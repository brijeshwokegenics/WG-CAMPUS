"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { AtSign, KeyRound, Loader2, LogIn, School, User, Shield } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Logo } from "@/components/logo"
import { Separator } from "@/components/ui/separator"

type Role = "director" | "principal" | "admin" | "teacher" | "staff" | "accountant" | "librarian" | "parent"

const formSchema = z.object({
  role: z.string().min(1, "Please select a role"),
  identifier: z.string().min(1, "This field is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<Role | "">("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "",
      identifier: "",
      password: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    console.log(values)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Login Successful",
        description: `Welcome back! Redirecting to your dashboard.`,
      })
      router.push("/dashboard")
    }, 1500)
  }

  const getIdentifierLabel = () => {
    switch (selectedRole) {
      case "director":
        return "School ID"
      default:
        return "Email Address"
    }
  }

  const getIdentifierIcon = () => {
    switch (selectedRole) {
      case "director":
        return <School className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      default:
        return <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
       <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] opacity-10 dark:bg-background"></div>
      
      <div className="flex flex-col items-center justify-center gap-4 mb-8">
        <Logo />
        <h1 className="text-3xl font-bold text-center sm:text-4xl">WG CAMPUS</h1>
        <p className="text-muted-foreground text-center max-w-sm sm:max-w-md">Your integrated school management solution.</p>
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome Back!</CardTitle>
          <CardDescription>Select your role and sign in to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Role</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value)
                      setSelectedRole(value as Role)
                    }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="pl-10 relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="director">Director</SelectItem>
                        <SelectItem value="principal">Principal</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="accountant">Accountant</SelectItem>
                        <SelectItem value="librarian">Librarian</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedRole && (
                <>
                  <FormField
                    control={form.control}
                    name="identifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{getIdentifierLabel()}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            {getIdentifierIcon()}
                            <Input placeholder={getIdentifierLabel() === 'School ID' ? 'Enter School ID' : 'name@example.com'} {...field} className="pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                             <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                           </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                    Sign In
                  </Button>
                </>
              )}
            </form>
          </Form>
          <Separator className="my-6" />
           <div className="text-center">
              <Button variant="link" asChild>
                <Link href="/super-admin-login"><Shield className="mr-2 h-4 w-4" />Super Admin Login</Link>
              </Button>
            </div>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} WG CAMPUS. All Rights Reserved.
      </footer>
    </main>
  )
}
