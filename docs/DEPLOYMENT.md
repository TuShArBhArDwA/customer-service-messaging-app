# Deployment Guide

## Prerequisites
- Vercel account (https://vercel.com)
- GitHub repository with the code
- Supabase project

## Environment Variables

Add these to your Vercel project:

1. Go to **Settings → Environment Variables**
2. Add the following:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (optional)
```

Get these from your Supabase project settings.

## Deploy Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Connect to Vercel
1. Go to https://vercel.com/new
2. Connect your GitHub account
3. Select the repository
4. Click "Import"

### 3. Configure Environment
1. Add environment variables from Supabase
2. Click "Deploy"

### 4. Custom Domain
1. Go to **Settings → Domains**
2. Add your custom domain
3. Update DNS records as instructed

## Database Setup on Supabase

### Create Tables
1. In Supabase dashboard, go to **SQL Editor**
2. Create a new query
3. Paste contents of `/scripts/001_create_schema.sql`
4. Execute query

### Seed Sample Data
1. Paste contents of `/scripts/003_seed_sample_data.sql`
2. Execute query

## CI/CD Pipeline

Vercel automatically:
- Builds on each push to main
- Runs tests if configured
- Deploys on successful build
- Provides preview URLs for PRs

## Monitoring

### Error Tracking
Set up with Sentry:
```bash
npm install @sentry/nextjs
```

### Analytics
Use Vercel Analytics:
- Automatic page metrics
- Web Vitals tracking
- Real User Monitoring (RUM)

### Logs
- View in Vercel dashboard
- Use serverless function logs
- Monitor database queries in Supabase

## Scaling

### Database
- Supabase auto-scales PostgreSQL
- Monitor connections in dashboard
- Add read replicas if needed

### API
- Vercel auto-scales serverless functions
- Monitor execution time
- Optimize slow endpoints

### Cache
- Add Redis/Upstash for caching
- Cache canned messages
- Cache frequently accessed customers

## Rollback
If deployment fails:
1. Go to **Deployments**
2. Select previous successful deployment
3. Click **Promote to Production**

## Maintenance

### Regular Tasks
- Monitor error rates
- Review analytics
- Update dependencies monthly
- Backup database regularly (Supabase auto-backups)

### Performance Optimization
- Enable image optimization
- Minify CSS/JS
- Use SWR for client-side caching
- Implement database connection pooling
