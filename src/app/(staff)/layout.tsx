import { Suspense } from "react"
import Link from "next/link"
import { LogOutIcon, ScanLineIcon } from "lucide-react"
import { AppNav } from "@/components/app-nav"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { logout } from "@/app/actions"
import { CLINIC_NAME } from "@/lib/constants"
import { getSession } from "@/lib/session"

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="contents print:hidden">
        <Sidebar>
          <SidebarHeader className="border-b px-4 py-3">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ScanLineIcon className="size-4.5" />
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-semibold">X-Ray Portal</span>
                <span className="block text-xs text-muted-foreground">{CLINIC_NAME}</span>
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <Suspense
              fallback={
                <div className="space-y-1 p-2">
                  {Array.from({ length: 4 }, (_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              }
            >
              <Nav />
            </Suspense>
          </SidebarContent>
          <SidebarFooter className="border-t">
            <Suspense fallback={<Skeleton className="h-12 w-full" />}>
              <UserCard />
            </Suspense>
          </SidebarFooter>
        </Sidebar>
      </div>
      <SidebarInset className="min-w-0 bg-background">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background/90 px-4 backdrop-blur md:hidden print:hidden">
          <SidebarTrigger />
          <span className="text-sm font-semibold">X-Ray Portal</span>
        </header>
        <div className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-8 print:p-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

async function Nav() {
  const session = await getSession()
  if (!session) return null
  return <AppNav role={session.role} />
}

async function UserCard() {
  const session = await getSession()
  if (!session) return null
  const initials = session.name
    .replace("Dr. ", "")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
  return (
    <div className="flex items-center gap-3 rounded-lg p-1">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
        {initials}
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-sm font-medium">{session.name}</p>
        <p className="text-xs text-muted-foreground">
          {session.role === "admin" ? "Clinic helper / Admin" : "Radiologist"}
        </p>
      </div>
      <form action={logout}>
        <Button type="submit" variant="ghost" size="icon-sm" aria-label="Sign out" title="Sign out">
          <LogOutIcon />
        </Button>
      </form>
    </div>
  )
}
