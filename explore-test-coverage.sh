#!/bin/bash
echo "=== WordPress Test Coverage Explorer ==="
echo ""

# 1. See which files HAVE tests
echo "1. Files WITH existing tests:"
echo "============================="
find tests/phpunit/tests -name "*.php" -type f | wc -l | xargs echo "Total test files: "
echo ""

# 2. See WordPress source files
echo "2. WordPress Source Files:"
echo "=========================="
find src -name "*.php" -type f | wc -l | xargs echo "Total PHP files in src/: "
echo ""

# 3. Check coverage from your last run
echo "3. Current Coverage Status:"
echo "==========================="
if [ -d "coverage" ]; then
    echo "Coverage report exists in: coverage/"
    echo "Covered files: $(find coverage -name "*.html" | wc -l)"
    
    # Get covered vs uncovered
    covered=$(find coverage -name "*.html" -exec grep -l "covered" {} \; | wc -l)
    total=$(find coverage -name "*.html" | wc -l)
    echo "Files with SOME coverage: $covered/$total"
else
    echo "No coverage report found. Generate one first."
fi

echo ""
echo "4. Test Directory Structure:"
echo "============================"
ls tests/phpunit/tests/ | head -20
