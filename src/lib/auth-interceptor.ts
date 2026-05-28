/**
 * Auth Session Guard — safe, loop-free implementation.
 *
 * Design principles:
 * 1. NEVER call clearSessionAndRedirect() blindly on a 401.
 *    Some API routes return 401 when the Authorization header is simply
 *    missing — not because the session is expired. Wiping storage in that
 *    case destroys the session tokens and causes an infinite redirect loop.
 *
 * 2. The interceptor only redirects after CONFIRMING with Supabase that
 *    the local session is genuinely gone. This costs one lightweight call
 *    but prevents false positives completely.
 *
 * 3. Storage is only cleared during an EXPLICIT sign-out action, not
 *    speculatively on a failed API request.
 */

let _redirecting = false // guard against concurrent redirect calls

/**
 * Call this on intentional sign-out only (the Log Out button).
 * Clears Supabase-specific keys from storage, then hard-navigates to root.
 */
export function clearSessionAndRedirect(): void {
  if (_redirecting) return
  _redirecting = true

  try {
    // Only remove Supabase auth keys — don't wipe unrelated app state
    const storages = [localStorage, sessionStorage]
    storages.forEach((store) => {
      try {
        Object.keys(store).forEach((key) => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            store.removeItem(key)
          }
        })
      } catch {}
    })
  } catch {}

  window.location.replace('/login')
}

/**
 * Install a fetch interceptor that listens for 401/403 responses from
 * our own API routes. When detected, it asynchronously checks whether
 * the Supabase session is still valid before deciding to redirect.
 *
 * This prevents a false-positive redirect when, for example, a request
 * is made before the auth header has been attached.
 *
 * @param getSession  A function that returns the current Supabase session
 *                    (or null if none). Pass `() => supabase.auth.getSession()`.
 * @returns           A cleanup function to uninstall the interceptor.
 */
export function installAuthInterceptor(
  getSession: () => Promise<{ data: { session: unknown | null } }>
): () => void {
  if (typeof window === 'undefined') return () => {}

  const _originalFetch = window.fetch.bind(window)

  window.fetch = async (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> => {
    const response = await _originalFetch(input, init)

    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
        ? input.href
        : (input as Request).url

    // Only watch our own API routes
    const isApiRoute = url.startsWith('/api/')

    if (isApiRoute && (response.status === 401 || response.status === 403)) {
      // Asynchronously verify: is the Supabase session actually gone?
      // We do NOT await this in the hot path — it runs in the background.
      getSession()
        .then(({ data }) => {
          if (!data.session && !_redirecting) {
            // Confirmed: no valid session — perform a soft redirect (no storage wipe)
            _redirecting = true
            window.location.replace('/login')
          }
          // If data.session exists, the 401 was a transient/permissions issue — ignore
        })
        .catch(() => {})
    }

    return response
  }

  return () => {
    window.fetch = _originalFetch
  }
}
