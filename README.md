# Insurance Agent CRM

A Personal CRM designed for independent insurance agents to manage leads, sphere of influence (SOI), and clients. Built with React, Convex, and Clerk.

## Features

- Contact Management (Leads, SOI, Clients)
- Policy Management
- Email and SMS Integration
- Role-based Access Control
- Dashboard and Reporting
- Google Maps Integration for Addresses

## Tech Stack

- Frontend: React with Vite
- Styling: Tailwind CSS
- Database: Convex
- Authentication: Clerk
- Additional: Google Maps API, Twilio

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Clerk account
- Convex account
- Google Maps API key (for address autocomplete)
- Twilio account (for SMS features)

## Setup

1. Clone the repository:
\`\`\`bash
git clone [repository-url]
cd crm-app
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create a .env file:
\`\`\`bash
cp .env.example .env
\`\`\`

4. Fill in your environment variables in the .env file:
- Get Clerk API keys from your Clerk dashboard
- Get Convex URL from your Convex dashboard
- Add Google Maps API key
- Add Twilio credentials

5. Initialize Convex:
\`\`\`bash
npx convex dev
\`\`\`

6. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

## Project Structure

- `/src` - React application source code
  - `/components` - Reusable React components
  - `/lib` - Utility functions and constants
  - `/pages` - Page components
  - `/hooks` - Custom React hooks
- `/convex` - Convex backend code
  - `schema.ts` - Database schema
  - `/mutations` - Data modification functions
  - `/queries` - Data fetching functions

## Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run preview\` - Preview production build
- \`npm run lint\` - Run ESLint
- \`npm run test\` - Run tests (when implemented)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

[Your chosen license]
