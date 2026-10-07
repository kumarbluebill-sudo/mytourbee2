"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { schemas, slugify, type EntityKind, type Field } from "@/lib/admin-schema";

type Values = Record<string, unknown>;
type Option = { value: string; label: string };

const inputCls = "mt-1 min-h-11 w-full rounded-xl border border-line bg-white px-3 text-heading";

function blank(fields: Field[]): Values {
  const v: Values = {};
  for (const f of fields) {
    v[f.key] = f.type === "checkbox" ? f.key === "published" : f.type === "lines" || f.type === "images" || f.type === "rows" ? [] : f.type === "number" ? "" : f.type === "select" ? "" : "";
  }
  return v;
}

function Preview({ src }: { src: string }) {
  // Plain img on purpose: admin previews may point at hosts next/image does not allow.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className="h-16 w-24 rounded-lg object-cover" />;
}

function ImageInput({ value, onChange, id }: { value: string; onChange: (v: string) => void; id: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function upload(file: File) {
    setBusy(true); setErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const j = await res.json().catch(() => ({}));
      if (res.ok) onChange(j.url); else setErr(j.error ?? "Upload failed.");
    } catch {
      setErr("Network problem.");
    }
    setBusy(false);
  }
  return (
    <div>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        {value && /^(https:|\/media\/)/.test(value) && <Preview src={value} />}
        <input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://… or upload" className={`${inputCls} mt-0 min-w-0 flex-1`} />
        <label className="flex min-h-11 cursor-pointer items-center rounded-full border border-primary px-4 text-sm font-semibold text-primary">
          {busy ? "Uploading…" : "Upload"}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
        </label>
      </div>
      {err && <p role="alert" className="mt-1 text-sm text-discount">{err}</p>}
    </div>
  );
}

function FieldInput({ f, value, onChange, path, errors, destinations }: {
  f: Field; value: unknown; onChange: (v: unknown) => void; path: string; errors: Record<string, string>; destinations: Option[];
}) {
  const error = errors[path];
  const id = `f-${path}`;
  const label = <span className="text-sm font-medium text-heading">{f.label}{"required" in f && f.required && <span aria-hidden> *</span>}</span>;
  const help = "help" in f && f.help ? <span className="mt-0.5 block text-xs">{f.help}</span> : null;
  const err = error ? <p role="alert" className="mt-1 text-sm text-discount">{error}</p> : null;

  switch (f.type) {
    case "text": case "url":
      return <div><label htmlFor={id}>{label}</label><input id={id} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className={inputCls} />{help}{err}</div>;
    case "textarea":
      return <div><label htmlFor={id}>{label}</label><textarea id={id} rows={f.key === "body" ? 12 : 4} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className={`${inputCls} py-2`} />{help}{err}</div>;
    case "date":
      return <div><label htmlFor={id}>{label}</label><input id={id} type="date" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className={inputCls} />{help}{err}</div>;
    case "number":
      return <div><label htmlFor={id}>{label}</label><input id={id} type="number" inputMode="decimal" step={f.step ?? 1} min={f.min} max={f.max} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className={inputCls} />{help}{err}</div>;
    case "select": {
      const opts: Option[] = f.options === "destinations" ? destinations : f.options.map((o) => ({ value: o, label: o }));
      return <div><label htmlFor={id}>{label}</label><select id={id} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className={inputCls}><option value="">Choose…</option>{opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>{help}{err}</div>;
    }
    case "checkbox":
      return <div><label className="flex min-h-11 items-center gap-3 text-sm font-medium text-heading"><input type="checkbox" className="size-5" checked={value === true} onChange={(e) => onChange(e.target.checked)} />{f.label}</label>{help}</div>;
    case "image":
      return <div><label htmlFor={id}>{label}</label><ImageInput id={id} value={String(value ?? "")} onChange={onChange} />{help}{err}</div>;
    case "lines":
      return <div><label htmlFor={id}>{label}</label><textarea id={id} rows={5} value={(Array.isArray(value) ? value : []).join("\n")} onChange={(e) => onChange(e.target.value.split("\n"))} className={`${inputCls} py-2`} />{help}{err}</div>;
    case "images": {
      const list = (Array.isArray(value) ? value : []) as string[];
      return (
        <fieldset><legend>{label}</legend>{help}
          <ul className="mt-2 space-y-3">
            {list.map((v, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="min-w-0 flex-1"><ImageInput id={`${id}-${i}`} value={v} onChange={(nv) => onChange(list.map((x, j) => (j === i ? nv : x)))} /></div>
                <button type="button" onClick={() => onChange(list.filter((_, j) => j !== i))} aria-label={`Remove image ${i + 1}`} className="min-h-11 rounded-full px-3 text-sm font-semibold text-discount">Remove</button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => onChange([...list, ""])} className="mt-3 min-h-11 rounded-full border border-primary px-5 text-sm font-semibold text-primary">+ Add image</button>
          {err}
        </fieldset>
      );
    }
    case "rows": {
      const rows = (Array.isArray(value) ? value : []) as Values[];
      return (
        <fieldset><legend>{label}</legend>{help}
          <ol className="mt-2 space-y-3">
            {rows.map((row, i) => (
              <li key={i} className="rounded-2xl border border-line bg-surface p-4">
                <div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold uppercase">#{i + 1}</span>
                  <span className="flex gap-1">
                    <button type="button" disabled={i === 0} onClick={() => { const c = [...rows]; [c[i - 1], c[i]] = [c[i], c[i - 1]]; onChange(c); }} aria-label="Move up" className="min-h-9 rounded-full px-3 text-sm disabled:opacity-30">↑</button>
                    <button type="button" disabled={i === rows.length - 1} onClick={() => { const c = [...rows]; [c[i + 1], c[i]] = [c[i], c[i + 1]]; onChange(c); }} aria-label="Move down" className="min-h-9 rounded-full px-3 text-sm disabled:opacity-30">↓</button>
                    <button type="button" onClick={() => onChange(rows.filter((_, j) => j !== i))} className="min-h-9 rounded-full px-3 text-sm font-semibold text-discount">Remove</button>
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {f.fields.map((sf) => (
                    <div key={sf.key} className={sf.type === "textarea" ? "sm:col-span-2" : ""}>
                      <FieldInput f={sf} value={row[sf.key]} path={`${path}.${i}.${sf.key}`} errors={errors} destinations={destinations} onChange={(nv) => onChange(rows.map((r, j) => (j === i ? { ...r, [sf.key]: nv } : r)))} />
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ol>
          <button type="button" onClick={() => onChange([...rows, blank(f.fields)])} className="mt-3 min-h-11 rounded-full border border-primary px-5 text-sm font-semibold text-primary">+ Add</button>
          {err}
        </fieldset>
      );
    }
  }
}

export default function EntityForm({ kind, slug, initial, destinations }: { kind: EntityKind; slug?: string; initial?: Values; destinations: Option[] }) {
  const router = useRouter();
  const schema = schemas[kind];
  const steps = schema.steps ?? [{ title: schema.label, keys: schema.fields.map((f) => f.key) }];
  const wizard = steps.length > 1;
  const isNew = !slug && kind !== "settings";
  const [values, setValues] = useState<Values>(() => {
    const v = { ...blank(schema.fields), ...(initial ?? {}) };
    // Items saved before drafts existed have no flag and count as published.
    if (schema.fields.some((f) => f.key === "published") && v.published === undefined) v.published = true;
    return v;
  });
  const [step, setStep] = useState(0);
  const [customSlug, setCustomSlug] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const top = useRef<HTMLHeadingElement>(null);

  const title = String(values[schema.titleKey] ?? "");
  const effectiveSlug = customSlug || slugify(title);
  const stepOfKey = (k: string) => steps.findIndex((st) => st.keys.includes(k.split(".")[0]));
  const badSteps = new Set(Object.keys(errors).map(stepOfKey).filter((n) => n >= 0));
  if (errors._slug) badSteps.add(0);
  const current = steps[step];
  const fields = schema.fields.filter((f) => current.keys.includes(f.key));

  function go(n: number) {
    setStep(Math.max(0, Math.min(steps.length - 1, n)));
    setTimeout(() => top.current?.focus(), 0);
  }

  async function save(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true); setMsg(""); setErrors({});
    try {
      const url = isNew ? `/api/admin/catalog/${kind}` : `/api/admin/catalog/${kind}/${kind === "settings" ? "site" : slug}`;
      const res = await fetch(url, {
        method: isNew ? "POST" : "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isNew ? { slug: effectiveSlug, data: values } : { data: values }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok) {
        if (isNew) { router.push(`/admin/c/${kind}/${j.slug}`); router.refresh(); return; }
        setMsg("Saved. The website is updated."); router.refresh();
      } else if (j.errors) {
        const errs = j.errors as Record<string, string>;
        setErrors(errs);
        const idx = Object.keys(errs).map((k) => (k === "_slug" ? 0 : stepOfKey(k))).filter((n) => n >= 0);
        if (idx.length) go(Math.min(...idx));
        setMsg(`Please fix ${Object.keys(errs).length} field(s)${wizard ? " (steps marked in red)" : ""}.`);
      } else setMsg(j.error ?? "Could not save.");
    } catch {
      setMsg("Network problem. Please try again.");
    }
    setBusy(false);
  }

  async function remove() {
    if (!slug || !confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setBusy(true); setMsg("");
    const res = await fetch(`/api/admin/catalog/${kind}/${slug}`, { method: "DELETE" }).catch(() => null);
    const j = await res?.json().catch(() => ({}));
    if (res?.ok) { router.push(`/admin/c/${kind}`); router.refresh(); return; }
    setMsg(j?.error ?? "Could not delete."); setBusy(false);
  }

  const last = step === steps.length - 1;
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (wizard && !last) go(step + 1); else save(); }} noValidate className="space-y-6">
      {wizard && (
        <ol className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0" aria-label="Steps">
          {steps.map((st, i) => (
            <li key={st.title}>
              <button type="button" onClick={() => go(i)} aria-current={i === step ? "step" : undefined}
                className={`flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-medium ${i === step ? "border-primary bg-primary text-white" : badSteps.has(i) ? "border-discount text-discount" : "border-line text-heading hover:border-primary"}`}>
                <span className={`flex size-6 items-center justify-center rounded-full text-xs ${i === step ? "bg-white/20" : "bg-surface"}`}>{i + 1}</span>{st.title}{badSteps.has(i) && <span aria-label="has errors">!</span>}
              </button>
            </li>
          ))}
        </ol>
      )}

      <div>
        <h2 ref={top} tabIndex={-1} className="text-xl outline-none">{wizard ? `Step ${step + 1} of ${steps.length}: ${current.title}` : schema.label}</h2>
        {current.hint && <p className="mt-1 text-sm">{current.hint}</p>}
      </div>

      {isNew && step === 0 && (
        <div>
          <label htmlFor="f-slug" className="text-sm font-medium text-heading">Web address</label>
          <div className="mt-1 flex items-center gap-2"><span className="text-sm">/{schema.publicPath}/</span>
            <input id="f-slug" value={customSlug || slugify(title)} onChange={(e) => setCustomSlug(slugify(e.target.value))} className={`${inputCls} mt-0`} /></div>
          <p className="mt-0.5 text-xs">Created from the title. It can&apos;t be changed after saving.</p>
          {errors._slug && <p role="alert" className="mt-1 text-sm text-discount">{errors._slug}</p>}
        </div>
      )}

      {fields.map((f) => (
        <FieldInput key={f.key} f={f} value={values[f.key]} path={f.key} errors={errors} destinations={destinations} onChange={(v) => setValues((p) => ({ ...p, [f.key]: v }))} />
      ))}

      {wizard && last && (
        <div className="rounded-2xl bg-surface p-5 text-sm">
          <p className="font-semibold text-heading">Ready to {isNew ? "create" : "save"} “{title || "Untitled"}”?</p>
          <p className="mt-1">{isNew ? `It will appear at /${schema.publicPath}/${effectiveSlug || "…"}` : "Changes go live on the website as soon as you save."}{values.published === false ? " It is a draft, so visitors won't see it." : ""}</p>
          {badSteps.size > 0 && <p className="mt-2 font-semibold text-discount">Some steps still have errors: {[...badSteps].map((n) => steps[n].title).join(", ")}.</p>}
        </div>
      )}

      <div className="sticky bottom-14 z-20 -mx-4 flex flex-wrap items-center gap-3 border-t border-line bg-white px-4 py-3 md:bottom-0">
        {wizard && <button type="button" onClick={() => go(step - 1)} disabled={step === 0 || busy} className="min-h-12 rounded-full border border-primary px-6 font-semibold text-primary disabled:opacity-40">Back</button>}
        {wizard && !last && <button type="submit" className="min-h-12 rounded-full bg-primary px-8 font-semibold text-white hover:bg-primary-dark">Next</button>}
        {(!wizard || last) ? (
          <button type="submit" disabled={busy} className="min-h-12 rounded-full bg-accent px-8 font-semibold text-heading hover:brightness-95 disabled:opacity-60">{busy ? "Saving…" : isNew ? "Create" : "Save changes"}</button>
        ) : (
          <button type="button" onClick={() => save()} disabled={busy} className="min-h-12 rounded-full border border-line px-6 text-sm font-semibold text-heading disabled:opacity-60">{busy ? "Saving…" : isNew ? "Create now" : "Save"}</button>
        )}
        {!isNew && kind !== "settings" && kind !== "page" && <button type="button" onClick={remove} disabled={busy} className="min-h-12 rounded-full border border-discount px-6 font-semibold text-discount disabled:opacity-60">Delete</button>}
        {msg && <span role="status" className="text-sm">{msg}</span>}
      </div>
    </form>
  );
}
