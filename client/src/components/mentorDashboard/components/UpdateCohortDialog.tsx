"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

// ✅ Schema
const cohortSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    shortDescription: z.string(),
    description: z.string(),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    maxCapacity: z.coerce.number(),
    category: z.string(),
    difficulty: z.string(),
    schedule: z.string().optional(),
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
    activateOn: z.string().nullable().optional(),
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

    if (data.status === "upcoming" && !data.activateOn) {
      ctx.addIssue({
        path: ["activateOn"],
        message: "Activate On date is required for upcoming cohorts",
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
      activateOn: cohort.activateOn ?? "",
      tags: cohort.tags?.join(", ") || "",
      prerequisites: cohort.prerequisites?.join(", ") || "",
    },
  });

  const isLimitedOffer = watch("limitedTimeOffer.isActive");
  const status = watch("status");

  const toUTCString = (datetime: string | undefined | null) =>
    datetime ? new Date(datetime).toISOString() : undefined;

  const onSubmit = (data: CohortFormData) => {
    const finalData = {
      ...data,
      tags: data.tags.split(",").map((t) => t.trim()),
      prerequisites: data.prerequisites.split(",").map((p) => p.trim()),
      activateOn:
        data.status === "upcoming" ? toUTCString(data.activateOn) : undefined,
      limitedTimeOffer: {
        ...data.limitedTimeOffer,
        startDate: toUTCString(data.limitedTimeOffer.startDate),
        endDate: toUTCString(data.limitedTimeOffer.endDate),
      },
    };

    console.log("🚀 Final UTC Data:", finalData);
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

        <form
          onSubmit={handleSubmit(onSubmit, (e) =>
            console.error("❌ Form Validation Errors:", e)
          )}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
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
            {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate.message}</p>}
          </div>

          <div>
            <Label>End Date</Label>
            <Input type="date" {...register("endDate")} />
            {errors.endDate && <p className="text-red-500 text-sm">{errors.endDate.message}</p>}
          </div>

          <div>
            <Label>Max Capacity</Label>
            <Input type="number" {...register("maxCapacity")} />
          </div>

          <div>
            <Label>Category</Label>
            <Select
              onValueChange={(val) => setValue("category", val)}
              value={watch("category")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {["Web Development", "Mobile Development", "Data Science"].map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Difficulty</Label>
            <Select
              onValueChange={(val) => setValue("difficulty", val)}
              value={watch("difficulty")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Language</Label>
            <Select
              onValueChange={(val) => setValue("language", val)}
              value={watch("language")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Hindi">Hindi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Location</Label>
            <Select
              onValueChange={(val) => setValue("location", val)}
              value={watch("location")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
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
              {errors.activateOn && (
                <p className="text-red-500 text-sm">{errors.activateOn.message}</p>
              )}
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
            <Input {...register("duration")} />
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
            {errors.discount && (
              <p className="text-red-500 text-sm">{errors.discount.message}</p>
            )}
          </div>

          {/* Limited Time Offer */}
          <div className="md:col-span-2">
            <Label>Limited Time Offer</Label>
            <div className="flex gap-2 items-center">
              <Switch
                checked={isLimitedOffer}
                onCheckedChange={(val) =>
                  setValue("limitedTimeOffer.isActive", val)
                }
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
              onCheckedChange={(val) =>
                setValue("certificateAvailable", val)
              }
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
