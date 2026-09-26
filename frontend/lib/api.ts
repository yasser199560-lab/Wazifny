export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      // response wasn't JSON — keep the default statusText
    }
    throw new ApiError(
      typeof detail === "string" ? detail : "Something went wrong",
      res.status
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ---- Types mirroring the backend Pydantic schemas ----

export type UserRole = "talent" | "employer" | "admin";

export interface TokenResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
  full_name: string;
  email: string;
}

export interface CurrentUser {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_verified: boolean;
}

export interface LandingStat {
  value: string;
  label: string;
}

export interface LandingCategory {
  name: string;
  count: string;
}

export interface LandingTestimonial {
  quote: string;
  name: string;
  role: string;
  rating: number;
}

export interface LandingData {
  stats: LandingStat[];
  categories: LandingCategory[];
  testimonials: LandingTestimonial[];
}

// ---- Jobs / search / recommendations / applications ----

export interface Job {
  id: string;
  employer_id: string;
  title: string;
  category: string;
  location: string;
  salary: string | null;
  job_type: string;
  application_method: "in_platform" | "external";
  external_url: string | null;
  description: string;
  company_description?: string;
  employment_level?: string;
  work_arrangement?: string;
  working_hours?: string;
  responsibilities?: string[];
  requirements: string[];
  nice_to_have?: string[];
  benefits?: string[];
  application_instructions?: string;
  application_deadline?: string | null;
  status: string;
  posted_at: string | null;
  company_name: string | null;
  company_logo_url?: string | null;
  source: string;
  match_reason?: string | null;
  match_score?: number | null;
  applicants_count?: number | null;
  has_applied: boolean;
}

export interface JobSearchResponse {
  jobs: Job[];
  ai_ranked: boolean;
  ai_provider?: string | null;
}

export interface RecommendedJobsResponse {
  personalized: boolean;
  ai_ranked: boolean;
  ai_provider?: string | null;
  recommended: Job[];
  other: Job[];
}

export interface JobSearchParams {
  q?: string;
  category?: string;
  location?: string;
  job_type?: string;
}

export function searchJobs(params: JobSearchParams = {}, token?: string | null) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) qs.set(k, v);
  });
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return request<JobSearchResponse>(`/jobs${suffix}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    cache: "no-store",
  });
}

export function translateTexts(texts: string[], target_language: "en" | "ar") {
  return request<{ translations: string[]; provider: "gemini" | "groq" | "manual" }>("/translations", {
    method: "POST",
    body: JSON.stringify({ texts, target_language }),
  });
}

export function getRecommendedJobs(token: string) {
  return request<RecommendedJobsResponse>("/jobs/recommended", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

export interface ApplicationOut {
  id: string;
  job_id: string;
  talent_id: string;
  applied_via: string;
  status: string;
  applied_at: string | null;
  job_title: string | null;
  company_name: string | null;
  employer_id?: string | null;
  match_score: number | null;
}

export function applyToJob(token: string, jobId: string) {
  return request<ApplicationOut>("/applications", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ job_id: jobId }),
  });
}

export function getMyApplications(token: string) {
  return request<ApplicationOut[]>("/applications/me", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

export interface TalentPreferences {
  skills: string[];
  preferred_categories: string[];
}

export function updateTalentPreferences(token: string, payload: TalentPreferences) {
  return request<TalentPreferences>("/talents/me/preferences", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

// ---- Auth ----

export function login(email: string, password: string) {
  return request<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  role: "talent" | "employer";
  company_name?: string;
}

export function register(payload: RegisterPayload) {
  return request<TokenResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getCurrentUser(token: string) {
  return request<CurrentUser>("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ---- Public landing data ----
// Used by server components, so failures should never crash the page —
// callers fall back to lib/landing-data.ts's static content.
export async function getLandingData(): Promise<LandingData | null> {
  try {
    return await request<LandingData>("/public/landing-data", {
      // Refresh public landing data periodically instead of blocking every visit.
      next: { revalidate: 60 },
    });
  } catch {
    return null;
  }
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  published_at: string | null;
}

export async function getArticles(): Promise<Article[]> {
  try {
    const res = await request<{ articles: Article[] }>("/public/articles", {
      cache: "no-store",
    });
    return res.articles;
  } catch {
    return [];
  }
}

// ---- AI Matches ----

export interface AiMatchesResponse {
  personalized: boolean;
  ai_ranked: boolean;
  matches: Job[];
}

export function getAiMatches(token: string) {
  return request<AiMatchesResponse>("/matches/me", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

// ---- Talent profile ----

export interface EducationEntry {
  id?: string;
  degree: string;
  institution: string;
  start_date?: string | null;
  end_date?: string | null;
  source?: string;
}

export interface ExperienceEntry {
  id?: string;
  job_title: string;
  company_name: string;
  start_date?: string | null;
  end_date?: string | null;
  source?: string;
}

export interface TalentMe {
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  country: string | null;
  city: string | null;
  headline: string | null;
  dob: string | null;
  gender: string | null;
  cv_filename: string | null;
  cv_uploaded_at: string | null;
  profile_completion_status: string;
  profile_completion_percent: number;
  skills: string[];
  preferred_categories: string[];
  education: EducationEntry[];
  experience: ExperienceEntry[];
  ai_filled_fields: string[];
}

export function getMyTalentProfile(token: string) {
  return request<TalentMe>("/talents/me", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

export interface PersonalInfoUpdate {
  phone?: string | null;
  country?: string | null;
  city?: string | null;
  headline?: string | null;
  dob?: string | null;
  gender?: string | null;
}

export function updatePersonalInfo(token: string, payload: PersonalInfoUpdate) {
  return request<TalentMe>("/talents/me/profile", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function addSkill(token: string, skill_name: string) {
  return request<TalentMe>("/talents/me/skills", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ skill_name }),
  });
}

export function removeSkill(token: string, skillName: string) {
  return request<TalentMe>(`/talents/me/skills/${encodeURIComponent(skillName)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function addEducation(token: string, payload: EducationEntry) {
  return request<EducationEntry>("/talents/me/education", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function deleteEducation(token: string, id: string) {
  return request<void>(`/talents/me/education/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function addExperience(token: string, payload: ExperienceEntry) {
  return request<ExperienceEntry>("/talents/me/experience", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function deleteExperience(token: string, id: string) {
  return request<void>(`/talents/me/experience/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getSavedJobs(token: string) {
  return request<Job[]>("/talents/me/saved-jobs", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

export function saveJob(token: string, jobId: string) {
  return request<{ saved: boolean }>(`/jobs/${jobId}/save`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function unsaveJob(token: string, jobId: string) {
  return request<void>(`/jobs/${jobId}/save`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ---- Notifications ----

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  content: string;
  is_read: boolean;
  created_at: string | null;
}

export function getNotifications(token: string) {
  return request<{ notifications: NotificationItem[]; unread_count: number }>(
    "/notifications",
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
  );
}

export function markNotificationRead(token: string, id: string) {
  return request<void>(`/notifications/${id}/read`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function markAllNotificationsRead(token: string) {
  return request<void>("/notifications/mark-all-read", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ---- Messages ----

export interface Conversation {
  id: string;
  other_party_id: string;
  other_party_name: string;
  other_party_role: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

export interface MessageItem {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  sent_at: string | null;
  is_read: boolean;
}

export function getConversations(token: string) {
  return request<Conversation[]>("/messages/conversations", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

export function startConversation(token: string, employerId: string) {
  return request<Conversation>("/messages/conversations", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ employer_id: employerId }),
  });
}

export function startApplicantConversation(token: string, applicationId: string) {
  return request<Conversation>(`/messages/applications/${applicationId}/conversation`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getConversationMessages(token: string, conversationId: string) {
  return request<MessageItem[]>(`/messages/conversations/${conversationId}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

export function sendMessage(token: string, conversationId: string, content: string) {
  return request<MessageItem>(`/messages/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content }),
  });
}

// ---- Courses ----

export interface Course {
  id: string;
  title: string;
  provider: string;
  skill_tag: string;
  duration_weeks: number;
  rating: number;
  url: string | null;
}

export interface SkillGap {
  skill: string;
  severity: string;
  jobs_requiring: number;
}

export interface SkillGapResponse {
  ai_generated: boolean;
  gaps: SkillGap[];
  recommended_courses: Course[];
}

export function getCourses() {
  return request<Course[]>("/courses", { cache: "no-store" });
}

export function getSkillGap(token: string) {
  return request<SkillGapResponse>("/courses/skill-gap", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

// ---- Password reset ----

export function forgotPassword(email: string) {
  return request<void>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token: string, new_password: string) {
  return request<void>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, new_password }),
  });
}

// ---- Employer: jobs ----

export function createJob(token: string, payload: JobCreate) {
  return request<Job>("/jobs", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export interface JobCreate {
  title: string;
  category: string;
  location: string;
  salary?: string | null;
  job_type: string;
  application_method: "in_platform" | "external";
  external_url?: string | null;
  description: string;
  company_description: string;
  employment_level: string;
  work_arrangement: string;
  working_hours: string;
  responsibilities: string[];
  requirements: string[];
  nice_to_have: string[];
  benefits: string[];
  application_instructions: string;
  application_deadline: string | null;
}

export interface JobDraft {
  title: string;
  category: string;
  location: string;
  salary_min: string;
  salary_max: string;
  job_type: string;
  description: string;
  company_description: string;
  employment_level: string;
  work_arrangement: string;
  working_hours: string;
  responsibilities: string;
  requirements: string;
  nice_to_have: string;
  benefits: string;
  application_method: "in_platform" | "external";
  external_url: string;
  application_instructions: string;
  application_deadline: string;
}

export async function analyzeJobPostImage(token: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_BASE_URL}/jobs/analyze-image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = await response.json();
      message = body.detail ?? message;
    } catch {
      // Keep the HTTP status text when the response is not JSON.
    }
    throw new ApiError(typeof message === "string" ? message : "Image analysis failed", response.status);
  }
  return response.json() as Promise<{ fields: JobDraft; provider: string }>;
}

export function getJobDraft(token: string) {
  return request<JobDraft>("/jobs/draft", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
}

export function saveJobDraft(token: string, payload: JobDraft) {
  return request<JobDraft>("/jobs/draft", { method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
}

export function deleteJobDraft(token: string) {
  return request<void>("/jobs/draft", { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
}

export function updateJob(token: string, jobId: string, payload: JobCreate) {
  return request<Job>(`/jobs/${jobId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function closeJob(token: string, jobId: string) {
  return request<void>(`/jobs/${jobId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getMyJobs(token: string) {
  return request<Job[]>("/jobs/mine", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

export function getMyJob(token: string, jobId: string) {
  return request<Job>(`/jobs/mine/${jobId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

export function getJob(jobId: string, token?: string | null) {
  return request<Job>(`/jobs/${jobId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    cache: "no-store",
  });
}

// ---- Employer: company profile ----

export interface CompanyProfile {
  user_id: string;
  company_name: string;
  logo_url: string | null;
  banner_url: string | null;
  website: string | null;
  sector: string | null;
  workforce_size: string | null;
  lifecycle_stage: string | null;
  description: string | null;
  location: string | null;
  is_hidden: boolean;
}

export function getCompanyProfile(token: string) {
  return request<CompanyProfile>("/employers/me", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

export function updateCompanyProfile(token: string, payload: Partial<CompanyProfile>) {
  return request<CompanyProfile>("/employers/me", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function companyImageUrl(path: string | null) {
  if (!path) return null;
  return new URL(path, API_BASE_URL).toString();
}

export async function uploadCompanyImage(
  token: string,
  kind: "logo" | "banner",
  file: File
) {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch(`${API_BASE_URL}/employers/me/media/${kind}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = await response.json();
      message = body.detail ?? message;
    } catch {
      // Keep the HTTP status text when the response is not JSON.
    }
    throw new ApiError(typeof message === "string" ? message : "Image upload failed", response.status);
  }
  return response.json() as Promise<{ url: string }>;
}

// ---- Employer: dashboard ----

export interface RecentJobSummary {
  id: string;
  title: string;
  status: string;
  applicants_count: number;
  posted_at: string | null;
}

export interface TopCandidateSummary {
  talent_id: string;
  full_name: string;
  headline: string | null;
  match_score: number | null;
}

export interface EmployerDashboard {
  active_jobs: number;
  total_applicants: number;
  shortlisted: number;
  saved_candidates: number;
  recent_jobs: RecentJobSummary[];
  top_candidates: TopCandidateSummary[];
}

export function getEmployerDashboard(token: string) {
  return request<EmployerDashboard>("/employers/dashboard", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

// ---- Employer: applicants ----

export interface Applicant {
  application_id: string;
  status: string;
  applied_at: string | null;
  match_score: number | null;
  talent_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  headline: string | null;
  city: string | null;
  country: string | null;
  skills: string[];
  education: { degree: string; institution: string }[];
  experience: { job_title: string; company_name: string }[];
  cv_filename: string | null;
  cv_available: boolean;
}

export function getApplicantsForJob(token: string, jobId: string) {
  return request<Applicant[]>(`/applications/job/${jobId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

/** Fetches a private applicant CV after the API verifies job ownership. */
export async function getApplicantCv(token: string, applicationId: string) {
  const res = await fetch(`${API_BASE_URL}/applications/${applicationId}/cv`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = typeof body.detail === "string" ? body.detail : detail;
    } catch {
      // Keep the HTTP status text when the response has no JSON body.
    }
    throw new ApiError(detail || "Could not open this CV", res.status);
  }
  return { blob: await res.blob(), filename: res.headers.get("Content-Disposition") };
}

export function updateApplicationStatus(token: string, applicationId: string, status: string) {
  return request<ApplicationOut>(`/applications/${applicationId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  });
}

// ---- Employer: saved candidates ----

export interface CandidateSummary {
  talent_id: string;
  full_name: string;
  headline: string | null;
  city: string | null;
  skills: string[];
  match_score: number | null;
}

export function getSavedCandidates(token: string) {
  return request<CandidateSummary[]>("/employers/candidates/saved", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

export function saveCandidate(token: string, talentId: string) {
  return request<{ saved: boolean }>(`/employers/candidates/${talentId}/save`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function unsaveCandidate(token: string, talentId: string) {
  return request<void>(`/employers/candidates/${talentId}/save`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ---- Employer: subscription ----

export interface SubscriptionPlan {
  plan_id: string;
  name: string;
  price: number;
  duration_days: number;
  features: string[];
}

export interface Subscription {
  current_plan: string;
  renews_at: string | null;
  price: number;
  features: string[];
  all_plans: SubscriptionPlan[];
}

export function getSubscription(token: string) {
  return request<Subscription>("/employers/subscription", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

export function switchSubscription(token: string, planId: string) {
  return request<Subscription>("/employers/subscription/switch", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ plan_id: planId }),
  });
}

// ---- Chat: AI-suggested replies ----

export interface SuggestedReplies {
  ai_available: boolean;
  ai_provider?: string | null;
  suggestions: string[];
}

export function getSuggestedReplies(token: string, conversationId: string) {
  return request<SuggestedReplies>(`/messages/conversations/${conversationId}/suggest-replies`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

// ---- Admin ----
export interface AdminUser { id: string; full_name: string; email: string; role: UserRole; location: string; is_blocked: boolean; blocked_reason: string | null; created_at: string | null; }
export interface AdminOverview { total_users: number; talents: number; employers: number; blocked_users: number; jobs: number; applications: number; active_subscriptions: number; countries_reached: number; pending_jobs: number; recent_users: AdminUser[]; }
export interface ModerationJob { id: string; title: string; company_name: string | null; location: string | null; category: string | null; description: string; requirements: string[]; status: string; posted_at: string | null; }
export function getAdminOverview(token: string) { return request<AdminOverview>("/admin/overview", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }); }
export function getAdminUsers(token: string, params: { q?: string; role?: string; blocked?: boolean } = {}) { const query = new URLSearchParams(); if (params.q) query.set("q", params.q); if (params.role) query.set("role", params.role); if (params.blocked !== undefined) query.set("blocked", String(params.blocked)); return request<AdminUser[]>(`/admin/users${query.size ? `?${query}` : ""}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }); }
export function setAdminUserBlocked(token: string, userId: string, blocked: boolean) { return request<AdminUser>(`/admin/users/${userId}/block`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ blocked, reason: "Administrative action" }) }); }
export function getModerationJobs(token: string) { return request<ModerationJob[]>("/admin/jobs/moderation", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }); }
export function setModerationJobStatus(token: string, jobId: string, status: "active" | "removed" | "pending") { return request<{ id: string; status: string }>(`/admin/jobs/${jobId}/status`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ status }) }); }

// ---- Applicants: AI screening ----

export interface AiScreeningResult {
  ai_available: boolean;
  ai_provider?: string | null;
  recommendation?: "shortlist" | "consider" | "reject" | null;
  reasoning?: string | null;
  strengths: string[];
  gaps: string[];
}

export function aiScreenApplication(token: string, applicationId: string) {
  return request<AiScreeningResult>(`/applications/${applicationId}/ai-screen`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ---- Talent profile: CV upload ----

export interface CvUploadResponse {
  profile: TalentMe;
  parsed_ok: boolean;
  ai_provider?: string | null;
  fields_updated: string[];
  education_added: number;
  experience_added: number;
  skills_added: number;
  message: string;
}

export async function uploadCv(token: string, file: File): Promise<CvUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE_URL}/talents/me/cv`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      // ignore
    }
    throw new ApiError(typeof detail === "string" ? detail : "Upload failed", res.status);
  }
  return res.json();
}
