
import { DirectorSidebar } from "@/components/DirectorSidebar";

export default function DirectorDashboardLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  return (
    <div className="flex min-h-screen">
      <DirectorSidebar schoolId={params.id} />
      <main className="flex-1 p-4 sm:p-6 md:p-8 bg-background">
        {children}
      </main>
    </div>
  );
}
