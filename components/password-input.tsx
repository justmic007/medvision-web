"use client";

import { useState, forwardRef } from "react";

/**
 * A password <input> with a built-in Show/Hide toggle.
 * Forwards the ref and spreads props (so react-hook-form's register works).
 */
export const PasswordInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function PasswordInput(props, ref) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        ref={ref}
        type={show ? "text" : "password"}
        className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 pr-14 text-sm focus:border-ring focus:ring-2 focus:ring-ring/30 focus:outline-none"
        placeholder="••••••••"
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
        tabIndex={-1}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
});
