# Deployment Guide

Complete deployment instructions for the Test Automation AI Analyzer.

## Table of Contents
1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Cloud Deployment](#cloud-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Security Considerations](#security-considerations)

---

## Local Development

### Prerequisites
- Node.js 16+ and npm
- Git
- API key from OpenAI or Anthropic

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd test-automation-ai-analyzer
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your API keys
npm start
```

3. **Frontend Setup** (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

---

## Docker Deployment

### Quick Start

1. **Create environment file**
```bash
cd backend
cp .env.example .env
# Edit .env with your API keys
```

2. **Start all services**
```bash
docker-compose up -d
```

3. **Check status**
```bash
docker-compose ps
docker-compose logs -f
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Production Docker Deployment

1. **Build production images**
```bash
docker-compose build --no-cache
```

2. **Start with resource limits**
```bash
docker-compose up -d
```

3. **Monitor logs**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

4. **Scale backend (if needed)**
```bash
docker-compose up -d --scale backend=3
```

### Useful Docker Commands
```bash
# Stop all services
docker-compose down

# Restart a service
docker-compose restart backend

# View resource usage
docker stats

# Clean up
docker-compose down -v
docker system prune -a
```

---

## Cloud Deployment

### AWS Deployment

#### Option 1: EC2 + Docker

1. **Launch EC2 Instance**
   - AMI: Amazon Linux 2
   - Instance Type: t3.medium or larger
   - Security Group: Open ports 80, 443, 3000, 3001

2. **Connect and Setup**
```bash
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Docker
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone and deploy
git clone <repository-url>
cd test-automation-ai-analyzer
cd backend && cp .env.example .env
# Edit .env with API keys
cd ..
docker-compose up -d
```

3. **Setup Nginx Reverse Proxy** (optional)
```bash
sudo yum install nginx -y
sudo nano /etc/nginx/conf.d/test-analyzer.conf
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### Option 2: ECS (Elastic Container Service)

1. **Push images to ECR**
```bash
# Create ECR repositories
aws ecr create-repository --repository-name test-analyzer-backend
aws ecr create-repository --repository-name test-analyzer-frontend

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag and push
docker tag test-analyzer-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/test-analyzer-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/test-analyzer-backend:latest

docker tag test-analyzer-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/test-analyzer-frontend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/test-analyzer-frontend:latest
```

2. **Create ECS Task Definitions** (use AWS Console or CLI)

3. **Create ECS Service** with Application Load Balancer

4. **Configure environment variables** in Task Definition

#### Option 3: Elastic Beanstalk

1. **Install EB CLI**
```bash
pip install awsebcli
```

2. **Initialize EB application**
```bash
eb init test-analyzer --platform docker --region us-east-1
```

3. **Create environment**
```bash
eb create production --instance-type t3.medium
```

4. **Deploy**
```bash
eb deploy
```

### Heroku Deployment

#### Backend
```bash
cd backend
heroku create test-analyzer-backend
heroku config:set AI_PROVIDER=anthropic
heroku config:set ANTHROPIC_API_KEY=your-key
# Add other env vars
git subtree push --prefix backend heroku master
```

#### Frontend
```bash
cd frontend
heroku create test-analyzer-frontend
heroku buildpacks:set heroku/nodejs
git subtree push --prefix frontend heroku master
```

### Vercel (Frontend Only)

```bash
cd frontend
npm install -g vercel
vercel
# Follow prompts
# Configure environment variable for API URL
```

### Netlify (Frontend Only)

1. **Build settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

2. **Environment variables**
   - Add API base URL if needed

---

## Environment Configuration

### Backend Environment Variables

**Required:**
```env
PORT=3001
AI_PROVIDER=anthropic  # or openai
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Optional:**
```env
# OpenAI (if using instead of Claude)
OPENAI_API_KEY=sk-your-key-here

# AWS S3 (for fetching test results)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET=your-bucket-name

# Node environment
NODE_ENV=production
```

### Frontend Environment Variables

For production builds, update API URL in `vite.config.js` if needed:

```javascript
export default defineConfig({
  // ...
  server: {
    proxy: {
      '/api': {
        target: 'https://your-backend-api.com',
        changeOrigin: true
      }
    }
  }
});
```

---

## Security Considerations

### Production Checklist

- [ ] **API Keys**: Store in environment variables, never commit
- [ ] **HTTPS**: Use SSL certificates (Let's Encrypt)
- [ ] **CORS**: Restrict to allowed origins
- [ ] **Rate Limiting**: Implement request throttling
- [ ] **Authentication**: Add user auth for production
- [ ] **Input Validation**: Sanitize all user inputs
- [ ] **File Upload Limits**: Restrict file sizes
- [ ] **Secrets Management**: Use AWS Secrets Manager or similar
- [ ] **Monitoring**: Set up CloudWatch or similar
- [ ] **Backups**: Regular database backups (if added)
- [ ] **Updates**: Keep dependencies updated

### Recommended Security Additions

1. **Rate Limiting**
```bash
cd backend
npm install express-rate-limit
```

Add to `server.js`:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

2. **Helmet for Security Headers**
```bash
npm install helmet
```

Add to `server.js`:
```javascript
const helmet = require('helmet');
app.use(helmet());
```

3. **CORS Configuration**
Update `server.js`:
```javascript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
```

---

## Health Checks and Monitoring

### Health Check Endpoints

Backend includes `/health` endpoint:
```bash
curl http://localhost:3001/health
```

### Monitoring Setup

**AWS CloudWatch:**
- Set up log groups for backend/frontend
- Create alarms for error rates
- Monitor API latency

**Datadog/New Relic:**
- Install agent
- Configure APM
- Set up dashboards

---

## Backup and Recovery

### Database Backup (Future)
When database is added:
```bash
# PostgreSQL
pg_dump dbname > backup.sql

# MongoDB
mongodump --db dbname --out /backup
```

### Environment Backup
```bash
# Backup .env files securely
tar -czf env-backup.tar.gz backend/.env
gpg -c env-backup.tar.gz
```

---

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (ALB/NLB)
- Run multiple backend instances
- Session storage in Redis (if added)

### Vertical Scaling
- Increase instance size
- Add more CPU/memory

### Database Scaling (Future)
- Read replicas
- Connection pooling
- Query optimization

---

## Troubleshooting

### Backend won't start
```bash
# Check logs
docker-compose logs backend

# Verify .env file
cat backend/.env

# Test API key
curl -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01"
```

### Frontend can't connect
```bash
# Check backend is running
curl http://localhost:3001/health

# Check proxy configuration
cat frontend/vite.config.js

# Check browser console
# Open DevTools > Console > Network tab
```

### S3 Integration Issues
```bash
# Test AWS credentials
aws s3 ls s3://your-bucket-name

# Check IAM permissions
# Ensure: s3:GetObject, s3:ListBucket
```

---

## Cost Optimization

### AWS
- Use Auto Scaling Groups
- Reserved Instances for predictable workload
- CloudFront for static assets
- S3 lifecycle policies

### AI API Costs
- Cache frequent analyses
- Implement request throttling
- Use cheaper models for simple analyses
- Batch processing where possible

---

## CI/CD Pipeline (GitHub Actions Example)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build and push Docker images
        run: |
          docker-compose build
          # Push to registry
          
      - name: Deploy to production
        run: |
          # SSH to server and update
          # or use AWS ECS task update
```

---

## Support and Maintenance

- Monitor error logs daily
- Update dependencies weekly
- Review API costs monthly
- Security patches immediately
- Backup data regularly

---

For additional help, refer to:
- [README.md](README.md) - Main documentation
- [QUICKSTART.md](QUICKSTART.md) - Quick setup guide
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Architecture overview
