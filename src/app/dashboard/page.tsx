import Link from "next/link"
import { ArrowRight, BookUser, ShieldCheck, UserCog, Users } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const actions = [
  {
    role: "Super Admin",
    title: "Create a New School",
    description: "Generate a new School ID and Password for a director to get started.",
    icon: <ShieldCheck className="w-8 h-8 text-primary" />,
    link: "/dashboard/create-school",
    cta: "Create School",
  },
  {
    role: "Director",
    title: "Create Principal Account",
    description: "Onboard a new principal for your school by creating their account.",
    icon: <UserCog className="w-8 h-8 text-primary" />,
    link: "/dashboard/create-principal",
    cta: "Create Principal",
  },
  {
    role: "Principal",
    title: "Create Staff Accounts",
    description: "Create accounts for Admins, Teachers, Staff, Accountants, and Librarians.",
    icon: <Users className="w-8 h-8 text-primary" />,
    link: "/dashboard/create-staff",
    cta: "Create Staff",
  },
  {
    role: "Admin",
    title: "Create Parent Accounts",
    description: "Enable parents to access the portal by creating their accounts.",
    icon: <BookUser className="w-8 h-8 text-primary" />,
    link: "/dashboard/create-parent",
    cta: "Create Parent",
  },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Select an action based on your role to manage the campus.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        {actions.map((action) => (
          <Card key={action.title} className="flex flex-col">
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <div className="bg-primary/10 p-3 rounded-full">
                {action.icon}
              </div>
              <div className="flex-1">
                <CardTitle>{action.title}</CardTitle>
                <CardDescription>For: <span className="font-semibold text-primary">{action.role}</span></CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground">
                {action.description}
              </p>
            </CardContent>
            <div className="p-6 pt-0">
              <Button asChild className="w-full sm:w-auto">
                <Link href={action.link}>
                  {action.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
