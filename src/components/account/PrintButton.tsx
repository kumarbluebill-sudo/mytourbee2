"use client";

export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="min-h-11 rounded-full bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-dark">
      Print / save as PDF
    </button>
  );
}
