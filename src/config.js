// In production this is set on Netlify as REACT_APP_API_URL.
// Locally it falls back to the Express server running on port 3001.
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
