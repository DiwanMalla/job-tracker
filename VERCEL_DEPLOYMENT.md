# Deploying Job Tracker to Vercel

This guide will help you deploy the Job Tracker application to Vercel with Vercel Blob Storage for file uploads.

## Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Your job-tracker repository pushed to GitHub

## Step 1: Set Up Vercel Blob Storage

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on the "Storage" tab
3. Click "Create Database" → Select "Blob"
4. Give it a name (e.g., "job-tracker-uploads")
5. Click "Create"
6. Copy the `BLOB_READ_WRITE_TOKEN` - you'll need this later

## Step 2: Deploy to Vercel

### Option A: Deploy from Vercel Dashboard (Easiest)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Project"
3. Select your `job-tracker` repository from GitHub
4. Vercel will auto-detect it's a Next.js app
5. Click "Deploy"

### Option B: Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

## Step 3: Configure Environment Variables

After deployment, add these environment variables in Vercel:

1. Go to your project in Vercel Dashboard
2. Click "Settings" → "Environment Variables"
3. Add the following variables:

```env
# Database
DATABASE_URL=your_production_database_url

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-app.vercel.app

# Vercel Blob (automatically added if you created Blob storage)
BLOB_READ_WRITE_TOKEN=vercel_blob_***
```

### Important Notes:

- **DATABASE_URL**: You'll need a production database. Options:
  - **Vercel Postgres** (Recommended): Create in Vercel Dashboard → Storage → Postgres
  - **PlanetScale**: Free tier available
  - **Neon**: Free serverless Postgres
  - **Supabase**: Free tier with PostgreSQL

- **NEXTAUTH_SECRET**: Generate with:
  ```bash
  openssl rand -base64 32
  ```

- **NEXTAUTH_URL**: Your Vercel deployment URL (e.g., `https://job-tracker.vercel.app`)

## Step 4: Set Up Production Database

### Using Vercel Postgres (Recommended):

1. In Vercel Dashboard → Storage → Create Database → Postgres
2. Connect it to your project
3. Vercel will automatically add `DATABASE_URL` to your environment variables
4. Run Prisma migrations:

```bash
# After deployment, run migrations
npx prisma migrate deploy
```

Or set up a `postbuild` script in `package.json`:

```json
{
  "scripts": {
    "postbuild": "prisma generate && prisma migrate deploy"
  }
}
```

## Step 5: Verify Deployment

1. Visit your Vercel URL
2. Test user registration and login
3. Create a job application
4. **Upload a document** (resume or cover letter)
5. **Test document download**
6. **Create a share link** and test it

## Features Verification Checklist

- [ ] User authentication (signup/signin)
- [ ] Create job application
- [ ] **Upload resume** ✅
- [ ] **Upload cover letter** ✅
- [ ] **Download documents** ✅
- [ ] **Share link generation** ✅
- [ ] **Public sharing view** ✅
- [ ] **Document display in shared view** ✅
- [ ] Analytics dashboard
- [ ] Edit/Delete applications

## Troubleshooting

### File Upload Issues

If file uploads fail:
1. Check that `BLOB_READ_WRITE_TOKEN` is set in environment variables
2. Verify Vercel Blob storage is created and connected
3. Check deployment logs for errors

### Database Issues

If database connection fails:
1. Verify `DATABASE_URL` is correct
2. Check if migrations ran successfully
3. Review Vercel function logs

### Authentication Issues

If auth doesn't work:
1. Verify `NEXTAUTH_SECRET` is set
2. Ensure `NEXTAUTH_URL` matches your deployment URL
3. Check that it ends with your actual domain (no trailing slash)

## Performance Optimization

Vercel automatically optimizes:
- ✅ Edge caching
- ✅ Image optimization
- ✅ Automatic HTTPS
- ✅ CDN distribution
- ✅ Serverless functions

## Cost Estimate

**Free Tier Includes:**
- Unlimited static requests
- 100GB bandwidth/month
- 100GB-hrs serverless function execution
- Blob Storage: 10GB storage + 1GB bandwidth

**Blob Storage Pricing (if exceeding free tier):**
- $0.15/GB storage per month
- $0.20/GB bandwidth

For a typical job tracker with ~50 users:
- Estimated 100-500 MB storage
- **Cost: FREE** (within free tier)

## Continuous Deployment

Once set up, every push to your `main` branch will:
1. Automatically trigger a new deployment
2. Run build process
3. Deploy to production
4. No manual steps needed! 🚀

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel Blob Docs: https://vercel.com/docs/storage/vercel-blob
- Need help? Check deployment logs in Vercel Dashboard

---

**Your app is now production-ready with:**
- ✅ File uploads (Vercel Blob)
- ✅ Share links
- ✅ Secure authentication
- ✅ Auto-scaling infrastructure
- ✅ HTTPS by default
- ✅ Global CDN

🎉 **Congratulations on your deployment!**
