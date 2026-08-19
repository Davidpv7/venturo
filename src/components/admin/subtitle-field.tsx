"use client";

import { useState } from "react";
import { Field, inputClasses } from "@/components/ui/field";
import { countWords, truncateToWords } from "@/lib/format";

const MAX_WORDS = 15;

export function SubtitleField({ defaultValue = "" }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);
  const count = countWords(value);

  return (
    <Field label="Subtitle">
      <input
        name="subtitle"
        type="text"
        required
        maxLength={200}
        value={value}
        onChange={(e) => setValue(truncateToWords(e.target.value, MAX_WORDS))}
        className={inputClasses}
        placeholder="A short one-line summary shown under the photos"
      />
      <p className="mt-1 text-xs font-normal text-foreground/50">
        {count}/{MAX_WORDS} words
      </p>
    </Field>
  );
}
