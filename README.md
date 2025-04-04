# Trigger Map

A web application for creating and managing behavior trigger maps. This tool helps users break down behaviors and habits into actionable steps, identifying specific triggers and actions for behavior change.

## Deployment Status

✅ Latest build working as of April 4, 2025.

## Features

- Create detailed trigger maps for behavior change
- Step-by-step behavior breakdown process
- Interactive map builder
- User authentication with Google
- Persistent storage of trigger maps
- Real-time editing and updates

## Tech Stack

- Next.js 13+ (App Router)
- TypeScript
- Prisma (PostgreSQL)
- NextAuth.js
- Tailwind CSS

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/[your-username]/trigger-map.git
cd trigger-map
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables:
Create a `.env` file in the root directory with:
```
DATABASE_URL="postgresql://..."
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT 