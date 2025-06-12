import CourseGrid from '@/components/CourseGrid'
import Footer from '@/components/footer'
import HeroSection from '@/components/HeroSection'
import Navigation from '@/components/Navigation'

function Home() {
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