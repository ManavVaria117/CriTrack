# Welcome App

A full-stack web application with Google OAuth authentication, built with React, Tailwind CSS, and Express.

## Features

- Modern, responsive UI with Tailwind CSS
- Secure Google OAuth authentication
- Protected routes and authentication state management
- Express backend with JWT authentication
- Cookie-based session management
- Loading states and error handling
- Responsive design for all devices

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Google Cloud Platform account for OAuth setup

### Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" and select "OAuth client ID"
5. Configure the consent screen:
   - Application type: Web application
   - Name: Welcome App
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000`
6. Note down your Client ID

### Environment Variables

Create a `.env` file in the `client` directory:
```
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

Create a `.env` file in the `server` directory:
```
GOOGLE_CLIENT_ID=your-google-client-id
JWT_SECRET=your-secure-jwt-secret
NODE_ENV=development
```

### Installation

1. Clone the repository
2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```
3. Install client dependencies:
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd server
   npm run dev
   ```

2. In a new terminal, start the React development server:
   ```bash
   cd client
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Available Scripts

### Server

In the `server` directory, you can run:

```bash
# Run the server in development mode with auto-reload
npm run dev

# Start the production server
npm start
```

### Client

In the `client` directory, you can run:

```bash
# Start the development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Project Structure

```
welcome-app/
├── client/                 # React frontend
│   ├── public/            # Static files
│   └── src/               # Source files
│       ├── components/    # Reusable components
│       ├── contexts/      # React context providers
│       ├── pages/         # Page components
│       ├── utils/         # Utility functions
│       ├── App.js         # Main App component
│       └── index.js       # Entry point
└── server/                # Express backend
    ├── .env              # Environment variables
    ├── routes/           # API routes
    ├── middleware/       # Custom middleware
    └── server.js         # Server entry point
```

## Authentication Flow

1. User clicks "Sign in with Google"
2. Google OAuth consent screen is shown
3. Upon successful authentication, Google returns an ID token
4. The frontend sends the ID token to the backend
5. The backend verifies the ID token with Google
6. If valid, the backend creates a JWT and sets it as an HTTP-only cookie
7. The frontend receives the user data and updates the auth state
8. The user is redirected to the dashboard

## Security Considerations

- Uses HTTP-only cookies for JWT storage
- Implements CORS with proper origin validation
- Validates all user input on the server
- Uses environment variables for sensitive data
- Implements proper error handling and logging

## Deployment

### Client

Build the React app for production:
```bash
cd client
npm run build
```

### Server

Set up environment variables in your production environment:
```
NODE_ENV=production
PORT=5000
GOOGLE_CLIENT_ID=your-google-client-id
JWT_SECRET=your-secure-jwt-secret
```

Start the production server:
```bash
npm start
```

## Built With

- [React](https://reactjs.org/) - Frontend library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Express](https://expressjs.com/) - Backend framework
- [Axios](https://axios-http.com/) - HTTP client

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
