"use client"

import { useState } from "react"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleUpdateProfile = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      })
    }, 1500)
  }

  const handleChangePassword = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Password Changed",
        description: "Your password has been successfully changed.",
      })
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Super Admin Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and personal information.
        </p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" defaultValue="Super Admin" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" defaultValue="superadmin@example.com" disabled />
          </div>
          <Button onClick={handleUpdateProfile} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Profile
          </Button>
        </CardContent>
        <Separator />
        <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password here. It's recommended to use a strong password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" type="password" placeholder="••••••••" />
          </div>
           <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" placeholder="••••••••" />
          </div>
           <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input id="confirmPassword" type="password" placeholder="••••••••" />
          </div>
          <Button onClick={handleChangePassword} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Change Password
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
