# Deployment Guide - Polkadot LLMS.txt Checker

This guide will walk you through deploying the Polkadot LLMS.txt checker to
Vercel with full functionality.

## Prerequisites

- ✅ GitHub account
- ✅ Vercel account (free tier works)
- ✅ Application code ready (you have this!)

## Step 1: Deploy to Vercel

### Option A: Connect GitHub Repository (Recommended)

1. **Push your code to GitHub:**

   ```bash
   git add .
   git commit -m "Initial commit: Polkadot llms.txt checker"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings ✅

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI:**

   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

## Step 2: Set Up Vercel KV Storage

1. **In your Vercel dashboard:**

   - Go to your project
   - Click "Storage" tab
   - Click "Create Database"
   - Select "KV (Redis-compatible)"
   - Choose a name like `llms-txt-checker-kv`
   - Select region (closest to your users)

2. **Get KV credentials:**
   - After creation, click on your KV database
   - Go to "Settings" → "Environment Variables"
   - Copy the 4 environment variables:
     - `KV_URL`
     - `KV_REST_API_URL`
     - `KV_REST_API_TOKEN`
     - `KV_REST_API_READ_ONLY_TOKEN`

## Step 3: Configure Environment Variables

1. **In your Vercel project settings:**

   - Go to "Settings" → "Environment Variables"
   - Add each variable from Step 2

2. **Add cron security:**

   - Generate a secure random string:
     ```bash
     openssl rand -base64 32
     ```
   - Add as `CRON_SECRET` environment variable

3. **Your final environment variables should be:**
   ```
   KV_URL=redis://...
   KV_REST_API_URL=https://...
   KV_REST_API_TOKEN=...
   KV_REST_API_READ_ONLY_TOKEN=...
   CRON_SECRET=your_random_32_char_string
   ```

## Step 4: Redeploy with Environment Variables

After adding environment variables, trigger a new deployment:

- **Via GitHub:** Push any small change
- **Via CLI:** Run `vercel --prod`
- **Via Dashboard:** Go to "Deployments" → "Redeploy"

## Step 5: Test Your Deployment

### Test the Web Interface

1. **Visit your live URL** (shown in Vercel dashboard)
2. **Verify you see:**
   - ✅ No blue "Development Mode" banner
   - ✅ Real URL check data
   - ✅ Working search and refresh buttons

### Test the Cron Job

1. **Manual cron test:**

   ```bash
   curl -X GET "https://your-app.vercel.app/api/cron/check-urls" \
        -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

2. **Should return:**
   ```json
   {
     "success": true,
     "message": "URL checks completed",
     "results": { "total": 3, "success": 2, "errors": 1 },
     "timestamp": "2024-..."
   }
   ```

## Step 6: Verify Cron Schedule

The cron job is configured in `vercel.json` to run every hour:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-urls",
      "schedule": "0 * * * *"
    }
  ]
}
```

- **Check cron logs:** Vercel Dashboard → Functions → Cron
- **First run:** Wait up to 1 hour, or trigger manually

## Troubleshooting

### Issue: Still seeing "Development Mode" banner

**Solution:** Environment variables not properly set

1. Verify all 4 KV variables are set in Vercel
2. Redeploy the application
3. Check function logs for errors

### Issue: Cron job not working

**Solutions:**

1. Verify `CRON_SECRET` matches in environment variables
2. Check that the cron endpoint returns 200 when called manually
3. Look at function logs in Vercel dashboard

### Issue: URLs not updating

**Symptoms:** Manual checks work, but hourly updates don't happen **Solutions:**

1. Test cron endpoint manually (Step 5)
2. Check Vercel function logs for errors
3. Verify KV storage has write permissions

### Issue: "KV storage not configured" errors

**Solutions:**

1. Double-check all 4 KV environment variables
2. Ensure KV database is in same region as functions
3. Test KV connection in function logs

## Expected Functionality After Deployment

✅ **Hourly automated checks** of all URLs ✅ **Real-time status updates**
(green/red badges) ✅ **Response time tracking** ✅ **Manual refresh
capabilities** ✅ **Search and filter functionality** ✅ **Persistent data
storage**

## URLs Being Monitored

Your application will monitor:

- **Papi**: https://papi.how/llms.txt
- **Dedot**: https://docs.dedot.dev/llms.txt
- **Ink**: https://use.ink/llms.txt

## Adding More URLs

To monitor additional URLs, modify `lib/db.ts`:

```typescript
const initialUrls = [
  // ... existing URLs
  {
    id: "new-site",
    name: "New Site",
    url: "https://example.com/llms.txt",
  },
];
```

Then redeploy to Vercel.

---

🎉 **Congratulations!** Your Polkadot LLMS.txt checker is now live with
automated monitoring!
