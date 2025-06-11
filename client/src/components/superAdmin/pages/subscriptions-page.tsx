
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
import { Check, Star } from "lucide-react"
import { toast } from "sonner"
import { useGetSubscriptionsQuery, useUpdateSubscriptionMutation, type SubscriptionPlan } from "@/store/features/api/superAdmin/superAdminApi"

// Zod schema for validating subscription form data
const subscriptionSchema = z.object({
  name: z.enum(["basic", "pro", "business"], {
    errorMap: () => ({ message: "Plan name must be 'basic', 'pro', or 'business'" }),
  }),
  description: z.string().min(10, "Description must be at least 10 characters").max(200, "Description must not exceed 200 characters"),
  price: z.number().min(0, "Price must be a positive number"),
  features: z.array(z.string().min(1, "Feature cannot be empty")).min(1, "At least one feature is required"),
  popular: z.boolean(),
})

type SubscriptionFormData = z.infer<typeof subscriptionSchema>

export function SubscriptionsPage() {
  const { data, error, isLoading } = useGetSubscriptionsQuery()
  const [updateSubscription, { error: updateError, isLoading: updateSubscriptionLoading }] = useUpdateSubscriptionMutation()
  const [open, setOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionPlan | null>(null)
  const [formData, setFormData] = useState<SubscriptionFormData>({
    name: "basic",
    description: "",
    price: 0,
    features: [],
    popular: false,
  })
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof SubscriptionFormData, string>>>({})

  // Validate form in real-time to enable/disable submit button
  const isFormValid = useMemo(() => {
    const validationResult = subscriptionSchema.safeParse(formData)
    return validationResult.success
  }, [formData])

  // Handle opening the modal and pre-filling form data
  const handleOpenModal = useCallback((subscription: SubscriptionPlan) => {
    setSelectedSubscription(subscription)
    setFormData({
      name: subscription.name,
      description: subscription.description,
      price: subscription.price,
      features: subscription.features,
      popular: subscription.popular,
    })
    setFormErrors({})
    setOpen(true)
  }, [])

  // Handle form submission with validation and API call
  const handleUpdate = useCallback(async () => {
    if (!selectedSubscription) return

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
      await updateSubscription({
        id: selectedSubscription._id,
        data: validationResult.data,
      }).unwrap()
      toast.success("Subscription updated successfully", {
        description: `Plan ${validationResult.data.name} updated.`,
        duration: 3000,
        position: "top-right",
      })
      setOpen(false)
      setFormErrors({})
    } catch (err: any) {
      console.error("Failed to update subscription:", err)
      toast.error("Failed to update subscription", {
        description: err?.data?.message || "An unexpected error occurred",
        duration: 5000,
        position: "top-right",
      })
    }
  }, [formData, selectedSubscription, updateSubscription])

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
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Subscription Plans</h2>
        <p className="text-muted-foreground mt-1">
          Manage and monitor subscription tiers, features, and subscriber metrics.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y

-0 pb-2">
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
                  <Skeleton className="h-4 w-48 mx-auto mt-2" />
                  <Skeleton className="h-8 w-24 mx-auto mt-4" />
                  <Skeleton className="h-4 w-36 mx-auto mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {Array(3)
                      .fill(0)
                      .map((_, idx) => (
                        <li key={idx} className="flex items-center space-x-3">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 w-48" />
                        </li>
                      ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-8 w-full" />
                </CardFooter>
              </Card>
            ))
        ) : error ? (
          <div className="col-span-full text-center text-red-500">
            Error loading subscriptions: {JSON.stringify(error)}
          </div>
        ) : !data?.data?.length ? (
          <div className="col-span-full text-center text-muted-foreground">
            No subscription plans available.
          </div>
        ) : (
          data.data.map((subscription: SubscriptionPlan) => (
            <Card
              key={subscription._id}
              className={`relative ${subscription.popular ? "border-primary shadow-lg" : ""}`}
            >
              {subscription.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl capitalize">{subscription.name}</CardTitle>
                <CardDescription>{subscription.description}</CardDescription>
                <div className="flex items-baseline justify-center space-x-1 pt-4">
                  <span className="text-4xl font-bold">₹{subscription.price.toLocaleString()}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {subscription.subscribers.length.toLocaleString()} active subscribers
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {subscription.features.map((feature) => (
                    <li key={feature} className="flex items-center space-x-3">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full"
                      variant={subscription.popular ? "default" : "outline"}
                      size="lg"
                      onClick={() => handleOpenModal(subscription)}
                      aria-label={`Manage ${subscription.name} plan`}
                    >
                      Manage Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit {selectedSubscription?.name}</DialogTitle>
                      <DialogDescription>
                        Update the subscription plan details below.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Plan Name</Label>
                        <Select
                          value={formData.name}
                          onValueChange={(value) =>
                            setFormData({ ...formData, name: value as "basic" | "pro" | "business" })
                          }
                          disabled={updateSubscriptionLoading}
                        >
                          <SelectTrigger id="name" aria-label="Select plan name">
                            <SelectValue placeholder="Select plan name" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                          </SelectContent>
                        </Select>
                        {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          disabled={updateSubscriptionLoading}
                          placeholder="Enter plan description"
                          aria-describedby="description-error"
                        />
                        {formErrors.description && (
                          <p id="description-error" className="text-red-500 text-sm">{formErrors.description}</p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="price">Price (₹)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                          disabled={updateSubscriptionLoading}
                          placeholder="Enter price"
                          aria-describedby="price-error"
                        />
                        {formErrors.price && <p id="price-error" className="text-red-500 text-sm">{formErrors.price}</p>}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="features">Features (comma-separated)</Label>
                        <Textarea
                          id="features"
                          value={formData.features.join(", ")}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              features: e.target.value.split(",").map((f) => f.trim()).filter(Boolean),
                            })
                          }
                          disabled={updateSubscriptionLoading}
                          placeholder="e.g., Feature 1, Feature 2, Feature 3"
                          aria-describedby="features-error"
                        />
                        {formErrors.features && (
                          <p id="features-error" className="text-red-500 text-sm">{formErrors.features}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="popular"
                          checked={formData.popular}
                          onCheckedChange={(checked) => setFormData({ ...formData, popular: !!checked })}
                          disabled={updateSubscriptionLoading}
                          aria-label="Mark as popular plan"
                        />
                        <Label htmlFor="popular">Mark as Popular Plan</Label>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        type="submit"
                        onClick={handleUpdate}
                        disabled={updateSubscriptionLoading || !isFormValid}
                        aria-label="Save subscription changes"
                      >
                        {updateSubscriptionLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  aria-label={`View subscribers for ${subscription.name}`}
                >
                  View Subscribers
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
