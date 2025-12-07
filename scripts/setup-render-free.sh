#!/bin/bash
# setup-render-free.sh
echo "Setting up FREE Render.com deployment..."
echo ""

# Create minimal files if they don't exist
if [ ! -f "Dockerfile" ]; then
  echo "Creating Dockerfile..."
  cat > Dockerfile << 'EOF'
FROM wordpress:php8.2-apache
COPY src/ /var/www/html/
RUN chown -R www-data:www-data /var/www/html
EOF
fi

# Create README for Render
cat > RENDER-README.md << 'EOF'
# WordPress Core on Render.com (Free)

This deploys WordPress core source code to Render.com free tier.

## Quick Setup:

1. **Sign up** at [render.com](https://render.com) (use GitHub, it's free)
2. **Create New Web Service**
3. **Connect this repository**
4. **Configure:**
   - Name: wordpress-core-demo
   - Environment: Docker
   - Dockerfile Path: ./Dockerfile
   - Plan: Free
   - Instance Type: Free
5. **Create Service**

## Free Tier Limits:
- 750 hours/month
- 512MB RAM
- Sleeps after inactivity
- No database (static deployment)

## Manual Deployment:
After setup, get "Manual Deploy Hook" from Render service settings and add to GitHub Secrets as `RENDER_DEPLOY_HOOK`.

## GitHub Actions:
Push to `main` branch to trigger automatic deployment.
EOF

echo "✅ Created setup files"
echo ""
echo "📋 Next steps:"
echo "1. Commit and push these files"
echo "2. Go to https://render.com"
echo "3. Create Web Service with above configuration"
echo "4. Get deploy hook and add to GitHub Secrets"
echo ""
echo "Files created:"
echo "- Dockerfile (for Render)"
echo "- RENDER-README.md (instructions)"
