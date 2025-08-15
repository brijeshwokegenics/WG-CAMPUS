
export default function DirectorDashboard({ params }: { params: { id: string } }) {
  const schoolId = params.id;

  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Director Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Use the sidebar to navigate through the different sections.</p>
        </div>
    </div>
  );
}
