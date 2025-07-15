import CourseGrid from '@/components/CourseGrid';
import Footer from '@/components/footer';
import HeroSection from '@/components/HeroSection';
import HomeSkeleton from '@/components/HomeSkeleton';
import Navigation from '@/components/Navigation';
import { selectIsInitialized } from '@/store/features/slice/UserAuthSlice';

import { useSelector } from "react-redux";


function Home() {

  const isInitialized = useSelector(selectIsInitialized);

  if (!isInitialized) return <HomeSkeleton />;
  return (
    <div className="min-h-screen w-full bg-background">
      
      <Navigation />
      <main>
        
        <HeroSection />
        <CourseGrid />
      </main>
      <Footer/>
    </div>
  )
}

export default Home