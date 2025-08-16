'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function MoviePage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [err, setErr] = useState("");
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchMovieData = async () => {
      try {
        const res = await fetch(`/api/movie/${id}`);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (data.Response === 'False') {
          throw new Error(data.Error || "Failed to load movie");
        }
        
        setMovie(data);
        
        if (data.Genre) {
          fetchRelatedMovies(data.Genre);
        }
      } catch (e) {
        console.error("Movie fetch error:", e);
        setErr(e.message || "Failed to load movie. Please check your internet connection and try again.");
      }
    };
    
    fetchMovieData();
  }, [id]);

  const fetchRelatedMovies = async (genre) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/movies?genre=${genre}&limit=20`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.Search) {
        setRelatedMovies(data.Search);
        setFilteredMovies(data.Search);
      } else {
        setRelatedMovies([]);
        setFilteredMovies([]);
      }
    } catch (e) {
      console.error("Failed to fetch related movies:", e);
      setRelatedMovies([]);
      setFilteredMovies([]);
      // Show user-friendly error message
      setErr("Unable to load related movies at the moment. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = relatedMovies;
    
    if (selectedGenre !== "all") {
      filtered = filtered.filter(movie => 
        movie.Genre && movie.Genre.toLowerCase().includes(selectedGenre.toLowerCase())
      );
    }
    
    if (minRating > 0) {
      filtered = filtered.filter(movie => 
        movie.imdbRating && parseFloat(movie.imdbRating) >= minRating
      );
    }
    
    setFilteredMovies(filtered);
  }, [selectedGenre, minRating, relatedMovies]);

  const getUniqueGenres = () => {
    const genres = new Set();
    relatedMovies.forEach(movie => {
      if (movie.Genre) {
        movie.Genre.split(', ').forEach(genre => genres.add(genre.trim()));
      }
    });
    return Array.from(genres);
  };

  const resetFilters = () => {
    setSelectedGenre("all");
    setMinRating(0);
  };

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
    <main style={{ minHeight: "100vh", padding: 24, maxWidth: 1200, margin: "0 auto" }}>
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
      </div>

      <div style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Related Movies</h2>
        
        {relatedMovies.length === 0 && !loading ? (
          <p style={{ textAlign: "center", opacity: 0.7, padding: 32 }}>
            No related movies available at the moment.
          </p>
        ) : (
          <>
            <div style={{ 
              display: "flex", 
              gap: 16, 
              marginBottom: 24, 
              padding: 16, 
              backgroundColor: "#f8f9fa", 
              borderRadius: 8,
              flexWrap: "wrap"
            }}>
              <div>
                <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Genre:</label>
                <select 
                  value={selectedGenre} 
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  style={{ 
                    padding: "8px 12px", 
                    borderRadius: 4, 
                    border: "1px solid #ddd",
                    minWidth: 120
                  }}
                >
                  <option value="all">All Genres</option>
                  {getUniqueGenres().map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Min Rating:</label>
                <select 
                  value={minRating} 
                  onChange={(e) => setMinRating(parseFloat(e.target.value))}
                  style={{ 
                    padding: "8px 12px", 
                    borderRadius: 4, 
                    border: "1px solid #ddd",
                    minWidth: 120
                  }}
                >
                  <option value={0}>Any Rating</option>
                  <option value={7}>7.0+</option>
                  <option value={8}>8.0+</option>
                  <option value={9}>9.0+</option>
                </select>
              </div>
              
              <div style={{ display: "flex", alignItems: "end" }}>
                <button 
                  onClick={resetFilters}
                  style={{ 
                    padding: "8px 16px", 
                    backgroundColor: "#6b7280", 
                    color: "white", 
                    border: "none", 
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                >
                  Clear Filters
                </button>
              </div>
            </div>

            <p style={{ marginBottom: 16, opacity: 0.7 }}>
              Showing {filteredMovies.length} of {relatedMovies.length} movies
            </p>

            {loading ? (
              <p>Loading related movies...</p>
            ) : filteredMovies.length > 0 ? (
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
                gap: 16 
              }}>
                {filteredMovies.map((relatedMovie) => (
                  <Link 
                    key={relatedMovie.imdbID} 
                    href={`/movie/${relatedMovie.imdbID}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div style={{ 
                      border: "1px solid #e5e7eb", 
                      borderRadius: 8, 
                      overflow: "hidden",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      cursor: "pointer"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    >
                      <img
                        src={relatedMovie.Poster !== "N/A" ? relatedMovie.Poster : "https://via.placeholder.com/200x300?text=No+Image"}
                        alt={relatedMovie.Title}
                        style={{ width: "100%", height: 300, objectFit: "cover" }}
                      />
                      <div style={{ padding: 12 }}>
                        <h3 style={{ 
                          fontSize: 14, 
                          fontWeight: 600, 
                          marginBottom: 4,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}>
                          {relatedMovie.Title}
                        </h3>
                        <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>
                          {relatedMovie.Year}
                        </p>
                        {relatedMovie.imdbRating && (
                          <p style={{ fontSize: 12, color: "#f59e0b", fontWeight: 500 }}>
                            ⭐ {relatedMovie.imdbRating}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: "center", opacity: 0.7, padding: 32 }}>
                No movies found with the selected filters.
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
