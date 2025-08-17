
import { LibraryManager } from "@/components/library/LibraryManager";

export default function LibraryPage({ params }: { params: { id: string } }) {
  const schoolId = params.id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Library Management</h1>
        <p className="text-muted-foreground">
          Manage book catalog, circulation, and member activities.
        </p>
      </div>
      <LibraryManager schoolId={schoolId} />
    </div>
  );
}
