#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║      WordPress Test Coverage Analysis                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Function to check if a function has tests
check_function() {
    local func_name=$1
    local file_path=$2
    local count=$(grep -r "function test.*${func_name}" tests/phpunit/tests/ 2>/dev/null | wc -l)
    
    echo "DEBUG: Checking ${func_name} - count=$count"  # Debug line
    
    if [ $count -eq 0 ]; then
        echo "  ❌ ${func_name}() - NO TESTS"
        return 1
    else
        echo "  ✓ ${func_name}() - ${count} test(s)"
        return 0
    fi
}

untested=0
tested=0

echo "📁 File: src/wp-includes/formatting.php"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_function "sanitize_title" "formatting.php" && ((tested++)) || ((untested++))
check_function "wpautop" "formatting.php" && ((tested++)) || ((untested++))
check_function "esc_html" "formatting.php" && ((tested++)) || ((untested++))
check_function "esc_attr" "formatting.php" && ((tested++)) || ((untested++))
check_function "sanitize_email" "formatting.php" && ((tested++)) || ((untested++))
check_function "sanitize_file_name" "formatting.php" && ((tested++)) || ((untested++))

echo "DEBUG: formatting.php - tested=$tested, untested=$untested"  # Debug line

echo ""
echo "📁 File: src/wp-includes/link-template.php"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_function "get_permalink" "link-template.php" && ((tested++)) || ((untested++))
check_function "home_url" "link-template.php" && ((tested++)) || ((untested++))
check_function "site_url" "link-template.php" && ((tested++)) || ((untested++))
check_function "admin_url" "link-template.php" && ((tested++)) || ((untested++))
check_function "get_category_link" "link-template.php" && ((tested++)) || ((untested++))

echo "DEBUG: link-template.php - tested=$tested, untested=$untested"  # Debug line

echo ""
echo "📁 File: src/wp-includes/general-template.php"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_function "get_bloginfo" "general-template.php" && ((tested++)) || ((untested++))
check_function "wp_title" "general-template.php" && ((tested++)) || ((untested++))
check_function "get_archives" "general-template.php" && ((tested++)) || ((untested++))
check_function "calendar" "general-template.php" && ((tested++)) || ((untested++))

echo "DEBUG: general-template.php - tested=$tested, untested=$untested"  # Debug line

echo ""
echo "📁 File: src/wp-includes/pluggable.php"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_function "wp_mail" "pluggable.php" && ((tested++)) || ((untested++))
check_function "wp_authenticate" "pluggable.php" && ((tested++)) || ((untested++))
check_function "wp_logout" "pluggable.php" && ((tested++)) || ((untested++))
check_function "wp_generate_password" "pluggable.php" && ((tested++)) || ((untested++))

echo "DEBUG: pluggable.php - tested=$tested, untested=$untested"  # Debug line

echo ""
echo "📁 File: src/wp-includes/bookmark.php"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_function "get_bookmark" "bookmark.php" && ((tested++)) || ((untested++))
check_function "get_bookmarks" "bookmark.php" && ((tested++)) || ((untested++))

echo "DEBUG: bookmark.php - tested=$tested, untested=$untested"  # Debug line
echo "DEBUG: TOTAL - tested=$tested, untested=$untested"  # Debug line

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                      SUMMARY                                ║"
echo "╠════════════════════════════════════════════════════════════╣"
printf "║  ✓ Functions with tests:    %-30s ║\n" "$tested"
printf "║  ❌ Functions without tests: %-30s ║\n" "$untested"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

if [ $untested -gt 0 ]; then
    echo "💡 Recommendation: Write unit tests for the ❌ functions above"
    echo "   These are good candidates for your CI/CD project!"
fi
