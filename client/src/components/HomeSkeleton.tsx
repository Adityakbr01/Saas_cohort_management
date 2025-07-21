// components/skeleton/HomeSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function HomeSkeleton() {
  return (
    <div className="min-h-screen w-full bg-background">
      {/* ✅ Navigation Skeleton */}
      <div className="w-full h-16 border-b px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="hidden md:flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-20 rounded" />
          ))}
        </div>
        <Skeleton className="h-8 w-8 md:hidden" />
      </div>

      {/* ✅ HeroSection Skeleton */}
      <section className="py-20 lg:py-32 px-4 container mx-auto text-center">
        <Skeleton className="h-12 w-2/3 mx-auto mb-6" />
        <Skeleton className="h-5 w-1/2 mx-auto mb-8" />

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
          <Skeleton className="h-12 w-48 rounded-md" />
          <Skeleton className="h-12 w-40 rounded-md" />
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </section>

      {/* ✅ CourseGrid Skeleton */}
      <section className="py-16 lg:py-24 container mx-auto px-4">
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-1/3 mx-auto mb-4" />
          <Skeleton className="h-5 w-2/3 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[280px] w-full rounded-xl" />
          ))}
        </div>

        <div className="text-center mt-12">
          <Skeleton className="h-10 w-44 mx-auto rounded-md" />
        </div>
      </section>

      {/* ✅ Footer Skeleton */}
      <footer className="w-full border-t py-10 px-4 text-center">
        <Skeleton className="h-5 w-1/3 mx-auto" />
      </footer>
    </div>
  );
}
