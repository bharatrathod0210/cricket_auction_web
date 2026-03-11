# Deploy to Vercel - Complete Guide

## 🚀 Deploy Both Frontend & Backend on Vercel

Your URLs will be:
- Frontend: `https://rpl.vercel.app`
- Backend: `https://rpl-backend.vercel.app`

---

## Prerequisites

1. GitHub account
2. Vercel account (sign up at https://vercel.com)
3. Push your code to GitHub

---

## Step 1: Push Code to GitHub

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

---

## Step 2: Deploy Backend First

### 2.1 Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Click: **"Add New..."** → **"Project"**

### 2.2 Import Repository
- Click: **"Import Git Repository"**
- Select your repository
- Click: **"Import"**

### 2.3 Configure Backend Project
```
Project Name: rpl-backend
Framework Preset: Other
Root Directory: backend
Build Command: (leave empty)
Output Directory: (leave empty)
Install Command: npm install
```

### 2.4 Add Environment Variables
Click **"Environment Variables"** and add:

```
NODE_ENV=production
MONGO_URI=mongodb+srv://bharat0210:Bharat123@hello.kmsnd1s.mongodb.net/rpl_db
JWT_SECRET=5ZFa6l3SzV8CVVc7lnGSaQ3K4kg5rFVlGfapPtmNNVF
PORT=5000
```

### 2.5 Deploy
- Click: **"Deploy"**
- Wait 2-3 minutes
- Copy your backend URL: `https://rpl-backend.vercel.app`

### 2.6 Test Backend
Visit: `https://rpl-backend.vercel.app/api/health`

Should return:
```json
{"success":true,"message":"RPL API is running 🏏"}
```

---

## Step 3: Deploy Frontend

### 3.1 Import Repository Again
- Go back to Vercel Dashboard
- Click: **"Add New..."** → **"Project"**
- Select same repository
- Click: **"Import"**

### 3.2 Configure Frontend Project
```
Project Name: rpl
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 3.3 Deploy
- Click: **"Deploy"**
- Wait 2-3 minutes
- Your app will be live at: `https://rpl.vercel.app`

---

## Step 4: Configure Custom Domain (Optional)

### 4.1 In Vercel Dashboard
- Go to your frontend project (rpl)
- Click: **"Settings"** → **"Domains"**
- Add domain: `rpl.vercel.app`

### 4.2 Update Backend URL (if needed)
If Vercel gives you a different URL, update `frontend/src/services/api.js`:
```javascript
const API_BASE = import.meta.env.PROD 
    ? 'https://your-actual-backend-url.vercel.app/api' 
    : 'http://localhost:5000/api';
```

Then redeploy frontend.

---

## Step 5: Test Your Deployment

### Test Frontend
1. Homepage: `https://rpl.vercel.app/`
2. Admin Login: `https://rpl.vercel.app/admin/login`
3. Registration: `https://rpl.vercel.app/register`

### Test Backend API
1. Health: `https://rpl-backend.vercel.app/api/health`
2. Teams: `https://rpl-backend.vercel.app/api/teams`

---

## Important Notes

### MongoDB Configuration
1. Go to MongoDB Atlas
2. Network Access → Add IP Address
3. Add: `0.0.0.0/0` (Allow from anywhere)
4. Or add Vercel IPs

### File Uploads
⚠️ **Important:** Vercel has read-only filesystem. Uploaded files won't persist.

**Solution:** Use cloud storage:
- Cloudinary (Recommended)
- AWS S3
- Vercel Blob Storage

For now, uploads will work but may be lost on redeployment.

### Environment Variables
Never commit `.env` file. Always set in Vercel dashboard.

---

## Troubleshooting

### CORS Errors
Backend CORS is already configured for Vercel domains. If you still get errors:
1. Check backend URL in frontend is correct
2. Verify backend is deployed and running
3. Check browser console for exact error

### API Not Working
1. Test backend directly: `https://rpl-backend.vercel.app/api/health`
2. Check Vercel logs: Dashboard → Project → Deployments → View Function Logs
3. Verify environment variables are set

### Frontend Blank Page
1. Check browser console for errors
2. Verify build succeeded in Vercel
3. Check if API_BASE URL is correct

### 404 Errors
- Frontend: Already configured with `vercel.json` rewrites
- Backend: Check `vercel.json` routes configuration

---

## Redeploy After Changes

### Auto Deploy (Recommended)
Push to GitHub and Vercel auto-deploys:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

### Manual Deploy
1. Go to Vercel Dashboard
2. Select project
3. Click: **"Deployments"**
4. Click: **"Redeploy"**

---

## Update Backend URL

If your backend URL is different, update these files:

1. `frontend/src/services/api.js`
2. All component files (already configured with `import.meta.env.PROD`)

Then commit and push to redeploy.

---

## MongoDB Atlas Whitelist

Add Vercel IPs to MongoDB:
1. Go to MongoDB Atlas
2. Network Access
3. Add IP: `0.0.0.0/0`

Or get Vercel IPs from: https://vercel.com/docs/concepts/edge-network/regions

---

## Cost

- Vercel Free Tier:
  - ✅ Unlimited deployments
  - ✅ 100GB bandwidth/month
  - ✅ Serverless functions
  - ✅ Custom domains

Both frontend and backend are FREE on Vercel!

---

## Summary

✅ Backend deployed at: `https://rpl-backend.vercel.app`
✅ Frontend deployed at: `https://rpl.vercel.app`
✅ Auto-deploy on git push
✅ Environment variables configured
✅ CORS configured
✅ MongoDB connected

Your RPL Tournament app is now LIVE! 🎉

---

## Quick Commands

```bash
# Push changes and auto-deploy
git add .
git commit -m "Update"
git push origin main

# View logs
vercel logs rpl-backend
vercel logs rpl
```

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Check deployment logs in Vercel dashboard
