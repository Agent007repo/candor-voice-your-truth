import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIssues } from '@/hooks/useIssues';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { StatsCard } from '@/components/ui/stats-card';
import { MainLayout } from '@/components/layout/main-layout';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  LineChart,
  Line,
  Pie
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { issues, loading, categories, refetchIssues } = useIssues();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
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

  if (authLoading || loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  const totalIssues = issues.length;
  const openIssues = issues.filter(issue => issue.status === 'open').length;
  const inProgressIssues = issues.filter(issue => issue.status === 'in_progress').length;
  const resolvedIssues = issues.filter(issue => issue.status === 'resolved').length;
  const criticalIssues = issues.filter(issue => issue.severity === 'critical').length;

  // Filter issues based on search and filters
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || issue.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  // Analytics data
  const statusData = [
    { name: 'Open', value: openIssues, color: '#ef4444' },
    { name: 'In Progress', value: inProgressIssues, color: '#f59e0b' },
    { name: 'Resolved', value: resolvedIssues, color: '#10b981' },
  ];

  const severityData = [
    { name: 'Critical', value: issues.filter(i => i.severity === 'critical').length, color: '#ef4444' },
    { name: 'High', value: issues.filter(i => i.severity === 'high').length, color: '#f59e0b' },
    { name: 'Medium', value: issues.filter(i => i.severity === 'medium').length, color: '#3b82f6' },
    { name: 'Low', value: issues.filter(i => i.severity === 'low').length, color: '#10b981' },
  ];

  // Trend data (mock for now - in real app, this would come from analytics)
  const trendData = [
    { month: 'Jan', issues: 12, resolved: 8 },
    { month: 'Feb', issues: 15, resolved: 12 },
    { month: 'Mar', issues: 18, resolved: 15 },
    { month: 'Apr', issues: 14, resolved: 16 },
    { month: 'May', issues: 22, resolved: 18 },
    { month: 'Jun', issues: totalIssues, resolved: resolvedIssues },
  ];

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user?.user_metadata?.display_name || user?.email}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/report')} className="shadow-candor-md">
              <FileText className="w-4 h-4 mr-2" />
              Report Issue
            </Button>
            <Button variant="outline" onClick={() => navigate('/track')}>
              <Search className="w-4 h-4 mr-2" />
              Track Issue
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Issues"
            value={totalIssues}
            description="All time"
            icon={<FileText />}
            trend={{ value: 12, label: "vs last month" }}
          />
          <StatsCard
            title="Open Issues"
            value={openIssues}
            description="Needs attention"
            icon={<AlertCircle />}
            trend={{ value: -5, label: "vs last week" }}
          />
          <StatsCard
            title="In Progress"
            value={inProgressIssues}
            description="Being worked on"
            icon={<Clock />}
            trend={{ value: 8, label: "vs last week" }}
          />
          <StatsCard
            title="Critical Issues"
            value={criticalIssues}
            description="Urgent attention"
            icon={<AlertTriangle />}
            trend={{ value: -2, label: "vs last week" }}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="issues" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Issues
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Issues */}
              <Card className="shadow-candor-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {issues.slice(0, 5).map((issue) => (
                      <div key={issue.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <Badge variant={getStatusColor(issue.status) as any} className="flex items-center gap-1">
                          {getStatusIcon(issue.status)}
                          {issue.status.replace('_', ' ')}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{issue.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(issue.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <Badge className={`text-xs ${getSeverityColor(issue.severity)}`}>
                          {issue.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Status Distribution */}
              <Card className="shadow-candor-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Issues Tab */}
          <TabsContent value="issues" className="space-y-6">
            {/* Filters */}
            <Card className="shadow-candor-md">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search issues..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severity</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Issues List */}
            <Card className="shadow-candor-lg">
              <CardHeader>
                <CardTitle>Issues ({filteredIssues.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredIssues.map((issue) => (
                    <div key={issue.id} className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground">{issue.title}</h3>
                            <Badge variant={getStatusColor(issue.status) as any} className="flex items-center gap-1">
                              {getStatusIcon(issue.status)}
                              {issue.status.replace('_', ' ')}
                            </Badge>
                            <Badge className={`${getSeverityColor(issue.severity)}`}>
                              {issue.severity}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm line-clamp-2">
                            {issue.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Created {format(new Date(issue.created_at), 'MMM d, yyyy')}</span>
                            {issue.category && (
                              <span>Category: {issue.category.name}</span>
                            )}
                            {issue.location && (
                              <span>Location: {issue.location}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredIssues.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No issues found matching your filters.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Issues Trend */}
              <Card className="shadow-candor-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Issues Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="issues" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Severity Distribution */}
              <Card className="shadow-candor-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Severity Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={severityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <Card className="shadow-candor-lg">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {resolvedIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Resolution Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-success">
                      2.4 days
                    </div>
                    <div className="text-sm text-muted-foreground">Average Resolution Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-warning">
                      {openIssues + inProgressIssues}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Issues</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Dashboard;