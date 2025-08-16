'use client';

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const onSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setErr("");
    setResults([]);
    setPage(1);
    setTotalResults(0);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&page=1`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");

      const uniqueResults = Array.from(
        new Map((data.Search || []).map(item => [item.imdbID, item])).values()
      );

      setResults(uniqueResults);
      setTotalResults(parseInt(data.totalResults || 0, 10));
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    const nextPage = page + 1;
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&page=${nextPage}`);
      const data = await res.json();
      if (data.Search) {
        const combined = [...results, ...data.Search];
        const uniqueResults = Array.from(
          new Map(combined.map(item => [item.imdbID, item])).values()
        );

        setResults(uniqueResults);
        setPage(nextPage);
      }
    } catch (e) {
      setErr(e.message);
    }
  };

  const cardStyle = {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 12
  };

  return (
    <main style={{ minHeight: "100vh", padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>🎬 Movie Search</h1>

      <form onSubmit={onSearch} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try: Inception, Batman, Interstellar..."
          style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb" }}
        />
        <button
          type="submit"
          style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #111827", background: "#111827", color: "white" }}
        >
          Search
        </button>
      </form>

      {loading && <p>Loading…</p>}
      {err && <p style={{ color: "#b91c1c" }}>{err}</p>}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: 12
      }}>
        {results.map((m) => (
          <div key={m.imdbID} style={cardStyle}>
            <img
              src={m.Poster !== "N/A" ? m.Poster : "https://via.placeholder.com/300x445?text=No+Image"}
              alt={m.Title}
              style={{ width: "100%", height: "auto", borderRadius: 8, marginBottom: 8 }}
            />
            <div style={{ fontWeight: 600 }}>{m.Title}</div>
            <div style={{ opacity: 0.7, fontSize: 14 }}>{m.Year} • {m.Type}</div>
            <Link href={`/movie/${m.imdbID}`} style={{ fontSize: 14, color: "#2563eb" }}>
              Details →
            </Link>
          </div>
        ))}
      </div>

      {results.length > 0 && results.length < totalResults && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button
            onClick={loadMore}
            style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #111827", background: "#111827", color: "white" }}
          >
            Load More
          </button>
        </div>
      )}

      {!loading && results.length === 0 && query && <p>No results found</p>}
    </main>
  );
}
