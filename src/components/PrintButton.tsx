"use client";

import type { ReactNode } from "react";

/** Opens the browser's print dialog; "Save as PDF" there produces the résumé file from the print stylesheet. */
export function PrintButton({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <button type="button" className={className} onClick={() => print()}>
      {children}
    </button>
  );
}
