# WordPress CI/CD Pipeline

## Pipeline Stages:
1. 🔍 **Source Stage** - Code validation and security scanning
2. 🏗️ **Build Stage** - Create WordPress build package
3. 🧪 **Test Stage** - Automated testing
4. 🚀 **Staging Stage** - Deploy to staging environment
5. 🌐 **Production Stage** - Deploy to production

## How to Use:

### 1. Automatic Trigger:
- Push to `trunk` branch → Runs stages 1-4
- Create Pull Request → Runs stages 1-3

### 2. Manual Trigger:
- Go to GitHub Actions tab
- Select "WordPress CI/CD Pipeline"
- Click "Run workflow"
- Choose branch and run

### 3. Production Deployment:
1. Ensure staging is verified
2. Go to GitHub Actions
3. Run "WordPress CI/CD Pipeline" workflow
4. Select "production" environment
5. Confirm deployment

## Environment Variables:
Set these in GitHub Repository Settings → Secrets and Variables → Actions:

### Secrets (for real deployment):
- `STAGING_SSH_KEY` - SSH key for staging server
- `PRODUCTION_SSH_KEY` - SSH key for production server

### Variables:
- `STAGING_URL` - https://staging.yourdomain.com
- `PRODUCTION_URL` - https://yourdomain.com

## Testing Locally:
```bash
# Test PHP syntax
./scripts/validate-php.sh

# Build locally
./scripts/build-wordpress.sh

