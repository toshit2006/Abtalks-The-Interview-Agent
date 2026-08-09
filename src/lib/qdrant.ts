/**
 * Server-side Qdrant Vector Database integration.
 * Communicates with Qdrant REST API using native fetch.
 * Provides vector storage and semantic retrieval (RAG) for curriculum & interview session context.
 */

const VECTOR_DIM = 64;

export type QdrantPoint = {
  id: string | number;
  vector: number[];
  payload: Record<string, unknown>;
};

export type QdrantSearchResult = {
  id: string | number;
  score: number;
  payload: Record<string, unknown>;
};

export function qdrantEnabled(): boolean {
  return Boolean(process.env["QDRANT_URL"]?.trim());
}

function getQdrantUrl(): string {
  const raw = process.env["QDRANT_URL"]?.trim() || "";
  return raw.replace(/\/+$/, "");
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  const apiKey = process.env["QDRANT_API_KEY"]?.trim();
  if (apiKey) {
    headers["api-key"] = apiKey;
  }
  return headers;
}

/**
 * Lightweight, zero-dependency normalized text vectorizer (Cosine-compatible).
 * Hashes n-grams into a fixed float32 vector space for local semantic embedding.
 */
export function generateTextEmbedding(text: string, dim = VECTOR_DIM): number[] {
  const vec = new Float64Array(dim);
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
  for (const w of words) {
    let h = 0;
    for (let i = 0; i < w.length; i++) h = (h * 31 + w.charCodeAt(i)) | 0;
    const idx = Math.abs(h) % dim;
    vec[idx] = (vec[idx] ?? 0) + 1;
  }
  const norm = Math.hypot(...vec) || 1;
  return Array.from(vec, (v) => Number((v / norm).toFixed(6)));
}

/** Ensures a Qdrant collection exists before writing or searching. */
export async function ensureCollection(
  collectionName: string,
  vectorSize = VECTOR_DIM,
): Promise<boolean> {
  if (!qdrantEnabled()) return false;
  const baseUrl = getQdrantUrl();

  try {
    const getRes = await fetch(`${baseUrl}/collections/${collectionName}`, {
      headers: getHeaders(),
    });
    if (getRes.ok) return true;

    // Create collection
    const putRes = await fetch(`${baseUrl}/collections/${collectionName}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({
        vectors: {
          size: vectorSize,
          distance: "Cosine",
        },
      }),
    });

    if (!putRes.ok) {
      console.error(`Qdrant create collection failed: ${await putRes.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Qdrant collection check/creation failed:", err);
    return false;
  }
}

/** Converts arbitrary string keys into valid Qdrant point IDs (unsigned integers or UUIDs). */
export function stringToPointId(id: string | number): number | string {
  if (typeof id === "number") return Math.abs(Math.floor(id));
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) return id;

  let hash = 5381;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 33) ^ id.charCodeAt(i);
  }
  return Math.abs(hash >>> 0);
}

/** Upsert points into a Qdrant vector collection. */
export async function upsertPoints(
  collectionName: string,
  points: QdrantPoint[],
): Promise<boolean> {
  if (!qdrantEnabled() || !points.length) return false;
  const baseUrl = getQdrantUrl();

  const sanitizedPoints = points.map((p) => ({
    ...p,
    id: stringToPointId(p.id),
  }));

  try {
    const res = await fetch(`${baseUrl}/collections/${collectionName}/points?wait=true`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ points: sanitizedPoints }),
    });

    if (!res.ok) {
      console.error(`Qdrant upsert error ${res.status}: ${await res.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Qdrant upsert failed:", err);
    return false;
  }
}

/** Search similar vector points in Qdrant for semantic RAG. */
export async function searchSimilarContext(
  collectionName: string,
  queryText: string,
  limit = 3,
): Promise<QdrantSearchResult[]> {
  if (!qdrantEnabled() || !queryText.trim()) return [];
  const baseUrl = getQdrantUrl();
  const vector = generateTextEmbedding(queryText);

  try {
    const res = await fetch(`${baseUrl}/collections/${collectionName}/points/search`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        vector,
        limit,
        with_payload: true,
      }),
    });

    if (!res.ok) {
      console.error(`Qdrant search error ${res.status}: ${await res.text()}`);
      return [];
    }

    const data = (await res.json()) as {
      result?: { id: string | number; score: number; payload?: Record<string, unknown> }[];
    };
    return (
      data.result?.map((item) => ({
        id: item.id,
        score: item.score,
        payload: item.payload ?? {},
      })) ?? []
    );
  } catch (err) {
    console.error("Qdrant search failed:", err);
    return [];
  }
}
