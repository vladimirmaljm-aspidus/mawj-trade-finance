"use client";

import { type ReactNode } from "react";
import { CbiHeader, CbiBackBar, CbiFooter } from "./cbi";
import { useNav } from "./nav";

interface SubPageProps {
  title: string;
  /** Optional right-side action rendered in the header bar. */
  headerRight?: ReactNode;
  children: ReactNode;
  /** Hide the default back button (e.g. when a custom one is needed). */
  hideBack?: boolean;
  /** Right-side text in the navy back bar (e.g. "Step 1 of 3"). */
  stepIndicator?: string;
}

/**
 * Full-screen overlay sub-page — authentic CBI layout:
 * gradient header (pennant + right-aligned title) → navy Back bar →
 * flat body → gradient copyright footer.
 */
export function SubPage({ title, headerRight, children, hideBack, stepIndicator }: SubPageProps) {
  const { closeSubPage } = useNav();

  return (
    <div className="cbi-slide-in fixed inset-0 z-50 flex flex-col bg-[#F7F7F7]">
      <CbiHeader
        title={title}
        onBack={hideBack ? undefined : closeSubPage}
        right={headerRight}
      />
      <CbiBackBar
        onBack={closeSubPage}
        right={stepIndicator}
      />
      <div className="hide-scrollbar flex-1 overflow-y-auto">{children}</div>
      <CbiFooter />
    </div>
  );
}
