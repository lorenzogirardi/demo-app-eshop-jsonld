"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminTokenGate from "@/components/AdminTokenGate";
import { useAdminFetch } from "@/components/useAdminFetch";

const FIELDS = ["description", "seo_title", "seo_description", "seo_tags", "attributes", "categories"] as const;
type Field = (typeof FIELDS)[number];

const FIELD_LABEL: Record<Field, string> = {
  description: "Description",
  seo_title: "SEO title",
  seo_description: "SEO description",
  seo_tags: "SEO tags",
  attributes: "Attributes",
  categories: "Categories",
};

const CHECK_LABEL: Record<string, string> = {
  length_valid: "Lengths within limits",
  no_placeholder: "No placeholder text",
  category_coherent: "Categories allowed",
  grounded: "Only facts from the source",
};

interface Proposal {
  proposal_id: string;
  product_id: string;
  status: "draft" | "approved" | "rejected" | "reverted";
  proposed_values: Record<string, unknown>;
  original_values: Record<string, unknown>;
  validation: { auto_checks: Record<string, boolean>; issues: string[]; confidence_score: number };
  metadata: { generated_at: string; model: string };
  review?: { action: string; reviewed_at: string; notes?: string };
}
interface ProductRow {
  id: string;
  name: string;
  description_length: number;
  enriched: boolean;
}
interface AuditRow {
  at: string;
  actor: string;
  action: string;
  product_id?: string;
  detail?: string;
}

const STATUS_BADGE: Record<Proposal["status"], string> = {
  draft: "badge-warning",
  approved: "badge-success",
  rejected: "badge-error",
  reverted: "badge-ghost",
};

function asText(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (value && typeof value === "object")
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
  return value === undefined || value === null ? "" : String(value);
}

function ProposalCard({
  proposal,
  productName,
  onAction,
  busy,
}: {
  proposal: Proposal;
  productName: string;
  busy: boolean;
  onAction: (
    action: "approve" | "reject" | "revert",
    extra: { notes?: string; override?: boolean; edits?: Record<string, unknown> }
  ) => void;
}) {
  const [description, setDescription] = useState(String(proposal.proposed_values.description ?? ""));
  const [notes, setNotes] = useState("");
  const [override, setOverride] = useState(false);

  const checks = proposal.validation.auto_checks;
  const allPassed = Object.values(checks).every(Boolean);
  const descriptionEdited =
    proposal.proposed_values.description !== undefined && description !== proposal.proposed_values.description;
  const isDraft = proposal.status === "draft";

  return (
    <article className="card bg-base-200 shadow-md">
      <div className="card-body gap-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="card-title">
              {productName} <span className="text-sm font-normal opacity-60">#{proposal.product_id}</span>
            </h2>
            <p className="text-xs opacity-60">
              {new Date(proposal.metadata.generated_at).toLocaleString()} · {proposal.metadata.model}
            </p>
          </div>
          <span className={`badge ${STATUS_BADGE[proposal.status]}`}>{proposal.status}</span>
        </div>

        <ul className="flex flex-wrap gap-2 text-xs" aria-label="Automatic checks">
          {Object.entries(checks).map(([key, ok]) => (
            <li key={key} className={`badge ${ok ? "badge-success" : "badge-error"} badge-outline`}>
              {ok ? "Pass" : "Fail"} · {CHECK_LABEL[key] ?? key}
            </li>
          ))}
        </ul>
        {proposal.validation.issues.length > 0 && (
          <ul className="list-disc pl-5 text-sm text-error">
            {proposal.validation.issues.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        )}

        <div className="grid gap-4">
          {FIELDS.filter((f) => proposal.proposed_values[f] !== undefined).map((f) => {
            const original =
              f === "description"
                ? proposal.original_values.description
                : f === "categories"
                  ? proposal.original_values.categories
                  : undefined;
            return (
              <div key={f} className="grid gap-2 md:grid-cols-2">
                <div>
                  <h3 className="mb-1 text-sm font-semibold">{FIELD_LABEL[f]} · current</h3>
                  <p className="whitespace-pre-wrap rounded bg-base-300 p-2 text-sm">
                    {original !== undefined ? asText(original) : <span className="opacity-50">not set</span>}
                  </p>
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-semibold">{FIELD_LABEL[f]} · proposed</h3>
                  {f === "description" && isDraft ? (
                    <>
                      <label htmlFor={`desc-${proposal.proposal_id}`} className="sr-only">
                        Edit proposed description
                      </label>
                      <textarea
                        id={`desc-${proposal.proposal_id}`}
                        className="textarea textarea-bordered w-full text-sm"
                        rows={5}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                      {descriptionEdited && <p className="text-xs text-info">Edited: will be saved as “modified”.</p>}
                    </>
                  ) : (
                    <p className="whitespace-pre-wrap rounded bg-base-100 p-2 text-sm">
                      {asText(proposal.proposed_values[f])}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {isDraft && (
          <div className="grid gap-2">
            <label htmlFor={`notes-${proposal.proposal_id}`} className="sr-only">
              Review notes
            </label>
            <input
              id={`notes-${proposal.proposal_id}`}
              className="input input-bordered input-sm"
              placeholder="Review notes (optional)"
              value={notes}
              maxLength={500}
              onChange={(e) => setNotes(e.target.value)}
            />
            {!allPassed && (
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={override}
                  onChange={(e) => setOverride(e.target.checked)}
                />
                <span className="label-text">I checked the failed items and approve anyway</span>
              </label>
            )}
            <div className="card-actions justify-end">
              <button
                className="btn btn-error btn-sm"
                disabled={busy}
                onClick={() => onAction("reject", { notes })}
              >
                Reject
              </button>
              <button
                className="btn btn-success btn-sm"
                disabled={busy || (!allPassed && !override)}
                onClick={() =>
                  onAction("approve", {
                    notes,
                    override: override || undefined,
                    edits: descriptionEdited ? { description } : undefined,
                  })
                }
              >
                Approve and publish
              </button>
            </div>
          </div>
        )}

        {proposal.status === "approved" && (
          <div className="card-actions items-center justify-between">
            <p className="text-sm opacity-70">Live on the product page. Reverting restores the original description.</p>
            <button className="btn btn-outline btn-sm" disabled={busy} onClick={() => onAction("revert", {})}>
              Revert
            </button>
          </div>
        )}
        {proposal.review?.notes && proposal.status !== "draft" && (
          <p className="text-sm opacity-70">Notes: {proposal.review.notes}</p>
        )}
      </div>
    </article>
  );
}

export default function EnrichmentPage() {
  const { token, saveToken, adminFetch, unauthorized } = useAdminFetch();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [auditLog, setAuditLog] = useState<AuditRow[]>([]);
  const [llmOk, setLlmOk] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "info"; text: string } | null>(null);
  const [filter, setFilter] = useState<"draft" | "approved" | "all">("draft");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [fields, setFields] = useState<Set<Field>>(
    new Set<Field>(["description", "seo_title", "seo_description", "seo_tags"])
  );

  const load = useCallback(async () => {
    try {
      const res = await adminFetch("/api/ai/enrich");
      if (res.ok) {
        const data = await res.json();
        setProposals(data.proposals);
        setProducts(data.products);
        setAuditLog(data.audit);
        setLlmOk(data.llm_configured);
      } else if (res.status !== 401) {
        setMessage({ kind: "error", text: "Could not load proposals." });
      }
    } catch {
      setMessage({ kind: "error", text: "Could not reach the server." });
    } finally {
      setLoaded(true);
    }
  }, [adminFetch]);

  useEffect(() => {
    load();
  }, [load, token]);

  const nameOf = useMemo(() => new Map(products.map((p) => [p.id, p.name])), [products]);

  function toggle<T>(set: Set<T>, value: T, apply: (s: Set<T>) => void) {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    apply(next);
  }

  async function generate() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await adminFetch("/api/ai/enrich", {
        method: "POST",
        body: JSON.stringify({ product_ids: Array.from(selected), fields: Array.from(fields) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ kind: "error", text: data.error ?? "Generation failed." });
      } else {
        const failed: Array<{ product_id: string; error: string }> = data.errors ?? [];
        setMessage({
          kind: failed.length ? "error" : "info",
          text:
            `${data.proposals.length} proposal(s) created.` +
            (failed.length ? ` Failed: ${failed.map((f) => `#${f.product_id} (${f.error})`).join(", ")}` : ""),
        });
        setSelected(new Set());
        setFilter("draft");
      }
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function review(
    proposalId: string,
    action: "approve" | "reject" | "revert",
    extra: { notes?: string; override?: boolean; edits?: Record<string, unknown> }
  ) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await adminFetch("/api/ai/enrich", {
        method: "POST",
        body: JSON.stringify({ proposal_id: proposalId, action, ...extra }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage({ kind: "error", text: data.error ?? "Action failed." });
      } else {
        const done = {
          approve: "Approved and applied to the product.",
          reject: "Proposal rejected.",
          revert: "Reverted to the original.",
        };
        setMessage({ kind: "info", text: done[action] });
      }
      await load();
    } finally {
      setBusy(false);
    }
  }

  if (unauthorized) return <AdminTokenGate onSubmit={saveToken} />;
  if (!loaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  const shown = proposals.filter((p) => filter === "all" || p.status === filter);

  return (
    <div className="mx-auto max-w-6xl p-4">
      <h1 className="mb-2 text-3xl font-bold">AI catalog enrichment</h1>
      <p className="mb-6 max-w-prose text-sm opacity-70">
        The AI proposes better descriptions and SEO data using only what the product text already says. Nothing reaches
        the shop until you approve it, and every approval can be reverted.
      </p>

      {!llmOk && (
        <div role="alert" className="alert alert-warning mb-4">
          No LLM key configured: generation is unavailable.
        </div>
      )}
      {message && (
        <div role="status" className={`alert mb-4 ${message.kind === "error" ? "alert-error" : "alert-success"}`}>
          {message.text}
        </div>
      )}

      <section className="mb-8 rounded-xl border border-base-300 p-4" aria-labelledby="gen-title">
        <h2 id="gen-title" className="mb-3 text-xl font-bold">
          Generate proposals
        </h2>
        <fieldset className="mb-3">
          <legend className="mb-1 text-sm font-semibold">Fields</legend>
          <div className="flex flex-wrap gap-4">
            {FIELDS.map((f) => (
              <label key={f} className="label cursor-pointer gap-2 p-0">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={fields.has(f)}
                  onChange={() => toggle(fields, f, setFields)}
                />
                <span className="label-text">{FIELD_LABEL[f]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">Products ({selected.size} selected, max 20)</span>
          <button
            type="button"
            className="btn btn-xs"
            onClick={() =>
              setSelected(new Set(products.filter((p) => !p.enriched).slice(0, 20).map((p) => p.id)))
            }
          >
            First 20 not enriched
          </button>
          <button type="button" className="btn btn-xs" onClick={() => setSelected(new Set())}>
            Clear
          </button>
        </div>
        <ul className="mb-4 grid max-h-56 gap-1 overflow-y-auto rounded border border-base-300 p-2 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <li key={p.id}>
              <label className="label cursor-pointer justify-start gap-2 py-0.5">
                <input
                  type="checkbox"
                  className="checkbox checkbox-xs"
                  checked={selected.has(p.id)}
                  disabled={!selected.has(p.id) && selected.size >= 20}
                  onChange={() => toggle(selected, p.id, setSelected)}
                />
                <span className="label-text text-sm">
                  {p.name} {p.enriched && <span className="badge badge-success badge-xs">enriched</span>}
                </span>
              </label>
            </li>
          ))}
        </ul>
        <button
          className="btn btn-primary"
          disabled={busy || selected.size === 0 || fields.size === 0 || !llmOk}
          onClick={generate}
        >
          {busy ? <span className="loading loading-spinner loading-sm" /> : null}
          Generate {selected.size > 0 ? `for ${selected.size} product${selected.size > 1 ? "s" : ""}` : ""}
        </button>
      </section>

      <div role="tablist" className="tabs tabs-boxed mb-4 w-fit">
        {(["draft", "approved", "all"] as const).map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            className={`tab ${filter === f ? "tab-active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "draft" ? "To review" : f === "approved" ? "Live" : "All"} (
            {proposals.filter((p) => f === "all" || p.status === f).length})
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="py-8 text-center opacity-60">Nothing here yet. Select products above and generate proposals.</p>
      ) : (
        <div className="space-y-4">
          {shown.map((p) => (
            <ProposalCard
              key={p.proposal_id}
              proposal={p}
              productName={nameOf.get(p.product_id) ?? `Product ${p.product_id}`}
              busy={busy}
              onAction={(action, extra) => review(p.proposal_id, action, extra)}
            />
          ))}
        </div>
      )}

      <h2 className="mb-2 mt-10 text-xl font-bold">Audit trail</h2>
      {auditLog.length === 0 ? (
        <p className="text-sm opacity-60">No activity yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>When</th>
                <th>Who</th>
                <th>Action</th>
                <th>Product</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {auditLog.map((a, i) => (
                <tr key={i}>
                  <td className="whitespace-nowrap">{new Date(a.at).toLocaleString()}</td>
                  <td>{a.actor}</td>
                  <td>{a.action}</td>
                  <td>{a.product_id ? (nameOf.get(a.product_id) ?? `#${a.product_id}`) : ""}</td>
                  <td className="text-xs opacity-70">{a.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
