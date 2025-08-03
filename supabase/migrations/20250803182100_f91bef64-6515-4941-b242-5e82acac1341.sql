-- Fix the profile creation trigger to work with the current profiles table structure
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create updated function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    email, 
    role, 
    display_name,
    first_name,
    last_name,
    company,
    job_title
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'employee'),
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'company',
    NEW.raw_user_meta_data ->> 'job_title'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add sample issues data to populate the dashboard
INSERT INTO public.issues (
  title,
  description,
  category_id,
  department_id,
  severity,
  status,
  anonymous_token,
  reporter_id,
  location,
  metadata,
  created_at,
  updated_at
) VALUES
-- Sample Issue 1: Security Concern
(
  'Suspicious individual in Building A',
  'I noticed someone without a visitor badge attempting to access restricted areas in Building A, 3rd floor. They appeared to be taking photos of security equipment and seemed unfamiliar with the layout.',
  (SELECT id FROM issue_categories WHERE name = 'Security' LIMIT 1),
  (SELECT id FROM departments WHERE name = 'Security' LIMIT 1),
  'high',
  'open',
  'sec_' || substring(encode(gen_random_bytes(16), 'base64'), 1, 12),
  (SELECT user_id FROM profiles LIMIT 1),
  'Building A, 3rd Floor',
  '{"building": "A", "floor": "3", "time_observed": "14:30", "witness_count": 2}',
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '2 hours'
),

-- Sample Issue 2: Maintenance Request
(
  'Air conditioning not working in Conference Room B',
  'The AC unit in Conference Room B has been making loud noises and is not cooling properly. The temperature is uncomfortably warm, making it difficult to conduct meetings.',
  (SELECT id FROM issue_categories WHERE name = 'Maintenance' LIMIT 1),
  (SELECT id FROM departments WHERE name = 'Facilities' LIMIT 1),
  'medium',
  'in_progress',
  'mnt_' || substring(encode(gen_random_bytes(16), 'base64'), 1, 12),
  NULL, -- Anonymous report
  'Building B, Conference Room B',
  '{"room_number": "B-205", "issue_type": "HVAC", "urgency": "medium", "affected_capacity": 20}',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '6 hours'
),

-- Sample Issue 3: Workplace Harassment
(
  'Inappropriate behavior from colleague',
  'I would like to report repeated inappropriate comments and behavior from a colleague that make me uncomfortable in the workplace. This has been ongoing for several weeks.',
  (SELECT id FROM issue_categories WHERE name = 'Harassment' LIMIT 1),
  (SELECT id FROM departments WHERE name = 'Human Resources' LIMIT 1),
  'high',
  'open',
  'hr_' || substring(encode(gen_random_bytes(16), 'base64'), 1, 12),
  NULL, -- Anonymous report
  'Building C, 2nd Floor',
  '{"anonymous": true, "department": "Marketing", "frequency": "daily", "witnesses": false}',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
),

-- Sample Issue 4: IT Support
(
  'Computer running extremely slow',
  'My workstation has been running very slowly for the past week. Applications take forever to load and the system frequently freezes. This is impacting my productivity significantly.',
  (SELECT id FROM issue_categories WHERE name = 'IT Support' LIMIT 1),
  (SELECT id FROM departments WHERE name = 'IT' LIMIT 1),
  'medium',
  'resolved',
  'it_' || substring(encode(gen_random_bytes(16), 'base64'), 1, 12),
  (SELECT user_id FROM profiles LIMIT 1),
  'Building A, Desk 45',
  '{"computer_model": "Dell Optiplex", "ram": "8GB", "last_update": "2024-01-15", "ticket_type": "hardware"}',
  NOW() - INTERVAL '1 week',
  NOW() - INTERVAL '1 day'
),

-- Sample Issue 5: Safety Concern
(
  'Broken handrail on staircase',
  'The handrail on the main staircase between floors 2 and 3 is loose and wobbles when used. This could be a safety hazard, especially during emergency evacuations.',
  (SELECT id FROM issue_categories WHERE name = 'Safety' LIMIT 1),
  (SELECT id FROM departments WHERE name = 'Facilities' LIMIT 1),
  'high',
  'open',
  'saf_' || substring(encode(gen_random_bytes(16), 'base64'), 1, 12),
  (SELECT user_id FROM profiles LIMIT 1),
  'Building A, Main Staircase (Floor 2-3)',
  '{"safety_level": "high", "location_type": "staircase", "potential_impact": "fall_risk", "usage_frequency": "high"}',
  NOW() - INTERVAL '12 hours',
  NOW() - INTERVAL '12 hours'
),

-- Sample Issue 6: General Feedback
(
  'Suggestion for improved cafeteria menu',
  'I would like to suggest adding more vegetarian and vegan options to the cafeteria menu. Many employees have expressed interest in healthier, plant-based meal choices.',
  (SELECT id FROM issue_categories WHERE name = 'General' LIMIT 1),
  (SELECT id FROM departments WHERE name = 'Administration' LIMIT 1),
  'low',
  'open',
  'gen_' || substring(encode(gen_random_bytes(16), 'base64'), 1, 12),
  (SELECT user_id FROM profiles LIMIT 1),
  'Building A, Cafeteria',
  '{"suggestion_type": "menu_improvement", "dietary_preference": "vegetarian/vegan", "employee_interest": "high"}',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
);

-- Add some issue updates to show activity
INSERT INTO public.issue_updates (
  issue_id,
  update_type,
  content,
  old_status,
  new_status,
  created_by,
  is_public
) VALUES
(
  (SELECT id FROM issues WHERE title LIKE '%Air conditioning%' LIMIT 1),
  'status_change',
  'Maintenance team has been notified and will inspect the AC unit tomorrow morning.',
  'open',
  'in_progress',
  (SELECT user_id FROM profiles LIMIT 1),
  true
),
(
  (SELECT id FROM issues WHERE title LIKE '%Computer running%' LIMIT 1),
  'resolution',
  'Upgraded RAM to 16GB and performed system optimization. Computer performance has been restored.',
  'in_progress',
  'resolved',
  (SELECT user_id FROM profiles LIMIT 1),
  true
);

-- Create anonymous tokens for the anonymous reports
INSERT INTO public.anonymous_tokens (token, issue_id)
SELECT 
  i.anonymous_token,
  i.id
FROM issues i
WHERE i.reporter_id IS NULL;