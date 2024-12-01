-- Enable Row Level Security
create extension if not exists "uuid-ossp";

-- Funds table
create table funds (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text not null,
  transparency text not null check (transparency in ('public', 'private', 'all')),
  approval_threshold integer not null check (approval_threshold between 1 and 100),
  creator_address text not null,
  contract_fund_id text not null,
  total_contributions numeric(78, 0) default 0 not null,
  pending_withdrawals numeric(78, 0) default 0 not null,
  contributor_count integer default 0 not null
);

-- Contributions table
create table contributions (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  fund_id uuid references funds(id) not null,
  contributor_address text not null,
  amount numeric(78, 0) not null,
  transaction_hash text not null
);

-- Withdrawal requests table
create table withdrawal_requests (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  fund_id uuid references funds(id) not null,
  requester_address text not null,
  amount numeric(78, 0) not null,
  reason text not null,
  status text not null check (status in ('pending', 'approved', 'rejected')) default 'pending',
  transaction_hash text,
  required_approvals integer not null,
  current_approvals integer default 0 not null,
  current_rejections integer default 0 not null
);

-- Request votes table
create table request_votes (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  request_id uuid references withdrawal_requests(id) not null,
  voter_address text not null,
  vote_type text not null check (vote_type in ('approve', 'reject')),
  unique(request_id, voter_address)
);

-- Update timestamps trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Apply update timestamps trigger to relevant tables
create trigger update_funds_updated_at
  before update on funds
  for each row
  execute function update_updated_at_column();

create trigger update_withdrawal_requests_updated_at
  before update on withdrawal_requests
  for each row
  execute function update_updated_at_column();

-- Vote counting trigger
create or replace function update_vote_counts()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    if NEW.vote_type = 'approve' then
      update withdrawal_requests
      set current_approvals = current_approvals + 1
      where id = NEW.request_id;
    else
      update withdrawal_requests
      set current_rejections = current_rejections + 1
      where id = NEW.request_id;
    end if;
  elsif TG_OP = 'DELETE' then
    if OLD.vote_type = 'approve' then
      update withdrawal_requests
      set current_approvals = current_approvals - 1
      where id = OLD.request_id;
    else
      update withdrawal_requests
      set current_rejections = current_rejections - 1
      where id = OLD.request_id;
    end if;
  end if;
  return NEW;
end;
$$ language plpgsql;

-- Apply vote counting trigger
create trigger update_vote_counts
  after insert or delete on request_votes
  for each row
  execute function update_vote_counts();

-- Auto-update request status trigger
create or replace function update_request_status()
returns trigger as $$
begin
  -- Check if approval threshold is met
  if NEW.current_approvals >= NEW.required_approvals then
    NEW.status = 'approved';
  -- Check if rejection threshold is met (more than 50% of total possible votes)
  elsif NEW.current_rejections > (NEW.required_approvals / 2) then
    NEW.status = 'rejected';
  end if;
  return NEW;
end;
$$ language plpgsql;

-- Apply status update trigger
create trigger update_request_status
  before update on withdrawal_requests
  for each row
  execute function update_request_status();

-- Row Level Security Policies
alter table funds enable row level security;
alter table contributions enable row level security;
alter table withdrawal_requests enable row level security;
alter table request_votes enable row level security;

-- Funds policies
create policy "Funds are viewable by everyone"
  on funds for select
  using (true);

create policy "Funds can be created by anyone with a wallet"
  on funds for insert
  with check (creator_address is not null);

-- Contributions policies
create policy "Contributions are viewable by everyone"
  on contributions for select
  using (true);

create policy "Contributions can be created by anyone with a wallet"
  on contributions for insert
  with check (contributor_address is not null);

-- Withdrawal requests policies
create policy "Withdrawal requests are viewable by everyone"
  on withdrawal_requests for select
  using (true);

create policy "Withdrawal requests can be created by fund contributors"
  on withdrawal_requests for insert
  with check (exists (
    select 1 from contributions
    where fund_id = withdrawal_requests.fund_id
    and contributor_address = withdrawal_requests.requester_address
  ));

-- Request votes policies
create policy "Request votes are viewable by everyone"
  on request_votes for select
  using (true);

create policy "Request votes can be created by fund contributors"
  on request_votes for insert
  with check (exists (
    select 1 from contributions c
    join withdrawal_requests w on w.fund_id = c.fund_id
    where w.id = request_votes.request_id
    and c.contributor_address = request_votes.voter_address
  ));
