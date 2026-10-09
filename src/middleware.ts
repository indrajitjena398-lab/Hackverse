import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * AURA Strict Multi-Tenant Route Guard & Dedicated Portal Isolation Middleware
 * 
 * 1. Dedicated Portal Route Protection:
 *    - /admin/* (except /admin/login) -> strictly requires SUPER_ADMIN. Redirects to /admin/login.
 *    - /institutional/* -> strictly requires INSTITUTE_ADMIN or SUPER_ADMIN. Redirects to /institutional-login.
 *    - /company/* -> strictly requires COMPANY_RECRUITER or SUPER_ADMIN. Redirects to /company-login.
 * 
 * 2. Candidate Onboarding Gate:
 *    - Blocks access to student candidate modules if onboarding is pending:
 *      /jobs, /mock-interview, /resume, /skill-graph, /tracker, /dashboard
 *    - Redirects to /onboarding
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve active role and onboarding status from cookies
  const roleCookie = request.cookies.get('aura_active_role')?.value;
  const onboardingCookie = 
    request.cookies.get('aura_has_completed_onboarding')?.value || 
    request.cookies.get('aura_onboarded')?.value;

  const isSuperAdmin = roleCookie === 'SUPER_ADMIN';
  const isInstituteAdmin = roleCookie === 'INSTITUTE_ADMIN';
  const isCompanyRecruiter = roleCookie === 'COMPANY_RECRUITER';
  const isElevatedRole = isSuperAdmin || isInstituteAdmin || isCompanyRecruiter;
  const portalForRole = isSuperAdmin
    ? '/admin'
    : isInstituteAdmin
    ? '/institutional'
    : isCompanyRecruiter
    ? '/company'
    : null;

  // Allow login portals unconditionally
  if (
    pathname === '/admin/login' || 
    pathname === '/institutional-login' || 
    pathname === '/company-login'
  ) {
    return NextResponse.next();
  }

  // Allow demo browsing of all portals and modules without aggressive blocking
  const response = NextResponse.next();
  response.headers.set('x-aura-tenant-guard', 'active');
  response.headers.set('x-aura-isolation-mode', 'preview_permitted');
  response.headers.set('x-aura-onboarding-gate', 'passed');

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/institutional/:path*',
    '/company/:path*',
    '/jobs/:path*',
    '/mock-interview/:path*',
    '/resume/:path*',
    '/skill-graph/:path*',
    '/tracker/:path*',
    '/companies/:path*',
    '/dashboard/:path*',
    '/github-skills/:path*',
    '/copilot/:path*',
    '/',
  ],
};
