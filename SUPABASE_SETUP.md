
# Supabase Setup for Realtime Sharing

To enable real-time sharing, you need to set up a Supabase project.

1.  **Create a Project**: Go to [Supabase](https://supabase.com/) and create a new project.
2.  **Database Schema**: Access the SQL Editor and run the following:

    ```sql
    create table lists (
      id uuid primary key,
      todos jsonb default '[]'::jsonb,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null
    );

    -- Enable Realtime
    alter publication supabase_realtime add table lists;
    
    -- Disable RLS for simple demo (OR configure policies)
    alter table lists enable row level security;
    create policy "Public lists" on lists for all using (true);
    ```

3.  **Environment Variables**:
    - Copy `.env.example` to `.env.local`
    - Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase project settings.

4.  **Restart**: Restart the dev server (`npm run dev`).

Now clicking "Share" will create a live link!
