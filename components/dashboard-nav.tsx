"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Mail,
  Users,
  BarChart3,
  History,
  Zap,
  Settings,
  Send,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardNav() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Contacts", icon: Users },
    { href: "/research", label: "Research", icon: Zap },
    { href: "/composer", label: "Email Composer", icon: Mail },
    { href: "/campaigns", label: "Campaigns", icon: Calendar },
    { href: "/emails-sent", label: "Emails Sent", icon: Send },
    { href: "/history", label: "Email History", icon: History },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2">
        <h1 className="text-xl font-bold text-foreground mr-8">
          Investor Outreach
        </h1>
        <div className="flex gap-2">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <Button
                variant={pathname === href ? "default" : "ghost"}
                className="gap-2"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
