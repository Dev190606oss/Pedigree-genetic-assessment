/**
 * PEDIGREE — User-Friendly Error Formatting Utility
 * Translates technical Axios errors, HTTP status codes, and network exceptions
 * into calm, human-understandable messaging.
 */

export function getFriendlyErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  if (!err) return fallback;

  // Log technical diagnostics to developer console
  console.error('[Pedigree Diagnostic Log]', err);

  // Network or server unreachable
  if (!err.response) {
    if (
      err.code === 'ERR_NETWORK' ||
      err.message?.includes('Network') ||
      err.message?.includes('Failed to fetch') ||
      err.message?.includes('NetworkError')
    ) {
      return "We couldn't connect to the service. Please check your connection and try again.";
    }
    // Don't show raw message if it contains "status code"
    if (err.message && !err.message.includes('status code')) {
      return err.message;
    }
    return fallback;
  }

  const { status, data } = err.response;

  // Respect backend-provided message if it is clean and user-facing
  const backendMsg = data?.error || data?.message;
  if (backendMsg && typeof backendMsg === 'string') {
    // If backend gave a specific role mismatch error
    if (backendMsg.toLowerCase().includes('reserved for')) {
      return backendMsg;
    }
    if (backendMsg.toLowerCase().includes('deactivated')) {
      return 'Your account has been deactivated. Please contact support.';
    }
    // Clean validation messages
    if (status === 400 && !backendMsg.includes('Cast to') && !backendMsg.includes('E11000')) {
      return backendMsg;
    }
  }

  switch (status) {
    case 400:
      return backendMsg || 'Please review the information you entered and try again.';
    case 401:
      return 'The email or password you entered is incorrect.';
    case 403:
      return backendMsg || 'Your account does not have permission to access this area.';
    case 404:
      return "We couldn't find what you're looking for.";
    case 409:
      return 'This information already exists. Please check your details.';
    case 429:
      return 'Too many attempts. Please wait a moment and try again.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'Something went wrong on our side. Please try again in a moment.';
    default:
      return fallback;
  }
}
