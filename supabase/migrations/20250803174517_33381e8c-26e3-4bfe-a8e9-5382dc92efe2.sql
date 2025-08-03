-- Create departments table
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create issue categories table
CREATE TABLE public.issue_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'AlertCircle',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create issues table
CREATE TABLE public.issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.issue_categories(id),
  department_id UUID REFERENCES public.departments(id),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  anonymous_token TEXT NOT NULL UNIQUE,
  reporter_id UUID,
  assigned_to UUID REFERENCES public.profiles(user_id),
  location TEXT,
  attachments JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create issue updates table
CREATE TABLE public.issue_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  update_type TEXT NOT NULL CHECK (update_type IN ('status_change', 'comment', 'assignment', 'resolution')),
  content TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT,
  created_by UUID REFERENCES public.profiles(user_id),
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create anonymous tokens table for tracking
CREATE TABLE public.anonymous_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '90 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update profiles table to support employee roles and departments
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id),
ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES public.profiles(user_id),
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT;

-- Create function to generate anonymous tokens
CREATE OR REPLACE FUNCTION public.generate_anonymous_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on all tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for departments
CREATE POLICY "Anyone can view departments" ON public.departments FOR SELECT USING (true);

-- RLS Policies for issue categories
CREATE POLICY "Anyone can view issue categories" ON public.issue_categories FOR SELECT USING (true);

-- RLS Policies for issues
CREATE POLICY "Anyone can create issues" ON public.issues FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view issues" ON public.issues FOR SELECT USING (true);
CREATE POLICY "Staff can update issues" ON public.issues FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('staff', 'faculty')
  )
);

-- RLS Policies for issue updates
CREATE POLICY "Anyone can view public updates" ON public.issue_updates FOR SELECT USING (is_public = true);
CREATE POLICY "Staff can create updates" ON public.issue_updates FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('staff', 'faculty')
  )
);

-- RLS Policies for anonymous tokens
CREATE POLICY "Anyone can view their token" ON public.anonymous_tokens FOR SELECT USING (true);

-- Insert default departments
INSERT INTO public.departments (name, description) VALUES
('Human Resources', 'HR related issues and policies'),
('Engineering', 'Technical team and development issues'),
('Sales', 'Sales team and customer-related issues'),
('Marketing', 'Marketing and communication issues'),
('Operations', 'General operations and logistics'),
('Finance', 'Financial and accounting issues'),
('General', 'General workplace issues');

-- Insert default issue categories
INSERT INTO public.issue_categories (name, description, color, icon) VALUES
('Workplace Harassment', 'Sexual harassment, discrimination, bullying', '#ef4444', 'Shield'),
('Workload & Stress', 'Excessive workload, burnout, work-life balance', '#f59e0b', 'Clock'),
('Management Issues', 'Poor leadership, unfair treatment, communication problems', '#8b5cf6', 'Users'),
('Safety Concerns', 'Physical safety, health hazards, unsafe conditions', '#dc2626', 'AlertTriangle'),
('Compensation & Benefits', 'Pay issues, benefits, promotion concerns', '#10b981', 'DollarSign'),
('Workplace Environment', 'Office conditions, resources, equipment issues', '#06b6d4', 'Building'),
('Ethics & Compliance', 'Unethical behavior, policy violations, fraud', '#6366f1', 'Scale'),
('Communication', 'Poor communication, lack of transparency', '#84cc16', 'MessageCircle'),
('Training & Development', 'Lack of training, career development issues', '#f97316', 'BookOpen'),
('Other', 'Issues not covered by other categories', '#6b7280', 'MoreHorizontal');

-- Create trigger for updating timestamps
CREATE TRIGGER update_issues_updated_at
  BEFORE UPDATE ON public.issues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();