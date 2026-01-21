# Vercel Deployment Guide

## Prerequisites
- GitHub account with your repo pushed
- Vercel account (https://vercel.com)
- Supabase project (already set up)

## Step 1: Push Code to GitHub

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

## Step 2: Connect to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Select "Import Git Repository"
4. Find and select your `Complaint-Management-System-2026` repo
5. Click "Import"

## Step 3: Environment Variables

Add these to Vercel Project Settings → Environment Variables:

### Core Supabase
```
NEXT_PUBLIC_SUPABASE_URL=your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Email Configuration (Optional but Recommended)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

### App URL
```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## Step 4: Get Supabase Keys

1. Go to your Supabase Project Settings
2. Click "API" in the left sidebar
3. Copy these values:
   - **NEXT_PUBLIC_SUPABASE_URL**: Project URL
   - **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Anon public key
   - **SUPABASE_SERVICE_ROLE_KEY**: Service role key (keep this SECRET - never share)

## Step 5: Configure Google OAuth in Supabase

1. Go to Supabase Dashboard → Authentication → Providers
2. Click "Google"
3. Add your OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console

### Set Google OAuth Redirect URL in Supabase:
```
https://your-domain.vercel.app/auth/callback
```

## Step 6: Update Google Cloud OAuth Redirect URLs

1. Go to Google Cloud Console → APIs & Services → Credentials
2. Select your OAuth 2.0 Client ID
3. Add Authorized redirect URIs:
   - `https://your-domain.vercel.app/auth/callback`
   - `https://your-domain.vercel.app/` (optional)

## Step 7: Vercel Deployment

1. After adding environment variables, click "Deploy"
2. Wait for deployment to complete (usually 2-5 minutes)
3. Vercel will provide your live URL: `https://your-app.vercel.app`

## Step 8: Configure Supabase RLS and Email Notifications

### If you want Email Notifications:

1. Install nodemailer package (already in your code)
2. Add email environment variables (see above)
3. Recommended: Use SendGrid or AWS SES for production instead of Gmail

### RLS Policies:
Your RLS policies are already configured in the database. Make sure:
- `ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;` was run
- Policies were created in migration `002_full_schema.sql`

## Environment Variables Summary

### Required (Must Have)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Recommended (For Full Features)
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_SECURE`
- `EMAIL_USER`
- `EMAIL_PASSWORD`
- `EMAIL_FROM`
- `NEXT_PUBLIC_APP_URL`

### Optional
- `NODE_ENV` (set automatically by Vercel)

## Troubleshooting

### "Invalid Supabase URL"
- Copy URL from Supabase Settings → API → Project URL
- Should be: `https://xxxxx.supabase.co`

### "Anon key is invalid"
- Use the `anon` key, not the service role key
- In Supabase: Settings → API → Anon public key

### "OAuth redirect mismatch"
- Update both Supabase AND Google Cloud with correct Vercel URL
- URL format: `https://your-domain.vercel.app/auth/callback`

### "Email not sending"
- Verify EMAIL_* variables are set correctly
- Check console logs in Vercel: Deployments → Functions
- Test with Gmail first (easiest setup)

## Database Migrations

Your migrations are already applied to your Supabase project:
- `001_initial_schema.sql`
- `002_full_schema.sql`
- `003_oauth_sync.sql`

No additional migrations needed before deployment!

## Custom Domain (Optional)

1. In Vercel: Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` if using custom domain

## Security Checklist

- [ ] Service role key only stored in Vercel (never in client code)
- [ ] Email password never committed to GitHub
- [ ] Google OAuth credentials verified
- [ ] RLS policies enabled in Supabase
- [ ] NEXT_PUBLIC variables are safe to expose (no secrets)
- [ ] All .env.local secrets added to Vercel dashboard
- [ ] .env.local is in .gitignore (not pushed to GitHub)

## Production Email Service

For production, consider upgrading from Gmail to:

### SendGrid (Recommended)
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourcompany.com
```

### AWS SES
```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-smtp-username
EMAIL_PASSWORD=your-smtp-password
EMAIL_FROM=noreply@yourcompany.com
```

## Monitoring & Logs

1. Vercel Dashboard → Deployments → Select deployment
2. View real-time logs and function execution
3. Check error messages in "Errors" tab
4. Use Supabase logs for database issues: Supabase → Logs

## Performance Tips

1. Vercel automatically optimizes Next.js
2. Use ISR (Incremental Static Regeneration) for static pages
3. Monitor Core Web Vitals: Vercel → Analytics
4. Enable automatic security updates for dependencies

## Post-Deployment Testing

1. Test Google OAuth login
2. Create a test complaint
3. Assign to an agent (check email if configured)
4. Verify all pages load correctly
5. Check dark/light theme toggle works
6. Test notifications on dashboard

## Next Steps

1. Add custom domain
2. Set up Vercel Analytics
3. Configure error monitoring (Sentry recommended)
4. Set up CI/CD for automatic deployments on git push
5. Add email preferences table for user notification settings
