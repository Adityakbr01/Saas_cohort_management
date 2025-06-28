
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { User, Settings, Eye, EyeOff, Trash2, Plus } from "lucide-react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useUpdateProfileMutation, useGetProfileQuery, useResetPasswordMutation } from "@/store/features/auth/authApi";
import { TabsContent } from "@/components/ui/tabs";

// Zod schema for student profile form
const studentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name cannot exceed 100 characters"),
  phone: z.string().optional().refine((val) => !val || /^\+?[\d\s\-()]{10,}$/.test(val), {
    message: "Please enter a valid phone number"
  }),
  bio: z.string().optional().refine((val) => !val || val.length <= 500, {
    message: "Bio cannot exceed 500 characters"
  }),
  goals: z.string().optional().refine((val) => !val || val.length <= 1000, {
    message: "Goals cannot exceed 1000 characters"
  }),
  background: z
    .object({
      education: z.string().optional().refine((val) => !val || val.length <= 200, {
        message: "Education cannot exceed 200 characters"
      }),
      previousCourses: z.array(z.string()).optional(),
      experience: z.string().optional().refine((val) => !val || val.length <= 500, {
        message: "Experience cannot exceed 500 characters"
      }),
      skills: z.array(z.object({
        name: z.string().min(1, "Skill name is required").max(50, "Skill name cannot exceed 50 characters"),
        progress: z.number().min(0, "Progress must be at least 0").max(100, "Progress cannot exceed 100"),
      })).optional(),
      learningGoals: z.string().optional().refine((val) => !val || val.length <= 500, {
        message: "Learning goals cannot exceed 500 characters"
      }),
    })
    .optional(),
  media: z.any().optional(),
});

const passwordSchema = z
  .object({
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof studentSchema>;

// Skill interface for better type safety
interface Skill {
  name: string;
  progress: number;
}

// Background interface for student profile
interface StudentBackground {
  education?: string;
  previousCourses?: string[];
  experience?: string;
  skills?: Skill[];
  learningGoals?: string;
}

// Main user data interface
interface UserData {
  role?: "student";
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  goals?: string;
  background?: StudentBackground;
  profileImageUrl?: string;
}

interface SettingsTabProps {
  userData: UserData;
}

export function SettingsTab({ userData }: SettingsTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [updatePassword, { isLoading: isUpdatingPassword }] = useResetPasswordMutation();
  const [updateProfile, { isLoading: isUpdatingProfile, error: updateError }] = useUpdateProfileMutation();
  const { data: profileData, refetch, isLoading: isProfileLoading } = useGetProfileQuery(undefined);

  const currentData = profileData?.data || userData;

  console.log("[DEBUG] SettingsTab: Current data:", currentData);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfileForm,
    setValue,
    control,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      phone: "",
      bio: "",
      goals: "",
      background: { education: "", previousCourses: [], experience: "", skills: [], learningGoals: "" },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "background.skills",
  });

  const watchedSkills = useWatch({
    control,
    name: "background.skills",
    defaultValue: currentData.background?.skills || [],
  }) || [];

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    console.log("[DEBUG] SettingsTab: Received userData:", userData);
    console.log("[DEBUG] SettingsTab: Profile data from API:", profileData);
    resetProfileForm({
      name: currentData.name !== "Unknown User" ? currentData.name : "Aditya kbr",
      phone: currentData.phone || "",
      bio: currentData.bio || "",
      goals: currentData.goals || "",
      background: {
        education: currentData.background?.education || "",
        previousCourses: currentData.background?.previousCourses || [],
        experience: currentData.background?.experience || "",
        skills: currentData.background?.skills || [],
        learningGoals: currentData.background?.learningGoals || "",
      },
    });
  }, [currentData, resetProfileForm, userData, profileData]);

  // Helper function to extract error message from RTK Query error
  const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === 'object' && 'data' in error) {
      const errorData = error.data;
      if (errorData && typeof errorData === 'object' && 'message' in errorData) {
        return (errorData as { message: string }).message;
      }
    }
    if (error && typeof error === 'object' && 'message' in error) {
      return (error as { message: string }).message;
    }
    return "An unexpected error occurred";
  };

  useEffect(() => {
    if (updateError) {
      console.error("[DEBUG] SettingsTab: Update error:", updateError);
      toast.error(getErrorMessage(updateError));
    }
  }, [updateError]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      console.log("[DEBUG] SettingsTab: Submitting profile update:", data);

      // Validate required fields
      if (!data.name?.trim()) {
        toast.error("Name is required");
        return;
      }

      const formData = new FormData();
      formData.append("name", data.name.trim());

      // Add optional fields only if they have values
      if (data.phone?.trim()) formData.append("phone", data.phone.trim());
      if (data.bio?.trim()) formData.append("bio", data.bio.trim());
      if (data.goals?.trim()) formData.append("goals", data.goals.trim());

      // Handle background data
      if (data.background) {
        // Ensure skills have proper structure
        const backgroundData = {
          ...data.background,
          skills: data.background.skills?.map(skill => ({
            name: skill.name.trim(),
            progress: skill.progress || 0
          })) || []
        };
        formData.append("background", JSON.stringify(backgroundData));
      }

      // Handle file upload
      if (data.media && data.media[0] instanceof File) {
        console.log("[DEBUG] Appending media to FormData:", data.media[0]);
        formData.append("media", data.media[0]);
      }

      // Debug FormData contents
      for (const [key, value] of formData.entries()) {
        console.log(`[DEBUG] FormData: ${key} = ${value}`);
      }

      await updateProfile(formData).unwrap();
      toast.success("Profile updated successfully");
      setIsEditing(false);
      setPreview(null);
      await refetch(); // Ensure fresh data

      // Reset form with updated data
      resetProfileForm({
        ...data,
        media: undefined,
      });
    } catch (error: unknown) {
      console.error("[DEBUG] SettingsTab: Failed to update profile:", error);
      toast.error(getErrorMessage(error));
    }
  };

  const onPasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
    try {
      console.log("[DEBUG] SettingsTab: Submitting password update");

      // Additional validation
      if (data.newPassword !== data.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      if (data.newPassword.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }

      await updatePassword({ password: data.newPassword }).unwrap();
      toast.success("Password updated successfully");
      resetPasswordForm();

      // Hide password visibility toggles
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error: unknown) {
      console.error("[DEBUG] SettingsTab: Failed to update password:", error);
      toast.error(getErrorMessage(error));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      const file = fileList[0];

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please select a valid image file (JPEG, PNG, or JPG)");
        e.target.value = ''; // Clear the input
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast.error("File size must be less than 5MB");
        e.target.value = ''; // Clear the input
        return;
      }

      console.log("[DEBUG] Selected file:", file);
      setPreview(URL.createObjectURL(file));
      setValue("media", fileList);
    } else {
      console.warn("[DEBUG] No file selected!");
      setPreview(null);
      setValue("media", undefined);
    }
  };


  const addSkill = () => {
    // Limit to maximum 10 skills
    if (fields.length >= 10) {
      toast.error("You can add a maximum of 10 skills");
      return;
    }
    append({ name: "", progress: 0 });
  };

  const removeSkill = (index: number) => {
    remove(index);
    toast.success("Skill removed");
  };

  if (isProfileLoading) {
    return (
      <TabsContent value="settings" className="mt-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </TabsContent>
    );
  }

  return (
    <TabsContent value="settings" className="mt-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (isEditing) {
                    handleProfileSubmit(onProfileSubmit)();
                  } else {
                    setIsEditing(true);
                  }
                }}
                disabled={isUpdatingProfile}
              >
                {isEditing ? (isUpdatingProfile ? "Saving..." : "Save Changes") : "Edit Profile"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    {...registerProfile("name")}
                    disabled={!isEditing}
                    className={profileErrors.name ? "border-destructive" : ""}
                  />
                  {profileErrors.name && (
                    <p className="text-destructive text-sm mt-1">{profileErrors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    {...registerProfile("phone")}
                    disabled={!isEditing}
                    className={profileErrors.phone ? "border-destructive" : ""}
                  />
                  {profileErrors.phone && (
                    <p className="text-destructive text-sm mt-1">{profileErrors.phone.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    {...registerProfile("bio")}
                    disabled={!isEditing}
                    rows={3}
                    className={profileErrors.bio ? "border-destructive" : ""}
                  />
                  {profileErrors.bio && (
                    <p className="text-destructive text-sm mt-1">{profileErrors.bio.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="goals">Goals</Label>
                  <Textarea
                    id="goals"
                    {...registerProfile("goals")}
                    disabled={!isEditing}
                    rows={3}
                    className={profileErrors.goals ? "border-destructive" : ""}
                  />
                  {profileErrors.goals && (
                    <p className="text-destructive text-sm mt-1">{profileErrors.goals.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="background.education">Education</Label>
                  <Input
                    id="background.education"
                    {...registerProfile("background.education")}
                    disabled={!isEditing}
                    className={profileErrors.background?.education ? "border-destructive" : ""}
                  />
                  {profileErrors.background?.education && (
                    <p className="text-destructive text-sm mt-1">
                      {profileErrors.background.education.message}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Label>Skills</Label>
                  <div className="space-y-4 mt-2">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <div className="flex-1">
                          <Input
                            {...registerProfile(`background.skills.${index}.name`)}
                            placeholder="Skill name (e.g., Java)"
                            disabled={!isEditing}
                            className={profileErrors.background?.skills?.[index]?.name ? "border-destructive" : ""}
                          />
                          {profileErrors.background?.skills?.[index]?.name && (
                            <p className="text-destructive text-sm mt-1">
                              {profileErrors.background.skills[index].name.message}
                            </p>
                          )}
                        </div>
                        <div className="w-1/2">
                          <Slider
                            value={[watchedSkills[index]?.progress || 0]}
                            min={0}
                            max={100}
                            step={1}
                            disabled={!isEditing}
                            onValueChange={(value) => {
                              console.log("[DEBUG] Slider value change:", value);
                              setValue(`background.skills.${index}.progress`, value[0], { shouldValidate: true, shouldDirty: true });
                            }}
                            className="py-2"
                          />
                          <div className="text-center text-sm mt-1">
                            Progress: {watchedSkills[index]?.progress || 0}%
                          </div>
                          {profileErrors.background?.skills?.[index]?.progress && (
                            <p className="text-destructive text-sm mt-1">
                              {profileErrors.background.skills[index].progress.message}
                            </p>
                          )}
                        </div>
                        {isEditing && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSkill(index)}
                            title="Remove skill"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addSkill}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Skill
                      </Button>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="media">Profile Image</Label>
                  <Input
                    id="media"
                    type="file"
                    accept="image/jpeg,image/png"
                    disabled={!isEditing}
                    onChange={handleFileChange} // ✅ only this
                  />

                  {preview && <img src={preview} alt="Preview" className="h-24 w-24 mt-2 rounded" />}
                  {currentData.profileImageUrl && !preview && (
                    <img
                      src={currentData.profileImageUrl}
                      alt="Profile"
                      className="h-24 w-24 mt-2 rounded"
                    />
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
              <div className="relative">
                <Label htmlFor="new-password">New Password</Label>
                <div className="flex items-center">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    {...registerPassword("newPassword")}
                    className={passwordErrors.newPassword ? "border-destructive" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-destructive text-sm mt-1">{passwordErrors.newPassword.message}</p>
                )}
              </div>
              <div className="relative">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="flex items-center">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    {...registerPassword("confirmPassword")}
                    className={passwordErrors.confirmPassword ? "border-destructive" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-destructive text-sm mt-1">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>
              <Button type="submit" disabled={isUpdatingPassword} className="mt-4">
                {isUpdatingPassword ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}
