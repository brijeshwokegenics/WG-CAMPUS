import Link from "next/link"
import { ArrowRight, BookUser, School, ShieldCheck, UserCog, Users } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const stats = [
  {
    title: "Total Schools",
    value: "12",
    icon: <School className="w-6 h-6 text-primary" />,
    change: "+2 this month",
  },
  {
    title: "Total Principals",
    value: "10",
    icon: <UserCog className="w-6 h-6 text-primary" />,
    change: "+1 this month",
  },
  {
    title: "Total Staff",
    value: "150+",
    icon: <Users className="w-6 h-6 text-primary" />,
    change: "+15 this month",
  },
  {
    title: "Total Students",
    value: "2,500+",
    icon: <BookUser className="w-6 h-6 text-primary" />,
    change: "+120 this month",
  },
];


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
        <h1 className="text-3xl font-bold tracking-tight">Welcome, Super Admin!</h1>
        <p className="text-muted-foreground">
          Here's an overview of the entire campus ecosystem.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight">Quick Actions</h2>
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
