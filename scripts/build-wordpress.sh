#!/bin/bash
echo "Building WordPress..."
echo "Version: $(git describe --tags --always)"
echo "PHP Version: $(php --version | head -1)"

# Create timestamp
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Create build directory
mkdir -p "build-$TIMESTAMP"

# Copy WordPress files
if [ -d "src" ]; then
  cp -r src/* "build-$TIMESTAMP"/
  echo "Copied WordPress core files"
fi

# Create build info
cat > "build-$TIMESTAMP/BUILD_INFO.txt" << EOL
WordPress Build Information
===========================
Build Date: $(date)
Commit: $(git rev-parse --short HEAD)
Branch: $(git branch --show-current)
PHP Version: $(php --version | head -1)
EOL

echo "✅ Build created: build-$TIMESTAMP"
ls -la "build-$TIMESTAMP"
