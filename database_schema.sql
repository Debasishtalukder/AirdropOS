-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Projects Table
create table public.projects (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    name text not null,
    description text,
    chain text,
    stage text,
    status text default 'Active',
    potential_value text,
    website_url text,
    twitter_url text,
    discord_url text,
    color_tag text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Tasks Table
create table public.tasks (
    id uuid default uuid_generate_v4() primary key,
    project_id uuid references public.projects on delete cascade not null,
    user_id uuid references auth.users not null,
    title text not null,
    description text,
    status text default 'Todo',
    priority text default 'Medium',
    is_recurring boolean default false,
    recurrence_type text,
    due_date date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Resources Table
create table public.resources (
    id uuid default uuid_generate_v4() primary key,
    project_id uuid references public.projects on delete cascade not null,
    user_id uuid references auth.users not null,
    title text not null,
    url text not null,
    type text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.resources enable row level security;

-- Create Policies for Projects
create policy "Users can view own projects."
    on projects for select
    using ( auth.uid() = user_id );

create policy "Users can insert own projects."
    on projects for insert
    with check ( auth.uid() = user_id );

create policy "Users can update own projects."
    on projects for update
    using ( auth.uid() = user_id );

create policy "Users can delete own projects."
    on projects for delete
    using ( auth.uid() = user_id );

-- Create Policies for Tasks
create policy "Users can view own tasks."
    on tasks for select
    using ( auth.uid() = user_id );

create policy "Users can insert own tasks."
    on tasks for insert
    with check ( auth.uid() = user_id );

create policy "Users can update own tasks."
    on tasks for update
    using ( auth.uid() = user_id );

create policy "Users can delete own tasks."
    on tasks for delete
    using ( auth.uid() = user_id );

-- Create Policies for Resources
create policy "Users can view own resources."
    on resources for select
    using ( auth.uid() = user_id );

create policy "Users can insert own resources."
    on resources for insert
    with check ( auth.uid() = user_id );

create policy "Users can update own resources."
    on resources for update
    using ( auth.uid() = user_id );

create policy "Users can delete own resources."
    on resources for delete
    using ( auth.uid() = user_id );
