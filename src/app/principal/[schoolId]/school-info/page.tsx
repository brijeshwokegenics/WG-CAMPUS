
import { getSchool } from "@/app/actions/school";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";


function InfoDetail({ label, value }: { label: string, value: string | undefined | null }) {
    if (!value) return null;
    return (
        <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-base">{value}</p>
        </div>
    );
}

export default async function SchoolInfoViewPage({ params }: { params: { schoolId: string } }) {
    const schoolId = params.schoolId;
    const { school, error } = await getSchool(schoolId);

    if (error || !school) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <Link href={`/principal/${schoolId}/dashboard`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Link>

            <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start space-x-6">
                        <Avatar className="h-24 w-24 border">
                            <AvatarImage src={school.schoolLogoUrl || "https://placehold.co/100x100.png"} alt={school.schoolName} data-ai-hint="school logo" />
                            <AvatarFallback>{school.schoolName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <CardTitle className="text-3xl">{school.schoolName}</CardTitle>
                            <CardDescription className="text-base text-muted-foreground">
                                School ID: {school.schoolId}
                            </CardDescription>
                             <p className="text-sm text-muted-foreground pt-2">Registration No: {school.registrationNumber || 'N/A'}</p>
                             <p className="text-sm text-muted-foreground">Affiliation Code: {school.affiliationCode || 'N/A'}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mt-6 border-t pt-6">
                        <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <InfoDetail label="Address" value={school.address} />
                            <InfoDetail label="City" value={school.city} />
                            <InfoDetail label="State" value={school.state} />
                            <InfoDetail label="Zip Code" value={school.zipcode} />
                            <InfoDetail label="Phone Number" value={school.phone} />
                            <InfoDetail label="Contact Email" value={school.contactEmail} />
                            <InfoDetail label="School Website" value={school.schoolWebsite} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
