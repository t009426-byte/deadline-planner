"use client";

import { useState, useSyncExternalStore } from "react";
import { useLanguage } from "../lib/i18n";

const DISMISSED_KEY = "family-hub:install-hint-dismissed";

function shouldOffer() {
  try {
    if (localStorage.getItem(DISMISSED_KEY)) return false;
  } catch {}
  const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const standalone =
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches;
  return isIos && !standalone;
}

const noopSubscribe = () => () => {};

export default function InstallHint() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";
  const eligible = useSyncExternalStore(noopSubscribe, shouldOffer, () => false);
  const [dismissed, setDismissed] = useState(false);

  if (!eligible || dismissed) return null;

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {}
  }

  return (
    <div className="flex items-start gap-3 rounded-xl bg-primary/10 px-4 py-3">
      <span className="material-symbols-outlined text-primary text-[22px] shrink-0">install_mobile</span>
      <p className="flex-1 text-sm text-on-surface leading-relaxed">
        {isAr ? (
          <>
            ثبّتي التطبيق على الآيفون: اضغطي{" "}
            <span className="material-symbols-outlined text-[16px] align-text-bottom">ios_share</span> مشاركة ثم
            «إضافة إلى الشاشة الرئيسية».
          </>
        ) : (
          <>
            Install on your iPhone: tap{" "}
            <span className="material-symbols-outlined text-[16px] align-text-bottom">ios_share</span> Share, then
            “Add to Home Screen”.
          </>
        )}
      </p>
      <button
        onClick={dismiss}
        aria-label={isAr ? "إغلاق" : "Dismiss"}
        className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-outline hover:bg-surface-container"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
}
