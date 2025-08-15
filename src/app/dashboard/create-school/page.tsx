"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { AlertCircle, ArrowLeft, Loader2, School } from "lucide-react"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const formSchema = z.object({
  schoolName: z.string().min(3, "School name must be at least 3 characters"),
})

export default function CreateSchoolPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [generatedCredentials, setGeneratedCredentials] = useState<{ id: string; pass: string } | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      schoolName: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    console.log(values)
    
    // Simulate API call and credential generation
    setTimeout(() => {
      const schoolId = `SCH-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      const password = Math.random().toString(36).substr(2, 8)
      setGeneratedCredentials({ id: schoolId, pass: password })
      setIsLoading(false)
      form.reset()
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create New School</h1>
        <p className="text-muted-foreground">
          This action is reserved for Super Admins.
        </p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>School Details</CardTitle>
          <CardDescription>Enter the school name to generate its credentials.</CardDescription>
        </CardHeader>
        <CardContent>
          {!generatedCredentials ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="schoolName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Greenwood High International" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Credentials
                </Button>
              </form>
            </Form>
          ) : (
            <div className="space-y-4">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Credentials Generated Successfully!</AlertTitle>
                    <AlertDescription className="space-y-2 mt-2">
                      <p>Please save these credentials securely. They will be used by the School Director to log in.</p>
                      <div>
                        <p className="text-sm font-medium">School ID: <span className="font-mono p-1 bg-muted rounded">{generatedCredentials.id}</span></p>
                        <p className="text-sm font-medium">Password: <span className="font-mono p-1 bg-muted rounded">{generatedCredentials.pass}</span></p>
                      </div>
                    </AlertDescription>
                </Alert>
                <Button onClick={() => setGeneratedCredentials(null)}>
                    Create Another School
                </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
