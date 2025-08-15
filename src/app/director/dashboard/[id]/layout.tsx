
'use client';

import { useState } from 'react';
import { DirectorSidebar } from '@/components/DirectorSidebar';
import { MobileSidebar } from '@/components/MobileSidebar';

export default function DirectorDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  
  return (
    <div className="flex min-h-screen">
      <DirectorSidebar 
        schoolId={params.id}
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />
       <div className={`flex flex-col flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-64'}`}>
         <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 md:hidden">
            <MobileSidebar schoolId={params.id} />
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8 bg-muted/40">
          {children}
        </main>
      </div>
    </div>
  );
}
