#!/bin/bash
# scripts/run-tests.sh
# This matches your local npm run test:coverage -- --group formatting

set -e

echo "🎯 Running WordPress Core Tests"

# Default values
GROUP=""
COVERAGE=false
VERBOSE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --group)
      GROUP="$2"
      shift 2
      ;;
    --coverage)
      COVERAGE=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

# Build PHPUnit command
CMD="vendor/bin/phpunit --configuration=tests/phpunit/phpunit.xml.dist"

if [ ! -z "$GROUP" ]; then
  CMD="$CMD --group=$GROUP"
fi

if [ "$COVERAGE" = true ]; then
  CMD="$CMD --coverage-html=coverage-report --coverage-clover=coverage.xml"
fi

if [ "$VERBOSE" = true ]; then
  CMD="$CMD --display-incomplete --display-skipped --display-deprecations --display-errors --display-notices --display-warnings"
fi

echo "🚀 Running: $CMD"
eval $CMD

if [ "$COVERAGE" = true ] && [ -d "coverage-report" ]; then
  echo "📊 Coverage report generated: coverage-report/index.html"
fi
