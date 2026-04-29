import { redirect, type Handle } from "@sveltejs/kit"
import { AUTH_COOKIE_NAME, clearAuthCookie, getUserFromSessionToken, isSetupComplete } from "$lib/server/auth"

const PUBLIC_ASSETS = new Set(["/robots.txt", "/favicon.ico", "/favicon.svg"])
const PUBLIC_API_PREFIXES = ["/api/auth/"]

const isPublicAsset = (pathname: string) => pathname.startsWith("/_app/") || PUBLIC_ASSETS.has(pathname)
const isPublicApi = (pathname: string) => PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))

const buildLoginRedirect = (pathname: string, search: string, setupComplete: boolean) => {
  const target = encodeURIComponent(`${pathname}${search}`)
  return setupComplete ? `/auth/login?redirectTo=${target}` : `/auth/setup?redirectTo=${target}`
}

export const handleAuth: Handle = async ({ event, resolve }) => {
  const setupComplete = isSetupComplete()
  const sessionToken = event.cookies.get(AUTH_COOKIE_NAME)
  const user = sessionToken ? getUserFromSessionToken(sessionToken) : null

  event.locals.user = user
  event.locals.setupComplete = setupComplete

  const { pathname, search } = event.url

  if (isPublicAsset(pathname) || isPublicApi(pathname)) {
    return resolve(event)
  }

  if (sessionToken && !user) {
    clearAuthCookie(event.cookies, event.url.protocol === "https:")
  }

  if (user) {
    if (pathname.startsWith("/auth")) {
      throw redirect(303, "/")
    }
    return resolve(event)
  }

  if (pathname.startsWith("/api/")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" }
    })
  }

  if (pathname === "/auth" || pathname === "/auth/login" || pathname === "/auth/setup") {
    if (!setupComplete && pathname !== "/auth/setup") {
      throw redirect(303, "/auth/setup")
    }
    if (setupComplete && pathname !== "/auth/login") {
      throw redirect(303, "/auth/login")
    }
    return resolve(event)
  }

  throw redirect(303, buildLoginRedirect(pathname, search, setupComplete))
}
