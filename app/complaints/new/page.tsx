"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { createComplaintAction } from "@/app/actions/complaints";

const formSchema = z.object({
  subject: z.string().min(4, "Subject is required"),
  description: z.string().min(10, "Description is required"),
  category: z.enum([
    "service_quality",
    "provider_conduct",
    "access_eligibility",
    "privacy_concern",
    "product",
    "technical_support",
    "other",
  ], { required_error: "Category required" }),
  categoryOther: z.string().optional(),
  desiredOutcome: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]),
  branch: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

export default function NewComplaintPage() {
  const router = useRouter();
  const [isSubmitting, setSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      description: "",
      category: "service_quality",
      categoryOther: "",
      desiredOutcome: "",
      priority: "Medium",
      branch: "",
      phone: "",
      email: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const result = await createComplaintAction(values);
      
      toast({
        title: "Success",
        description: `Complaint ${result.complaintNumber} created successfully.`,
      });
      router.push("/complaints");
    } catch (error) {
      const message = error instanceof Error ? error.message : JSON.stringify(error);
      console.error("Error creating complaint:", error);
      toast({
        title: "Error",
        description: message || "Failed to create complaint. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Create Complaint</p>
          <h1 className="text-2xl font-bold">Log a new complaint</h1>
          <p className="text-sm text-muted-foreground">Capture customer context and route to the right queue.</p>
        </div>
      </div>

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>Complaint details</CardTitle>
          <CardDescription>Use realistic data to keep the team aligned.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-6">
            <CardContent className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Device outage at Branch 14" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe what happened" className="min-h-[140px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="service_quality">Service Quality</SelectItem>
                        <SelectItem value="provider_conduct">Provider Conduct</SelectItem>
                        <SelectItem value="access_eligibility">Access and Eligibility</SelectItem>
                        <SelectItem value="privacy_concern">Privacy Concern</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="technical_support">Technical Support</SelectItem>
                        <SelectItem value="other">Others (Can write)</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.watch("category") === "other" && (
                      <div className="mt-2">
                        <FormLabel>Specify category</FormLabel>
                        <FormControl>
                          <Input placeholder="Type category name" {...form.register("categoryOther")} />
                        </FormControl>
                        <FormMessage />
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(["Low", "Medium", "High", "Urgent"] as const).map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="desiredOutcome"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Desired outcome</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the desired resolution or outcome" className="min-h-[120px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch / Location (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Manila East" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+63 900 000 0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (optional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contact@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Attachments section removed per request */}
            </CardContent>

            <CardFooter className="flex items-center justify-end gap-2">
              <Button variant="ghost" type="button" onClick={() => router.push("/complaints")}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Submit complaint"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
