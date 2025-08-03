import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['employee', 'manager', 'hr'], {
    required_error: 'Please select your role',
  }),
  company: z.string().min(1, 'Company name is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignInData = z.infer<typeof signInSchema>;
type SignUpData = z.infer<typeof signUpSchema>;

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signIn, signUp, resendConfirmation } = useAuth();
  const [activeTab, setActiveTab] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'signin');
  const [loading, setLoading] = useState(false);
  const [emailForConfirmation, setEmailForConfirmation] = useState<string | null>(null);

  const signInForm = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
  });

  const signUpForm = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
  });

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSignIn = async (data: SignInData) => {
    setLoading(true);
    try {
      await signIn(data.email, data.password);
    } catch (error) {
      // Error handled in useAuth hook
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (data: SignUpData) => {
    setLoading(true);
    try {
      const result = await signUp(data.email, data.password, {
        first_name: data.firstName,
        last_name: data.lastName,
        role: data.role,
        company: data.company,
        job_title: data.jobTitle,
        display_name: `${data.firstName} ${data.lastName}`,
      });
      
      // If signup successful but no session (email confirmation required), 
      // store email for potential resend
      if (result?.data?.user && !result?.data?.session) {
        setEmailForConfirmation(data.email);
      }
    } catch (error) {
      // Error handled in useAuth hook
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = () => {
    if (emailForConfirmation) {
      resendConfirmation(emailForConfirmation);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 hover:bg-background/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <Card className="glass shadow-candor-xl border-0">
          <CardHeader className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-candor-lg">
              <span className="text-3xl font-bold text-white">C</span>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold">Welcome to Candor</CardTitle>
              <CardDescription className="text-base">
                Access your dashboard or create a new account
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/30">
                <TabsTrigger value="signin" className="text-sm font-medium">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="text-sm font-medium">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                  <div>
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      {...signInForm.register('email')}
                    />
                    {signInForm.formState.errors.email && (
                      <p className="text-sm text-destructive mt-1">
                        {signInForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      {...signInForm.register('password')}
                    />
                    {signInForm.formState.errors.password && (
                      <p className="text-sm text-destructive mt-1">
                        {signInForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    size="lg"
                    variant="gradient"
                    className="w-full shadow-candor-md"
                    disabled={loading}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        {...signUpForm.register('firstName')}
                      />
                      {signUpForm.formState.errors.firstName && (
                        <p className="text-sm text-destructive mt-1">
                          {signUpForm.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        {...signUpForm.register('lastName')}
                      />
                      {signUpForm.formState.errors.lastName && (
                        <p className="text-sm text-destructive mt-1">
                          {signUpForm.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="john.doe@company.com"
                      {...signUpForm.register('email')}
                    />
                    {signUpForm.formState.errors.email && (
                      <p className="text-sm text-destructive mt-1">
                        {signUpForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      placeholder="Your Company Name"
                      {...signUpForm.register('company')}
                    />
                    {signUpForm.formState.errors.company && (
                      <p className="text-sm text-destructive mt-1">
                        {signUpForm.formState.errors.company.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      placeholder="Software Engineer"
                      {...signUpForm.register('jobTitle')}
                    />
                    {signUpForm.formState.errors.jobTitle && (
                      <p className="text-sm text-destructive mt-1">
                        {signUpForm.formState.errors.jobTitle.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select onValueChange={(value) => signUpForm.setValue('role', value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="hr">HR Representative</SelectItem>
                      </SelectContent>
                    </Select>
                    {signUpForm.formState.errors.role && (
                      <p className="text-sm text-destructive mt-1">
                        {signUpForm.formState.errors.role.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a strong password"
                      {...signUpForm.register('password')}
                    />
                    {signUpForm.formState.errors.password && (
                      <p className="text-sm text-destructive mt-1">
                        {signUpForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      {...signUpForm.register('confirmPassword')}
                    />
                    {signUpForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive mt-1">
                        {signUpForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    size="lg"
                    variant="gradient"
                    className="w-full shadow-candor-md"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                  
                  {emailForConfirmation && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        Didn't receive the confirmation email?
                      </p>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={handleResendConfirmation}
                      >
                        Resend Confirmation Email
                      </Button>
                    </div>
                  )}
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;