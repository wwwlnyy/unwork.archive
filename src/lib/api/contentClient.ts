const CONTENT_BASE_URL = "https://ai-image-api.fly.dev";

export type ContentType = "informational" | "experiential";
export type ItemStatus = "pending" | "processing" | "done" | "failed";
export type SearchMode = "informational" | "experiential" | "browse" | "none";

export interface Attribute {
  key: string;
  value: string;
}

export interface Tag {
  name: string;
  category: string;
}

export interface SavedItem {
  id: string;
  user_id: string;
  url: string;
  status: ItemStatus;
  error?: string | null;
  platform?: string | null;
  title?: string | null;
  thumbnail?: string | null;
  author?: string | null;
  content_type?: ContentType | null;
  category?: string | null;
  summary?: string | null;
  key_points: string[];
  attributes: Attribute[];
  tags: Tag[];
  entities: { name: string; note: string }[];
  extra: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SearchAnswerSection {
  title: string;
  lines: string[];
}

export interface SearchAnswer {
  intro: string;
  sections: SearchAnswerSection[];
}

export interface SearchResponse {
  query: string;
  mode: SearchMode;
  answer: SearchAnswer | null;
  items: SavedItem[];
}

export class SessionExpiredError extends Error {
  constructor() {
    super("로그인이 만료되었어요. 다시 로그인해주세요.");
    this.name = "SessionExpiredError";
  }
}

function authHeaders(accessToken: string): Record<string, string> {
  return { Authorization: `Bearer ${accessToken}` };
}

async function parseJsonOrThrow<T>(
  response: Response,
  action: string,
): Promise<T> {
  if (response.status === 401) {
    throw new SessionExpiredError();
  }
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${action} 실패 (${response.status}): ${body}`);
  }
  return response.json();
}

export async function search(
  query: string,
  accessToken: string,
): Promise<SearchResponse> {
  const response = await fetch(`${CONTENT_BASE_URL}/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(accessToken),
    },
    body: JSON.stringify({ query }),
  });
  return parseJsonOrThrow(response, "검색");
}

export async function scrap(
  url: string,
  accessToken: string,
): Promise<SavedItem> {
  const response = await fetch(`${CONTENT_BASE_URL}/scrap`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(accessToken),
    },
    body: JSON.stringify({ url }),
  });
  return parseJsonOrThrow(response, "스크랩 저장");
}

export interface ScrapStats {
  total: number;
  by_platform: Record<string, number>;
  by_category: Record<string, number>;
  by_status: Record<string, number>;
}

export interface DeleteItemsResponse {
  deleted: number;
}

export async function getStats(accessToken: string): Promise<ScrapStats> {
  const response = await fetch(`${CONTENT_BASE_URL}/stats`, {
    headers: authHeaders(accessToken),
  });
  return parseJsonOrThrow(response, "스크랩 통계 조회");
}

export async function getItems(
  accessToken: string,
  limit = 100,
): Promise<SavedItem[]> {
  const response = await fetch(`${CONTENT_BASE_URL}/items?limit=${limit}`, {
    headers: authHeaders(accessToken),
  });
  return parseJsonOrThrow(response, "스크랩 목록 조회");
}

export async function getItem(
  id: string,
  accessToken: string,
): Promise<SavedItem> {
  const response = await fetch(
    `${CONTENT_BASE_URL}/items/${encodeURIComponent(id)}`,
    {
      headers: authHeaders(accessToken),
    },
  );
  return parseJsonOrThrow(response, "스크랩 상세 조회");
}

export async function deleteItems(
  ids: string[],
  accessToken: string,
): Promise<DeleteItemsResponse> {
  const response = await fetch(`${CONTENT_BASE_URL}/items/delete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(accessToken),
    },
    body: JSON.stringify({ ids }),
  });
  return parseJsonOrThrow(response, "스크랩 삭제");
}

export function imageProxyUrl(url: string): string {
  return `${CONTENT_BASE_URL}/img?url=${encodeURIComponent(url)}`;
}

const PLATFORM_LABELS: Record<string, string> = {
  youtube: "YouTube",
  instagram: "Instagram",
  web: "Web",
};

export function platformLabel(platform?: string | null): string {
  if (!platform) {
    return "Web";
  }
  return PLATFORM_LABELS[platform] ?? platform;
}
