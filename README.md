# Our Journal

A minimal, mobile-first web app for two people to share a private journal. 

## Features
- **Private Space**: No accounts or signups. Gated by a single shared password.
- **Real-time feel**: Auto-refreshes when opened or focused.
- **Mobile First**: Feels like a real app on iOS/Android (can be added to home screen).

## Deployment (Vercel)

1. Push this repository to GitHub/GitLab.
2. Go to Vercel and **Import Project**.
3. In the Vercel dashboard, go to the **Storage** tab and create a **Postgres** database (Neon integration).
4. Connect the database to your project. This will automatically set `POSTGRES_URL` in your environment variables.
5. Go to your project's **Settings -> Environment Variables** and add:
   - `SITE_PASSWORD`: (Required) The password to unlock the journal.
   - `AUTHOR_A_NAME`: (Optional) First person's name (e.g., "Alice"). Defaults to "Me".
   - `AUTHOR_B_NAME`: (Optional) Second person's name (e.g., "Bob"). Defaults to "You".

## Database Setup

Run the following SQL in your Vercel Postgres query editor (found in the Storage tab):

```sql
CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  reactions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Local Development

1. Create a `.env.local` file with:
   ```
   SITE_PASSWORD=your_password
   POSTGRES_URL=your_neon_or_vercel_postgres_url
   AUTHOR_A_NAME=Alice
   AUTHOR_B_NAME=Bob
   ```
2. Run `npm install`
3. Run `npm run dev`
