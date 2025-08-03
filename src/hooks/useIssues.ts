import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Issue, IssueCategory, Department } from '@/types/database';
import { toast } from '@/hooks/use-toast';

// Type for database response
interface DatabaseIssue {
  id: string;
  title: string;
  description: string;
  category_id: string;
  department_id?: string;
  severity: string;
  status: string;
  anonymous_token: string;
  reporter_id?: string;
  assigned_to?: string;
  location?: string;
  attachments: any;
  metadata: any;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  category?: IssueCategory;
  department?: Department;
  assigned_user?: any;
}

export const useIssues = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [categories, setCategories] = useState<IssueCategory[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select(`
          *,
          category:issue_categories(*),
          department:departments(*),
          assigned_user:profiles!assigned_to(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform database response to proper types
      const transformedIssues: Issue[] = (data || []).map((item: DatabaseIssue) => ({
        ...item,
        severity: item.severity as Issue['severity'],
        status: item.status as Issue['status'],
        attachments: Array.isArray(item.attachments) ? item.attachments : [],
        metadata: item.metadata || {},
      }));
      
      setIssues(transformedIssues);
    } catch (error: any) {
      console.error('Error fetching issues:', error);
      toast({
        title: "Error loading issues",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('issue_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error: any) {
      console.error('Error fetching departments:', error);
    }
  };

  const createIssue = async (issueData: Partial<Issue>) => {
    try {
      // Generate anonymous token
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_anonymous_token');

      if (tokenError) throw tokenError;

      // Prepare data for database insert
      const insertData = {
        title: issueData.title!,
        description: issueData.description!,
        category_id: issueData.category_id,
        department_id: issueData.department_id,
        severity: issueData.severity!,
        location: issueData.location,
        anonymous_token: tokenData,
      };

      const { data, error } = await supabase
        .from('issues')
        .insert([insertData])
        .select(`
          *,
          category:issue_categories(*),
          department:departments(*)
        `)
        .single();

      if (error) throw error;

      // Transform response
      const transformedIssue: Issue = {
        ...data,
        severity: data.severity as Issue['severity'],
        status: data.status as Issue['status'],
        attachments: Array.isArray(data.attachments) ? data.attachments : [],
        metadata: typeof data.metadata === 'object' ? data.metadata as Record<string, any> : {},
      };

      // Store the anonymous token for tracking
      localStorage.setItem(`issue_token_${data.id}`, tokenData);

      setIssues(prev => [transformedIssue, ...prev]);
      
      toast({
        title: "Issue reported successfully",
        description: `Your anonymous tracking ID is: ${tokenData.slice(-8)}`,
      });

      return { issue: transformedIssue, token: tokenData };
    } catch (error: any) {
      console.error('Error creating issue:', error);
      toast({
        title: "Error reporting issue",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateIssue = async (issueId: string, updates: Partial<Issue>) => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .update(updates)
        .eq('id', issueId)
        .select(`
          *,
          category:issue_categories(*),
          department:departments(*),
          assigned_user:profiles!assigned_to(*)
        `)
        .single();

      if (error) throw error;

      // Transform response
      const transformedIssue: Issue = {
        ...data,
        severity: data.severity as Issue['severity'],
        status: data.status as Issue['status'],
        attachments: Array.isArray(data.attachments) ? data.attachments : [],
        metadata: typeof data.metadata === 'object' ? data.metadata as Record<string, any> : {},
        assigned_user: data.assigned_user ? {
          ...data.assigned_user,
          department: typeof data.assigned_user.department === 'object' ? data.assigned_user.department : undefined
        } : undefined,
      };

      setIssues(prev => prev.map(issue => 
        issue.id === issueId ? transformedIssue : issue
      ));

      toast({
        title: "Issue updated successfully",
      });

      return transformedIssue;
    } catch (error: any) {
      console.error('Error updating issue:', error);
      toast({
        title: "Error updating issue",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const trackIssueByToken = async (token: string) => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select(`
          *,
          category:issue_categories(*),
          department:departments(*),
          updates:issue_updates(*)
        `)
        .eq('anonymous_token', token)
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error tracking issue:', error);
      toast({
        title: "Issue not found",
        description: "Please check your tracking token and try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchIssues(),
        fetchCategories(),
        fetchDepartments(),
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    issues,
    categories,
    departments,
    loading,
    createIssue,
    updateIssue,
    trackIssueByToken,
    refetch: fetchIssues,
  };
};