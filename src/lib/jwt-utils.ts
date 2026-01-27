/**
 * JWT Token Validation Utilities
 * Validates JWT tokens client-side to check expiry and prompt re-login
 */

interface JWTPayload {
  sub: number;
  email: string;
  type: string;
  iat: number;
  exp: number;
}

/**
 * Decode JWT token without verification (for client-side expiry check)
 * Note: This only decodes the payload, doesn't verify signature (that's done server-side)
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded as JWTPayload;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Check if JWT token is expired
 * Returns true if expired or invalid
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }

  // Check if token is expired (with 30-second buffer to account for clock skew)
  const currentTime = Math.floor(Date.now() / 1000);
  const bufferTime = 30; // 30 seconds buffer
  
  return payload.exp < (currentTime + bufferTime);
}

/**
 * Get time remaining until token expires (in seconds)
 * Returns 0 if expired or invalid
 */
export function getTokenTimeRemaining(token: string): number {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return 0;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const remaining = payload.exp - currentTime;
  
  return remaining > 0 ? remaining : 0;
}

/**
 * Check if token will expire soon (within specified minutes)
 * Useful for showing "session expiring soon" warnings
 */
export function isTokenExpiringSoon(token: string, minutesBeforeExpiry: number = 5): boolean {
  const remainingSeconds = getTokenTimeRemaining(token);
  return remainingSeconds > 0 && remainingSeconds < (minutesBeforeExpiry * 60);
}

/**
 * Extract token from cookie string
 * Used to get JWT from document.cookie
 */
export function getTokenFromCookie(cookieName: string = 'student_token'): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === cookieName) {
      return decodeURIComponent(value);
    }
  }
  
  return null;
}
