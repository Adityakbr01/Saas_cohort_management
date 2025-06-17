import { useMemo, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { ModeToggle } from "./Theme/mode-toggle"
import { getCurrentUserRole } from "@/utils/authUtils"
import { Role } from "@/config/constant"

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const userRole = getCurrentUserRole()

  const isActive = (href: string) => location.pathname === href

  const navItems = useMemo(() => {
    // Common items
    const items = [{ name: "Home", href: "/" }]

    if (!userRole) {
      items.push({ name: "Courses", href: "/courses" })
      items.push({ name: "Sign Up", href: "/login" })
    }

    if (userRole === Role.student) {
      items.push({ name: "Courses", href: "/courses" })
      items.push({ name: "Profile", href: "/profile" })
    }

    if (
      userRole === Role.super_admin

    ) {
      items.push({ name: "Dashboard", href: "/dashboard/super_admin" })
    }

      if (
      userRole === Role.org_admin

    ) {
      items.push({ name: "Dashboard", href: "/dashboard/org_admin" })
    }



    // Optional for all logged-in users
    if (userRole) {
      items.push({ name: "Subscription", href: "/subscription" })
    }

    return items
  }, [userRole])

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">EL</span>
            </div>
            <span className="font-bold text-xl">EduLaunch</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${isActive(item.href)
                    ? "text-primary border-b-2 border-primary pb-1"
                    : "text-muted-foreground"
                  }`}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.name}
              </Link>
            ))}
            <ModeToggle />
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-8">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">EL</span>
                  </div>
                  <span className="font-bold text-xl">EduLaunch</span>
                </div>
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`text-lg font-medium transition-colors hover:text-primary ${isActive(item.href) ? "text-primary" : "text-muted-foreground"
                      }`}
                    aria-current={isActive(item.href) ? "page" : undefined}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="mt-6">
                  <ModeToggle />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
