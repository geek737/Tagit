/**
 * Error handler utility for user-friendly error messages
 * Translates technical errors into professional, user-friendly messages
 */

export interface ErrorInfo {
  message: string;
  type: 'network' | 'credentials' | 'server' | 'unknown';
}

/**
 * Detects error type and returns user-friendly message
 */
export function getErrorMessage(error: any): ErrorInfo {
  // Network errors (no connection, timeout, etc.)
  if (!navigator.onLine) {
    return {
      message: 'No internet connection. Please check your network and try again.',
      type: 'network'
    };
  }

  // Check if it's a Supabase error
  if (error?.code || error?.message) {
    const errorCode = error.code;
    const errorMessage = error.message?.toLowerCase() || '';

    // Network/Connection errors
    if (
      errorCode === 'PGRST301' ||
      errorCode === 'PGRST116' ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('network') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('failed to fetch')
    ) {
      return {
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        type: 'network'
      };
    }

    // Authentication/Authorization errors
    if (
      errorCode === 'PGRST301' ||
      errorCode === '42501' ||
      errorMessage.includes('permission') ||
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('forbidden')
    ) {
      return {
        message: 'Access denied. Please contact your administrator.',
        type: 'server'
      };
    }

    // Database/Server errors
    if (
      errorCode?.startsWith('PGRST') ||
      errorMessage.includes('database') ||
      errorMessage.includes('server') ||
      errorMessage.includes('internal')
    ) {
      return {
        message: 'A server error occurred. Please try again in a few moments.',
        type: 'server'
      };
    }
  }

  // Generic error fallback
  return {
    message: 'An unexpected error occurred. Please try again.',
    type: 'unknown'
  };
}

/**
 * Get user-friendly login error message
 */
export function getLoginErrorMessage(error: any, username?: string): string {
  const errorInfo = getErrorMessage(error);

  // For login specifically, we want more specific messages
  if (errorInfo.type === 'network') {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }

  if (errorInfo.type === 'server') {
    return 'We\'re experiencing technical difficulties. Please try again in a few moments.';
  }

  // For invalid credentials, we don't want to reveal which field is wrong
  // This is a security best practice
  return 'The username or password you entered is incorrect. Please try again.';
}

