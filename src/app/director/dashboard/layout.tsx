
'use client';

import { useState, useMemo } from 'react';
import { DirectorSidebar, directorSidebarNavItems } from "@/components/DirectorSidebar";
import { MobileSidebar } from '@/components/MobileSidebar';
import { SchoolProvider, useSchool } from '@/context/SchoolProvider';

function DashboardContent({ children, params }: { children: React.ReactNode; params: { id: string } }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { schoolId } = useSchool();

  const navItems = useMemo(() => {
    return schoolId ? directorSidebarNavItems(schoolId) : [];
  }, [schoolId]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex min-h-screen">
      <DirectorSidebar 
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />
      <div className={`flex flex-col flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-64'}`}>
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 md:hidden">
          <MobileSidebar navItems={navItems} />
        </header>
        <main className="flex-1 p-6 bg-background">
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
