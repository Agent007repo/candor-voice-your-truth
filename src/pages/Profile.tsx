import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { MainLayout } from '@/components/layout/main-layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  User, 
  Settings, 
  Mail,
  Phone,
  Building,
  Briefcase,
  Save,
  Shield
} from 'lucide-react';
import type { Profile } from '@/types/database';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    display_name: '',
    first_name: '',
    last_name: '',
    phone: '',
    company: '',
    job_title: '',
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          department:departments(*)
        `)
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, create one
          await createInitialProfile();
          return;
        }
        throw error;
      }

      const profileData: Profile = {
        ...data,
        department: data.department || undefined
      };

      setProfile(profileData);
      setFormData({
        display_name: data.display_name || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
        company: data.company || '',
        job_title: data.job_title || '',
      });
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createInitialProfile = async () => {
    if (!user) return;

    try {
      const initialProfile = {
        user_id: user.id,
        email: user.email!,
        role: 'employee',
        display_name: user.user_metadata?.display_name || '',
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([initialProfile])
        .select(`
          *,
          department:departments(*)
        `)
        .single();

      if (error) throw error;

      const profileData: Profile = {
        ...data,
        department: data.department || undefined
      };

      setProfile(profileData);
      setFormData({
        display_name: data.display_name || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
        company: data.company || '',
        job_title: data.job_title || '',
      });
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast({
        title: "Error creating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', profile.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...formData } : null);
      setEditing(false);

      toast({
        title: "Profile updated successfully",
        description: "Your changes have been saved.",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'hr': return 'default';
      case 'manager': return 'secondary';
      case 'employee': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Profile Not Found</h1>
            <p className="text-muted-foreground">Unable to load your profile information.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
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
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button onClick={() => setEditing(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and account settings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <Card className="lg:col-span-1 shadow-candor-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 bg-gradient-candor rounded-full flex items-center justify-center">
                  {profile.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt="Profile" 
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
              </div>
              <CardTitle className="text-xl">
                {profile.display_name || `${profile.first_name} ${profile.last_name}`.trim() || 'Anonymous User'}
              </CardTitle>
              <CardDescription className="space-y-2">
                <div className="flex justify-center">
                  <Badge variant={getRoleBadgeColor(profile.role)} className="capitalize">
                    <Shield className="w-3 h-3 mr-1" />
                    {profile.role}
                  </Badge>
                </div>
                {profile.job_title && (
                  <p className="text-sm">{profile.job_title}</p>
                )}
                {profile.company && (
                  <p className="text-xs text-muted-foreground">{profile.company}</p>
                )}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Profile Information */}
          <Card className="lg:col-span-2 shadow-candor-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Your personal details and contact information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  {editing ? (
                    <Input
                      id="display_name"
                      value={formData.display_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                      placeholder="How you'd like to be called"
                    />
                  ) : (
                    <p className="text-sm py-2 px-3 bg-muted/30 rounded-md">
                      {profile.display_name || 'Not set'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center gap-2 text-sm py-2 px-3 bg-muted/30 rounded-md">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {profile.email}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  {editing ? (
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                      placeholder="Your first name"
                    />
                  ) : (
                    <p className="text-sm py-2 px-3 bg-muted/30 rounded-md">
                      {profile.first_name || 'Not set'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  {editing ? (
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                      placeholder="Your last name"
                    />
                  ) : (
                    <p className="text-sm py-2 px-3 bg-muted/30 rounded-md">
                      {profile.last_name || 'Not set'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  {editing ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Your phone number"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-sm py-2 px-3 bg-muted/30 rounded-md">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      {profile.phone || 'Not set'}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job_title">Job Title</Label>
                  {editing ? (
                    <Input
                      id="job_title"
                      value={formData.job_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                      placeholder="Your job title"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-sm py-2 px-3 bg-muted/30 rounded-md">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      {profile.job_title || 'Not set'}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  {editing ? (
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Your company"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-sm py-2 px-3 bg-muted/30 rounded-md">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      {profile.company || 'Not set'}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Department</Label>
                  <div className="flex items-center gap-2 text-sm py-2 px-3 bg-muted/30 rounded-md">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    {profile.department?.name || 'Not assigned'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Settings */}
        <Card className="shadow-candor-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Account Settings
            </CardTitle>
            <CardDescription>
              Manage your account preferences and security settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Account Status</h4>
                  <p className="text-sm text-muted-foreground">Your account is active and verified</p>
                </div>
                <Badge variant="default" className="bg-success text-success-foreground">Active</Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Profile Visibility</h4>
                  <p className="text-sm text-muted-foreground">Your profile is visible to organization members</p>
                </div>
                <Badge variant="outline">Public</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;