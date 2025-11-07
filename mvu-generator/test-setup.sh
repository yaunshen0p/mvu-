#!/bin/bash

echo "Testing Vue 3 + Vite scaffold setup..."

# Test 1: Check if dev server starts (timeout after 5 seconds)
echo "1. Testing dev server..."
timeout 5s npm run dev > /dev/null 2>&1
if [ $? -eq 124 ]; then
    echo "✓ Dev server starts successfully"
else
    echo "✗ Dev server failed to start"
fi

# Test 2: Check build
echo "2. Testing build..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Build succeeds"
else
    echo "✗ Build failed"
fi

# Test 3: Check lint
echo "3. Testing lint..."
npm run lint > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Lint succeeds"
else
    echo "✗ Lint failed"
fi

echo "Setup test complete."