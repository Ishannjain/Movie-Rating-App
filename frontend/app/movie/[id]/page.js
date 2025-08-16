'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function MoviePage() {
  const { id } = useParams();   // safer than relying on props
  const [movie, setMovie] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!id) return; // wait until id is available
    const run = async () => {
      try {
        const res = await fetch(`/api/movie/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load movie");
        setMovie(data);
      } catch (e) {
        setErr(e.message);
      }
    };
    run();
  }, [id]);

  if (err) {
    return (
      <main style={{ padding: 24 }}>
        <p style={{ color: "red" }}>{err}</p>
      </main>
    );
  }

  if (!movie) {
    return (
      <main style={{ padding: 24 }}>
        <p>Loading…</p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <Link href="/" style={{ color: "#2563eb", fontSize: 14 }}>← Back</Link>
      <div style={{ marginTop: 16, display: "flex", gap: 16 }}>
        <div>
          <img
            src={movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x445?text=No+Image"}
            alt={movie.Title}
            style={{ width: 300, borderRadius: 12 }}
          />
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>
            {movie.Title} ({movie.Year})
          </h1>
          <p style={{ opacity: 0.8 }}>{movie.Rated} • {movie.Runtime} • {movie.Genre}</p>
          <p style={{ marginTop: 12 }}>{movie.Plot}</p>
          <p style={{ marginTop: 8, opacity: 0.8 }}>Director: {movie.Director}</p>
          <p style={{ opacity: 0.8 }}>Actors: {movie.Actors}</p>
          <p style={{ marginTop: 8, opacity: 0.8 }}>IMDb Rating: {movie.imdbRating}</p>
        </div>
        <div>
            {results.length > 0 && results.length < totalResults && (
  <button onClick={loadMore}>Load More</button>
)}

        </div>
      </div>
      
    </main>
  );
}
