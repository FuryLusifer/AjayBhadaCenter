-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create enum types
create type public.app_role as enum ('super_admin', 'admin', 'customer');
create type public.order_status as enum ('pending', 'confirmed', 'paid', 'delivered', 'canceled');
create type public.payment_method as enum ('cod', 'qr_payment');
create type public.payment_status as enum ('pending', 'verified', 'rejected');

-- User roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null default 'customer',
  created_at timestamp with time zone default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Security definer function to check roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  address text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

-- Categories table
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  parent_id uuid references public.categories(id) on delete set null,
  image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.categories enable row level security;

-- Products table
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price decimal(10,2) not null,
  discount_percentage decimal(5,2) default 0,
  category_id uuid references public.categories(id) on delete set null,
  stock_quantity integer not null default 0,
  image_url text,
  images text[], -- Array of image URLs
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.products enable row level security;

-- Orders table
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references auth.users(id) on delete cascade not null,
  status order_status default 'pending',
  payment_method payment_method not null,
  payment_status payment_status default 'pending',
  total_amount decimal(10,2) not null,
  shipping_address text not null,
  phone text not null,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.orders enable row level security;

-- Order items table
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete restrict not null,
  quantity integer not null,
  price_at_purchase decimal(10,2) not null,
  created_at timestamp with time zone default now()
);

alter table public.order_items enable row level security;

-- Payment screenshots table
create table public.payment_screenshots (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  screenshot_url text not null,
  uploaded_at timestamp with time zone default now(),
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamp with time zone,
  verification_notes text
);

alter table public.payment_screenshots enable row level security;

-- RLS Policies for user_roles
create policy "Users can view their own roles"
  on public.user_roles for select
  using (auth.uid() = user_id);

create policy "Admins can view all roles"
  on public.user_roles for select
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'super_admin'));

create policy "Super admins can insert roles"
  on public.user_roles for insert
  with check (public.has_role(auth.uid(), 'super_admin'));

create policy "Super admins can update roles"
  on public.user_roles for update
  using (public.has_role(auth.uid(), 'super_admin'));

create policy "Super admins can delete roles"
  on public.user_roles for delete
  using (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for categories
create policy "Anyone can view categories"
  on public.categories for select
  using (true);

create policy "Admins can insert categories"
  on public.categories for insert
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'super_admin'));

create policy "Admins can update categories"
  on public.categories for update
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'super_admin'));

create policy "Admins can delete categories"
  on public.categories for delete
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for products
create policy "Anyone can view active products"
  on public.products for select
  using (is_active = true or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'super_admin'));

create policy "Admins can insert products"
  on public.products for insert
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'super_admin'));

create policy "Admins can update products"
  on public.products for update
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'super_admin'));

create policy "Admins can delete products"
  on public.products for delete
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for orders
create policy "Customers can view own orders"
  on public.orders for select
  using (auth.uid() = customer_id);

create policy "Admins can view all orders"
  on public.orders for select
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'super_admin'));

create policy "Customers can insert own orders"
  on public.orders for insert
  with check (auth.uid() = customer_id);

create policy "Customers can update own pending orders"
  on public.orders for update
  using (auth.uid() = customer_id and status = 'pending');

create policy "Admins can update any order"
  on public.orders for update
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for order_items
create policy "Users can view order items for their orders"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and (orders.customer_id = auth.uid() or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'super_admin'))
    )
  );

create policy "Customers can insert order items for their orders"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_id
      and orders.customer_id = auth.uid()
    )
  );

-- RLS Policies for payment_screenshots
create policy "Users can view screenshots for their orders"
  on public.payment_screenshots for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = payment_screenshots.order_id
      and (orders.customer_id = auth.uid() or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'super_admin'))
    )
  );

create policy "Customers can upload screenshots for their orders"
  on public.payment_screenshots for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_id
      and orders.customer_id = auth.uid()
    )
  );

create policy "Admins can update payment screenshots"
  on public.payment_screenshots for update
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'super_admin'));

-- Trigger to create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  
  -- Assign default customer role
  insert into public.user_roles (user_id, role)
  values (new.id, 'customer');
  
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

create trigger update_categories_updated_at
  before update on public.categories
  for each row execute function public.update_updated_at_column();

create trigger update_products_updated_at
  before update on public.products
  for each row execute function public.update_updated_at_column();

create trigger update_orders_updated_at
  before update on public.orders
  for each row execute function public.update_updated_at_column();