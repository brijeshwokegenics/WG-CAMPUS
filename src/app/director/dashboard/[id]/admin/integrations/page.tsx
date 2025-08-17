
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">
          Connect your school's ERP with third-party services like WhatsApp.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Business API</CardTitle>
          <CardDescription>
            Configure your WhatsApp provider to send notifications for attendance, fees, and announcements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Developer Note</AlertTitle>
                <AlertDescription>
                   This form allows you to input your API credentials. However, the "Save" button is a placeholder. A developer must implement the backend server action to securely store these keys (e.g., using a secret manager) and handle the API calls to the provider. Storing secrets directly in the database is not secure.
                </AlertDescription>
            </Alert>
            <div className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="whatsapp-provider">WhatsApp Provider</Label>
                    <Input id="whatsapp-provider" placeholder="e.g., Twilio, Vonage" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="whatsapp-api-key">API Key / Account SID</Label>
                    <Input id="whatsapp-api-key" type="password" placeholder="******************" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="whatsapp-auth-token">Auth Token</Label>
                    <Input id="whatsapp-auth-token" type="password" placeholder="******************" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="whatsapp-number">WhatsApp Sender Number</Label>
                    <Input id="whatsapp-number" placeholder="e.g., +14155238886" />
                </div>
                 <div className="flex justify-end">
                    <Button>Save Configuration</Button>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
