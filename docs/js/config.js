// QuickBite Configuration
const CONFIG = {
  // Uses deployed backend URL or defaults to window host / mock mode
  API_BASE_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api'
    : 'https://quickbite-backend-service.onrender.com/api' // Fallback to internal API router if live backend isn't set
};