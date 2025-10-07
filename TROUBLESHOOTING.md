# Troubleshooting Guide

## Common Error: 500 Internal Server Error

### Symptoms
```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
POST http://localhost:3000/api/analyze
```

### Most Common Cause: Missing AI API Keys

The backend needs an API key from OpenAI or Anthropic to analyze tests.

---

## ✅ Quick Fix (5 minutes)

### Step 1: Get an API Key

**Option A: Use Anthropic Claude (Recommended)**
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Click "API Keys"
4. Click "Create Key"
5. Copy the key (starts with `sk-ant-`)

**Option B: Use OpenAI**
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Go to API Keys section
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)

### Step 2: Configure Backend

```bash
cd backend

# Create .env file from example
cp .env.example .env

# Edit .env file
nano .env
# or
code .env
# or use any text editor
```

### Step 3: Add Your API Key

**For Anthropic (Claude):**
```env
PORT=3001
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-YOUR-ACTUAL-KEY-HERE
```

**For OpenAI:**
```env
PORT=3001
AI_PROVIDER=openai
OPENAI_API_KEY=sk-YOUR-ACTUAL-KEY-HERE
```

### Step 4: Restart Backend

```bash
# Stop the backend (Ctrl+C)

# Start it again
npm start
```

You should see:
```
🚀 Test Analyzer API running on port 3001
📊 AI Provider: anthropic
```

### Step 5: Test Again

1. Go to http://localhost:3000
2. Paste some test content
3. Click "Analyze Logs"
4. Should work now! ✅

---

## 🔍 Other Possible Issues

### Issue 1: Backend Not Running

**Check if backend is running:**
```bash
# Should show backend process
ps aux | grep node

# Or check the port
lsof -i :3001
```

**Fix:**
```bash
cd backend
npm start
```

### Issue 2: Frontend Can't Reach Backend

**Check backend health:**
```bash
curl http://localhost:3001/health
```

Should return:
```json
{"status":"OK","timestamp":"..."}
```

**If it fails:**
- Backend isn't running
- Port 3001 is blocked
- Firewall issue

### Issue 3: Dependencies Not Installed

**Error message:**
```
Cannot find module 'express'
```

**Fix:**
```bash
cd backend
npm install

cd ../frontend
npm install
```

### Issue 4: Wrong Node Version

**Check version:**
```bash
node --version
```

Should be 16+ (tested with 18.20.4)

**Fix:**
```bash
# Install Node 18 or higher
# Use nvm (recommended):
nvm install 18
nvm use 18
```

### Issue 5: Port Already in Use

**Error message:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Fix:**
```bash
# Find process using port 3001
lsof -i :3001

# Kill it
kill -9 <PID>

# Or use a different port
# Edit backend/.env:
PORT=3002
```

---

## 🐛 Debugging Steps

### Step 1: Check Backend Logs

```bash
cd backend
npm start
```

Look for error messages like:
- `Missing API key` ← Need to add API key
- `Cannot find module` ← Run npm install
- `EADDRINUSE` ← Port in use
- `401 Unauthorized` ← Wrong API key

### Step 2: Check Frontend Logs

Open browser console (F12):
- Look for red errors
- Check Network tab
- See what the request/response shows

### Step 3: Test Backend Directly

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test analyze endpoint (with API key configured)
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"logContent":"25 scenarios (1 failed, 24 passed)"}'
```

### Step 4: Check Environment Variables

```bash
cd backend
cat .env
```

Make sure it has:
- `AI_PROVIDER=anthropic` (or openai)
- `ANTHROPIC_API_KEY=sk-ant-...` (or OPENAI_API_KEY)
- Key should be actual key, not placeholder

---

## 💡 Common Mistakes

### ❌ Mistake 1: Not Creating .env File
```bash
# This won't work - .env.example is just a template
cd backend
npm start  # Will fail - no API key!
```

✅ **Correct:**
```bash
cd backend
cp .env.example .env
# Edit .env and add real API key
npm start
```

### ❌ Mistake 2: Using Placeholder Key
```env
ANTHROPIC_API_KEY=sk-ant-...  ← This is placeholder!
```

✅ **Correct:**
```env
ANTHROPIC_API_KEY=sk-ant-api03-abc123xyz...  ← Real key
```

### ❌ Mistake 3: Wrong Provider Setting
```env
AI_PROVIDER=anthropic
OPENAI_API_KEY=sk-...  ← Wrong! Using Anthropic but set OpenAI key
```

✅ **Correct:**
```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...  ← Matches provider
```

### ❌ Mistake 4: Starting Frontend Only
```bash
cd frontend
npm run dev  # Frontend runs but backend isn't started!
```

✅ **Correct:**
```bash
# Terminal 1
cd backend && npm start

# Terminal 2
cd frontend && npm run dev
```

---

## 🚨 Emergency Quick Start

If nothing works, try this fresh start:

```bash
# 1. Stop everything
pkill -f node

# 2. Clean install
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend  
rm -rf node_modules package-lock.json
npm install

# 3. Configure backend
cd ../backend
cp .env.example .env

# 4. Edit .env and add API key
echo "AI_PROVIDER=anthropic" >> .env
echo "ANTHROPIC_API_KEY=YOUR_KEY_HERE" >> .env
# Replace YOUR_KEY_HERE with real key!

# 5. Start backend
npm start
```

Wait for: `🚀 Test Analyzer API running on port 3001`

```bash
# 6. In new terminal, start frontend
cd frontend
npm run dev
```

---

## 📋 Checklist

Before asking for help, verify:

- [ ] Node.js 16+ installed (`node --version`)
- [ ] Dependencies installed (`npm install` in both folders)
- [ ] Backend .env file exists (`ls backend/.env`)
- [ ] Real API key in .env (not placeholder)
- [ ] Backend is running (Terminal 1)
- [ ] Frontend is running (Terminal 2)
- [ ] Backend shows "running on port 3001"
- [ ] Can access http://localhost:3001/health
- [ ] No firewall blocking ports 3000 or 3001

---

## 💬 Getting Help

If still stuck, provide:

1. **Error message** from backend terminal
2. **Browser console** errors (F12)
3. **Node version** (`node --version`)
4. **Environment check:**
   ```bash
   cd backend
   cat .env | grep -v KEY  # Shows config without exposing key
   ```
5. **Health check result:**
   ```bash
   curl http://localhost:3001/health
   ```

---

## ✅ Success Indicators

You'll know it's working when:

1. **Backend shows:**
   ```
   🚀 Test Analyzer API running on port 3001
   📊 AI Provider: anthropic
   ```

2. **Frontend shows:**
   ```
   VITE v4.3.9  ready in 500 ms
   ➜  Local:   http://localhost:3000/
   ```

3. **Health check works:**
   ```bash
   curl http://localhost:3001/health
   # Returns: {"status":"OK"...}
   ```

4. **Analysis works:**
   - Paste test log
   - Click "Analyze"
   - See results! 🎉

---

## 🎯 Most Likely Solution

**90% of 500 errors are fixed by:**

```bash
cd backend
cp .env.example .env
# Edit .env and add: ANTHROPIC_API_KEY=sk-ant-YOUR-REAL-KEY
npm start
```

That's it! 🚀

---

**Need more help?** Check the backend terminal - it will show the exact error message!
