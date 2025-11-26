import app from '../src/server';

// Vercel serverless function handler
// The app is already configured to handle requests
// Database connections are lazy-loaded per request in the routes
export default app;
