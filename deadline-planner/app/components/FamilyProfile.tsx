"use client";

import { useEffect } from "react";
import { useLanguage } from "../lib/i18n";
import { PALETTE, memberLabel, useFamily, type Member } from "../lib/family";
import CalendarConnections from "./CalendarConnections";

export default function FamilyProfile({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { locale } = useLanguage();
  const isAr = locale === "ar";
  const { admin, kids, entries, updateMember, addKid, removeMember, session, signOut } = useFamily();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function remove(kid: Member) {
    const count = entries.filter((e) => e.memberId === kid.id).length;
    const name = memberLabel(kid, isAr);
    const msg = isAr
      ? `حذف ${name}${count ? ` و${count} من مواعيده` : ""}؟`
      : `Remove ${name}${count ? ` and ${count} calendar ${count === 1 ? "entry" : "entries"}` : ""}?`;
    if (confirm(msg)) removeMember(kid.id);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      <button
        aria-label="Close"
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full md:max-w-lg max-h-[90vh] overflow-y-auto bg-background rounded-t-2xl md:rounded-2xl shadow-xl"
      >
        <div className="sticky top-0 bg-background flex items-center justify-between px-5 py-4 border-b border-surface-container">
          <h2 className="font-heading text-base font-semibold text-on-surface">
            {isAr ? "ملف العائلة" : "Family Profile"}
          </h2>
          <button
            onClick={onClose}
            className="text-sm font-semibold text-primary px-3 py-1.5 rounded-lg hover:bg-surface-container"
          >
            {isAr ? "تم" : "Done"}
          </button>
        </div>

        <div className="p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] space-y-6">
          <section className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-outline">
              {isAr ? "أنا (المسؤولة)" : "Me (Admin)"}
            </p>
            <MemberRow
              member={admin}
              placeholder={isAr ? "اسمك" : "Your name"}
              onChange={(patch) => updateMember(admin.id, patch)}
            />
          </section>

          <section className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-outline">
              {isAr ? "الأطفال" : "Kids"}
            </p>
            {kids.length === 0 && (
              <p className="text-sm text-on-surface-variant">
                {isAr ? "أضيفي أطفالك واختاري لوناً لكل واحد." : "Add your kids and pick a color for each one."}
              </p>
            )}
            {kids.map((kid, i) => (
              <MemberRow
                key={kid.id}
                member={kid}
                autoFocus={!kid.name && i === kids.length - 1}
                placeholder={isAr ? `اسم الطفل ${i + 1}` : `Child ${i + 1} name`}
                onChange={(patch) => updateMember(kid.id, patch)}
                onRemove={() => remove(kid)}
              />
            ))}
            <button
              onClick={addKid}
              className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl border-2 border-dashed border-outline-variant text-sm font-semibold text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              {isAr ? "إضافة طفل" : "Add child"}
            </button>
          </section>

          <section className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-outline">
              {isAr ? "التقويمات" : "Calendars"}
            </p>
            <CalendarConnections />
          </section>

          <section className="flex items-center justify-between gap-3 pt-2 border-t border-surface-container">
            <span className="text-xs text-outline truncate">{session?.user.email}</span>
            <button
              onClick={() => {
                onClose();
                signOut();
              }}
              className="shrink-0 flex items-center gap-1 text-sm font-semibold text-on-surface-variant px-3 py-1.5 rounded-lg hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              {isAr ? "تسجيل الخروج" : "Sign out"}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

function MemberRow({
  member,
  placeholder,
  autoFocus,
  onChange,
  onRemove,
}: {
  member: Member;
  placeholder: string;
  autoFocus?: boolean;
  onChange: (patch: Partial<Pick<Member, "name" | "color">>) => void;
  onRemove?: () => void;
}) {
  return (
    <div className="rounded-xl border border-surface-container bg-surface-container-lowest p-3 space-y-3">
      <div className="flex items-center gap-3">
        <span
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ backgroundColor: member.color }}
        >
          {member.name.trim().charAt(0).toUpperCase() || (
            <span className="material-symbols-outlined text-[18px]">
              {member.role === "admin" ? "person" : "child_care"}
            </span>
          )}
        </span>
        <input
          value={member.name}
          autoFocus={autoFocus}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder={placeholder}
          className="flex-1 min-w-0 bg-surface-container rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/20"
        />
        {onRemove && (
          <button
            onClick={onRemove}
            aria-label="Remove"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-error hover:bg-error-container/50 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {PALETTE.map((c) => (
          <button
            key={c}
            aria-label={c}
            onClick={() => onChange({ color: c })}
            className={`w-7 h-7 rounded-full transition-transform ${
              member.color === c ? "ring-2 ring-offset-2 ring-on-surface scale-110" : "hover:scale-110"
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
        <label
          className={`relative w-7 h-7 rounded-full border-2 border-dashed border-outline-variant flex items-center justify-center cursor-pointer overflow-hidden ${
            !PALETTE.includes(member.color) ? "ring-2 ring-offset-2 ring-on-surface" : ""
          }`}
          style={!PALETTE.includes(member.color) ? { backgroundColor: member.color, borderStyle: "solid" } : undefined}
          title="Custom color"
        >
          {PALETTE.includes(member.color) && (
            <span className="material-symbols-outlined text-[16px] text-outline">palette</span>
          )}
          <input
            type="color"
            value={member.color}
            onChange={(e) => onChange({ color: e.target.value })}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
}
