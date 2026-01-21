# Vercel Build & Output Settings

## Build Settings

| Setting | Value |
|---------|-------|
| **Framework** | Next.js |
| **Build Command** | `npm run build` |
| **Output Directory** | `.next` |
| **Install Command** | `npm install` |
| **Node.js Version** | 18.x or 20.x (auto-detected) |
| **Root Directory** | `./` (root of repo) |

## Environment Variables

### Required (Must Set)
```
NEXT_PUBLIC_SUPABASE_URL=https://rsfkygtoqutxelguoqyg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzZmt5Z3RvcXV0eGVsZ3VvcXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4ODg5MDMsImV4cCI6MjA4NDQ2NDkwM30.3_HSc1tZS_DRjWhfLIIr7SLblOkTrZRzT8WVUV_nEhk
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzZmt5Z3RvcXV0eGVsZ3VvcXlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODg4ODkwMywiZXhwIjoyMDg0NDY0OTAzfQ.r8iEgcfhkvz5vZ6yNMKbYNmPO28FOuIcqiWtoAT5Ljs
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### Optional (For Email Notifications)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

## Vercel Dashboard Settings Path

1. Go to **https://vercel.com/dashboard**
2. Select your project
3. Click **Settings**
4. Go to **Build & Development Settings**
5. Configure:

### Build & Development Settings Section

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Development Command: npm run dev
```

### Node.js Version

```
Node.js Version: 20.x
```

### Environment Variables

1. Click **Environment Variables**
2. Add variables below (set to Production, Preview, Development)
3. Click **Save**

| Environment | Variables |
|-------------|-----------|
| Production | All three required vars |
| Preview | All three required vars |
| Development | All three required vars |

## Advanced Settings (Optional)

### Automatically Rerun Builds on Redeploy
- Enable (recommended for consistency)

### Auto-update Production Deployments
- Enable (auto-deploy on main branch push)

### Deployment Protection
- Enable for production (requires authentication to deploy)

## Regions

Default: Auto-selected based on your location

**Recommended**: Select your primary user region for best latency

Available regions:
- North America (iad, sfo)
- Europe (arn, fra, lhr)
- Asia Pacific (sin, syd)

## Crons & Scheduled Functions

Not needed for this project (leave empty)

## Serverless Functions Configuration

**Max Duration**: 60 seconds (default is sufficient)

**Memory**: 1024 MB (default is sufficient)

## Copy-Paste Configuration

### For Vercel Dashboard

**Settings → Build & Development Settings:**

```
Framework: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Development Command: npm run dev
```

**Settings → Environment Variables:**

Add these exactly as shown:

**Key**: `NEXT_PUBLIC_SUPABASE_URL`  
**Value**: `https://rsfkygtoqutxelguoqyg.supabase.co`  
**Environments**: Production, Preview, Development

**Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
**Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzZmt5Z3RvcXV0eGVsZ3VvcXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4ODg5MDMsImV4cCI6MjA4NDQ2NDkwM30.3_HSc1tZS_DRjWhfLIIr7SLblOkTrZRzT8WVUV_nEhk`  
**Environments**: Production, Preview, Development

**Key**: `SUPABASE_SERVICE_ROLE_KEY`  
**Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzZmt5Z3RvcXV0eGVsZ3VvcXlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODg4ODkwMywiZXhwIjoyMDg0NDY0OTAzfQ.r8iEgcfhkvz5vZ6yNMKbYNmPO28FOuIcqiWtoAT5Ljs`  
**Environments**: Production, Preview, Development

**Key**: `NEXT_PUBLIC_APP_URL`  
**Value**: `https://your-domain.vercel.app`  
**Environments**: Production, Preview, Development

## Build Output

Expected successful build output:
```
✓ Compiled successfully in 5.1s
✓ TypeScript validation passed
✓ Generating static pages (14/14) in 248.4ms

Route (app)
├ ƒ /
├ ○ /admin/categories
├ ○ /admin/seed
├ ○ /admin/settings
├ ○ /admin/users
├ ƒ /api/admin/users
├ ƒ /auth/callback
├ ○ /complaints
├ ƒ /complaints/[id]
├ ○ /complaints/new
├ ƒ /dashboard
└ ○ /login

○ (Static) prerendered as static content
ƒ (Dynamic) server-rendered on demand
```

**Build Time**: 5-10 minutes (first), 2-3 minutes (subsequent)

## Deployment Preview

After pushing to GitHub, Vercel creates:

1. **Preview Deployment** - For pull requests (auto-deployed)
2. **Production Deployment** - For main branch pushes

You can see deployment status at: **https://vercel.com/dashboard/deployments**

## Rollback

If deployment fails or you need to revert:

1. Go to **Deployments**
2. Click the previous successful deployment
3. Click **Redeploy**

## Logs & Debugging

### Build Logs
- **Deployments** → Click deployment → **Build**
- See all build steps and errors

### Runtime Logs
- **Deployments** → Click deployment → **Functions**
- See server-side errors during execution

### Client Logs
- Open DevTools Console in browser (F12)
- Check for client-side errors

## Performance Optimization Settings

Vercel automatically handles:
- Image optimization
- Code splitting
- Minification
- Compression
- Caching headers

No manual configuration needed!

## Testing Before Production

```bash
# Test locally
npm run build
npm start

# Visit http://localhost:3000
# Test all features (login, create complaint, etc.)
```

## Quick Reference

| Item | Value |
|------|-------|
| Framework | Next.js 16.1.4 |
| Build Command | `npm run build` |
| Output Dir | `.next` |
| Node Version | 20.x |
| Environment Vars | 4 required |
| Build Time | ~5 mins (first) |
| Deploy Time | ~2 mins |
| Cost | Hobby tier included |

---

**All settings are production-ready. Ready to deploy!** ✅
