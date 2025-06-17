// pages/CreateOrg.tsx
"use client";

import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useCreateOrgMutation } from "@/store/features/api/organization/orgApi";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// ------------------ Schema ------------------
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  logo: z.instanceof(File).optional(),
});

type FormData = z.infer<typeof formSchema>;

// ------------------ Component ------------------
export default function CreateOrg() {
  const navigate = useNavigate();
  const [createOrg, { isLoading }] = useCreateOrgMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      logo: undefined,
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.logo) {
      formData.append("logo", data.logo);
    }

    // Debug: Log FormData contents
    console.log("FormData contents:");
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    try {
      await createOrg(formData).unwrap();
      toast.success("Organization created successfully");
      navigate("/dashboard/org_admin");
    } catch (err: any) {
      const message = err?.data?.message || "Failed to create organization";
      toast.error(message);
    }
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-gray-100">
      <Card className="max-w-md mx-auto mt-10 shadow-md rounded-lg">
        <CardHeader>
          <CardTitle>Create Organization</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                placeholder="Enter organization name"
                {...register("name")}
                className="focus:ring-2 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="logo">Upload Logo (Optional)</Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setValue("logo", file, { shouldValidate: true });
                }}
                className="focus:ring-2 focus:ring-blue-500"
              />
              {errors.logo && (
                <p className="text-red-500 text-sm mt-1">{errors.logo.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                "Create Organization"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}