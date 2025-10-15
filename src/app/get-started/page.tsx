"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuroraBackgroundDemo } from "@/components/ui/aurora-background-demo";
import { Sidebar,
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
        SidebarSeparator,
        SidebarTrigger } from "@/components/ui/sidebar";
import { BotIcon, StarIcon, VideoIcon } from "lucide-react";
import { DashboardUserButton } from "./dashboard-user-button";
import { DashboardNavbar } from "./dashboard-navbar";

const firstSection = [
  {
    icon: VideoIcon,
    label: "Meetings",
    href: "/meetings",
    
  },
  {
    icon: BotIcon,
    label: "Agents",
    href: "/agents",
  }
];
const secondSection =[
  {
    icon: StarIcon,
    label: "Upgrade",
    href: "/upgrade",
    
  }
];

export default function GetStartedPage() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="text-sidebar-accent-foreground">
          <Link href="/" className="flex items-center gap-2 px-1 pt-2">
            <img src="/actiq_lg.png" height={40} width={40} alt="Actiq.AI" />
            <span className="text-sm font-semibold">Actiq.AI</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="px-2">Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {firstSection.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild>
                      <Link href={item.href} className="flex items-center gap-2">
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {secondSection.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild>
                      <Link href={item.href} className="flex items-center gap-2">
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="text-black">
          <DashboardUserButton />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <DashboardNavbar />
        <AuroraBackgroundDemo />
      </SidebarInset>
    </SidebarProvider>
  );
}
