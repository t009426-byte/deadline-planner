"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Locale = "en" | "ar";

export const translations = {
  en: {
    dir: "ltr",
    brand: "Family Command Hub",
    nav: { digest: "Digest", calendar: "Calendar", routines: "Routines", wellbeing: "Wellbeing" },
    hero: {
      title: "Calm productivity for busy families.",
      subtitle:
        "One command center for schedules, routines, and wellbeing — so dense family logistics feel like ordered peace instead of chaos.",
      cta: "Get Started",
      secondary: "See it in action",
    },
    sections: {
      digest: { title: "Today's Digest", subtitle: "Your AI-curated brief, with conflicts flagged before they become fire drills." },
      calendar: { title: "Family Calendar", subtitle: "A 7-day view, color-coded by family member, with clash detection built in." },
      wellbeing: { title: "Wellbeing Check-in", subtitle: "A daily pulse on mood, energy, and workload — for the person running the household." },
    },
    footer: "Family Command Hub. Built for calm productivity.",
    digestCard: {
      clashTitle: "Clash Flag: Tuesday 4:00 PM",
      clashText: "Leo's Soccer Practice overlaps with Maya's Violin Recital. Both require transportation from different locations.",
      briefTitle: "Your Next 48 Hours",
      briefText:
        "Good morning! You have a busy Tuesday ahead, primarily focused on afternoon logistics. While the morning is clear for deep work, three school activities converge after 3:00 PM, including a transit conflict I've flagged above. Tomorrow looks much lighter, with just a morning parent-teacher sync and your usual gym block at noon.",
      events: "5 Events",
      conflict: "1 Conflict",
      assistant: "Family Assistant",
      online: "Online",
      placeholder: "Ask follow-up...",
      messages: [
        { from: "ai", text: "I've reviewed the schedule. Would you like me to see if Grandma is available to help with the 4:00 PM transport conflict today?", time: "8:32 AM" },
        { from: "user", text: "Yes, please. Also, can you check if Leo needs his soccer cleats for today's practice or if it's indoors?", time: "8:34 AM" },
        { from: "ai", text: "I've confirmed with Coach Dan—practice is indeed indoors today at the Community Center. Cleats are not needed; sneakers are best. I'm waiting on Grandma's reply about the pickup.", time: "8:36 AM" },
      ],
    },
    calendarCard: {
      familyMembers: "Family Members",
      members: ["Mom", "Oliver", "Maya", "Leo"],
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      advisorTitle: "Clash Advisor",
      advisorText: "Maya's Piano Lesson and Oliver's Soccer Practice overlap on Wednesday (Oct 23).",
      advisorSuggestion: "AI Suggestion:",
      advisorSuggestionText: "Ask Grandma to drop Maya off at 4:00 PM while you take Oliver to the pitch.",
      sendToGrandma: "SEND TO GRANDMA",
      dismiss: "DISMISS",
    },
    routinesCard: {
      title: "Routines",
      subtitle: "Small steps, every day, for a calm and intentional life.",
      myRoutines: "My Routines",
      addNew: "ADD NEW",
      kidsRoutines: "Kids' Routines",
      weeklyMilestones: "Weekly Milestones",
      weeklyFooter: "Weekly routines reset every Sunday at midnight.",
      resetsDaily: "Resets daily at midnight",
      dayStreak: "DAY STREAK",
      starStreak: "STAR STREAK",
      kidTags: ["LEO", "MIA"],
      routines: [
        { id: "morning-mindfulness", title: "Morning Mindfulness", subtitle: "10 min meditation + gratitude" },
        { id: "deep-work", title: "Deep Work Session", subtitle: "90 minutes focused focus" },
        { id: "teeth-face", title: "Teeth & Face", subtitle: "Morning hygiene habit", owner: "For Leo" },
        { id: "reading-time", title: "Reading Time", subtitle: "20 minutes before bed", owner: "For Mia" },
      ],
      weeklyItems: [
        { title: "Sunday Meal Prep", subtitle: "Reset for the week ahead", tag: "SUNDAY" },
        { title: "Library Return", subtitle: "Update the kids' book stack", tag: "WEDNESDAY" },
      ],
    },
    wellbeingCard: {
      greeting: "How are you, Sarah?",
      subtitle: "Take a breath and check in with yourself.",
      dayStreak: "DAY STREAK",
      currentMood: "Current Mood",
      moods: [
        { key: "exhausted", label: "Exhausted" },
        { key: "stressed", label: "Stressed" },
        { key: "neutral", label: "Neutral" },
        { key: "calm", label: "Calm" },
        { key: "focused", label: "Energized" },
      ],
      energyLevel: "Energy Level",
      lowBattery: "Low Battery",
      fullyCharged: "Fully Charged",
      mindPrompt: "What's on your mind?",
      mindPlaceholder: "Any specific wins or worries today?",
      submit: "Complete Daily Check-in",
      coachTitle: "Personal AI Coach Response",
      coachText:
        "\"It sounds like you're carrying a lot of mental load today, Sarah. Since your energy is lower than usual, consider delegating the grocery run to your partner or pushing the 'Deep Clean' routine to Saturday.\"",
      groundingTip: "GROUNDING TIP",
      groundingText: "Try the 5-4-3-2-1 technique: Acknowledge 5 things you can see, 4 you can touch, 3 you can hear...",
      familyWorkload: "Family Workload",
      ofCap: "OF {cap}H CAP",
      balanced: "Balanced Week",
      high: "High Workload",
      capacityText: "You are currently at {pct}% of your ideal capacity. A little tight, but manageable.",
      todaysBalance: "Today's Balance",
      priorities: [
        { title: "School Drop-off", subtitle: "Completed • 08:30 AM" },
        { title: "Grocery Delivery", subtitle: "Upcoming • 04:00 PM" },
        { title: "Kids Soccer Training", subtitle: "Heads up • 05:30 PM" },
      ],
      selfCareLog: "Self-Care Log",
      vitamins: "Vitamins Taken",
      yes: "YES",
      water: "Water (2L Goal)",
      waterDone: "1.2L DONE",
      meditation: "10min Meditation",
      logNow: "LOG NOW",
    },
  },
  ar: {
    dir: "rtl",
    brand: "مركز قيادة الأسرة",
    nav: { digest: "الملخص", calendar: "التقويم", routines: "العادات", wellbeing: "الراحة" },
    hero: {
      title: "إنتاجية هادئة للعائلات المشغولة.",
      subtitle:
        "مركز قيادة واحد للجدول الزمني والعادات والراحة النفسية — لتشعر بالهدوء والتنظيم بدلاً من الفوضى وسط ازدحام مهام العائلة.",
      cta: "ابدأ الآن",
      secondary: "شاهد كيف يعمل",
    },
    sections: {
      digest: { title: "ملخص اليوم", subtitle: "موجز يومي بمساعدة الذكاء الاصطناعي، يكشف التعارضات قبل أن تتحول إلى مشكلة." },
      calendar: { title: "تقويم العائلة", subtitle: "عرض أسبوعي لسبعة أيام مرمّز بالألوان لكل فرد من العائلة، مع كشف تلقائي للتعارضات." },
      wellbeing: { title: "تسجيل الحالة النفسية", subtitle: "نبضة يومية عن المزاج والطاقة وحجم المهام — لمن يدير شؤون المنزل." },
    },
    footer: "مركز قيادة الأسرة. صُمم من أجل إنتاجية هادئة.",
    digestCard: {
      clashTitle: "تنبيه تعارض: الثلاثاء 4:00 مساءً",
      clashText: "تدريب كرة القدم لـ ليو يتعارض مع حفل عزف الكمان لـ مايا. كلاهما يحتاج إلى توصيل من موقعين مختلفين.",
      briefTitle: "الـ48 ساعة المقبلة",
      briefText:
        "صباح الخير! أمامك يوم ثلاثاء مزدحم يتركز بشكل أساسي على لوجستيات بعد الظهر. الصباح خالٍ ومناسب للعمل المركّز، لكن ثلاث أنشطة مدرسية تتقاطع بعد الساعة 3:00 مساءً، بما فيها تعارض النقل المذكور أعلاه. يوم الغد أخف بكثير، مع اجتماع صباحي مع المعلمين وموعد النادي الرياضي المعتاد عند الظهر.",
      events: "5 أحداث",
      conflict: "تعارض واحد",
      assistant: "مساعد العائلة",
      online: "متصل",
      placeholder: "اكتب سؤالاً إضافياً...",
      messages: [
        { from: "ai", text: "راجعتُ الجدول. هل تريدين أن أتحقق إن كانت الجدة متاحة للمساعدة في تعارض التوصيل عند الساعة 4:00 مساءً اليوم؟", time: "8:32 ص" },
        { from: "user", text: "نعم من فضلك. وهل يمكنك التحقق إن كان ليو يحتاج إلى حذاء كرة القدم اليوم أم أن التدريب داخلي؟", time: "8:34 ص" },
        { from: "ai", text: "تأكدت مع المدرب دان — التدريب اليوم داخلي في المركز المجتمعي. لا حاجة للحذاء المخصص؛ الحذاء الرياضي العادي أفضل. أنتظر رد الجدة بخصوص التوصيل.", time: "8:36 ص" },
      ],
    },
    calendarCard: {
      familyMembers: "أفراد العائلة",
      members: ["أمي", "أوليفر", "مايا", "ليو"],
      days: ["إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت", "أحد"],
      advisorTitle: "مستشار التعارضات",
      advisorText: "درس البيانو لـ مايا وتدريب كرة القدم لـ أوليفر يتعارضان يوم الأربعاء (23 أكتوبر).",
      advisorSuggestion: "اقتراح الذكاء الاصطناعي:",
      advisorSuggestionText: "اطلبي من الجدة إيصال مايا في الساعة 4:00 مساءً بينما تأخذين أوليفر إلى الملعب.",
      sendToGrandma: "إرسال إلى الجدة",
      dismiss: "تجاهل",
    },
    routinesCard: {
      title: "العادات",
      subtitle: "خطوات صغيرة، كل يوم، لحياة هادئة وواعية.",
      myRoutines: "عاداتي",
      addNew: "إضافة جديد",
      kidsRoutines: "عادات الأطفال",
      weeklyMilestones: "محطات أسبوعية",
      weeklyFooter: "تُعاد العادات الأسبوعية كل يوم أحد عند منتصف الليل.",
      resetsDaily: "تُعاد التهيئة يومياً عند منتصف الليل",
      dayStreak: "يوم متتالي",
      starStreak: "نجمة متتالية",
      kidTags: ["ليو", "ميا"],
      routines: [
        { id: "morning-mindfulness", title: "تأمل الصباح", subtitle: "10 دقائق تأمل وامتنان" },
        { id: "deep-work", title: "جلسة عمل مركّز", subtitle: "90 دقيقة من التركيز العميق" },
        { id: "teeth-face", title: "الأسنان والوجه", subtitle: "عادة النظافة الصباحية", owner: "خاص بـ ليو" },
        { id: "reading-time", title: "وقت القراءة", subtitle: "20 دقيقة قبل النوم", owner: "خاص بـ ميا" },
      ],
      weeklyItems: [
        { title: "تحضير وجبات الأحد", subtitle: "إعادة التهيئة للأسبوع القادم", tag: "الأحد" },
        { title: "إرجاع كتب المكتبة", subtitle: "تحديث رصيد كتب الأطفال", tag: "الأربعاء" },
      ],
    },
    wellbeingCard: {
      greeting: "كيف حالك، سارة؟",
      subtitle: "خذي نفساً عميقاً وتحققي من حالتك.",
      dayStreak: "يوم متتالي",
      currentMood: "الحالة المزاجية الحالية",
      moods: [
        { key: "exhausted", label: "مُستنزفة" },
        { key: "stressed", label: "متوترة" },
        { key: "neutral", label: "عادية" },
        { key: "calm", label: "هادئة" },
        { key: "focused", label: "نشيطة" },
      ],
      energyLevel: "مستوى الطاقة",
      lowBattery: "طاقة منخفضة",
      fullyCharged: "طاقة كاملة",
      mindPrompt: "ما الذي يشغل بالك؟",
      mindPlaceholder: "أي إنجازات أو مخاوف محددة اليوم؟",
      submit: "إكمال تسجيل اليوم",
      coachTitle: "رد المدرّب الشخصي بالذكاء الاصطناعي",
      coachText:
        "«يبدو أنك تحملين عبئاً ذهنياً كبيراً اليوم، سارة. بما أن طاقتك أقل من المعتاد، فكّري بتفويض مهمة التسوق لشريكك أو تأجيل عادة «التنظيف العميق» إلى يوم السبت.»",
      groundingTip: "نصيحة للتهدئة",
      groundingText: "جرّبي تقنية 5-4-3-2-1: اذكري 5 أشياء تراها، 4 أشياء تلمسها، 3 أشياء تسمعها...",
      familyWorkload: "حِمل العائلة",
      ofCap: "من {cap} ساعة كحد أقصى",
      balanced: "أسبوع متوازن",
      high: "حِمل مرتفع",
      capacityText: "أنتِ حالياً عند {pct}% من سعتك المثالية. الوضع ضيق قليلاً لكنه ممكن.",
      todaysBalance: "توازن اليوم",
      priorities: [
        { title: "توصيل المدرسة", subtitle: "تم • 08:30 ص" },
        { title: "توصيل البقالة", subtitle: "قادم • 04:00 م" },
        { title: "تدريب كرة القدم للأطفال", subtitle: "تذكير • 05:30 م" },
      ],
      selfCareLog: "سجل العناية الذاتية",
      vitamins: "أخذ الفيتامينات",
      yes: "نعم",
      water: "الماء (هدف 2 لتر)",
      waterDone: "تم 1.2 لتر",
      meditation: "تأمل 10 دقائق",
      logNow: "سجّل الآن",
    },
  },
} as const;

type Translation = (typeof translations)[Locale];

type LanguageContextValue = {
  locale: Locale;
  t: Translation;
  toggleLocale: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = translations[locale].dir;
  }, [locale]);

  const toggleLocale = () => setLocale((l) => (l === "en" ? "ar" : "en"));

  return (
    <LanguageContext.Provider value={{ locale, t: translations[locale], toggleLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
