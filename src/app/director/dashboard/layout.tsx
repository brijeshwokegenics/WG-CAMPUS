
import { DirectorSidebar } from "@/components/DirectorSidebar";

export default function DirectorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <DirectorSidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 bg-background">
        {children}
      </main>
    </div>
  );
}
