import Footer from "@/components/footer";
import HomeSkeleton from "@/components/HomeSkeleton";
import Navigation from "@/components/Navigation";
import { selectIsInitialized } from "@/store/features/slice/UserAuthSlice";
import { Suspense, lazy } from "react";
import { useSelector } from "react-redux";

// Lazy load heavy components
const HeroSection = lazy(() => import("@/components/HeroSection"));
const CourseGrid = lazy(() => import("@/components/CourseGrid"));

function Home() {
  const isInitialized = useSelector(selectIsInitialized);

  if (!isInitialized) return <HomeSkeleton />;

  return (
    <div className="min-h-screen w-full bg-background">
      <Navigation />
      <main className="min-h-[70vh]">
        <Suspense
          fallback={
            <section className="h-[300px] animate-pulse bg-muted rounded-xl mx-4 my-10" />
          }
        >
          <HeroSection />
        </Suspense>

        <Suspense
          fallback={
            <section className="py-16 lg:py-24">
              <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-64 bg-muted rounded-xl animate-pulse"
                  />
                ))}
              </div>
            </section>
          }
        >
          <CourseGrid />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default Home;
