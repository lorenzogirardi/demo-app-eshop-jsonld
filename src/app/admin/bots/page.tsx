"use client";

import { useCallback, useEffect, useState } from "react";
import AdminTokenGate from "@/components/AdminTokenGate";
import { useAdminFetch } from "@/components/useAdminFetch";

interface KnownBot {
  token: string;
  vendor: string;
  kind: "search" | "user-agent" | "training";
  purpose: string;
}
interface Visit {
  at: string;
  bot: string;
  user_agent: string;
  path: string;
}

const KIND_LABEL: Record<KnownBot["kind"], string> = {
  search: "Search index",
  "user-agent": "On user request",
  training: "Training",
};

export default function BotsPage() {
  const { token, saveToken, adminFetch, unauthorized } = useAdminFetch();
  const [known, setKnown] = useState<KnownBot[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const res = await adminFetch("/api/ai/bots");
    if (res.ok) {
      const data = await res.json();
      setKnown(data.known_bots);
      setCounts(data.counts);
      setVisits(data.visits);
    }
    setLoaded(true);
  }, [adminFetch]);

  useEffect(() => {
    load();
  }, [load, token]);

  if (unauthorized) return <AdminTokenGate onSubmit={saveToken} />;
  if (!loaded) return <span className="loading loading-spinner loading-lg" />;

  return (
    <div className="mx-auto max-w-6xl p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">AI bot activity</h1>
        <button className="btn btn-sm" onClick={load}>
          Refresh
        </button>
      </div>
      <p className="mb-6 max-w-prose text-sm opacity-70">
        Visits to product pages by known AI crawlers and agents, detected from the User-Agent header. Try it:{" "}
        <code>curl -A &quot;OAI-SearchBot&quot; http://localhost:3000/products/15</code>. The user agent can be forged, so
        treat these numbers as indicative.
      </p>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Bot</th>
              <th>Vendor</th>
              <th>Type</th>
              <th>Purpose</th>
              <th className="text-right">Visits</th>
            </tr>
          </thead>
          <tbody>
            {known.map((b) => (
              <tr key={b.token}>
                <td className="font-mono text-xs">{b.token}</td>
                <td>{b.vendor}</td>
                <td>
                  <span className="badge badge-outline">{KIND_LABEL[b.kind]}</span>
                </td>
                <td className="text-sm">{b.purpose}</td>
                <td className="text-right tabular-nums">{counts[b.token] ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mb-2 mt-8 text-xl font-bold">Recent visits</h2>
      {visits.length === 0 ? (
        <p className="text-sm opacity-70">No bot visits yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>When</th>
                <th>Bot</th>
                <th>Path</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((v, i) => (
                <tr key={i}>
                  <td className="whitespace-nowrap text-sm">{new Date(v.at).toLocaleString()}</td>
                  <td className="font-mono text-xs">{v.bot}</td>
                  <td className="font-mono text-xs">{v.path}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
