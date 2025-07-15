import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { ModeToggle } from "./Theme/mode-toggle";
import { getCurrentUserRole } from "@/utils/authUtils";
import { Role } from "@/config/constant";

// 👇 Extract Logo component to avoid repetition
const Logo = () => (
  <Link to="/" className="flex items-center space-x-2">
    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
      <span className="text-primary-foreground font-bold text-sm">EL</span>
    </div>
    <span className="font-bold text-xl">EduLaunch</span>
  </Link>
);

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const userRole = getCurrentUserRole();

  const isActive = (href: string) => location.pathname === href;

  const navItems = useMemo(() => {
    const items = [
      { name: "Home", href: "/" },
      { name: "Whiteboard", href: "/whiteboard" },
    ];

    if (!userRole) {
      items.push({ name: "Courses", href: "/courses" });
      items.push({ name: "Sign Up", href: "/login" });
    }

    if (userRole === Role.student) {
      items.push({ name: "Courses", href: "/courses" });
      items.push({ name: "Profile", href: "/profile" });
    }

    if (userRole === Role.super_admin) {
      items.push({ name: "Dashboard", href: "/dashboard/super_admin" });
    }

    if ([Role.org_admin, Role.organization].includes(userRole!)) {
      items.push({ name: "Dashboard", href: "/dashboard/org_admin" });
      items.push({ name: "Subscription", href: "/subscription" });
    }

    if (userRole === Role.mentor) {
      items.push({ name: "Dashboard", href: "/dashboard/mentor" });
    }

    return items;
  }, [userRole]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Logo />

          {/* ✅ Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.href)
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

          {/* ✅ Mobile Nav */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[300px] sm:w-[400px] px-6 py-6"
            >
              <div className="flex items-center space-x-3 mb-8">
                <div className="h-9 w-9 rounded-md bg-primary flex items-center justify-center shadow-sm">
                  <span className="text-primary-foreground font-bold text-sm">
                    EL
                  </span>
                </div>
                <span className="text-xl font-bold tracking-tight">
                  EduLaunch
                </span>
              </div>

              <nav className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`text-base font-medium transition-colors px-2 py-1 rounded-md hover:bg-muted hover:text-primary ${
                      isActive(item.href)
                        ? "text-primary bg-muted"
                        : "text-muted-foreground"
                    }`}
                    aria-current={isActive(item.href) ? "page" : undefined}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              <div className="mt-10 border-t pt-6">
                <ModeToggle />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
