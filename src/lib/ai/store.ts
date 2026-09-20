import fs from "fs";
import os from "os";
import path from "path";
import type { EnrichmentProposal } from "./types";

export interface SeoOverride {
  seo_title?: string;
  seo_description?: string;
  seo_tags?: string[];
  attributes?: Record<string, string>;
  categories?: string[];
  proposal_id: string;
}

export interface AuditEntry {
  at: string;
  actor: string;
  action: string;
  product_id?: string;
  proposal_id?: string;
  detail?: string;
}

export interface BotVisit {
  at: string;
  bot: string;
  user_agent: string;
  path: string;
}

interface StoreShape {
  proposals: Record<string, EnrichmentProposal>;
  seo: Record<string, SeoOverride>;
  /** Description before the first approved enrichment, used for rollback. */
  originalDescriptions: Record<string, string>;
  audit: AuditEntry[];
  botVisits: BotVisit[];
}

const FILE = path.join(process.env.DATA_DIR || path.join(os.tmpdir(), "eshop-data"), "store.json");
const g = globalThis as unknown as { __eshopStore?: StoreShape };

function empty(): StoreShape {
  return { proposals: {}, seo: {}, originalDescriptions: {}, audit: [], botVisits: [] };
}

function load(): StoreShape {
  try {
    return { ...empty(), ...JSON.parse(fs.readFileSync(FILE, "utf8")) };
  } catch {
    return empty();
  }
}

export function getStore(): StoreShape {
  if (!g.__eshopStore) g.__eshopStore = load();
  return g.__eshopStore;
}

/** Best-effort persistence: the demo keeps working when the disk is not writable. */
export function saveStore(): void {
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(getStore()));
  } catch {
    /* ignore */
  }
}

export function audit(entry: Omit<AuditEntry, "at">): void {
  const s = getStore();
  s.audit.unshift({ at: new Date().toISOString(), ...entry });
  s.audit = s.audit.slice(0, 500);
  saveStore();
}

export function resetStoreForTests(): void {
  g.__eshopStore = empty();
}
