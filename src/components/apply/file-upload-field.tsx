"use client";

import { useState } from "react";
import { inputClasses } from "@/components/ui/field";

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
      <path
        d="M3.5 8.5L6.5 11.5L12.5 4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Mobile browsers don't surface the picked filename next to the file input
// the way desktop ones do, so without this the only feedback a phone user
// gets is the "File uploaded" banner that appears a step later (once the
// upload has actually gone to the server). Showing the filename the moment
// it's picked confirms the attachment immediately, in the same section.
export function FileUploadField({ name, accept }: { name: string; accept: string }) {
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1.5">
      <input
        name={name}
        type="file"
        accept={accept}
        className={inputClasses}
        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
      />
      {fileName && (
        <p className="flex items-center gap-1.5 text-xs text-venturo-olive">
          <CheckIcon />
          {fileName} selected — will be uploaded when you continue.
        </p>
      )}
    </div>
  );
}
