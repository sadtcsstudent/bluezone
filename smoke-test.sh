#!/bin/bash

echo "🔥 Running Smoke Tests on BlueZone API..."
echo ""

# Check if Docker is running
if ! docker compose -f docker-compose.dev.yml ps | grep -q "Up"; then
    echo "⚠️  Docker containers not running. Starting them..."
    docker compose -f docker-compose.dev.yml up -d
    echo "⏳ Waiting 15 seconds for services to start..."
    sleep 15
fi

# Run the tests inside the API container
echo "📊 Running endpoint tests..."
docker compose -f docker-compose.dev.yml exec -T api node test-all-endpoints.js

echo ""
echo "✅ Smoke test complete!"
echo ""
echo "💡 Tip: Check the results above for any failures"
