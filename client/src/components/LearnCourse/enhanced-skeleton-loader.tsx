import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function MainDashboardSkeleton() {
  return (
    <div className="flex h-screen bg-background">
      {/* Left Panel Skeleton */}
      <div className="w-80 border-r bg-card/30 hidden md:flex">
        <div className="flex flex-col h-full w-full">
          {/* Header Skeleton */}
          <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-4 w-48 mb-2" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>

          {/* Progress Summary Skeleton */}
          <div className="p-4 border-b space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-7 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-2 rounded-lg border">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-5 w-6" />
                  </div>
                  <Skeleton className="h-3 w-12 mx-auto" />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Tabs Skeleton */}
          <div className="flex border-b">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-1 p-2">
                <div className="flex flex-col items-center gap-1">
                  <Skeleton className="h-3 w-3" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="flex-1 p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-7 w-7 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-4" />
                  </div>
                  <Skeleton className="h-1.5 w-full mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Video Player Skeleton */}
        <div className="p-4 md:p-6">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-video bg-muted/50 flex items-center justify-center">
                <Skeleton className="h-16 w-16 rounded-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lesson Info Skeleton */}
        <div className="px-4 md:px-6 pb-4 md:pb-6 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-4 mt-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-14" />
            </div>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel Skeleton */}
      <div className="w-96 border-l bg-card/30 hidden lg:flex">
        <div className="flex flex-col h-full w-full">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
          <div className="flex-1 p-4 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function VideoPlayerSkeleton() {
  return (
    <Card className="overflow-hidden shadow-lg">
      <CardContent className="p-0">
        <div className="relative aspect-video bg-gradient-to-br from-muted/30 to-muted/60 flex items-center justify-center">
          <div className="space-y-4 text-center">
            <Skeleton className="h-16 w-16 rounded-full mx-auto" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24 mx-auto" />
              <Skeleton className="h-2 w-32 mx-auto" />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-1 flex-1" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-6" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function LanguagesSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-8 rounded" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
