
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, BarChart2, Building2, DollarSign, FileText, Megaphone, Settings, Shield, UserPlus, Users, Bus, Library, BedDouble, BookOpen, UserCheck, Briefcase, Calendar, MessageSquare, Banknote } from "lucide-react";

export default function DirectorDashboard() {
  return (
    <div>
        <h1 className="text-3xl font-bold tracking-tight">Director Dashboard</h1>
        <p className="text-muted-foreground">This page is not in use. You should be redirected to a specific school's dashboard.</p>
        <p className="mt-4">If you are seeing this, please try logging in again through the school portal.</p>
         <Link href="/school/login">
            <Button variant="link">Go to Login</Button>
        </Link>
    </div>
  );
}
