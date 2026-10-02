"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Locale = "en" | "ar";

export const translations = {
  en: {
    dir: "ltr",
    brand: "Family Command Hub",
    nav: { calendar: "Calendar", routines: "Tasks", wellbeing: "Check-in" },
    sections: {
      calendar: { title: "Family Calendar" },
    },
    wellbeingCard: {
      submit: "Complete Daily Check-in",
      priorities: [
        { title: "School Drop-off", subtitle: "Completed • 08:30 AM" },
        { title: "Grocery Delivery", subtitle: "Upcoming • 04:00 PM" },
        { title: "Kids Soccer Training", subtitle: "Heads up • 05:30 PM" },
      ],
    },
  },
  ar: {
    dir: "rtl",
    brand: "مركز قيادة الأسرة",
    nav: { calendar: "التقويم", routines: "المهام", wellbeing: "تسجيل الحالة" },
    sections: {
      calendar: { title: "تقويم العائلة" },
    },
    wellbeingCard: {
      submit: "إكمال تسجيل اليوم",
      priorities: [
        { title: "توصيل المدرسة", subtitle: "تم • 08:30 ص" },
        { title: "توصيل البقالة", subtitle: "قادم • 04:00 م" },
        { title: "تدريب كرة القدم للأطفال", subtitle: "تذكير • 05:30 م" },
      ],
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
