"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { UserNav } from "@/components/user-nav";
import {
  BarChart3,
  Bell,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  HelpCircle,
  Home,
  Settings,
  Shield,
  User,
  Users
} from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { ModeToggle } from "../Theme/mode-toggle";

const data = {
  navMain: [
    { title: "Dashboard", url: "/dashboard/super_admin", icon: Home },
    { title: "Subscriptions", url: "/subscriptions", icon: CreditCard },
    { title: "Organization Admins", url: "/org-admins", icon: Building2 },
    { title: "Analytics", url: "/analytics", icon: BarChart3 },
  ],
  navSecondary: [
    { title: "User Management", url: "/users", icon: Users },
    { title: "Permissions", url: "/permissions", icon: Shield },
    { title: "Notifications", url: "/notifications", icon: Bell },
    { title: "Reports", url: "/reports", icon: FileText },
    { title: "Calendar", url: "/calendar", icon: Calendar },
  ],
  navSupport: [
    { title: "User Profile", url: "/profile", icon: User },
    { title: "Help Center", url: "/help", icon: HelpCircle },
    { title: "Settings", url: "/settings", icon: Settings },
  ],
};

export function DashboardLayout() {
  const location = useLocation();

  const getCurrentPageTitle = () => {
    const allItems = [...data.navMain, ...data.navSecondary, ...data.navSupport];
    const current = allItems.find((item) => item.url === location.pathname);
    return current?.title || "Dashboard";
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar variant="inset" collapsible="icon" className="h-screen">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild aria-label="AdminHub Pro Dashboard">
                  <Link to="/">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <Building2 className="size-4" aria-hidden="true" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">AdminHub Pro</span>
                      <span className="truncate text-xs">Enterprise Dashboard</span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent className="flex-1 overflow-y-hidden">
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {data.navMain.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.url}
                        aria-current={location.pathname === item.url ? "page" : undefined}
                      >
                        <Link to={item.url} className="flex items-center gap-2" aria-label={item.title}>
                          <item.icon className="size-4" aria-hidden="true" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Management</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {data.navSecondary.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.url}
                        aria-current={location.pathname === item.url ? "page" : undefined}
                      >
                        <Link to={item.url} className="flex items-center gap-2" aria-label={item.title}>
                          <item.icon className="size-4" aria-hidden="true" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Support</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {data.navSupport.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.url}
                        aria-current={location.pathname === item.url ? "page" : undefined}
                      >
                        <Link to={item.url} className="flex items-center gap-2" aria-label={item.title}>
                          <item.icon className="size-4" aria-hidden="true" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4">
            <UserNav />
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <SidebarTrigger className="-ml-1" aria-label="Toggle Sidebar" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link to="/">Dashboard</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{getCurrentPageTitle()}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto">
             <ModeToggle />
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 pt-0 min-h-[calc(100vh-4rem)]">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}