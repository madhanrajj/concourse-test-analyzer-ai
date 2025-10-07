# Quick Start Guide

Get up and running with the Test Automation AI Analyzer in 5 minutes!

## Prerequisites

- Node.js 16+ installed
- An API key from OpenAI or Anthropic (Claude)

## Step 1: Clone and Setup

```bash
# Navigate to the project directory
cd test-automation-ai-analyzer
```

## Step 2: Backend Setup (2 minutes)

```bash
# Go to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=3001
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-YOUR-KEY-HERE
EOF

# Start the backend
npm start
```

Backend should now be running on `http://localhost:3001`

## Step 3: Frontend Setup (2 minutes)

Open a new terminal:

```bash
# Go to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Start the frontend
npm run dev
```

Frontend should now be running on `http://localhost:3000`

## Step 4: Try It Out! (1 minute)

1. Open your browser to `http://localhost:3000`

2. Copy the sample test log from `sample-test-log.txt` or use this quick example:

```
25 scenarios (1 failed, 24 passed)
70 steps (1 failed, 69 passed)
0m54.214s

Scenario: Validate Forbidden error response
  Error: expect(received).toBe(expected)
  Expected: "User is not authorized"
  Received: "User is not authorized to access this resource"
  at test.js:513:25
```

3. Paste it in the "Paste Content" tab

4. Click "Analyze Logs"

5. Watch as AI analyzes your test failures! 🎉

## Using Docker (Alternative)

If you prefer Docker:

```bash
# Make sure Docker is running

# Create backend/.env first with your API keys

# Start everything with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop when done
docker-compose down
```

## Troubleshooting

**Backend won't start?**
- Make sure you have a valid API key in `backend/.env`
- Check that port 3001 is not in use

**Frontend can't connect to backend?**
- Ensure backend is running on port 3001
- Check browser console for errors

**AI analysis fails?**
- Verify your API key is correct
- Check your API provider (OpenAI/Anthropic) has credits
- Look at backend logs for error messages

**Need OpenAI instead of Claude?**
Edit `backend/.env`:
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here
```

## What's Next?

- Try uploading a test log file
- Configure S3 to fetch test results automatically
- Export reports to share with your team
- Check out the full README.md for advanced features

## Getting API Keys

### Anthropic (Claude)
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys
4. Create a new key
5. Copy and paste into your `.env` file

### OpenAI
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys
4. Create a new key
5. Copy and paste into your `.env` file

## Support

Having issues? Check:
- The full README.md for detailed documentation
- Backend logs: Look at your backend terminal
- Frontend console: Press F12 in your browser
- API provider status pages

---

Happy testing! 🚀
