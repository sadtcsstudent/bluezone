#!/bin/bash
# Reset database script

echo "Resetting database..."

# Drop and recreate database
node node_modules/.bin/prisma migrate reset --force --skip-seed

echo "Database reset complete!"
echo "Now run: node node_modules/.bin/prisma db push"
