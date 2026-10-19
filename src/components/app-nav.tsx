"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ClipboardListIcon,
  FilePlus2Icon,
  FolderSearchIcon,
  LayoutDashboardIcon,
  QrCodeIcon,
} from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import type { Role } from "@/lib/types"

const NAV: Record<Role, { label: string; items: { href: string; label: string; icon: React.ElementType }[] }> = {
  admin: {
    label: "Clinic",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
      { href: "/records", label: "X-Ray Records", icon: FolderSearchIcon },
      { href: "/records/new", label: "New Examination", icon: FilePlus2Icon },
      { href: "/qr-codes", label: "QR Codes", icon: QrCodeIcon },
    ],
  },
  radiologist: {
    label: "Reporting",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
      { href: "/worklist", label: "Worklist", icon: ClipboardListIcon },
      { href: "/records", label: "All Records", icon: FolderSearchIcon },
    ],
  },
}

function isActive(pathname: string, href: string) {
  if (href === "/records") {
    return pathname === "/records" || (/^\/records\/[^/]+/.test(pathname) && pathname !== "/records/new")
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppNav({ role }: { role: Role }) {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()
  const nav = NAV[role]

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{nav.label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {nav.items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                isActive={isActive(pathname, item.href)}
                render={<Link href={item.href} onClick={() => setOpenMobile(false)} />}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
