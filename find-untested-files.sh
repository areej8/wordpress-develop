#!/bin/bash
echo "=== Finding Untested WordPress Files ==="
echo ""

# Get all WordPress PHP files
find src -name "*.php" -type f | sort > all-files.txt
echo "Total WordPress files: $(wc -l < all-files.txt)"

# Get files with tests (approximate - by name matching)
echo ""
echo "Files likely with tests:"
echo "========================"

# Check common patterns
for dir in post user option comment taxonomy; do
    if [ -d "tests/phpunit/tests/$dir" ]; then
        count=$(find "tests/phpunit/tests/$dir" -name "*.php" | wc -l)
        echo "$dir/: $count test files"
    fi
done

echo ""
echo "Quick check - sample untested areas:"
echo "===================================="

# Check if core files have tests
core_files=(
    "src/wp-admin/admin.php"
    "src/wp-includes/plugin.php"
    "src/wp-includes/theme.php"
    "src/wp-includes/user.php"
    "src/wp-includes/post.php"
)

for file in "${core_files[@]}"; do
    if [ -f "$file" ]; then
        # Try to find corresponding test
        base=$(basename "$file" .php)
        test_file="tests/phpunit/tests/${base}/${base}.php"
        
        if [ -f "$test_file" ]; then
            echo "✅ $file has tests"
        else
            echo "❌ $file - No direct test file found"
        fi
    fi
done
