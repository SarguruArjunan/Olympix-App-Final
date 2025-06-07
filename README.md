# PS Olympics Web Application

A web application for tracking multi-sport events in an Olympics-style format.

## Features

- Homepage with event introduction
- Sports section with detailed information for nine sports
- Real-time medal table
- Sport-specific detail pages with schedules and results
- Comprehensive schedule and results page
- Leaderboard tracking top performers

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Data Storage**: Excel file using xlsx library
- **State Management**: React Query
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install       # Install root dependencies
cd frontend && npm install  # Install frontend dependencies
cd ../backend && npm install # Install backend dependencies
```

### Development

Start both frontend and backend servers in development mode:

```bash
npm start
```

Or run them separately:

```bash
# Start frontend (from root directory)
npm run start:frontend

# Start backend (from root directory)
npm run start:backend
```

### Building for Production

```bash
npm run build
```

## Project Structure

```
ps-olympics-app/
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   └── styles/      # CSS styles
│   └── public/          # Static files
├── backend/           # Express backend server
│   ├── src/
│   │   ├── routes/     # API routes
│   │   ├── services/   # Business logic
│   │   └── utils/      # Utility functions
│   └── dist/           # Compiled TypeScript
└── data/             # Excel data storage
    └── backups/       # Data backups
```

## API Endpoints

- `GET /api/v1/sports` - Get all sports
- `GET /api/v1/sports/:id` - Get sport by ID
- `POST /api/v1/sports` - Create new sport
- `PUT /api/v1/sports/:id` - Update sport
- `DELETE /api/v1/sports/:id` - Delete sport

## Sports

1. Foosball
2. Carrom
3. Chess
4. Table Tennis
5. Badminton
6. Cricket
7. Football
8. Basketball
9. Lemon Spoon Race

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

ISC License
