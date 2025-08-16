import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const OMDB_API_KEY = process.env.OMDB_API_KEY;

// Health check
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Search movies
// GET /api/search?q=inception&page=1
app.get("/api/search", async (req, res) => {
  const q = (req.query.q || "").trim();
  const page = req.query.page || "1";
  if (!q) return res.status(400).json({ error: "Missing 'q' query param" });

  try {
    const url = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(
      q
    )}&page=${page}`;
    const resp = await fetch(url);
    const data = await resp.json();

    if (data.Response === "False") {
      return res.status(404).json({ error: data.Error || "No results" });
    }
    res.json(data); // { Search: [...], totalResults: "###", Response: "True" }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Movie details
// GET /api/movie/tt1375666
app.get("/api/movie/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const url = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${encodeURIComponent(
      id
    )}&plot=full`;
    const resp = await fetch(url);
    const data = await resp.json();

    if (data.Response === "False") {
      return res.status(404).json({ error: data.Error || "Not found" });
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () =>
  console.log(`API running on http://localhost:${PORT}`)
);
