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

### Step 2: Add These 3 Environment Variables

Copy and paste these exactly:

#### Variable 1: DATABASE_URL
- **Key**: `DATABASE_URL`
- **Value**: `file:./dev.db`
- **Environments**: Check ✅ Production, ✅ Preview, ✅ Development
- Click **Save**

> ⚠️ Note: This uses SQLite for quick testing. For production, scroll down to "Set Up Production Database" section.

#### Variable 2: NEXTAUTH_SECRET
- **Key**: `NEXTAUTH_SECRET`
- **Value**: `Ar6M1iTDRPmLmzUdf2/M6xMKNeM5WOXaeS7qaZ2x9ao=`
- **Environments**: Check ✅ Production, ✅ Preview, ✅ Development
- Click **Save**

#### Variable 3: NEXTAUTH_URL
- **Key**: `NEXTAUTH_URL`
- **Value**: `https://job-tracker-zeta-wheat.vercel.app`
- **Environments**: Check ✅ Production, ✅ Preview, ✅ Development
- Click **Save**

### Step 3: Redeploy

1. Go to **Deployments** tab in Vercel
2. Find the latest deployment
3. Click the **"..."** menu (three dots)
4. Select **"Redeploy"**
5. Wait 1-2 minutes for build to complete
6. Visit your site: https://job-tracker-zeta-wheat.vercel.app

✅ Your app should now work! Try signing up and creating a job application.

---

## ⚠️ Important: SQLite Limitation on Vercel

**SQLite (`file:./dev.db`) works but has limitations:**
- ❌ Data resets on every deployment
- ❌ Data not shared between serverless functions
- ❌ Not suitable for production

**You MUST migrate to a real database for production.** See below ⬇️

---

## 🗄️ Set Up Production Database (Recommended)

### Option 1: Vercel Postgres (Easiest - 5 minutes)

1. In Vercel Dashboard → **Storage** tab
2. Click **Create Database**
3. Select **Postgres**
4. Name: `job-tracker-db`
5. Region: Choose closest to your users
6. Click **Create & Continue**
7. Click **Connect to Project** → Select `job-tracker`
8. Click **Connect**

✅ This automatically adds `DATABASE_URL` to your environment variables!

**Now update your schema:**
1. Edit `prisma/schema.prisma` locally
2. Change line 9 from `sqlite` to `postgresql`:
```prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```
3. Commit and push:
```bash
git add .
git commit -m "feat: Switch to PostgreSQL for production"
git push
```

Vercel will auto-deploy and run migrations! 🎉

### Option 2: Free External Database

Choose one of these (all have free tiers):

**Supabase** (Recommended)
- Free: 500MB database, unlimited API requests
- Setup: https://supabase.com
1. Create project → Get connection string
2. Add as `DATABASE_URL` in Vercel
3. Update schema to `postgresql`

**Neon**
- Free: 3GB storage, autosuspends when idle
- Setup: https://neon.tech
1. Create project → Copy connection string
2. Add as `DATABASE_URL` in Vercel
3. Update schema to `postgresql`

**Railway**
- Free: $5/month credit (enough for small apps)
- Setup: https://railway.app
1. Create Postgres database → Get connection string
2. Add as `DATABASE_URL` in Vercel
3. Update schema to `postgresql`

---

## 📋 Verification Checklist

After redeployment, test these:

- [ ] Visit homepage - should load without 500 error
- [ ] Click "Sign Up" - form should appear
- [ ] Create an account - should redirect to dashboard
- [ ] Sign out and sign in - authentication should work
- [ ] Create a job application - should save successfully
- [ ] Generate share link - should work
- [ ] Visit share link in incognito - should show application

---

## 🐛 Troubleshooting

### Still getting 500 error?
**Check:** All 3 environment variables are set for **Production** environment

### "Environment variable not found" error?
**Fix:** Variable name typo - must be exactly `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

### Authentication not working?
**Fix:** Make sure `NEXTAUTH_URL` matches your actual Vercel URL (no trailing slash)

### Prisma errors after switching to PostgreSQL?
**Fix:** Vercel should auto-run migrations, but you can manually trigger:
```bash
# In Vercel project settings → Functions → Add command
npx prisma migrate deploy
```

---

## 🎯 What's Next?

Once your app is working:

1. **Set up file uploads** (optional):
   - See `VERCEL_DEPLOYMENT.md` for Vercel Blob Storage setup
   - Required for document upload/preview features

2. **Custom domain** (optional):
   - Vercel Settings → Domains → Add your domain

3. **Update README.md**:
   - Add your live deployment URL
   - Update setup instructions

4. **Share on LinkedIn**:
   - Use templates in `LINKEDIN_POST.md`

---

## 📞 Need Help?

Check Vercel logs for specific errors:
- Go to your deployment → **Logs** tab
- Look for the specific error message
- Most issues are typos in environment variable names

**Common fixes:**
- Variable not set for Production environment
- DATABASE_URL format incorrect
- NEXTAUTH_URL doesn't match deployment URL
