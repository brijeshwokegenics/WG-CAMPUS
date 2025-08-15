'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BarChart, Bell, Briefcase, IndianRupee, Search, UserCheck, Users } from "lucide-react";

export default function DirectorDashboard({ params }: { params: { id: string } }) {
  const schoolId = params.id;

  const statsCards = [
    { title: "Total Students", value: "1,250", change: "+2% from last month", icon: <Users className="h-5 w-5 text-muted-foreground" /> },
    { title: "Total Staff", value: "150", change: "+1 new hire this month", icon: <Briefcase className="h-5 w-5 text-muted-foreground" /> },
    { title: "Student Attendance", value: "92.5%", change: "Today's Average", icon: <UserCheck className="h-5 w-5 text-muted-foreground" /> },
    { title: "Fees Collected", value: "₹85.4L", change: "This Month", icon: <IndianRupee className="h-5 w-5 text-muted-foreground" /> },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Director's Dashboard</h1>
          <p className="text-muted-foreground">Friday, August 15, 2025</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Quick Search..." className="pl-10" />
          </div>
          <Button variant="outline" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-6 w-6" />
              Academic Performance Snapshot
            </CardTitle>
            <p className="text-sm text-muted-foreground">Average scores by class for the recent term</p>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
            <p>Chart placeholder</p>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}