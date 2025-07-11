# Google OAuth Authentication Flow Documentation

## Overview

This document explains the complete Google OAuth authentication flow in the AGRI-TECH application, including how the process works, configuration requirements, and potential issues with their solutions.

## Authentication Flow Diagram

```
┌─────────────┐     1. Click Sign in     ┌──────────────┐
│   User in   │────────with Google────────▶   Login.jsx  │
│  Browser    │                          └──────────────┘
└─────────────┘                                 │
      ▲                                         │ 2. Call loginWithGoogle()
      │                                         ▼
      │                               ┌──────────────────┐
      │                               │  AuthContext.jsx │
      │                               └──────────────────┘
      │                                         │
      │                                         │ 3. Call signInWithGoogle()
      │                                         ▼
      │                               ┌──────────────────┐
      │                               │  authService.js  │
      │                               └──────────────────┘
      │                                         │
      │                                         │ 4. Call supabase.auth.signInWithOAuth()
      │                                         ▼
      │                               ┌──────────────────┐
      │                               │  Supabase Client │
      │                               └──────────────────┘
      │                                         │
      │                                         │ 5. Redirect to Google
      │                                         ▼
      │                               ┌──────────────────┐
      │                               │  Google OAuth    │
      │                               │  Consent Screen  │
      │                               └──────────────────┘
      │                                         │
      │                                         │ 6. User grants permission
      │                                         ▼
┌─────────────┐     9. Redirect to    ┌──────────────────┐
│ AuthCallback │◀───────app with───────│  Supabase Auth   │
│    .jsx      │       tokens          │     Service      │
└─────────────┘                        └──────────────────┘
      │                                         ▲
      │                                         │
      │ 10. Check profile                       │ 7. Send auth code
      │     completion                          │
      ▼                                         │
┌─────────────┐                        ┌──────────────────┐
│ Dashboard or│                        │  Google Auth     │
│ Complete    │                        │     Servers      │
│ Profile     │                        └──────────────────┘
└─────────────┘
```

## Detailed Process

### 1. Initiation
- User clicks "Sign in with Google" button in `Login.jsx`
- This triggers `handleGoogleSignIn()` function

### 2. Authentication Context
- `handleGoogleSignIn()` calls `loginWithGoogle()` from `AuthContext.jsx`
- The Auth Context manages authentication state across the application

### 3. Auth Service
- `loginWithGoogle()` calls `signInWithGoogle()` from `authService.js`
- This service handles all authentication-related API calls

### 4. Supabase OAuth Request
- `signInWithGoogle()` calls `supabase.auth.signInWithOAuth()`
- It specifies:
  - Provider: 'google'
  - RedirectTo: URL where user should be sent after authentication
  - QueryParams: Additional parameters for the OAuth flow

### 5. Redirect to Google
- Browser redirects to Google's authentication page
- User is asked to sign in to their Google account if not already signed in

### 6. User Consent
- Google displays permissions the app is requesting
- User grants permission to the application

### 7. Authorization Code
- Google sends an authorization code to Supabase Auth service

### 8. Token Exchange
- Supabase exchanges the authorization code for access and refresh tokens
- Supabase creates or updates the user record in its auth system

### 9. Redirect Back to Application
- User is redirected to the specified callback URL (`/auth/callback`)
- This loads the `AuthCallback.jsx` component
- The URL includes tokens and session information

### 10. Session Handling
- `AuthCallback.jsx` checks if authentication was successful
- It verifies if the user's profile is complete
- Based on these checks, it redirects to:
  - Dashboard (if profile is complete)
  - CompleteProfile page (if profile is incomplete)
  - Login page (if authentication failed)

## Configuration Requirements

### 1. Supabase Project Configuration
- Google OAuth provider must be enabled
- Client ID and Client Secret from Google Cloud Console must be configured
- Authorized redirect URI must be set to: `https://[YOUR_SUPABASE_PROJECT].supabase.co/auth/v1/callback`

### 2. Google Cloud Console Configuration
- Project must have OAuth 2.0 credentials
- Authorized JavaScript origins must include:
  - `http://localhost:5173` (for development)
  - `https://farm-agent.vercel.app` (for production)
- Authorized redirect URIs must include:
  - `https://[YOUR_SUPABASE_PROJECT].supabase.co/auth/v1/callback`
  - `http://localhost:5173/auth/callback` (for development)
  - `https://farm-agent.vercel.app/auth/callback` (for production)

### 3. Application Code Configuration
- `.env` file must contain:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## Common Issues and Solutions

### 1. Incorrect Redirect After Authentication

**Problem**: After Google authentication, redirects to wrong URL (e.g., localhost:3000 instead of localhost:5173)

**Causes**:
- Hardcoded redirect URL in authService.js
- Mismatch between development server port and configured redirect
- Default values in Supabase client configuration

**Solutions**:
- Use dynamic redirect URL based on current origin: 
  ```js
  const redirectTo = `${window.location.origin}/auth/callback`;
  ```
- Explicitly specify the full URL including port for localhost:
  ```js
  const redirectTo = window.location.hostname === 'localhost' 
    ? 'http://localhost:5173/auth/callback' 
    : `${window.location.origin}/auth/callback`;
  ```
- Check Google Cloud Console configuration to ensure all redirect URIs are correctly set

### 2. "Provider Not Enabled" Error

**Problem**: Error message: "Unsupported provider: provider is not enabled"

**Causes**:
- Google provider not enabled in Supabase project
- Incorrect Client ID or Client Secret in Supabase configuration

**Solution**:
- Enable Google provider in Supabase Authentication settings
- Verify Client ID and Client Secret match Google Cloud Console values

### 3. Profile Completion Issues

**Problem**: Users not redirected to complete profile after OAuth login

**Causes**:
- Missing profile completion check
- Incorrect implementation of isProfileComplete function

**Solution**:
- Ensure AuthCallback.jsx correctly checks profile completion status
- Verify isProfileComplete function checks all required fields

## Implementation Details

### Key Files

1. **Login.jsx**: Contains the Google sign-in button and initiates the flow
2. **AuthContext.jsx**: Manages authentication state and provides auth functions
3. **authService.js**: Handles API calls to Supabase Auth
4. **AuthCallback.jsx**: Processes the OAuth callback and redirects appropriately
5. **CompleteProfile.jsx**: Allows users to complete missing profile information

### Critical Code Sections

#### 1. Google Sign-In Button (Login.jsx)
```jsx
<Button
  fullWidth
  variant="outlined"
  startIcon={<GoogleIcon />}
  onClick={handleGoogleSignIn}
  disabled={isGoogleSubmitting}
>
  {isGoogleSubmitting ? 'Signing in...' : 'Sign in with Google'}
</Button>
```

#### 2. Google Sign-In Handler (authService.js)
```js
export async function signInWithGoogle() {
  try {
    // Determine the correct redirect URL based on the current environment
    const redirectTo = window.location.hostname === 'localhost' 
      ? 'http://localhost:5173/auth/callback'
      : `${window.location.origin}/auth/callback`;
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return { data: null, error };
  }
}
```

#### 3. OAuth Callback Handling (AuthCallback.jsx)
```jsx
useEffect(() => {
  // Only proceed once we've checked auth status and profile completion
  if (!loading && !profileStatus.isChecking) {
    if (!user) {
      // If no user, something went wrong with the OAuth flow
      setError('Authentication failed. Please try again.');
      setTimeout(() => navigate('/login'), 3000);
    } else if (!profileStatus.isComplete) {
      // If profile is incomplete, redirect to profile completion page
      navigate('/complete-profile');
    } else {
      // If everything is good, redirect to dashboard
      navigate('/dashboard');
    }
  }
}, [user, loading, profileStatus, navigate]);
```

## Debugging Tips

1. **Check Browser Console**: Look for errors related to OAuth or redirect issues
2. **Verify Environment Variables**: Ensure all required variables are set correctly
3. **Inspect Network Requests**: Monitor the OAuth redirect chain in browser dev tools
4. **Test Locally First**: Confirm everything works in development before deploying
5. **Clear Browser Cache/Cookies**: Sometimes old sessions can interfere with authentication

## Conclusion

The Google OAuth flow in this application follows standard OAuth 2.0 practices through Supabase's authentication service. The key to successful implementation is ensuring all configuration points (Google Cloud Console, Supabase, and application code) are properly aligned, especially regarding redirect URLs. 