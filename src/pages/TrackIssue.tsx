import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useIssues } from "@/hooks/useIssues";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Search, Clock, User, MapPin, Building, Shield } from "lucide-react";
import { Issue } from "@/types/database";
import { format } from "date-fns";

const trackSchema = z.object({
  token: z.string().min(1, "Please enter your tracking token"),
});

type TrackData = z.infer<typeof trackSchema>;

const TrackIssue = () => {
  const navigate = useNavigate();
  const { trackIssueByToken } = useIssues();
  const [loading, setLoading] = useState(false);
  const [trackedIssue, setTrackedIssue] = useState<Issue | null>(null);

  const form = useForm<TrackData>({
    resolver: zodResolver(trackSchema),
    defaultValues: {
      token: "",
    },
  });

  const handleTrack = async (data: TrackData) => {
    setLoading(true);
    try {
      const issue = await trackIssueByToken(data.token);
      if (issue) {
        setTrackedIssue(issue as Issue);
        toast({
          title: "Issue found",
          description: "Here's the current status of your report.",
        });
      } else {
        toast({
          title: "Issue not found",
          description: "Please check your tracking token and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error tracking issue",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'in_progress': return 'default';
      case 'resolved': return 'secondary';
      case 'closed': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return '🔴';
      case 'in_progress': return '🟡';
      case 'resolved': return '🟢';
      case 'closed': return '⚪';
      default: return '⚪';
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

        {/* Search Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Track Your Issue</CardTitle>
                <CardDescription>
                  Enter your tracking token to check the status of your report
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleTrack)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tracking Token</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter your tracking token (e.g., hr_ABC123XYZ)"
                            {...field}
                            className="font-mono"
                          />
                          <Button type="submit" disabled={loading} className="gap-2">
                            {loading ? "Searching..." : "Track"}
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>

            {!trackedIssue && (
              <div className="text-center py-8 space-y-4">
                <div className="text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Anonymous reporting ensures your privacy.</p>
                  <p className="text-sm">Your tracking token was provided when you submitted your report.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Issue Details */}
        {trackedIssue && (
          <Card className="shadow-lg animate-fade-in">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getStatusIcon(trackedIssue.status)}</span>
                    <CardTitle className="text-xl">{trackedIssue.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(trackedIssue.status)}>
                      {trackedIssue.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className={getSeverityColor(trackedIssue.severity)}>
                      {trackedIssue.severity.toUpperCase()} PRIORITY
                    </Badge>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Reported {format(new Date(trackedIssue.created_at), 'MMM d, yyyy')}
                  </div>
                  {trackedIssue.resolved_at && (
                    <div className="flex items-center gap-1 text-green-600">
                      <Clock className="h-4 w-4" />
                      Resolved {format(new Date(trackedIssue.resolved_at), 'MMM d, yyyy')}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Issue Description */}
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {trackedIssue.description}
                </p>
              </div>

              {/* Issue Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trackedIssue.category && (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: trackedIssue.category.color }}
                    />
                    <span className="font-medium">Category:</span>
                    <span className="text-muted-foreground">{trackedIssue.category.name}</span>
                  </div>
                )}

                {trackedIssue.department && (
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Department:</span>
                    <span className="text-muted-foreground">{trackedIssue.department.name}</span>
                  </div>
                )}

                {trackedIssue.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Location:</span>
                    <span className="text-muted-foreground">{trackedIssue.location}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Submission:</span>
                  <span className="text-muted-foreground">
                    {trackedIssue.reporter_id ? 'Identified Reporter' : 'Anonymous Report'}
                  </span>
                </div>
              </div>

              {/* Status Timeline */}
              <div>
                <h3 className="font-medium mb-4">Status Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <div>
                      <div className="font-medium">Report Submitted</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(trackedIssue.created_at), 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                  </div>

                  {trackedIssue.status !== 'open' && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <div>
                        <div className="font-medium">Under Review</div>
                        <div className="text-sm text-muted-foreground">
                          Your report is being processed
                        </div>
                      </div>
                    </div>
                  )}

                  {trackedIssue.status === 'resolved' && trackedIssue.resolved_at && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <div>
                        <div className="font-medium text-green-700">Issue Resolved</div>
                        <div className="text-sm text-green-600">
                          {format(new Date(trackedIssue.resolved_at), 'MMM d, yyyy h:mm a')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <h3 className="font-medium mb-2">Need Help?</h3>
                <p className="text-sm text-muted-foreground">
                  If you have questions about your report or need to provide additional information, 
                  save your tracking token and contact our support team.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TrackIssue;