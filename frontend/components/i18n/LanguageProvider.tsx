"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "en" | "ar";

const arabic: Record<string, string> = {
  "Engineering": "الهندسة", "Design": "التصميم", "Marketing": "التسويق", "Finance": "المالية",
  "Product": "المنتجات", "Data & AI": "البيانات والذكاء الاصطناعي", "Sales": "المبيعات", "Operations": "العمليات",
  "Active Talents": "باحثون نشطون عن عمل", "Companies": "شركات", "Jobs Posted": "وظائف منشورة", "Match Accuracy": "دقة المطابقة",
  "342 jobs": "342 وظيفة", "189 jobs": "189 وظيفة", "216 jobs": "216 وظيفة", "134 jobs": "134 وظيفة", "97 jobs": "97 وظيفة", "158 jobs": "158 وظيفة", "203 jobs": "203 وظيفة", "112 jobs": "112 وظيفة",
  "Wazifny Partner": "شريك وظفني", "Dismiss": "إغلاق", "Get AI-matched jobs": "احصل على وظائف مناسبة بالذكاء الاصطناعي",
  "Which fields interest you?": "ما المجالات التي تهمك؟", "Your top skills (comma separated)": "أهم مهاراتك (مفصولة بفواصل)",
  "e.g. React, Figma, Financial Modeling, SQL": "مثال: React، Figma، التحليل المالي، SQL", "Show my AI matches": "اعرض مطابقات الذكاء الاصطناعي",
  "CV upload and auto-parsing is coming soon. For now, tell us what you're looking for and we'll use AI to find jobs that fit you best.": "سيصبح رفع السيرة الذاتية وتحليلها تلقائياً متاحاً قريباً. أخبرنا الآن بما تبحث عنه وسنستخدم الذكاء الاصطناعي لإيجاد الوظائف الأنسب لك.",
  "Type": "النوع", "Job title, keywords, or company (AI-powered)": "المسمى الوظيفي أو الكلمات المفتاحية أو الشركة (بالذكاء الاصطناعي)",
  "AI-matched picks based on your profile, plus everything else on Wazifny.": "اختيارات مناسبة بالذكاء الاصطناعي بناءً على ملفك الشخصي، بالإضافة إلى كل ما هو متاح على وظفني.",
  "Search jobs across every field on Wazifny — sign in as a talent for AI-personalized matches.": "ابحث عن وظائف في جميع المجالات على وظفني — سجّل الدخول كباحث عن عمل للحصول على مطابقات مخصصة بالذكاء الاصطناعي.",
  "Couldn't load jobs right now. Please try again in a moment.": "تعذّر تحميل الوظائف الآن. يرجى المحاولة بعد قليل.", "Couldn't submit your application. Please try again.": "تعذّر إرسال طلبك. يرجى المحاولة مرة أخرى.",
  "Application submitted! You can track it from your dashboard.": "تم إرسال طلبك! يمكنك متابعته من لوحة التحكم.", "Showing": "عرض", "job": "وظيفة", "jobs": "وظائف", "AI-ranked": "مرتبة بالذكاء الاصطناعي",
  "Recommended for you": "موصى بها لك", "More opportunities": "فرص أخرى", "No jobs match your search yet. Try different keywords or clear your filters.": "لا توجد وظائف مطابقة لبحثك بعد. جرّب كلمات مفتاحية أخرى أو امسح عوامل التصفية.",
  "Browse by Category": "تصفّح حسب الفئة",
  "Explore jobs across Lebanon's top industries": "استكشف الوظائف في أبرز قطاعات لبنان",
  "Platform Features": "مزايا المنصة",
  "Everything you need to land your next role": "كل ما تحتاجه للحصول على وظيفتك التالية",
  "Wazifny combines AI technology with a clean platform to make job searching smarter.": "يجمع وظفني بين الذكاء الاصطناعي ومنصة سهلة لجعل البحث عن عمل أكثر ذكاءً.",
  "AI CV Parsing": "تحليل السيرة الذاتية بالذكاء الاصطناعي",
  "Upload your CV and let our AI instantly extract your skills, experience, and education into a complete profile.": "ارفع سيرتك الذاتية ودع الذكاء الاصطناعي يستخرج مهاراتك وخبراتك وتعليمك فوراً في ملف شخصي متكامل.",
  "Smart Job Matching": "مطابقة ذكية للوظائف",
  "Once your profile is complete, receive a ranked list of jobs aligned with your background and preferences.": "بعد إكمال ملفك الشخصي، ستحصل على قائمة مرتبة بالوظائف المناسبة لخلفيتك وتفضيلاتك.",
  "One-Click Apply": "تقديم بنقرة واحدة",
  "Apply directly on Wazifny or get redirected to the employer's site — all with a single click.": "قدّم مباشرةً عبر وظفني أو انتقل إلى موقع صاحب العمل، كل ذلك بنقرة واحدة.",
  "Skill-Gap Analysis": "تحليل فجوات المهارات",
  "Identify gaps between your profile and your target roles, and get course recommendations to close them.": "حدّد الفجوات بين ملفك الشخصي والوظائف التي تستهدفها واحصل على دورات مقترحة لسدّها.",
  "In-App Chat": "محادثة داخل المنصة",
  "Communicate directly with employers inside the platform — no need for external email chains.": "تواصل مباشرةً مع أصحاب العمل داخل المنصة دون الحاجة إلى رسائل بريد إلكتروني خارجية.",
  "Course Library": "مكتبة الدورات",
  "Upskill with curated courses from top providers, recommended based on your specific skill gaps.": "طوّر مهاراتك عبر دورات مختارة من أفضل المزوّدين ومقترحة بناءً على فجوات مهاراتك.",
  "How It Works": "كيف يعمل",
  "Simple, fast, and intelligent": "بسيط وسريع وذكي",
  "For Talents": "للباحثين عن عمل",
  "For Employers": "لأصحاب العمل",
  "Start as Talent": "ابدأ كباحث عن عمل",
  "Post a Job": "انشر وظيفة",
  "Register & Upload CV": "سجّل وارفع سيرتك الذاتية",
  "Create your account and upload your CV. Our AI reads it and builds your profile automatically.": "أنشئ حسابك وارفع سيرتك الذاتية. يقرأها الذكاء الاصطناعي وينشئ ملفك الشخصي تلقائياً.",
  "Get Matched to Jobs": "احصل على وظائف مناسبة",
  "Once your profile is complete, AI generates a ranked list of jobs that fit your skills and experience.": "بعد اكتمال ملفك الشخصي، ينشئ الذكاء الاصطناعي قائمة مرتبة بالوظائف المناسبة لمهاراتك وخبراتك.",
  "Apply in One Click": "قدّم بنقرة واحدة",
  "Apply directly on Wazifny or follow an external link — the whole process takes seconds.": "قدّم مباشرةً عبر وظفني أو اتبع رابطاً خارجياً؛ تستغرق العملية كلها ثوانٍ.",
  "Create Company Profile": "أنشئ ملف الشركة",
  "Set up your company profile with logo, description, and industry details to attract the right talent.": "أنشئ ملف شركتك بالشعار والوصف وتفاصيل المجال لجذب الكفاءات المناسبة.",
  "Describe the role, requirements, and salary. Choose whether to receive applications in-platform or externally.": "صف الوظيفة والمتطلبات والراتب، واختر استلام الطلبات داخل المنصة أو خارجها.",
  "Review & Hire": "راجع ووظّف",
  "Browse matched applicants in your dashboard, save top candidates, and chat to schedule interviews.": "استعرض المتقدمين المناسبين في لوحة التحكم واحفظ أفضل المرشحين وتواصل لتحديد المقابلات.",
  "Ready to find your perfect match?": "هل أنت مستعد للعثور على فرصتك المثالية؟",
  "Join thousands of talents and employers already using Wazifny.": "انضم إلى آلاف الباحثين عن عمل وأصحاب العمل الذين يستخدمون وظفني.",
  "Upload CV & Get Matched": "ارفع سيرتك واحصل على تطابقات",
  "Post a Job Today": "انشر وظيفة اليوم",
  "Free for talents": "مجاني للباحثين عن عمل",
  "No credit card required": "لا يلزم بطاقة ائتمان",
  "Set up in 3 minutes": "إعداد خلال 3 دقائق",
  "Trusted by Lebanon's workforce": "موثوق من القوى العاملة في لبنان",
  "Applicants": "الباحثون عن عمل",
  "About": "حول",
  "Useful Links": "روابط مفيدة",
  "Contact Us": "اتصل بنا",
  "Terms of Use": "شروط الاستخدام",
  "Privacy Center": "مركز الخصوصية",
  "Beirut, Lebanon": "بيروت، لبنان",
  "All rights reserved.": "جميع الحقوق محفوظة.",
  "Beirut...": "بيروت...",
  "Account": "الحساب",
  "Admin Overview": "نظرة عامة للمسؤول",
  "My Dashboard": "لوحة التحكم",
  "Log out": "تسجيل الخروج",
  "Choose language": "اختر اللغة",
  Home: "الرئيسية",
  "Find Jobs": "ابحث عن وظائف",
  Courses: "الدورات",
  "About Us": "من نحن",
  Login: "تسجيل الدخول",
  Register: "إنشاء حساب",
  "I'm a Talent": "أنا باحث عن عمل",
  "I'm an Employer": "أنا صاحب عمل",
  "Find Your Dream Job": "اعثر على وظيفة أحلامك",
  "& Get Results": "وحقق النتائج",
  "AI-powered job matching platform for Lebanon. Upload your CV, get matched, and apply in seconds.": "منصة ذكية لمطابقة الوظائف في لبنان. ارفع سيرتك الذاتية، واحصل على وظائف مناسبة وقدّم خلال ثوانٍ.",
  "Job title, skills, or company...": "المسمى الوظيفي أو المهارات أو الشركة...",
  "Search jobs across every field on Wazifny": "ابحث عن وظائف في جميع المجالات على وظفني",
  Category: "الفئة",
  Location: "الموقع",
  "Apply Filters": "تطبيق الفلاتر",
  "Clear filters": "مسح الفلاتر",
  "All Categories": "كل الفئات",
  "All Types": "كل أنواع العمل",
  "Full-time": "دوام كامل",
  "Part-time": "دوام جزئي",
  Remote: "عن بُعد",
  Internship: "تدريب",
  Contract: "عقد",
  "Job Description": "الوصف الوظيفي",
  Requirements: "المتطلبات",
  Salary: "الراتب",
  Company: "الشركة",
  "Apply Now": "قدّم الآن",
  "Save Job": "حفظ الوظيفة",
  "Back to Find Jobs": "العودة إلى الوظائف",
  "Recently posted": "نُشرت مؤخراً",
};

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (english: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("wazifny_language");
    if (saved === "ar" || saved === "en") setLanguageState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    window.localStorage.setItem("wazifny_language", language);
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage: setLanguageState,
    t: (english: string) => (language === "ar" ? arabic[english] || english : english),
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
