# Authentication Error Handling System

## Overview
This system automatically handles authentication errors and redirects users to the login page when their session expires or becomes invalid.

## Components

### 1. AdminContext (`/contexts/AdminContext.tsx`)
- **`handleAuthError()`**: Clears user data and redirects to login
- **`refreshUser()`**: Validates token and handles auth errors
- Automatically detects 401/403 errors and triggers redirect

### 2. useAuthError Hook (`/hooks/useAuthError.ts`)
- **`handleApiError(error)`**: Checks if error is auth-related
- Sets up global fetch interceptor for automatic error detection
- Returns `true` if error was handled as auth error

### 3. ProtectedRoute Component (`/components/admin/ProtectedRoute.tsx`)
- Wraps admin routes to ensure authentication
- Shows loading spinner while checking auth status
- Redirects to login if not authenticated
- Handles global authentication error events

### 4. API Error Handler (`/lib/apiErrorHandler.ts`)
- **`handleApiError(error, showToast)`**: Centralized error handling
- **`createApiCall(apiFunction, showToast)`**: Wrapper for API calls
- Dispatches global auth-error events for 401/403 responses

## Usage Examples

### In Components
```tsx
import { useAuthError } from '@/hooks/useAuthError';

const MyComponent = () => {
  const { handleApiError } = useAuthError();
  
  const fetchData = async () => {
    try {
      const response = await api.getData();
      // Handle success
    } catch (error) {
      if (handleApiError(error)) {
        // Auth error was handled, user will be redirected
        return;
      }
      // Handle other errors
      toast.error('Failed to load data');
    }
  };
};
```

### With API Error Handler
```tsx
import { createApiCall } from '@/lib/apiErrorHandler';

const fetchData = async () => {
  try {
    const result = await createApiCall(() => api.getData());
    // Handle success
  } catch (error) {
    // Only non-auth errors reach here
    console.error('API Error:', error);
  }
};
```

## Features

### Automatic Detection
- Detects 401 Unauthorized and 403 Forbidden responses
- Monitors global fetch requests for auth errors
- Handles token expiration automatically

### User Experience
- Shows "Session expired" toast message
- Smooth redirect to login page
- Preserves intended destination for post-login redirect
- Loading states during authentication checks

### Security
- Clears all stored authentication data
- Prevents access to protected routes
- Automatic logout on auth errors

## Configuration

### Error Messages
Customize error messages in translation files:
```json
{
  "admin": {
    "login": {
      "sessionExpired": "Session expired. Please log in again."
    }
  }
}
```

### Redirect Behavior
- Default redirect: `/admin/login`
- Preserves intended destination in `location.state.from`
- Post-login redirect to original destination

## Integration

### App.tsx
```tsx
<Route path="/admin" element={
  <ProtectedRoute>
    <AdminLayout />
  </ProtectedRoute>
}>
  {/* Admin routes */}
</Route>
```

### AdminLayout.tsx
```tsx
const { handleApiError } = useAuthError();

useEffect(() => {
  const handleGlobalError = (event) => {
    if (event.detail?.error) {
      handleApiError(event.detail.error);
    }
  };
  
  window.addEventListener('auth-error', handleGlobalError);
  return () => window.removeEventListener('auth-error', handleGlobalError);
}, [handleApiError]);
```

## Error Flow

1. **API Call Fails** → 401/403 response
2. **Error Detection** → `handleApiError()` or global interceptor
3. **Auth Error Event** → Dispatched to global listeners
4. **Context Handler** → `handleAuthError()` in AdminContext
5. **Data Cleanup** → Clear user data and localStorage
6. **User Notification** → Toast message
7. **Redirect** → Navigate to login page
8. **Post-Login** → Redirect to original destination

## Best Practices

1. **Always use `handleApiError()`** in try-catch blocks
2. **Wrap API calls** with `createApiCall()` for automatic handling
3. **Check return value** of `handleApiError()` to avoid duplicate error messages
4. **Use ProtectedRoute** for all admin routes
5. **Test auth scenarios** with expired tokens and invalid sessions
