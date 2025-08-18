
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FrontDeskSidebar } from '@/components/FrontDeskSidebar';
import { MobileSidebar } from '@/components/MobileSidebar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Bell, User, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function FrontDeskDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { schoolId: string };
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  
  return (
    <div className="flex min-h-screen">
      <FrontDeskSidebar 
        schoolId={params.schoolId}
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />
       <div className={`flex flex-col flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-64'}`}>
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            {/* Mobile Sidebar Toggle */}
            <div className="md:hidden">
              <MobileSidebar schoolId={params.schoolId} />
            </div>

            {/* Header Right Side */}
            <div className="flex w-full items-center justify-end gap-4">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Toggle notifications</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                       <AvatarImage src="https://placehold.co/40x40.png" alt="@staff" data-ai-hint="user avatar" />
                       <AvatarFallback>FD</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                   <Link href="/school/login">
                    <DropdownMenuItem>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8 bg-muted/40">
          {children}
        </main>
      </div>
    </div>
  );
}
