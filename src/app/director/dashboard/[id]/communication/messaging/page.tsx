
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function MessagingPage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Messaging</h1>
        <p className="text-muted-foreground">This feature is coming soon.</p>
      </div>
      <Card className="flex flex-col items-center justify-center text-center p-12">
        <CardHeader>
            <div className="mx-auto bg-muted rounded-full p-4 w-fit">
                 <MessageSquare className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardTitle className="mt-4">Under Construction</CardTitle>
            <CardDescription>The direct messaging feature is currently being developed. Stay tuned!</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
