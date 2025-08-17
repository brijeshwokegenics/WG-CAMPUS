
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Mail, MessageSquare, Phone } from "lucide-react";

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">
          Connect your school's ERP with third-party services for communication.
        </p>
      </div>
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Developer Note</AlertTitle>
        <AlertDescription>
            The forms below allow you to input your API credentials. A developer must implement the backend server actions to securely store these keys (e.g., using a secret manager) and handle the API calls to the respective providers. Storing secrets directly in the database is not secure.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WhatsApp Integration Card */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5"/> WhatsApp Business API</CardTitle>
                <CardDescription>
                    Configure your WhatsApp provider to send notifications.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    <Button>Save WhatsApp Configuration</Button>
                </div>
            </CardContent>
        </Card>

        {/* Email Integration Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5"/> Email (SMTP) Gateway</CardTitle>
            <CardDescription>
              Configure an SMTP service to send emails for reports and notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="smtp-host">SMTP Host</Label>
                  <Input id="smtp-host" placeholder="e.g., smtp.sendgrid.net" />
              </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="smtp-port">SMTP Port</Label>
                    <Input id="smtp-port" placeholder="e.g., 587" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="smtp-user">SMTP Username</Label>
                    <Input id="smtp-user" placeholder="e.g., apikey" />
                </div>
              </div>
               <div className="space-y-2">
                  <Label htmlFor="smtp-pass">SMTP Password / API Key</Label>
                  <Input id="smtp-pass" type="password" placeholder="******************" />
              </div>
               <div className="space-y-2">
                  <Label htmlFor="from-email">Default "From" Email</Label>
                  <Input id="from-email" placeholder="e.g., no-reply@yourschool.com" />
              </div>
               <div className="flex justify-end">
                  <Button>Save Email Configuration</Button>
              </div>
          </CardContent>
        </Card>

        {/* SMS Integration Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5"/> SMS Gateway</CardTitle>
            <CardDescription>
              Configure an SMS provider to send critical alerts for attendance, etc.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
               <div className="space-y-2">
                  <Label htmlFor="sms-provider">SMS Provider</Label>
                  <Input id="sms-provider" placeholder="e.g., Twilio, Vonage" />
              </div>
               <div className="space-y-2">
                  <Label htmlFor="sms-sid">Account SID</Label>
                  <Input id="sms-sid" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxx" />
              </div>
               <div className="space-y-2">
                  <Label htmlFor="sms-token">Auth Token</Label>
                  <Input id="sms-token" type="password" placeholder="******************" />
              </div>
               <div className="space-y-2">
                  <Label htmlFor="sms-number">Provider Phone Number</Label>
                  <Input id="sms-number" placeholder="e.g., +14155238886" />
              </div>
               <div className="flex justify-end">
                  <Button>Save SMS Configuration</Button>
              </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
