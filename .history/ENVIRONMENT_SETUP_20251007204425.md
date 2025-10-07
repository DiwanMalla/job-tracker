# 🚨 URGENT: Fix Vercel Deployment Error

## Current Error
```
Environment variable not found: DATABASE_URL
```

Your app is deployed but **DATABASE_URL** is missing in Vercel, causing authentication to fail.

---

## ⚡ Quick Fix (5 minutes)

### Step 1: Go to Vercel Dashboard

1. Open: https://vercel.com/dashboard
2. Click on your **job-tracker** project
3. Go to **Settings** → **Environment Variables**

### Step 2: Add These 3 Environment Variables

Copy and paste these exactly:

#### DATABASE_URL
- **Key**: `DATABASE_URL`
- **Value**: Your database connection string
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

**Quick option**: Use SQLite for testing (add to Vercel):
```
file:./dev.db
```

**Better option**: Use Vercel Postgres (recommended):
1. In Vercel Dashboard → Storage → Create Database → Postgres
2. Connect to your project
3. DATABASE_URL will be auto-added

#### NEXTAUTH_SECRET
- **Key**: `NEXTAUTH_SECRET`
- **Value**: Paste the output from openssl command above
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### NEXTAUTH_URL
- **Key**: `NEXTAUTH_URL`  
- **Value**: `https://job-tracker-zeta-wheat.vercel.app` (your deployment URL)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

### Step 3: Redeploy

After adding environment variables:
1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Select **"Redeploy"**
4. Wait for the build to complete

---

## For Production: Set Up Proper Database

### Option 1: Vercel Postgres (Easiest)

1. In Vercel Dashboard → **Storage** tab
2. Click **Create Database** → Select **Postgres**
3. Name it: `job-tracker-db`
4. Click **Create**
5. Click **Connect to Project** → Select your job-tracker project
6. Environment variable `DATABASE_URL` will be automatically added
7. **Redeploy** your project

### Option 2: External Database

Use any of these free-tier databases:
- **Supabase**: https://supabase.com (2 free projects)
- **Neon**: https://neon.tech (1 free project)
- **PlanetScale**: https://planetscale.com (1 free database)

After creating database:
1. Get the connection string
2. Add as `DATABASE_URL` in Vercel
3. Redeploy

---

## Verify It's Working

After redeployment:
1. Visit your Vercel URL
2. You should see the landing page (not a 500 error)
3. Try to sign up
4. Try to sign in

---

## Common Issues

### Issue: Still getting 500 error
**Fix**: Check all environment variables are set for "Production" environment

### Issue: Database connection error
**Fix**: Verify DATABASE_URL format is correct (must start with `postgresql://` or `file:`)

### Issue: Authentication not working
**Fix**: Ensure NEXTAUTH_URL matches your actual Vercel URL (no trailing slash)

---

## Next Steps After Fix

Once the app loads:
1. ✅ Test signup/signin
2. ✅ Create a job application  
3. ✅ For file uploads: Set up Vercel Blob Storage (see VERCEL_DEPLOYMENT.md)
4. ✅ For sharing: Test share link generation

Need help? Check the deployment logs in Vercel for specific error messages.
