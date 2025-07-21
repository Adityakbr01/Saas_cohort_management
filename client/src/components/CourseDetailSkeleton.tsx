import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CourseDetailSkeleton() {
  return (
    <main className="min-h-screen bg-background w-full">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-10 w-full max-w-xl" />
              <Skeleton className="h-6 w-full max-w-2xl mt-2" />
              <div className="flex flex-wrap gap-4 mt-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-40" />
                ))}
              </div>
            </div>

            <div className="aspect-video rounded-lg overflow-hidden">
              <Skeleton className="w-full h-full" />
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                {['overview', 'syllabus', 'instructor', 'reviews'].map((tab) => (
                  <TabsTrigger key={tab} value={tab} disabled>
                    <Skeleton className="h-8 w-full" />
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-40" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6 mb-2" />
                    <Skeleton className="h-4 w-4/6" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="text-center">
                          <Skeleton className="h-8 w-8 mx-auto mb-2 rounded-full" />
                          <Skeleton className="h-4 w-20 mx-auto" />
                          <Skeleton className="h-3 w-16 mx-auto mt-1" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>

          <aside className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <Skeleton className="h-8 w-32 mx-auto" />
                  <Skeleton className="h-4 w-24 mx-auto mt-2" />
                  <Skeleton className="h-4 w-40 mx-auto mt-4" />
                </div>
                <div className="space-y-3 mb-6">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-3 text-sm">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
