import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { MainLayout } from '@/components/layout/main-layout';
import { useIssues } from '@/hooks/useIssues';
import { 
  ArrowLeft, 
  Search, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User, 
  MapPin, 
  Calendar,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import type { Issue } from '@/types/database';

const TrackIssue = () => {
  const navigate = useNavigate();
  const { trackIssueByToken } = useIssues();
  const [token, setToken] = useState('');
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async () => {
    if (!token.trim()) {
      setError('Please enter a tracking token');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const trackedIssue = await trackIssueByToken(token);
      if (trackedIssue) {
        setIssue({
          ...trackedIssue,
          severity: trackedIssue.severity as 'low' | 'medium' | 'high' | 'critical',
          status: trackedIssue.status as 'open' | 'in_progress' | 'resolved' | 'closed',
          attachments: Array.isArray(trackedIssue.attachments) ? trackedIssue.attachments : [],
          metadata: typeof trackedIssue.metadata === 'object' ? trackedIssue.metadata as Record<string, any> : {}
        });
      } else {
        setError('Issue not found. Please check your tracking token.');
      }
    } catch (err) {
      setError('Failed to track issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-5 h-5 text-destructive" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-warning" />;
      case 'resolved': return <CheckCircle className="w-5 h-5 text-success" />;
      case 'closed': return <CheckCircle className="w-5 h-5 text-muted-foreground" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'in_progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'secondary';
      default: return 'secondary';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-primary text-primary-foreground';
      case 'low': return 'bg-success text-success-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'open': return 'Your issue has been received and is awaiting review.';
      case 'in_progress': return 'Your issue is being actively worked on by our team.';
      case 'resolved': return 'Your issue has been resolved. Please verify the solution.';
      case 'closed': return 'Your issue has been closed and resolved.';
      default: return 'Status unknown.';
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="hover:bg-muted/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Track Your Issue</h1>
          <p className="text-muted-foreground">
            Enter your tracking token to view the status and progress of your reported issue.
          </p>
        </div>

        {/* Tracking Form */}
        <Card className="shadow-candor-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Enter Tracking Token
            </CardTitle>
            <CardDescription>
              The tracking token was provided when you submitted your issue report.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Tracking Token</Label>
              <div className="flex gap-2">
                <Input
                  id="token"
                  placeholder="Enter your tracking token..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleTrack} 
                  disabled={loading || !token.trim()}
                  className="shadow-candor-md"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Track
                    </>
                  )}
                </Button>
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Issue Details */}
        {issue && (
          <div className="space-y-6">
            {/* Status Overview */}
            <Card className="shadow-candor-lg border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {getStatusIcon(issue.status)}
                  Issue Status: {issue.status.replace('_', ' ').toUpperCase()}
                </CardTitle>
                <CardDescription>
                  {getStatusDescription(issue.status)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(issue.status) as any} className="text-sm">
                    {issue.status.replace('_', ' ')}
                  </Badge>
                  <Badge className={`text-sm ${getSeverityColor(issue.severity)}`}>
                    {issue.severity} priority
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Issue Information */}
            <Card className="shadow-candor-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Issue Information
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">{issue.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{issue.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Reported</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(issue.created_at), 'PPP p')}
                        </p>
                      </div>
                    </div>

                    {issue.category && (
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Category</p>
                          <p className="text-sm text-muted-foreground">{issue.category.name}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {issue.location && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Location</p>
                          <p className="text-sm text-muted-foreground">{issue.location}</p>
                        </div>
                      </div>
                    )}

                    {issue.department && (
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Department</p>
                          <p className="text-sm text-muted-foreground">{issue.department.name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {issue.resolved_at && (
                  <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Resolved</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      This issue was resolved on {format(new Date(issue.resolved_at), 'PPP p')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progress Timeline */}
            <Card className="shadow-candor-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Progress Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Issue Reported</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(issue.created_at), 'PPP p')}
                      </p>
                    </div>
                  </div>

                  {issue.status !== 'open' && (
                    <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                      <div className="w-3 h-3 bg-warning rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Under Review</p>
                        <p className="text-xs text-muted-foreground">
                          Issue is being reviewed by our team
                        </p>
                      </div>
                    </div>
                  )}

                  {issue.status === 'in_progress' && (
                    <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">In Progress</p>
                        <p className="text-xs text-muted-foreground">
                          Actively being worked on
                        </p>
                      </div>
                    </div>
                  )}

                  {(issue.status === 'resolved' || issue.status === 'closed') && (
                    <div className="flex items-center gap-4 p-3 bg-success/10 rounded-lg">
                      <div className="w-3 h-3 bg-success rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Resolved</p>
                        <p className="text-xs text-muted-foreground">
                          {issue.resolved_at ? format(new Date(issue.resolved_at), 'PPP p') : 'Recently resolved'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="shadow-candor-lg">
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
                <CardDescription>
                  If you have questions about this issue or need further assistance, you can:
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="outline" onClick={() => navigate('/report')}>
                    <FileText className="w-4 h-4 mr-2" />
                    Report New Issue
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Keep your tracking token safe for future reference: <code className="bg-muted px-2 py-1 rounded text-xs">{token}</code>
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default TrackIssue;