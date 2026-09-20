import { getAIConfig, type AIConfig } from "./config";
import { randomUUID } from "crypto";

/**
 * Minimal client for the Enthusiast REST API (Django REST Framework, `Authorization: Token <key>`).
 * Conversation flow: POST /api/conversations {agent_id} -> POST /api/conversations/{id}
 * {data_set_id, question_message} -> poll /api/task_status/{task}/ -> GET /api/conversations/{id}.
 */

export interface EnthusiastAgent {
  id: number;
  name: string;
  dataset: number;
  agent_type: string;
}

export interface EnthusiastHistoryItem {
  id: number;
  text: string;
  type: "human" | "ai" | string;
}

export interface EnthusiastConversation {
  id: number;
  history: EnthusiastHistoryItem[];
  agent: EnthusiastAgent;
}

let cachedConfig: AIConfig | null = null;

function getConfig(): AIConfig {
  if (!cachedConfig) cachedConfig = getAIConfig();
  return cachedConfig;
}

export function resetClientCacheForTests(): void {
  cachedConfig = null;
  cachedAgent = null;
}

export function generateCorrelationId(): string {
  return randomUUID();
}

async function enthusiastFetch(path: string, options: RequestInit = {}, timeoutMs?: number): Promise<Response> {
  const config = getConfig();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (config.enthusiastToken) headers["Authorization"] = `Token ${config.enthusiastToken}`;

  return fetch(`${config.enthusiastUrl}${path}`, {
    ...options,
    headers,
    signal: AbortSignal.timeout(timeoutMs ?? config.searchTimeoutMs),
  });
}

/** True when Enthusiast is selected as the AI backend and a token is configured. */
export function enthusiastBackendEnabled(): boolean {
  const c = getConfig();
  return c.backend === "enthusiast" && Boolean(c.enthusiastToken);
}

export async function checkHealth(): Promise<{
  status: "ok" | "error";
  details: string;
  agent?: { id: number; name: string; type: string };
}> {
  try {
    const response = await enthusiastFetch("/api/config");
    if (!response.ok) {
      return { status: "error", details: `Enthusiast API returned ${response.status}` };
    }
    const agent = await resolveAgent().catch(() => null);
    return {
      status: "ok",
      details: agent
        ? "Enthusiast API reachable, product-search agent found"
        : "Enthusiast API reachable, but no product-search agent is configured",
      ...(agent ? { agent: { id: agent.id, name: agent.name, type: agent.agent_type } } : {}),
    };
  } catch (error) {
    return {
      status: "error",
      details: `Enthusiast API unreachable: ${error instanceof Error ? error.message : "unknown"}`,
    };
  }
}

let cachedAgent: EnthusiastAgent | null = null;

/** The agent used for conversations: ENTHUSIAST_AGENT_ID, else the first product-search agent. */
export async function resolveAgent(): Promise<EnthusiastAgent> {
  if (cachedAgent) return cachedAgent;
  const cfg = getConfig();
  let datasetId = cfg.enthusiastDatasetId;
  if (!datasetId) {
    const ds = await enthusiastFetch("/api/data_sets");
    if (!ds.ok) throw new Error(`Failed to list data sets: ${ds.status}`);
    const dsData = await ds.json();
    datasetId = (dsData.results || dsData)[0]?.id;
    if (!datasetId) throw new Error("No Enthusiast data set available");
  }
  const response = await enthusiastFetch(`/api/agents?dataset=${datasetId}`);
  if (!response.ok) throw new Error(`Failed to list agents: ${response.status}`);
  const data = await response.json();
  const agents: EnthusiastAgent[] = (data.results || data).filter((a: any) => !a.deleted_at);
  const wanted = cfg.enthusiastAgentId;
  const agent = wanted
    ? agents.find((a) => a.id === wanted)
    : agents.find((a) => a.agent_type === "enthusiast-agent-product-search");
  if (!agent) throw new Error("No Enthusiast product-search agent available");
  cachedAgent = agent;
  return agent;
}

export async function createConversation(agentId: number): Promise<EnthusiastConversation> {
  const response = await enthusiastFetch("/api/conversations", {
    method: "POST",
    body: JSON.stringify({ agent_id: agentId }),
  });
  if (!response.ok) throw new Error(`Failed to create conversation: ${response.status}`);
  return response.json();
}

export async function getConversation(conversationId: number): Promise<EnthusiastConversation> {
  const response = await enthusiastFetch(`/api/conversations/${conversationId}`);
  if (!response.ok) throw new Error(`Failed to get conversation: ${response.status}`);
  return response.json();
}

async function askQuestion(conversationId: number, dataSetId: number, question: string): Promise<string> {
  const response = await enthusiastFetch(`/api/conversations/${conversationId}`, {
    method: "POST",
    body: JSON.stringify({ data_set_id: dataSetId, question_message: question }),
  });
  if (!response.ok) throw new Error(`Failed to ask question: ${response.status}`);
  return (await response.json()).task_id;
}

async function waitForTask(taskId: string, deadline: number): Promise<void> {
  while (Date.now() < deadline) {
    const response = await enthusiastFetch(`/api/task_status/${taskId}/`);
    if (!response.ok) throw new Error(`Failed to get task status: ${response.status}`);
    const { state } = await response.json();
    if (state === "SUCCESS") return;
    if (state === "FAILURE" || state === "REVOKED") throw new Error(`Enthusiast task ${state.toLowerCase()}`);
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("Enthusiast agent timed out");
}

export interface AgentAnswer {
  conversationId: number;
  reply: string;
  agent: EnthusiastAgent;
}

/** Sends one message to the Enthusiast agent (new conversation unless `conversationId` is given). */
export async function askAgent(
  question: string,
  opts: { conversationId?: number; timeoutMs?: number } = {}
): Promise<AgentAnswer> {
  const deadline = Date.now() + (opts.timeoutMs ?? getConfig().agentTimeoutMs);
  const agent = await resolveAgent();
  const conversationId = opts.conversationId ?? (await createConversation(agent.id)).id;

  const taskId = await askQuestion(conversationId, agent.dataset, question);
  await waitForTask(taskId, deadline);

  const conversation = await getConversation(conversationId);
  const reply = [...conversation.history].reverse().find((m) => m.type === "ai")?.text;
  if (!reply) throw new Error("Enthusiast agent returned no reply");
  return { conversationId, reply, agent };
}
