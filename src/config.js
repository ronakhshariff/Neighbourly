// config stuff - change these if you deploy somewhere else
export const API_BASE = import.meta.env.VITE_API_BASE || 'https://91vtecnl0h.execute-api.us-east-1.amazonaws.com/dev';

// cognito settings - the client id is the one without a secret (frontend can't use secrets)
export const COGNITO_CONFIG = {
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || 'us-east-1_zD19aoD0R',
  clientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID || '5dldlca5m31i0to42kk0bq8ac3',
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  authority: import.meta.env.VITE_COGNITO_AUTHORITY || 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_zD19aoD0R',
  redirectUri: import.meta.env.VITE_REDIRECT_URI || 'http://localhost:5173', // where cognito sends users after login
  logoutUri: import.meta.env.VITE_LOGOUT_URI || 'http://localhost:5173' // where to go after logout
};

