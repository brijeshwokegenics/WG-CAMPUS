
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageSquare } from "lucide-react";

export default function MessagingPage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Messaging</h1>
        <p className="text-muted-foreground">Send and receive messages from staff, students, and parents.</p>
      </div>
      <Card className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed">
        <CardHeader>
            <div className="mx-auto bg-muted rounded-full p-4 w-fit">
                 <MessageSquare className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardTitle className="mt-4">Advanced Messaging System Coming Soon</CardTitle>
            <CardDescription className="max-w-md mx-auto">
                This feature is currently under active development. Soon, you will be able to send direct messages, create group chats, and communicate seamlessly with everyone in the school community right from this page.
            </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
