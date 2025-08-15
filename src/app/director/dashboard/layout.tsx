
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { DirectorSidebar } from "@/components/DirectorSidebar";
import { MobileSidebar, directorSidebarNavItems } from '@/components/MobileSidebar';
import { SchoolProvider, useSchool } from '@/context/SchoolProvider';
import { Button } from '@/components/ui/button';
import { School, Sun, Moon, UserCog } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


function DashboardHeader({ schoolId }: { schoolId: string | null }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-2 font-semibold md:hidden">
          <School className="h-6 w-6 text-primary" />
          <span>Campus Hub</span>
      </div>
      <div className="flex-1" />
      <Button variant="outline" size="sm">
        <UserCog className="mr-2 h-4 w-4"/>
        Switch Role
      </Button>
      <ThemeToggle />
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="h-9 w-9 cursor-pointer">
            <AvatarImage src="https://placehold.co/100x100.png" alt="@director" data-ai-hint="user avatar" />
            <AvatarFallback>D</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Director</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}


function DashboardContent({ children, params }: { children: React.ReactNode; params: { id: string } }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { schoolId } = useSchool();

  const navItems = useMemo(() => {
    if (!schoolId) return [];
    return directorSidebarNavItems(schoolId);
  }, [schoolId]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex min-h-screen">
      <DirectorSidebar 
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        schoolId={schoolId}
      />
      <div className={`flex flex-col flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-64'}`}>
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 md:hidden">
          <MobileSidebar navItems={navItems} />
        </header>
        <DashboardHeader schoolId={schoolId} />
        <main className="flex-1 p-6 bg-muted/40">
          {children}
        </main>
      </div>
    </div>
  );
}


export default function DirectorDashboardLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  return (
    <SchoolProvider schoolId={params.id}>
      <DashboardContent params={params}>
        {children}
      </DashboardContent>
    </SchoolProvider>
  );
}
