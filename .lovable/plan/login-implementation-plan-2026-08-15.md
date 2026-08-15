# Login Implementation Plan

We will add Google authentication to the application using Lovable Cloud's managed auth system.

## User-facing changes
- **Login Button**: A prominent "Sign in with Google" button will be added to the dashboard for unauthenticated users.
- **User Profile**: When signed in, the user's name or email will be visible in the header.
- **Logout**: A logout option will be added to the header/settings area.
- **Protected Access**: The application will remain usable as a guest (current local-only mode), but signing in will eventually allow for future cloud synchronization features.

## Technical details
- **Auth Provider**: Enable and configure Google OAuth via Lovable Cloud.
- **Root Route Guard**: Update `src/routes/__root.tsx` to handle authentication state globally.
- **Auth Attacher**: Ensure `src/start.ts` is configured with `attachSupabaseAuth` middleware for server-side functions.
- **Session Management**: Use the standard Supabase client from `@/integrations/supabase/client` to manage the user session.
- **Navigation**: Use `@tanstack/react-router` for handling redirects after login.

## Execution steps
1. Enable Supabase and configure Google Social Auth (Already completed).
2. Create an `AuthDialog` component for the login trigger.
3. Update `src/routes/index.tsx` to display login status.
4. Update `src/routes/__root.tsx` to provide the auth context to all routes.
5. Register auth middleware in `src/start.ts`.
