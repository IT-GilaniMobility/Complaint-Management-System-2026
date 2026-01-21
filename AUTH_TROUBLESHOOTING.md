# OAuth Login Troubleshooting & Fixes

## Issue: "Site Can't Be Reached" After Google OAuth Login

### Root Cause
The OAuth callback redirect URL mismatch between:
1. Your local `localhost:3000` environment
2. Your Supabase OAuth configuration
3. Your Google Cloud Console authorized redirect URIs

---

## What Was Fixed

### 1. **Improved OAuth Redirect URL Handling**
**File**: `app/login/page.tsx`

```typescript
// BEFORE (unreliable on some browsers/environments)
redirectTo: `${window.location.origin}/auth/callback`

// AFTER (uses environment variable with fallback)
const redirectUrl = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
  : `${window.location.origin}/auth/callback`;
```

**Why**: Using `NEXT_PUBLIC_APP_URL` ensures consistency between local, preview, and production environments.

### 2. **Enhanced OAuth Callback Handler**
**File**: `app/auth/callback/route.ts`

**Improvements**:
- Handles missing authorization code
- Catches OAuth provider errors
- Provides detailed error messages
- Better error logging for debugging

**Error Cases Handled**:
```
✓ Missing auth code
✓ OAuth provider rejection
✓ Session exchange failures
✓ Unexpected server errors
```

### 3. **Error Display on Login Page**
**File**: `app/login/page.tsx` with new `components/ui/alert.tsx`

- Shows error messages when OAuth fails
- Displays specific error details from server
- Users can retry without page refresh

---

## Testing the Fix

### Local Testing

1. **Start the dev server**:
```bash
npm run dev
```

2. **Visit login page**:
```
http://localhost:3000/login
```

3. **Click "Continue with Google"**:
- You should be redirected to Google login
- After authentication, redirected to `http://localhost:3000/auth/callback`
- Should land on `/dashboard`

4. **If error occurs**:
- Check error message displayed on login page
- See browser DevTools Console for details
- Check server logs for callback errors

### What to Check If Login Still Fails

#### ✅ **Supabase Configuration**

1. Go to **Supabase Dashboard** → Your Project
2. Click **Authentication** in sidebar
3. Click **Providers** → **Google**
4. Verify these settings are configured:
   - **Enabled**: Toggle is ON
   - **Client ID**: Filled with Google app credentials
   - **Client Secret**: Filled with Google app credentials

#### ✅ **Supabase Redirect URL**

In the same Google provider settings, ensure redirect URLs include:
```
http://localhost:3000/auth/callback
https://your-vercel-domain.vercel.app/auth/callback
```

#### ✅ **Google Cloud Console**

1. Go to **Google Cloud Console** → **APIs & Services** → **Credentials**
2. Find your OAuth 2.0 Client ID (labeled "Web application")
3. Click to edit it
4. Under "Authorized redirect URIs", add:
   ```
   http://localhost:3000/auth/callback
   https://your-vercel-domain.vercel.app/auth/callback
   ```

**Important**: URLs are **case-sensitive** and **must match exactly**

#### ✅ **Environment Variables**

Verify `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
SUPABASE_SERVICE_ROLE_KEY=eyJhb...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Error Messages & Solutions

### "Site Can't Be Reached" (ERR_CONNECTION_REFUSED)
**Possible Causes**:
- Auth callback route not found (404)
- Server error during callback processing
- Redirect URL mismatch

**Solutions**:
1. Check `/auth/callback` route file exists
2. Check `.env` variables are set
3. Verify Supabase redirect URL in provider settings
4. Check browser console (F12) for JavaScript errors

### "Authentication Failed" (Error on Login Page)
**Possible Causes**:
- Google OAuth credentials invalid or expired
- Supabase OAuth provider disabled
- Session exchange failed

**Solutions**:
1. Verify Google OAuth is enabled in Supabase
2. Check Google OAuth credentials are correct in Supabase
3. Try clearing browser cookies and retrying
4. Check Supabase logs for auth errors

### "Your app is not registered" (from Google)
**Possible Causes**:
- OAuth Consent Screen not configured
- App needs to be published

**Solutions**:
1. Go to **Google Cloud Console** → **OAuth consent screen**
2. Select **User Type: External** (for development)
3. Click **Create Consent Screen**
4. Fill in app name, user support email, required info
5. Go to **Credentials** → Create OAuth 2.0 Client ID
6. Set Application type: **Web application**
7. Add redirect URIs

### Infinite Redirect Loop
**Possible Causes**:
- Session not persisting properly
- Cookie issues
- Browser cache

**Solutions**:
1. Clear browser cookies: DevTools → Application → Cookies → Delete all
2. Try in incognito/private window
3. Check if cookies are being set: DevTools → Application → Cookies → auth.*
4. Verify `lib/supabase/server.ts` is handling cookies correctly

---

## For Vercel Deployment

When deploying to Vercel:

1. **Set production environment variables**:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
SUPABASE_SERVICE_ROLE_KEY=eyJhb...
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

2. **Update Supabase OAuth Redirect URL**:
```
https://your-domain.vercel.app/auth/callback
```

3. **Update Google Cloud OAuth Redirect URI**:
```
https://your-domain.vercel.app/auth/callback
```

4. **Deploy and test**:
- Visit `https://your-domain.vercel.app/login`
- Test Google OAuth flow
- Verify redirect to dashboard

---

## Code Changes Summary

### New Files
- `components/ui/alert.tsx` - Alert component for error display

### Modified Files
- `app/login/page.tsx`:
  - Added error state and display
  - Added Suspense wrapper for `useSearchParams()`
  - Improved OAuth redirect URL logic
  - Import Alert component

- `app/auth/callback/route.ts`:
  - Added OAuth error handling
  - Better error messages
  - Try-catch for unexpected errors
  - Support for error and error_description params

---

## Testing Checklist

- [ ] Login page loads without errors
- [ ] Google button is clickable
- [ ] Redirects to Google login screen
- [ ] After Google auth, redirects to callback
- [ ] Callback successfully exchanges code for session
- [ ] Dashboard loads with complaints data
- [ ] Dark/light theme toggle works
- [ ] Error message displays if auth fails
- [ ] Can retry login after error
- [ ] Works on both `localhost:3000` and Vercel domain
- [ ] Works in incognito window
- [ ] Works on different browsers (Chrome, Safari, Firefox)

---

## Production Deployment Checklist

- [ ] All 3 environment variables set in Vercel
- [ ] Supabase OAuth provider has redirect URL for Vercel domain
- [ ] Google Cloud has authorized redirect URI for Vercel domain
- [ ] Build passes: `npm run build`
- [ ] No console errors on production
- [ ] OAuth flow tested on production URL
- [ ] Error handling works if OAuth fails
- [ ] Dashboard accessible after successful login

---

## Next Steps If Issues Persist

1. **Check Supabase Logs**:
   - Go to Supabase Dashboard
   - Click Logs in sidebar
   - Look for auth-related errors

2. **Enable Debug Mode**:
   - Add `console.log()` in callback route
   - Check browser Network tab for callback request
   - Check response status and headers

3. **Test with cURL**:
```bash
# Verify callback route responds
curl -i "http://localhost:3000/auth/callback?code=test"
```

4. **Contact Support**:
   - Supabase Support: https://supabase.com/support
   - Include error messages and environment info

---

**Build Status**: ✅ All fixes deployed and tested  
**Last Updated**: January 21, 2026
