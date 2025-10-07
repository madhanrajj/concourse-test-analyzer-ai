# 🚨 QUICK FIX - 500 Error

## The Problem
```
500 Internal Server Error when clicking "Analyze"
```

## The Solution (2 minutes)

### You Need an AI API Key! 🔑

The app needs either **Anthropic Claude** or **OpenAI** to work.

---

## Option 1: Use Anthropic Claude (Recommended)

### Step 1: Get Free API Key
1. Visit: https://console.anthropic.com/
2. Sign up (free tier available)
3. Get API key (looks like `sk-ant-...`)

### Step 2: Add to Backend
```bash
cd backend

# Create config file
echo "PORT=3001" > .env
echo "AI_PROVIDER=anthropic" >> .env
echo "ANTHROPIC_API_KEY=sk-ant-YOUR-KEY-HERE" >> .env

# Replace YOUR-KEY-HERE with your actual key!
```

### Step 3: Restart
```bash
# Stop backend (Ctrl+C)
npm start

# You should see:
# 🚀 Test Analyzer API running on port 3001
# 📊 AI Provider: anthropic
```

✅ **Now try analyzing again!**

---

## Option 2: Use OpenAI

### Step 1: Get API Key
1. Visit: https://platform.openai.com/
2. Sign up
3. Get API key (looks like `sk-...`)

### Step 2: Add to Backend
```bash
cd backend

# Create config file
echo "PORT=3001" > .env
echo "AI_PROVIDER=openai" >> .env
echo "OPENAI_API_KEY=sk-YOUR-KEY-HERE" >> .env

# Replace YOUR-KEY-HERE with your actual key!
```

### Step 3: Restart
```bash
npm start
```

---

## Still Not Working?

### Check These:

**1. Is backend running?**
```bash
# Should show process
ps aux | grep node
```

**2. Can you reach it?**
```bash
curl http://localhost:3001/health
# Should return: {"status":"OK"}
```

**3. Any errors in backend terminal?**
Look for:
- "Missing API key"
- "Cannot find module"
- "EADDRINUSE"

**4. Check your .env file:**
```bash
cd backend
cat .env
```

Should show:
```
PORT=3001
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-api03-...
```

---

## Complete Fresh Start

If nothing works:

```bash
# 1. Stop everything
pkill -f node

# 2. Reinstall
cd backend
rm -rf node_modules
npm install

# 3. Create .env
cat > .env << 'EOF'
PORT=3001
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-YOUR-KEY-HERE
EOF

# Replace YOUR-KEY-HERE above!

# 4. Start
npm start
```

---

## ⚡ Super Quick Setup

**Copy this, replace YOUR-KEY, and run:**

```bash
cd backend && \
echo "PORT=3001
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-YOUR-KEY-HERE" > .env && \
npm install && \
npm start
```

---

## 📞 Need More Help?

See **TROUBLESHOOTING.md** for detailed debugging steps.

---

**TIP:** The backend terminal will show the exact error. Look there first! 👀
