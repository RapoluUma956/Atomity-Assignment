import { useState, useEffect } from "react";

const CACHE_NAME  = "atomity-v1";     
const STALE_MS    = 5 * 60 * 1000;                 // 5 minutes
const API_BASE    = "https://jsonplaceholder.typicode.com/posts";

export type FetchStatus = "idle" | "loading" | "success" | "error";

export function useData(cacheKey: string) {
  const [seedOffset, setSeedOffset] = useState<number>(0);
  const [status, setStatus]         = useState<FetchStatus>("idle");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");

      // Derive a stable post id from the cache key
      const postId = (cacheKey.length % 100) + 1;
      const url    = `${API_BASE}/${postId}`;

      try {
        const cache = await caches.open(CACHE_NAME);

        const cachedResponse = await cache.match(url);

        if (cachedResponse) {
          const cachedAt = cachedResponse.headers.get("x-cached-at");
          const age      = Date.now() - Number(cachedAt);

          if (age < STALE_MS) {
            const data = await cachedResponse.json();
            if (!cancelled) {
              setSeedOffset((data.id * 7) % 100);
              setStatus("success");
            }
            return; 
          }

          
          await cache.delete(url);
        }

        
        const networkResponse = await fetch(url);
        if (!networkResponse.ok) throw new Error("Network error");

        const data = await networkResponse.json();

        const responseToCache = new Response(JSON.stringify(data), {
          headers: {
            "Content-Type":  "application/json",
            "x-cached-at":   String(Date.now()), 
          },
        });

        await cache.put(url, responseToCache);

        if (!cancelled) {
          setSeedOffset((data.id * 7) % 100);
          setStatus("success");
        }

      } catch {
        if (!cancelled) {
          setSeedOffset(0);
          setStatus("error");
        }
      }
    }

    load();

    
    return () => { cancelled = true; };

  }, [cacheKey]);

  return { seedOffset, status };
}