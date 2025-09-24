import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68d2b6512b6ece2d5ede928f", 
  requiresAuth: true // Ensure authentication is required for all operations
});
