-- Create Projects Table
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  chain text,
  stage text,
  status text,
  potential_value text,
  website_url text,
  twitter_url text,
  discord_url text,
  color_tag text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Tasks Table
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  priority text,
  status text,
  is_recurring boolean default false,
  recurrence_type text,
  due_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Resources Table
create table public.resources (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  url text not null,
  type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.resources enable row level security;

-- Create Policies for Projects (Users can only see and edit their own projects)
create policy "Users can view their own projects" on public.projects for select using (auth.uid() = user_id);
create policy "Users can insert their own projects" on public.projects for insert with check (auth.uid() = user_id);
create policy "Users can update their own projects" on public.projects for update using (auth.uid() = user_id);
create policy "Users can delete their own projects" on public.projects for delete using (auth.uid() = user_id);

-- Create Policies for Tasks
create policy "Users can view their own tasks" on public.tasks for select using (auth.uid() = user_id);
create policy "Users can insert their own tasks" on public.tasks for insert with check (auth.uid() = user_id);
create policy "Users can update their own tasks" on public.tasks for update using (auth.uid() = user_id);
create policy "Users can delete their own tasks" on public.tasks for delete using (auth.uid() = user_id);

-- Create Policies for Resources
create policy "Users can view their own resources" on public.resources for select using (auth.uid() = user_id);
create policy "Users can insert their own resources" on public.resources for insert with check (auth.uid() = user_id);
create policy "Users can update their own resources" on public.resources for update using (auth.uid() = user_id);
create policy "Users can delete their own resources" on public.resources for delete using (auth.uid() = user_id);
