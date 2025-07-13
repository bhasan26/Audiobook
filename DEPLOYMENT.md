# Deploying Audiobook Creator to Vercel

This guide will help you deploy your Audiobook Creator website to Vercel.

## Prerequisites

1. **GitHub Account**: Make sure your code is in a GitHub repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)

## Deployment Steps

### 1. Prepare Your Repository

Make sure your project structure looks like this:
```
audiobook-website/
├── server.js
├── package.json
├── vercel.json
├── index.html
├── styles.css
├── script.js
├── privacy.html
└── README.md
```

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project? → No
   - Project name → audiobook-creator (or your preferred name)
   - Directory → ./ (current directory)

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Node.js
   - Root Directory: ./
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
5. Click "Deploy"

### 3. Environment Variables (Optional)

If you plan to add a database later, you can set environment variables in the Vercel dashboard:

1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add any required variables (e.g., database URLs)

### 4. Custom Domain (Optional)

1. In your Vercel project dashboard, go to "Settings" → "Domains"
2. Add your custom domain
3. Follow the DNS configuration instructions

## Important Notes

### Current Limitations

1. **Data Persistence**: The current version uses in-memory storage, which means:
   - Data will be lost when the serverless function restarts
   - Each user session is isolated
   - No data sharing between users

2. **Serverless Functions**: Vercel uses serverless functions, so:
   - Cold starts may occur
   - Function timeout limits apply
   - Memory is limited per function

### Production Recommendations

For a production deployment, consider:

1. **Database Integration**:
   - **Vercel KV** (Redis): `npm install @vercel/kv`
   - **MongoDB Atlas**: Free tier available
   - **PostgreSQL**: Use Vercel Postgres or Supabase

2. **Example with Vercel KV**:
   ```javascript
   // Install: npm install @vercel/kv
   import { kv } from '@vercel/kv'
   
   // Store audiobook
   await kv.set(`audiobook:${id}`, audiobook)
   
   // Get audiobook
   const audiobook = await kv.get(`audiobook:${id}`)
   ```

3. **Authentication**: Add user authentication for multi-user support

## Troubleshooting

### Common Issues

1. **Build Errors**:
   - Check that all dependencies are in `package.json`
   - Ensure `vercel.json` is properly configured

2. **404 Errors**:
   - Verify routes in `vercel.json`
   - Check file paths in `public/` directory

3. **CORS Issues**:
   - The current setup should handle CORS automatically
   - If issues persist, check the CORS configuration in `server.js`

### Performance Optimization

1. **Static Assets**: Vercel automatically optimizes static files
2. **Caching**: Add cache headers for better performance
3. **CDN**: Vercel provides global CDN automatically

## Monitoring

After deployment:

1. **Check Function Logs**: Monitor serverless function performance
2. **Analytics**: Use Vercel Analytics for usage insights
3. **Performance**: Monitor Core Web Vitals

## Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

## Next Steps

Once deployed, consider:

1. Adding a database for persistent storage
2. Implementing user authentication
3. Adding analytics and monitoring
4. Setting up automated deployments with GitHub
5. Adding a custom domain

Your Audiobook Creator will be live at: `https://your-project-name.vercel.app` 