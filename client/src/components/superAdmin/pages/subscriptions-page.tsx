
import { useState, useMemo, useCallback } from "react"
import { z } from "zod"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { Check, Star, X } from "lucide-react"
import { toast } from "sonner"
import { useCreateSubscriptionMutation, useDeleteSubscriptionMutation, useGetSubscriptionsQuery, useUpdateSubscriptionMutation, type SubscriptionPlan } from "@/store/features/api/superAdmin/superAdminApi"

// Zod schema for validating subscription form data
const subscriptionSchema = z.object({
  name: z.enum(["basic", "pro", "business"], {
    errorMap: () => ({ message: "Plan name must be 'basic', 'pro', or 'business'" }),
  }),
  description: z.string().min(10, "Description must be at least 10 characters").max(200, "Description must not exceed 200 characters"),
  price: z.number().min(0, "Price must be a positive number"),
  features: z.array(z.string().min(1, "Feature cannot be empty")).min(5, "At least five features are required"),
  popular: z.boolean(),
  tax: z.number().min(0, "Tax must be a positive number"),
  yearlyPrice: z.number().min(0, "Yearly Price must be a positive number"),
  discount: z.number().min(0, "Discount Price must be a positive number"),
})

type SubscriptionFormData = z.infer<typeof subscriptionSchema>

export function SubscriptionsPage() {
  const { data, error, isLoading } = useGetSubscriptionsQuery()
  const [updateSubscription, { error: updateError, isLoading: updateSubscriptionLoading }] = useUpdateSubscriptionMutation()
  const [createSubscription, { isLoading: createSubscriptionLoading }] = useCreateSubscriptionMutation()
  const [deleteSubscription] = useDeleteSubscriptionMutation()
  const [open, setOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionPlan | null>(null)
  const [formData, setFormData] = useState<SubscriptionFormData>({
    name: "basic",
    description: "",
    price: 0,
    features: [],
    popular: false,
    tax: 0,
    yearlyPrice: 0,
    discount: 0
  })
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof SubscriptionFormData, string>>>({})

  // Validate form in real-time to enable/disable submit button
  const isFormValid = useMemo(() => {
    const validationResult = subscriptionSchema.safeParse(formData)
    return validationResult.success
  }, [formData])

  // Handle opening the modal for editing or creating
  const handleOpenModal = useCallback((subscription?: SubscriptionPlan) => {
    if (subscription) {
      // Edit mode
      setSelectedSubscription(subscription)
      setFormData({
        name: subscription.name,
        description: subscription.description,
        price: subscription.price,
        features: subscription.features,
        popular: subscription.popular,
        tax: subscription.tax,
        yearlyPrice: subscription.yearlyPrice,
        discount: subscription.discount
      })
      setIsCreating(false)
    } else {
      // Create mode
      setSelectedSubscription(null)
      setFormData({
        name: "basic",
        description: "",
        price: 0,
        features: [],
        popular: false,
        tax: 0,
        yearlyPrice: 0,
        discount: 0
      })
      setIsCreating(true)
    }
    setFormErrors({})
    setOpen(true)
  }, [])

  // Handle form submission for creating or updating
  const handleSubmit = useCallback(async () => {
    const validationResult = subscriptionSchema.safeParse(formData)
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors
      setFormErrors({
        name: errors.name?.[0],
        description: errors.description?.[0],
        price: errors.price?.[0],
        features: errors.features?.[0],
        popular: errors.popular?.[0],
      })
      toast.error("Please fix the form errors before submitting")
      return
    }

    try {
      if (isCreating) {
        // Create new subscription
        await createSubscription(validationResult.data).unwrap()
        toast.success("Subscription created successfully", {
          description: `Plan ${validationResult.data.name} created.`,
          duration: 3000,
          position: "top-right",
        })
      } else if (selectedSubscription) {
        // Update existing subscription
        await updateSubscription({
          id: selectedSubscription._id,
          data: validationResult.data,
        }).unwrap()
        toast.success("Subscription updated successfully", {
          description: `Plan ${validationResult.data.name} updated.`,
          duration: 3000,
          position: "top-right",
        })
      }
      setOpen(false)
      setFormErrors({})
    } catch (err: any) {
      console.error(`Failed to ${isCreating ? "create" : "update"} subscription:`, err)
      toast.error(`Failed to ${isCreating ? "create" : "update"} subscription`, {
        description: err?.data?.message || "An unexpected error occurred",
        duration: 5000,
        position: "top-right",
      })
    }
  }, [formData, isCreating, selectedSubscription, createSubscription, updateSubscription])

  // Handle subscription deletion
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<string | null>(null)

  const handleDelete = useCallback((subscriptionId: string) => {
    setSubscriptionToDelete(subscriptionId)
    setDeleteDialogOpen(true)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!subscriptionToDelete) return
    try {
      await deleteSubscription(subscriptionToDelete).unwrap()
      toast.success("Subscription deleted successfully", {
        description: "The subscription has been removed.",
        duration: 3000,
        position: "top-right",
      })
      setDeleteDialogOpen(false)
      setSubscriptionToDelete(null)
      setOpen(false)
    } catch (err: any) {
      console.error("Failed to delete subscription:", err)
      toast.error("Failed to delete subscription", {
        description: err?.data?.message || "An unexpected error occurred",
        duration: 5000,
        position: "top-right",
      })
    }
  }, [deleteSubscription, subscriptionToDelete])

  // Handle adding a new feature
  const addFeature = useCallback(() => {
    setFormData((prev) => ({ ...prev, features: [...prev.features, ""] }))
  }, [])

  // Handle updating a feature
  const updateFeature = useCallback((index: number, value: string) => {
    setFormData((prev) => {
      const newFeatures = [...prev.features]
      newFeatures[index] = value
      return { ...prev, features: newFeatures }
    })
  }, [])

  // Handle removing a feature
  const removeFeature = useCallback((index: number) => {
    setFormData((prev) => {
      const newFeatures = prev.features.filter((_, i) => i !== index)
      return { ...prev, features: newFeatures }
    })
  }, [])

  // Memoized total subscribers and revenue for performance
  const totalSubscribers = useMemo(
    () => data?.data?.reduce((sum: number, sub: SubscriptionPlan) => sum + sub.subscribers.length, 0) ?? 0,
    [data]
  )
  const monthlyRevenue = useMemo(
    () => data?.data?.reduce((sum: number, sub: SubscriptionPlan) => sum + sub.price * sub.subscribers.length, 0) ?? 0,
    [data]
  )

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Subscription Plans</h2>
          <p className="text-muted-foreground mt-1">
            Manage and monitor subscription tiers, features, and subscriber metrics.
          </p>
        </div>
        <div>
          <Button
            className="mt-4 cursor-pointer"
            onClick={() => handleOpenModal()}
            aria-label="Create new subscription plan"
          >
            Create New Plan
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{totalSubscribers.toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground">Active subscriptions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">₹{monthlyRevenue.toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground">Calculated from active plans</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">3.2%</div>}
            <p className="text-xs text-muted-foreground">+0.5% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array(3)
            .fill(0)
            .map((_, index) => (
              <Card key={index} className="relative">
                <CardHeader className="text-center">
                  <Skeleton className="h-6 w-32 mx-auto" />
                  <Skeleton className="h-3 w-48 mx-auto mt-3" />
                  <Skeleton className="h-8 w-24 mx-auto mt-4" />
                  <Skeleton className="h-3 w-36 mx-auto mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {Array(3)
                      .fill(0)
                      .map((_, i) => (
                        <li key={i} className="flex items-center space-x-3">
                          <Skeleton className="h-2 w-4" />
                          <p className="text-sm">
                            <Skeleton className="h-3 w-48" />
                          </p>
                        </li>
                      ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))
        ) : error ? (
          <div className="col-span-full text-center text-red-500">
            Error loading subscriptions: {"An unexpected error occurred"}
          </div>
        ) : !data?.data?.length ? (
          <div className="col-span-full text-center text-muted-foreground">
            No subscription plans available
          </div>
        ) : (
          data.data.map((plan: SubscriptionPlan) => (
            <Card
              key={plan._id}
              className={`relative ${plan.popular ? "border-primary shadow-lg" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
                <p className="mt-4">
                  <span className="text-3xl font-bold">₹{plan.price.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {plan.subscribers.length.toLocaleString()} active subscribers
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2 ">
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                      className="w-full"
                      onClick={() => handleOpenModal(plan)}
                    >
                      Manage Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
                    <DialogHeader>
                      <DialogTitle>{isCreating ? "Create New Plan" : `Edit ${selectedSubscription?.name}`}</DialogTitle>
                      <DialogDescription>
                        {isCreating ? "Enter the details for the new plan" : "Update the details for this plan"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Plan Name</Label>
                        <Select
                          value={formData.name}
                          onValueChange={(value) => setFormData({ ...formData, name: value as "basic" | "pro" | "business" })}
                          disabled={updateSubscriptionLoading || createSubscriptionLoading}
                        >
                          <SelectTrigger id="name">
                            <SelectValue placeholder="Select plan name" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                          </SelectContent>
                        </Select>
                        {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          disabled={updateSubscriptionLoading || createSubscriptionLoading}
                          placeholder="Enter plan description"
                        />
                        {formErrors.description && <p className="text-sm text-red-500">{formErrors.description}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Price (₹)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                          disabled={updateSubscriptionLoading || createSubscriptionLoading}
                          placeholder="Enter price"
                        />
                        {formErrors.price && <p className="text-sm text-red-500">{formErrors.price}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="yearlyPrice">YearlyPrice (₹)</Label>
                        <Input
                          value={formData.yearlyPrice}
                          id="yearlyPrice"
                          type="number"
                          onChange={(e) => setFormData({ ...formData, yearlyPrice: parseFloat(e.target.value) })}
                          disabled={updateSubscriptionLoading || createSubscriptionLoading}
                          placeholder="Enter yearlyPrice"

                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="price">Tax</Label>
                        <Input
                          value={formData.tax}
                          id="tax"
                          type="number"
                          onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) })}
                          disabled={updateSubscriptionLoading || createSubscriptionLoading}
                          placeholder="Enter tax"
                          max={28}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">discount</Label>
                        <Input
                          value={formData.discount}
                          id="discount"
                          type="number"
                          onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) })}
                          disabled={updateSubscriptionLoading || createSubscriptionLoading}
                          placeholder="Enter discount"
                        />
                      </div>


                      <div className="space-y-2">
                        <Label>Features</Label>
                        <div className="space-y-2">
                          {formData.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Input
                                value={feature}
                                onChange={(e) => updateFeature(index, e.target.value)}
                                disabled={updateSubscriptionLoading || createSubscriptionLoading}
                                placeholder={`Feature ${index + 1}`}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFeature(index)}
                                disabled={updateSubscriptionLoading || createSubscriptionLoading}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            onClick={addFeature}
                            disabled={updateSubscriptionLoading || createSubscriptionLoading}
                            className="w-full"
                          >
                            Add Feature
                          </Button>
                        </div>
                        {formErrors.features && <p className="text-sm text-red-500">{formErrors.features}</p>}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="popular"
                          checked={formData.popular}
                          onCheckedChange={(checked) => setFormData({ ...formData, popular: !!checked })}
                          disabled={updateSubscriptionLoading || createSubscriptionLoading}
                        />
                        <Label htmlFor="popular">Mark as Popular Plan</Label>
                      </div>
                    </div>
                    <DialogFooter className="flex justify-between">
                      {!isCreating && selectedSubscription && (
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(selectedSubscription._id)}
                          disabled={updateSubscriptionLoading || createSubscriptionLoading}
                        >
                          Delete Plan
                        </Button>
                      )}
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setOpen(false)}
                          disabled={updateSubscriptionLoading || createSubscriptionLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSubmit}
                          disabled={updateSubscriptionLoading || createSubscriptionLoading || !isFormValid}
                        >
                          {updateSubscriptionLoading || createSubscriptionLoading
                            ? "Saving..."
                            : isCreating
                              ? "Create Plan"
                              : "Save Changes"}
                        </Button>
                      </div>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => alert("View subscribers functionality not implemented yet")}
                >
                  View Subscribers
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this plan? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
