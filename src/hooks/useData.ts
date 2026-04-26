import { useState, useEffect } from "react";

interface CacheEntry {
  seedOffset: number;
  fetchedAt:  number;
}


const cache = new Map<string, CacheEntry>();
const STALE_MS = 5 * 60 * 1000; // 5 minutes

export type FetchState = "idle" | "loading" | "success" | "error";

export function useData(cacheKey: string) {
  const [seedOffset, setSeedOffset] = useState<number>(0);
  const [status, setStatus]         = useState<FetchState>("idle");

  useEffect(() => {
    const cached = cache.get(cacheKey);
    const now    = Date.now();

    // Cache hit and not stale → instant, no request
    if (cached && now - cached.fetchedAt < STALE_MS) {
      setSeedOffset(cached.seedOffset);
      setStatus("success");
      return;
    }

    // Cache miss or stale → fetch
    setStatus("loading");

    // JSONPlaceholder: fetch a post whose id is used as a seed offset
    const id = (cacheKey.length % 100) + 1; // derive a stable id from key
    fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then((data: { id: number }) => {
        const offset = (data.id * 7) % 100; // deterministic numeric offset
        cache.set(cacheKey, { seedOffset: offset, fetchedAt: Date.now() });
        setSeedOffset(offset);
        setStatus("success");
      })
      .catch(() => {
        // On error: fall back to 0 offset so the UI still renders
        setSeedOffset(0);
        setStatus("error");
      });
  }, [cacheKey]);

  return { seedOffset, status };
}