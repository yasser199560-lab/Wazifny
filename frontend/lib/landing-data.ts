import {
  UploadCloud,
  Sparkles,
  Zap,
  TrendingUp,
  Users,
  Star,
  type LucideIcon,
} from "lucide-react";

export const stats = [
  { value: "12,000+", label: "Active Talents" },
  { value: "850+", label: "Companies" },
  { value: "3,400+", label: "Jobs Posted" },
  { value: "94%", label: "Match Accuracy" },
];

export type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const features: Feature[] = [
  {
    icon: UploadCloud,
    title: "AI CV Parsing",
    description:
      "Upload your CV and let our AI instantly extract your skills, experience, and education into a complete profile.",
  },
  {
    icon: Sparkles,
    title: "Smart Job Matching",
    description:
      "Once your profile is complete, receive a ranked list of jobs aligned with your background and preferences.",
  },
  {
    icon: Zap,
    title: "One-Click Apply",
    description:
      "Apply directly on Wazifny or get redirected to the employer's site — all with a single click.",
  },
  {
    icon: TrendingUp,
    title: "Skill-Gap Analysis",
    description:
      "Identify gaps between your profile and your target roles, and get course recommendations to close them.",
  },
  {
    icon: Users,
    title: "In-App Chat",
    description:
      "Communicate directly with employers inside the platform — no need for external email chains.",
  },
  {
    icon: Star,
    title: "Course Library",
    description:
      "Upskill with curated courses from top providers, recommended based on your specific skill gaps.",
  },
];

export const categories = [
  { name: "Engineering", count: "342 jobs" },
  { name: "Design", count: "189 jobs" },
  { name: "Marketing", count: "216 jobs" },
  { name: "Finance", count: "134 jobs" },
  { name: "Product", count: "97 jobs" },
  { name: "Data & AI", count: "158 jobs" },
  { name: "Sales", count: "203 jobs" },
  { name: "Operations", count: "112 jobs" },
];

export const talentSteps = [
  {
    title: "Register & Upload CV",
    description:
      "Create your account and upload your CV. Our AI reads it and builds your profile automatically.",
  },
  {
    title: "Get Matched to Jobs",
    description:
      "Once your profile is complete, AI generates a ranked list of jobs that fit your skills and experience.",
  },
  {
    title: "Apply in One Click",
    description:
      "Apply directly on Wazifny or follow an external link — the whole process takes seconds.",
  },
];

export const employerSteps = [
  {
    title: "Create Company Profile",
    description:
      "Set up your company profile with logo, description, and industry details to attract the right talent.",
  },
  {
    title: "Post a Job",
    description:
      "Describe the role, requirements, and salary. Choose whether to receive applications in-platform or externally.",
  },
  {
    title: "Review & Hire",
    description:
      "Browse matched applicants in your dashboard, save top candidates, and chat to schedule interviews.",
  },
];

export const testimonials = [
  {
    quote:
      "I uploaded my CV on a Tuesday and by Thursday I had 3 interview requests from companies that actually matched my skillset. This platform is a game changer.",
    name: "Sara Khalil",
    role: "Frontend Developer, hired via Wazifny",
    rating: 5,
  },
  {
    quote:
      "As an employer, the quality of candidates we receive through Wazifny is noticeably higher. The AI pre-screening saves us hours every week.",
    name: "Karim Rahme",
    role: "Engineering Manager, TechCorp Lebanon",
    rating: 5,
  },
  {
    quote:
      "The skill-gap analysis pointed me to two courses. I completed them, updated my profile, and matched to my dream job within a month.",
    name: "Layla Nasr",
    role: "UX Designer, hired remotely",
    rating: 5,
  },
];
