import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { useIssues } from "@/hooks/useIssues";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, Shield, AlertTriangle, Building, MapPin } from "lucide-react";

const reportSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Please provide more details (minimum 20 characters)"),
  category_id: z.string().min(1, "Please select a category"),
  department_id: z.string().optional(),
  severity: z.enum(["low", "medium", "high", "critical"]),
  location: z.string().optional(),
  anonymous: z.boolean().default(false),
});

type ReportData = z.infer<typeof reportSchema>;

const ReportIssue = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { categories, departments, createIssue } = useIssues();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const form = useForm<ReportData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      title: "",
      description: "",
      category_id: "",
      department_id: "",
      severity: "medium",
      location: "",
      anonymous: false,
    },
  });

  const handleSubmit = async (data: ReportData) => {
    setLoading(true);
    try {
      const issueData = {
        title: data.title,
        description: data.description,
        category_id: data.category_id,
        department_id: data.department_id || undefined,
        severity: data.severity,
        location: data.location || undefined,
        reporter_id: data.anonymous ? undefined : user?.id,
        status: 'open' as const,
        metadata: {
          submitted_via: "web_form",
          anonymous_submission: data.anonymous,
          timestamp: new Date().toISOString(),
        },
      };

      await createIssue(issueData);
      
      toast({
        title: "Report submitted successfully",
        description: data.anonymous 
          ? "Your anonymous report has been submitted. Save your tracking token for updates."
          : "Your report has been submitted and assigned a tracking number.",
      });

      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Failed to submit report",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-destructive';
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-muted-foreground';
    }
  };

  const getSeverityDescription = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Immediate safety risk or system down';
      case 'high': return 'Significant impact on operations';
      case 'medium': return 'Moderate impact, needs attention';
      case 'low': return 'Minor issue or suggestion';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Main Form */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <AlertTriangle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Report an Issue</CardTitle>
                <CardDescription>
                  Help us improve by reporting problems, safety concerns, or suggestions
                </CardDescription>
              </div>
            </div>
            
            {/* Progress Steps */}
            <div className="flex items-center justify-center space-x-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`rounded-full h-8 w-8 flex items-center justify-center text-sm font-medium transition-all ${
                      step >= s
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`w-12 h-0.5 mx-2 transition-all ${
                        step > s ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {step === 1 && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-lg font-medium">What's the issue?</h3>
                    
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Issue Summary</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Brief description of the issue..." 
                              {...field} 
                              className="transition-all focus:ring-2 focus:ring-primary/20"
                            />
                          </FormControl>
                          <FormDescription>
                            A clear, concise title that describes the problem
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Detailed Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Please provide as much detail as possible about the issue, including when it occurred, what you were doing, and any other relevant information..."
                              className="min-h-32 transition-all focus:ring-2 focus:ring-primary/20"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            The more details you provide, the faster we can resolve the issue
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button 
                        type="button" 
                        onClick={() => setStep(2)}
                        disabled={!form.watch("title") || !form.watch("description")}
                      >
                        Next: Categorize
                      </Button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-lg font-medium">Help us categorize this issue</h3>

                    <FormField
                      control={form.control}
                      name="category_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select the most appropriate category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-3 h-3 rounded-full" 
                                      style={{ backgroundColor: category.color }}
                                    />
                                    {category.name}
                                  </div>
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
                      name="department_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Which department should handle this?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id}>
                                  <div className="flex items-center gap-2">
                                    <Building className="w-4 h-4" />
                                    {dept.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Help us route your issue to the right team
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="severity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Severity Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[
                                { value: "low", label: "Low Priority" },
                                { value: "medium", label: "Medium Priority" },
                                { value: "high", label: "High Priority" },
                                { value: "critical", label: "Critical" },
                              ].map((severity) => (
                                <SelectItem key={severity.value} value={severity.value}>
                                  <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${getSeverityColor(severity.value).replace('text-', 'bg-')}`} />
                                    <div>
                                      <div className={getSeverityColor(severity.value)}>{severity.label}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {getSeverityDescription(severity.value)}
                                      </div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={() => setStep(1)}>
                        Previous
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => setStep(3)}
                        disabled={!form.watch("category_id") || !form.watch("severity")}
                      >
                        Next: Final Details
                      </Button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-lg font-medium">Additional details</h3>

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location (Optional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input 
                                placeholder="Building, floor, room number, or specific area..."
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Help us locate the issue quickly
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="anonymous"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              Submit this report anonymously
                            </FormLabel>
                            <FormDescription>
                              Your identity will be protected. You'll receive a tracking token to check the status of your report.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-medium mb-2">Report Summary</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div><strong>Title:</strong> {form.watch("title")}</div>
                        <div><strong>Category:</strong> {categories.find(c => c.id === form.watch("category_id"))?.name}</div>
                        <div><strong>Severity:</strong> <span className={getSeverityColor(form.watch("severity"))}>{form.watch("severity")}</span></div>
                        {form.watch("location") && <div><strong>Location:</strong> {form.watch("location")}</div>}
                        <div><strong>Submission:</strong> {form.watch("anonymous") ? "Anonymous" : "With your identity"}</div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={() => setStep(2)}>
                        Previous
                      </Button>
                      <Button type="submit" disabled={loading} className="gap-2">
                        {loading ? "Submitting..." : "Submit Report"}
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportIssue;