# Life Manager - Personal Finance PWA

A mobile-first Progressive Web App for personal life management, starting with the Finance module. Built with Next.js 15, TypeScript, and a modern dark-first UI.

## Features

### Finance Module
- **Dashboard**: Monthly overview with income, expenses, and balance
- **Budget Tracking**: 50/30/20 rule (Needs/Wants/Savings) with progress visualization
- **Transactions**: Full CRUD operations with category and account support
- **Accounts**: Track multiple accounts (Bank, Cash, Credit Cards)
- **Categories**: Customizable categories with colors and icons
- **Tags**: Flexible tagging system for transactions

### Technical Features
- **PWA Support**: Installable on iOS and Android
- **Dark Mode First**: Apple/Linear inspired aesthetic
- **Mobile-First**: Bottom navigation, large touch targets
- **Responsive**: Adapts to desktop with side rail navigation
- **JWT Auth**: Secure HTTP-only cookie authentication

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/UI
- **State**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Database**: Drizzle ORM + PostgreSQL
- **Auth**: Custom JWT with HTTP-only cookies
- **PWA**: Serwist (Service Workers)

## Getting Started

### Prerequisites

- Node.js 22.12.0+ (use `nvm use` to switch)
- PostgreSQL database
- Yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd mk_digi
\`\`\`

2. Install dependencies:
\`\`\`bash
yarn
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local` with your database and JWT settings:
\`\`\`
DATABASE_URL="postgresql://user:password@localhost:5432/life_manager"
JWT_SECRET="your-super-secret-key-min-32-characters-long"
JWT_EXPIRES_IN="7d"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
\`\`\`

4. Set up the database:
\`\`\`bash
# Generate migrations
yarn db:generate

# Push schema to database
yarn db:push
\`\`\`

5. Run the development server:
\`\`\`bash
yarn dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Commands

\`\`\`bash
# Generate new migration files
yarn db:generate

# Apply migrations to database
yarn db:migrate

# Push schema directly (dev only)
yarn db:push

# Open Drizzle Studio (database viewer)
yarn db:studio
\`\`\`

## Project Structure

\`\`\`
src/
├── app/
│   ├── (auth)/           # Auth pages (login, signup)
│   ├── (dashboard)/      # Protected dashboard pages
│   ├── api/              # API routes
│   └── offline/          # PWA offline fallback
├── components/
│   ├── ui/               # Shadcn/UI components
│   ├── layout/           # Navigation components
│   ├── finance/          # Finance-specific components
│   └── common/           # Shared components
├── db/
│   ├── schema.ts         # Drizzle schema
│   └── index.ts          # Database client
├── hooks/                # React Query hooks
├── lib/                  # Utilities (auth, api-client)
├── schemas/              # Zod validation schemas
└── types/                # TypeScript types
\`\`\`

## PWA Installation

The app can be installed as a PWA:

1. **iOS**: Open in Safari → Share → "Add to Home Screen"
2. **Android**: Chrome will show an "Install" prompt
3. **Desktop**: Click the install icon in the address bar

## Future Modules (Planned)

- **Habit Tracker**: Daily habit tracking with streaks
- **Journal**: Personal journaling with mood tracking

## License

MIT
