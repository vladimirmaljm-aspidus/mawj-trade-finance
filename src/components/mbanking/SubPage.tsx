"use client";

import { type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useNav } from "./nav";

interface SubPageProps {
  title: string;
  /** Optional right-side action rendered in the header. */
  headerRight?: ReactNode;
  children: ReactNode;
  /** Hide the default back button (e.g. when a custom one is needed). */
  hideBack?: boolean;
}

/**
 * Full-screen overlay sub-page that slides in from the right.
 * Renders a sticky header with a back button + the page title.
 */
export function SubPage({ title, headerRight, children, hideBack }: SubPageProps) {
  const { closeSubPage } = useNav();

  return (
    <div className="aspidus-subpage fixed inset-0 z-50 flex flex-col bg-[#f8fafc]">
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-slate-200 bg-[#f8fafc] px-5 pb-3 pt-12">
        {!hideBack && (
          <button
            onClick={closeSubPage}
            className="active-scale flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 stroke-[2.5]" />
          </button>
        )}
        <h1 className="ml-1 text-xl font-black tracking-tight text-slate-900">
          {title}
        </h1>
        {headerRight && <div className="ml-auto flex items-center">{headerRight}</div>}
      </header>
      <div className="hide-scrollbar flex-1 overflow-y-auto">{children}</div>
      <style jsx>{`
        .aspidus-subpage {
          animation: aspidus-slide-in 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes aspidus-slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
