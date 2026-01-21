-- Complaint Management System Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Lead Agent', 'Agent', 'Staff')),
  avatar_url TEXT
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  sla_hours INTEGER NOT NULL DEFAULT 24
);

-- Complaints table
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_number TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  desired_outcome TEXT,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Unassigned', 'In Progress', 'Resolved', 'Closed')),
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Urgent', 'High', 'Medium', 'Low')),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  assigned_to_id UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  attachments JSONB
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE
);

-- Activities table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  action TEXT NOT NULL,
  details JSONB
);

-- Indexes for better performance
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_priority ON complaints(priority);
CREATE INDEX idx_complaints_category_id ON complaints(category_id);
CREATE INDEX idx_complaints_assigned_to_id ON complaints(assigned_to_id);
CREATE INDEX idx_complaints_reporter_id ON complaints(reporter_id);
CREATE INDEX idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX idx_comments_complaint_id ON comments(complaint_id);
CREATE INDEX idx_activities_complaint_id ON activities(complaint_id);

-- Function to auto-generate complaint numbers
CREATE OR REPLACE FUNCTION generate_complaint_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.complaint_number := 'CMP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('complaint_number_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sequence for complaint numbers
CREATE SEQUENCE complaint_number_seq START 1;

-- Trigger to auto-generate complaint numbers
CREATE TRIGGER set_complaint_number
  BEFORE INSERT ON complaints
  FOR EACH ROW
  WHEN (NEW.complaint_number IS NULL OR NEW.complaint_number = '')
  EXECUTE FUNCTION generate_complaint_number();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on complaints
CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Public read access for authenticated users
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view all categories" ON categories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view all complaints" ON complaints FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view all comments" ON comments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view all activities" ON activities FOR SELECT USING (auth.role() = 'authenticated');

-- Insert policies (server-side only with service role)
-- Note: These policies won't affect server actions using the service role key
CREATE POLICY "Service can create complaints" ON complaints FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can create comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can create activities" ON activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can create categories" ON categories FOR INSERT WITH CHECK (true);

-- Update policies
CREATE POLICY "Users can update complaints" ON complaints FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can update users" ON users FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin')
);
CREATE POLICY "Admins can update categories" ON categories FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin')
);

-- Delete policies
CREATE POLICY "Admins can delete categories" ON categories FOR DELETE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin')
);

-- Insert seed data
INSERT INTO users (id, name, email, role, avatar_url) VALUES
  ('00000000-0000-0000-0000-000000000001', 'John Doe', 'john.doe@company.com', 'Admin', NULL),
  ('00000000-0000-0000-0000-000000000002', 'Jane Smith', 'jane.smith@company.com', 'Lead Agent', NULL),
  ('00000000-0000-0000-0000-000000000003', 'Mike Johnson', 'mike.johnson@company.com', 'Agent', NULL),
  ('00000000-0000-0000-0000-000000000004', 'Sarah Williams', 'sarah.williams@company.com', 'Agent', NULL),
  ('00000000-0000-0000-0000-000000000005', 'David Brown', 'david.brown@company.com', 'Agent', NULL),
  ('00000000-0000-0000-0000-000000000006', 'Emily Davis', 'emily.davis@company.com', 'Staff', NULL);

INSERT INTO categories (id, name, description, sla_hours) VALUES
  ('00000000-0000-0000-0000-000000000011', 'Technical Support', 'Technical issues and system problems', 24),
  ('00000000-0000-0000-0000-000000000012', 'Billing & Payments', 'Payment issues, invoices, and refunds', 48),
  ('00000000-0000-0000-0000-000000000013', 'Product Quality', 'Product defects and quality concerns', 72),
  ('00000000-0000-0000-0000-000000000014', 'Customer Service', 'Service quality and staff behavior', 48),
  ('00000000-0000-0000-0000-000000000015', 'Shipping & Delivery', 'Delivery delays and shipping issues', 36);
