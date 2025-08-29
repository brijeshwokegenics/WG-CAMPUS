
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Mail, MessageSquare, Phone, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { getIntegrationSettings, saveSmsConfiguration, saveWhatsappConfiguration, saveEmailConfiguration } from "@/app/actions/integrations";

export default function IntegrationsPage({ params }: { params: { id: string }}) {
    const schoolId = params.id;
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSettings() {
            setLoading(true);
            const res = await getIntegrationSettings(schoolId);
            if (res.success) {
                setSettings(res.data);
            }
            setLoading(false);
        }
        fetchSettings();
    }, [schoolId]);

    if (loading) {
        return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

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
            The forms below save your API credentials to the database. A developer must implement the backend server actions in `src/app/actions/messaging.ts` to make the actual API calls to the respective providers. Storing secrets directly in the database is not recommended for production environments; use a secret manager instead.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WhatsAppForm schoolId={schoolId} initialData={settings?.whatsapp} />
        <EmailForm schoolId={schoolId} initialData={settings?.email} />
        <SmsForm schoolId={schoolId} initialData={settings?.sms} />
      </div>
    </div>
  );
}

function WhatsAppForm({ schoolId, initialData }: { schoolId: string, initialData?: any }) {
    const [state, formAction] = useFormState(saveWhatsappConfiguration, { success: false, error: null });
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5"/> WhatsApp Business API</CardTitle>
                <CardDescription>Configure your WhatsApp provider to send notifications.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-4">
                    <input type="hidden" name="schoolId" value={schoolId} />
                    {state.message && <Alert className="border-green-500 text-green-700"><AlertDescription>{state.message}</AlertDescription></Alert>}
                    {state.error && <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>}
                    <div className="space-y-2">
                        <Label htmlFor="whatsapp-provider">WhatsApp Provider</Label>
                        <Input id="whatsapp-provider" name="whatsappProvider" placeholder="e.g., Twilio, Vonage" defaultValue={initialData?.whatsappProvider} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="whatsapp-api-key">API Key / Account SID</Label>
                        <Input id="whatsapp-api-key" name="whatsappApiKey" type="password" placeholder="******************" defaultValue={initialData?.whatsappApiKey} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="whatsapp-auth-token">Auth Token</Label>
                        <Input id="whatsapp-auth-token" name="whatsappAuthToken" type="password" placeholder="******************" defaultValue={initialData?.whatsappAuthToken} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="whatsapp-number">WhatsApp Sender Number</Label>
                        <Input id="whatsapp-number" name="whatsappNumber" placeholder="e.g., +14155238886" defaultValue={initialData?.whatsappNumber} />
                    </div>
                    <div className="flex justify-end"><Button>Save WhatsApp Configuration</Button></div>
                </form>
            </CardContent>
        </Card>
    );
}

function EmailForm({ schoolId, initialData }: { schoolId: string, initialData?: any }) {
     const [state, formAction] = useFormState(saveEmailConfiguration, { success: false, error: null });
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5"/> Email (SMTP) Gateway</CardTitle>
                <CardDescription>Configure an SMTP service to send emails for reports and notifications.</CardDescription>
            </CardHeader>
            <CardContent>
                 <form action={formAction} className="space-y-4">
                    <input type="hidden" name="schoolId" value={schoolId} />
                    {state.message && <Alert className="border-green-500 text-green-700"><AlertDescription>{state.message}</AlertDescription></Alert>}
                    {state.error && <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>}
                    <div className="space-y-2">
                        <Label htmlFor="smtp-host">SMTP Host</Label>
                        <Input id="smtp-host" name="smtpHost" placeholder="e.g., smtp.sendgrid.net" defaultValue={initialData?.smtpHost} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label htmlFor="smtp-port">SMTP Port</Label><Input id="smtp-port" name="smtpPort" placeholder="e.g., 587" defaultValue={initialData?.smtpPort} /></div>
                        <div className="space-y-2"><Label htmlFor="smtp-user">SMTP Username</Label><Input id="smtp-user" name="smtpUser" placeholder="e.g., apikey" defaultValue={initialData?.smtpUser} /></div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="smtp-pass">SMTP Password / API Key</Label>
                        <Input id="smtp-pass" name="smtpPass" type="password" placeholder="******************" defaultValue={initialData?.smtpPass} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="from-email">Default "From" Email</Label>
                        <Input id="from-email" name="fromEmail" placeholder="e.g., no-reply@yourschool.com" defaultValue={initialData?.fromEmail} />
                    </div>
                    <div className="flex justify-end"><Button>Save Email Configuration</Button></div>
                </form>
            </CardContent>
        </Card>
    );
}

function SmsForm({ schoolId, initialData }: { schoolId: string, initialData?: any }) {
     const [state, formAction] = useFormState(saveSmsConfiguration, { success: false, error: null });
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5"/> SMS Gateway</CardTitle>
                <CardDescription>Configure an SMS provider to send critical alerts for attendance, fees, etc.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-4">
                     <input type="hidden" name="schoolId" value={schoolId} />
                    {state.message && <Alert className="border-green-500 text-green-700"><AlertDescription>{state.message}</AlertDescription></Alert>}
                    {state.error && <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>}
                    <div className="space-y-2">
                        <Label htmlFor="sms-provider">SMS Provider</Label>
                        <Input id="sms-provider" name="smsProvider" placeholder="e.g., Twilio, Vonage" defaultValue={initialData?.smsProvider}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sms-sid">Account SID</Label>
                        <Input id="sms-sid" name="smsSid" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxx" defaultValue={initialData?.smsSid}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sms-token">Auth Token</Label>
                        <Input id="sms-token" name="smsToken" type="password" placeholder="******************" defaultValue={initialData?.smsToken}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sms-number">Provider Phone Number</Label>
                        <Input id="sms-number" name="smsNumber" placeholder="e.g., +14155238886" defaultValue={initialData?.smsNumber} />
                    </div>
                    <div className="flex justify-end"><Button>Save SMS Configuration</Button></div>
                </form>
            </CardContent>
        </Card>
    );
}
