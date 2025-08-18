
'use client';

import { useState } from 'react';
import { Sidebar } from "@/components/Sidebar";
import { MobileSidebar } from '@/components/MobileSidebar';
import { sidebarNavItems } from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />
       <div className={`flex flex-col flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-64'}`}>
         <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 md:hidden">
          <MobileSidebar navItems={sidebarNavItems} />
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
