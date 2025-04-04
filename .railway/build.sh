#!/bin/bash

# Run Prisma migrations
npx prisma migrate deploy

# Build the Next.js app
npm run build 