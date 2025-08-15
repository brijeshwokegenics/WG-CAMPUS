'use client';

import { useState } from 'react';
import { DirectorSidebar } from "@/components/DirectorSidebar";
import { MobileSidebar } from '@/components/MobileSidebar';
import { directorSidebarNavItems } from '@/components/DirectorSidebar';
import { SchoolProvider } from '@/context/SchoolProvider';

export default function DirectorDashboardLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <SchoolProvider schoolId={params.id}>
      <div className="flex min-h-screen">
        <DirectorSidebar 
          isCollapsed={isSidebarCollapsed}
          toggleSidebar={toggleSidebar}
        />
        <div className={`flex flex-col flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-64'}`}>
          <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 md:hidden">
            <MobileSidebar navItems={directorSidebarNavItems(params.id)} />
          </header>
          <main className="flex-1 p-6 bg-background">
            {children}
          </main>
        </div>
      </div>
    </SchoolProvider>
  );
}
