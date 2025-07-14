import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

// Zod schema with conditional validation
const cohortSchema = z
  .object({
    title: z.string().min(1),
    shortDescription: z.string(),
    description: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    maxCapacity: z.coerce.number(),
    category: z.string(),
    difficulty: z.string(),
    schedule: z.string(),
    location: z.string(),
    language: z.string(),
    certificateAvailable: z.boolean(),
    tags: z.string(),
    prerequisites: z.string(),
    status: z.string(),
    duration: z.string(),
    price: z.coerce.number(),
    originalPrice: z.coerce.number(),
    discount: z.coerce.number(),
    isPrivate: z.boolean(),
    activateOn: z.string().optional(),
    limitedTimeOffer: z.object({
      isActive: z.boolean(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.limitedTimeOffer.isActive && data.discount <= 0) {
      ctx.addIssue({
        path: ["discount"],
        message: "Discount must be greater than 0 when limited time offer is active",
        code: z.ZodIssueCode.custom,
      });
    }
  });

type CohortFormData = z.infer<typeof cohortSchema>;

export function UpdateCohortDialog({
  cohort,
  onUpdate,
}: {
  cohort: any;
  onUpdate: (data: any) => void;
}) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CohortFormData>({
    resolver: zodResolver(cohortSchema),
    defaultValues: {
      ...cohort,
      tags: cohort.tags?.join(", ") || "",
      prerequisites: cohort.prerequisites?.join(", ") || "",
    },
  });

  const isLimitedOffer = watch("limitedTimeOffer.isActive");
  const status = watch("status");

  const onSubmit = (data: CohortFormData) => {
    const finalData = {
      ...data,
      tags: data.tags.split(",").map((t) => t.trim()),
      prerequisites: data.prerequisites.split(",").map((p) => p.trim()),
      activateOn: data.status === "upcoming" ? data.activateOn : undefined,
    };
    onUpdate(finalData);
    setOpen(false);
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Update Cohort</DialogTitle>
          <DialogDescription>Edit cohort details below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <Label>Title</Label>
            <Input {...register("title")} />
            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
          </div>

          <div>
            <Label>Short Description</Label>
            <Input {...register("shortDescription")} />
          </div>

          <div className="md:col-span-2">
            <Label>Description</Label>
            <Textarea {...register("description")} />
          </div>

          <div>
            <Label>Start Date</Label>
            <Input type="date" {...register("startDate")} />
          </div>

          <div>
            <Label>End Date</Label>
            <Input type="date" {...register("endDate")} />
          </div>

          <div>
            <Label>Max Capacity</Label>
            <Input type="number" {...register("maxCapacity")} />
          </div>

          <div>
            <Label>Category</Label>
            <Select onValueChange={(value) => setValue("category", value)} value={watch("category")}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {["Web Development", "Mobile Development", "Data Science"].map((cat) => (
                  <SelectItem value={cat} key={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Difficulty</Label>
            <Select onValueChange={(value) => setValue("difficulty", value)} value={watch("difficulty")}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Language</Label>
            <Select onValueChange={(value) => setValue("language", value)} value={watch("language")}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Hindi">Hindi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Location</Label>
            <Select onValueChange={(value) => setValue("location", value)} value={watch("location")}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="In-Person">In-Person</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {status === "upcoming" && (
            <div className="md:col-span-2">
              <Label>Activate On</Label>
              <Input type="datetime-local" {...register("activateOn")} />
            </div>
          )}

          <div>
            <Label>Tags</Label>
            <Input {...register("tags")} />
          </div>

          <div>
            <Label>Prerequisites</Label>
            <Input {...register("prerequisites")} />
          </div>

          <div>
            <Label>Duration</Label>
            <Input type="text" {...register("duration")} />
          </div>

          <div>
            <Label>Price</Label>
            <Input type="number" {...register("price")} />
          </div>

          <div>
            <Label>Original Price</Label>
            <Input type="number" {...register("originalPrice")} />
          </div>

          <div>
            <Label>Discount</Label>
            <Input type="number" {...register("discount")} />
            {errors.discount && <p className="text-red-500 text-sm">{errors.discount.message}</p>}
          </div>

          {/* Limited Time Offer */}
          <div className="md:col-span-2">
            <Label>Limited Time Offer</Label>
            <div className="flex items-center gap-2">
              <Switch
                checked={isLimitedOffer}
                onCheckedChange={(checked) => setValue("limitedTimeOffer.isActive", checked)}
              />
              <Input
                type="datetime-local"
                {...register("limitedTimeOffer.startDate")}
                disabled={!isLimitedOffer}
              />
              <Input
                type="datetime-local"
                {...register("limitedTimeOffer.endDate")}
                disabled={!isLimitedOffer}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Label>Certificate</Label>
            <Switch
              checked={watch("certificateAvailable")}
              onCheckedChange={(val) => setValue("certificateAvailable", val)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Label>Private</Label>
            <Switch
              checked={watch("isPrivate")}
              onCheckedChange={(val) => setValue("isPrivate", val)}
            />
          </div>

          <DialogFooter className="md:col-span-2 mt-4">
            <Button type="submit">Update</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
