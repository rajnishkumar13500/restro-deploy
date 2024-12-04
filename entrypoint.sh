#!/bin/sh

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy || { echo 'Prisma migration failed!'; exit 1; }

# Start the application
echo "Starting the application..."
npm start || { echo 'Application start failed!'; exit 1; }