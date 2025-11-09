// wrapper around react-oidc-context so we don't have to change all our components
// basically just makes the API match what we were using before
import { useAuth as useOidcAuth } from 'react-oidc-context'
import { COGNITO_CONFIG } from '../config'

export function useAuth() {
  const oidcAuth = useOidcAuth()

  return {
    isAuthenticated: oidcAuth.isAuthenticated || false,
    // extract user info from cognito profile
    user: oidcAuth.user ? {
      email: oidcAuth.user.profile?.email,
      name: oidcAuth.user.profile?.name || oidcAuth.user.profile?.email?.split('@')[0], // fallback to email username if no name
      ...oidcAuth.user.profile
    } : null,
    loading: oidcAuth.isLoading || false,
    // redirect to cognito hosted UI
    login: () => {
      oidcAuth.signinRedirect()
    },
    // logout and redirect to cognito logout page
    logout: () => {
      const cognitoDomain = `https://${COGNITO_CONFIG.userPoolId.split('_')[1]}.auth.${COGNITO_CONFIG.region}.amazoncognito.com`
      const logoutUrl = `${cognitoDomain}/logout?client_id=${COGNITO_CONFIG.clientId}&logout_uri=${encodeURIComponent(COGNITO_CONFIG.logoutUri)}`
      oidcAuth.removeUser() // clear local storage
      window.location.href = logoutUrl // redirect to cognito logout
    },
    checkAuth: () => {
      // no-op - oidc handles this automatically
    },
    // expose the raw oidc auth in case we need it
    oidcAuth
  }
}

