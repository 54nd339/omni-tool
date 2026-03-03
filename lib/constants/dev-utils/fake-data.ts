import type { FieldSchema, FieldType } from '@/types/dev-utils';

export const FIELD_TYPES: readonly FieldType[] = [
  'First Name',
  'Last Name',
  'Full Name',
  'Email',
  'Phone',
  'Address',
  'City',
  'Country',
  'Company',
  'Job Title',
  'UUID',
  'Date',
  'Boolean',
  'Integer',
  'Float',
  'URL',
  'IP Address',
  'Hex Color',
  'Sentence',
  'Paragraph',
] as const;

export const CITIES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio',
  'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus',
  'London', 'Paris', 'Tokyo', 'Berlin', 'Sydney', 'Toronto', 'Mumbai', 'Singapore',
  'Amsterdam', 'Seoul', 'Madrid', 'Boston', 'Seattle', 'Denver', 'Miami',
] as const;

export const COMPANIES = [
  'Acme Corp', 'TechNova', 'Global Solutions', 'DataFlow Inc', 'CloudSync',
  'NexGen Systems', 'Bright Future', 'Summit Industries', 'Prime Analytics',
  'Vertex Labs', 'Quantum Dynamics', 'Fusion Tech', 'Horizon Ventures',
  'Apex Software', 'Pinnacle Group', 'Catalyst Systems', 'Momentum Inc',
  'Elevate Labs', 'Synergy Corp', 'Atlas Industries', 'Pulse Networks',
  'Zenith Group', 'Nexus Solutions', 'Pioneer Tech',
] as const;

export const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
  'Japan', 'India', 'Brazil', 'Italy', 'Spain', 'Mexico', 'South Korea', 'Netherlands',
  'Sweden', 'Switzerland', 'Ireland', 'Singapore', 'New Zealand', 'Norway',
  'Poland', 'Belgium', 'Austria', 'Portugal', 'Argentina', 'South Africa',
] as const;

export const EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'company.com', 'mail.org', 'example.io',
  'tech.net', 'business.co', 'startup.dev', 'corp.xyz',
] as const;

export const FIRST_NAMES = [
  'James', 'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Oliver', 'Isabella',
  'Elijah', 'Mia', 'Lucas', 'Charlotte', 'Mason', 'Amelia', 'Ethan', 'Harper',
  'Alexander', 'Evelyn', 'Henry', 'Abigail', 'Sebastian', 'Emily', 'Jack', 'Elizabeth',
  'Aiden', 'Sofia', 'Owen', 'Avery', 'Samuel', 'Ella',
] as const;

export const JOB_TITLES = [
  'Software Engineer', 'Product Manager', 'Data Analyst', 'UX Designer', 'DevOps Engineer',
  'Frontend Developer', 'Backend Developer', 'Project Manager', 'Data Scientist',
  'Marketing Manager', 'Sales Representative', 'HR Specialist', 'Accountant',
  'Business Analyst', 'Quality Assurance', 'Systems Administrator', 'Technical Lead',
  'Scrum Master', 'Solutions Architect', 'Operations Manager', 'Content Writer',
  'Customer Success', 'Research Scientist', 'Consultant',
] as const;

export const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Young',
] as const;

export const WORDS = [
  'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog', 'hello', 'world',
  'data', 'flow', 'stream', 'cloud', 'system', 'service', 'platform', 'product',
  'design', 'build', 'deploy', 'test', 'integrate', 'scale', 'optimize', 'manage',
] as const;

export const ADDRESS_SUFFIXES = ['St', 'Ave', 'Blvd', 'Rd', 'Ln'] as const;
export const URL_TLDS = ['com', 'io', 'net', 'org'] as const;

export const DEFAULT_FIELDS = [
  { id: '1', name: 'id', type: 'Integer', min: 1, max: 1000 },
  { id: '2', name: 'full_name', type: 'Full Name' },
  { id: '3', name: 'email', type: 'Email' },
] as const satisfies readonly FieldSchema[];
