
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Mail, MessageSquare } from "lucide-react";

export default function SuperAdminIntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Integrations</h1>
        <p className="text-muted-foreground">
          Configure third-party services like Email and SMS for system-wide notifications.
        </p>
      </div>

      <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Developer Note</AlertTitle>
          <AlertDescription>
            This is a placeholder for the Email and SMS integration settings. The actual integration requires backend development to handle API calls to providers like SendGrid (for email) or Twilio (for SMS) and securely manage API keys.
          </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Integration Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5"/> Email (SMTP) Gateway</CardTitle>
            <CardDescription>
              Configure an SMTP service to send emails for reports, and notifications.
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
              Configure an SMS provider to send critical alerts for attendance, fees, etc.
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
