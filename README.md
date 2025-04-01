# Car Reliability App

A Next.js application for retrieving and displaying car reliability information.

## Features

- Vehicle reliability search with detailed scores
- User authentication and registration
- Premium subscription model
- Search history tracking
- Mobile-responsive design

## Tech Stack

- **Frontend**: Next.js, React
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **External APIs**: OpenAI (GPT) for vehicle analysis
- **Authentication**: JWT
- **Payments**: Stripe

## Project Structure

```
/
├── components/          # Reusable React components
├── contexts/            # React contexts for state management
├── lib/                 # Utility functions and shared code
├── pages/               # Next.js pages and API routes
│   ├── api/             # API routes for backend functionality
│   └── ...              # Page components
├── public/              # Static assets
├── scripts/             # Helper scripts
└── styles/              # Global styles
```

## Getting Started

### Prerequisites

- Node.js 14+ and npm
- PostgreSQL database

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/car-reliability-app.git
   cd car-reliability-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env.local
   ```
   Edit `.env.local` with your database connection string, API keys, etc.

4. Run the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Routes

- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile
- `POST /api/car-reliability` - Get vehicle reliability data
- `GET /api/user/searches` - Get user search history
- `POST /api/payment/verify` - Verify payment and create subscription
- `POST /api/verify-token` - Verify premium token

## Deployment

This application can be deployed to Vercel, Netlify, or any other Next.js-compatible hosting service.

1. Set up environment variables on your hosting platform
2. Connect your repository
3. Deploy

## License

This project is licensed under the MIT License - see the LICENSE file for details.