/**
 * Unified Backend API Client
 * Seamlessly interfaces the frontend with the standalone Master Backend Server running on port 5000.
 */

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000';

export async function backendFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${BACKEND_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });

    if (!res.ok) {
      // If backend port 5000 is down or fails, try local Next.js route fallback
      if (!endpoint.startsWith('http') && !url.includes('/api/health')) {
        const fallbackRes = await fetch(endpoint, options);
        if (fallbackRes.ok) return await fallbackRes.json();
      }
      throw new Error(`Backend request to ${url} failed with status ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    // If connection refused to port 5000, fallback to Next.js API route
    if (!endpoint.startsWith('http')) {
      try {
        const fallbackRes = await fetch(endpoint, options);
        if (fallbackRes.ok) return await fallbackRes.json();
      } catch {
        // Fallback also failed
      }
    }
    throw err;
  }
}

export const backendApi = {
  // Health
  getHealth: () => backendFetch('/'),
  
  // Student & CIP
  getProfile: (userId: string) => backendFetch(`/api/cip/profile/${encodeURIComponent(userId)}`),
  updateProfile: (userId: string, updates: any) => backendFetch('/api/cip/profile/update', {
    method: 'POST',
    body: JSON.stringify({ userId, updates })
  }),
  recalculateScore: (userId: string) => backendFetch('/api/cip/recalculate', {
    method: 'POST',
    body: JSON.stringify({ userId })
  }),
  
  // Jobs & Neural Matching
  getJobs: () => backendFetch('/api/jobs'),
  matchJob: (userId: string, jobId: string) => backendFetch('/api/jobs/match', {
    method: 'POST',
    body: JSON.stringify({ userId, jobId })
  }),
  neuralMatch: (candidate: any, job: any) => backendFetch('/api/neural/match', {
    method: 'POST',
    body: JSON.stringify({ candidate, job })
  }),
  getNeuralHealth: () => backendFetch('/api/neural/health'),
  getNeuralConfig: () => backendFetch('/api/neural/config'),
  updateNeuralConfig: (config: any) => backendFetch('/api/neural/config', {
    method: 'POST',
    body: JSON.stringify(config)
  }),

  // Placements Workflow (Company -> Institute -> Student)
  companyDispatchRole: (payload: any) => backendFetch('/api/placements/company-dispatch', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getCompanyDispatches: () => backendFetch('/api/placements/company-dispatch'),
  getInstitutionNotices: () => backendFetch('/api/placements/institution-notices'),
  institutionDispatchStudent: (payload: any) => backendFetch('/api/placements/institution-notices/dispatch-student', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getStudentNotices: (email: string) => backendFetch(`/api/placements/student-notices/${encodeURIComponent(email)}`),
  acknowledgeStudentNotice: (noticeId: string) => backendFetch(`/api/placements/student-notices/${noticeId}/acknowledge`, {
    method: 'POST'
  }),

  // Institute
  getCohorts: () => backendFetch('/api/institution/cohorts'),
  getDepartmentHealth: () => backendFetch('/api/institution/department-health'),
  getPlacementFunnel: () => backendFetch('/api/institution/placement-funnel'),

  // Company
  getCandidates: () => backendFetch('/api/company/candidates'),
  unlockCandidate: (candidateId: string, recruiterOrg: string) => backendFetch(`/api/company/candidates/${candidateId}/unlock`, {
    method: 'POST',
    body: JSON.stringify({ recruiterOrg })
  }),

  // Admin
  getUsersAndRoles: () => backendFetch('/api/admin/roles'),
  elevateRole: (payload: any) => backendFetch('/api/admin/elevate-role', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  issueCredential: (payload: any) => backendFetch('/api/admin/issue-credentials', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getAuditLogs: () => backendFetch('/api/admin/audit-logs'),

  // Interview & Transcribe
  getInterviewArchive: (search?: string, company?: string) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (company) params.set('company', company);
    return backendFetch(`/api/interview/archive?${params.toString()}`);
  },
  recordInterview: (payload: any) => backendFetch('/api/interview/archive', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  transcribeAudio: (audioLength: number) => backendFetch('/api/interview/transcribe', {
    method: 'POST',
    body: JSON.stringify({ audioLength })
  }),

  // Feedback
  submitFeedback: (payload: any) => backendFetch('/api/feedback', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getFeedbackAnalytics: () => backendFetch('/api/feedback/analytics'),
};
