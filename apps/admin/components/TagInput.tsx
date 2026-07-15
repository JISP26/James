"use client";

import { useState } from "react";

export function TagInput({
  values,
  onChange,
  placeholder = "Type and press Enter",
}: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function addValue() {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  }

  return (
    <div className="border border-jisp-light px-3 py-2 flex flex-wrap gap-2 items-center focus-within:border-jisp-blue">
      {values.map((v) => (
        <span key={v} className="bg-jisp-light px-2 py-1 text-xs flex items-center gap-1">
          {v}
          <button
            type="button"
            aria-label={`Remove ${v}`}
            onClick={() => onChange(values.filter((x) => x !== v))}
            className="text-jisp-grey hover:text-red-600"
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addValue();
          }
        }}
        onBlur={addValue}
        placeholder={placeholder}
        className="flex-1 min-w-[120px] text-sm outline-none py-1"
      />
    </div>
  );
}
