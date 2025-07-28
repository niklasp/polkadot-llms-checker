# Deployment Guide - Polkadot LLMS.txt Checker

This guide will walk you through deploying the Polkadot LLMS.txt checker to
Vercel with file-based storage and ISR caching.

## Prerequisites

- ✅ GitHub account
- ✅ Vercel account (free tier works perfectly)
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

## Step 2: Environment Variables (Optional)

The app works without any environment variables! But you can optionally add:

1. **In your Vercel project settings:**

   - Go to "Settings" → "Environment Variables"

2. **Optional: Add cron security (recommended):**

   - Generate a secure random string:
     ```bash
     openssl rand -base64 32
     ```
   - Add as `CRON_SECRET` environment variable

3. **Your optional environment variables:**
   ```
   CRON_SECRET=your_random_32_char_string  # Optional: For cron job security
   ```

## Step 3: That's It! 🎉

Your app is now deployed and fully functional with:

✅ **File-based storage** - No external database needed  
✅ **ISR caching** - 1 hour cache with automatic revalidation  
✅ **Daily cron jobs** - Automatic URL checking  
✅ **Zero configuration** - Works out of the box

## Step 4: Test Your Deployment

### Test the Web Interface

1. **Visit your live URL** (shown in Vercel dashboard)
2. **Verify you see:**
   - ✅ All 5 URLs in the table
   - ✅ Working search and refresh buttons
   - ✅ Fast loading with ISR caching

### Test the Cron Job

1. **Manual cron test (if CRON_SECRET is set):**

   ```bash
   curl -X GET "https://your-app.vercel.app/api/cron/check-urls" \
        -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

2. **Manual cron test (no auth):**

   ```bash
   curl -X GET "https://your-app.vercel.app/api/cron/check-urls"
   ```

3. **Should return:**
   ```json
   {
     "success": true,
     "message": "URL checks completed",
     "results": { "total": 5, "success": 4, "errors": 1 },
     "timestamp": "2024-..."
   }
   ```

## Step 5: Verify Cron Schedule

The cron job is configured in `vercel.json` to run daily at midnight UTC:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-urls",
      "schedule": "0 0 * * *"
    }
  ]
}
```

- **Check cron logs:** Vercel Dashboard → Functions → Cron
- **First run:** Will run daily at midnight UTC, or trigger manually

## Architecture Benefits

🚀 **No External Dependencies:**

- No KV storage costs or limits
- No database setup required
- Works on Vercel free tier

⚡ **Performance Optimized:**

- ISR caching (1 hour revalidation)
- Static generation for fast loading
- Automatic cache invalidation

💾 **File-Based Storage:**

- Data stored in `/data` directory
- JSON files for simple management
- Survives deployments with persistent storage

## Expected Functionality After Deployment

✅ **Daily automated checks** of all URLs (midnight UTC)  
✅ **Real-time status updates** (green/red badges)  
✅ **Response time tracking**  
✅ **Manual refresh capabilities**  
✅ **Search and filter functionality**  
✅ **ISR caching** for fast performance  
✅ **Zero configuration** deployment

## URLs Being Monitored

Your application monitors:

- **Papi**: https://papi.how/llms.txt
- **Dedot**: https://docs.dedot.dev/llms.txt
- **Ink**: https://use.ink/llms.txt
- **Substrate**: https://docs.substrate.io/llms.txt
- **Polkadot**: https://polkadot.network/llms.txt

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

## Troubleshooting

### Issue: Data not persisting

**Solution:** Check Vercel function logs

1. Ensure `/data` directory is being created
2. Check file write permissions in logs
3. Verify ISR is working properly

### Issue: Cron job not working (optional)

**Solutions:**

1. Verify `CRON_SECRET` matches in environment variables (if using)
2. Check that the cron endpoint returns 200 when called manually
3. Look at function logs in Vercel dashboard

### Issue: Slow performance

**Solutions:**

1. ISR should cache for 1 hour automatically
2. Check if revalidation is working properly
3. Monitor Vercel function execution time

---

🎉 **Congratulations!** Your Polkadot LLMS.txt checker is now live with
zero-dependency automated monitoring!
