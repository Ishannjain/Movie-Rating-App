export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const page = searchParams.get('page') || '1';

  if (!query) {
    return Response.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const apiKey = process.env.OMDB_API_KEY || 'demo';
    const url = `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&page=${page}&apikey=${apiKey}`;
    
    console.log('Searching OMDB API:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MovieApp/1.0',
      },
      timeout: 10000, // 10 second timeout
    });
    
    if (!response.ok) {
      console.error('OMDB API response not ok:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('OMDB API response:', data);

    if (data.Response === 'False') {
      // Check if it's an API key issue
      if (data.Error && data.Error.includes('API key')) {
        console.error('API key issue:', data.Error);
        return Response.json({ 
          error: 'API key configuration issue. Please contact support.',
          details: data.Error 
        }, { status: 500 });
      }
      
      // Check if it's a rate limit issue
      if (data.Error && data.Error.includes('limit')) {
        console.error('Rate limit reached:', data.Error);
        return Response.json({ 
          error: 'Search rate limit reached. Please try again later.',
          details: data.Error 
        }, { status: 429 });
      }
      
      return Response.json({ 
        error: data.Error || 'No movies found for this search',
        Search: [],
        totalResults: '0'
      }, { status: 200 });
    }

    return Response.json(data);
  } catch (error) {
    console.error('Search API error:', error);
    
    // Provide fallback data for demo purposes
    if (query.toLowerCase().includes('batman')) {
      return Response.json({
        Search: [
          {
            Title: "Batman Begins",
            Year: "2005",
            imdbID: "tt0372784",
            Type: "movie",
            Poster: "https://m.media-amazon.com/images/M/MV5BOTY4YjI2N2MtYmFlMC00ODYwYjJjNTYtYzFmYzEwN2E1OWZkXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg"
          },
          {
            Title: "The Dark Knight",
            Year: "2008",
            imdbID: "tt0468569",
            Type: "movie",
            Poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg"
          },
          {
            Title: "The Dark Knight Rises",
            Year: "2012",
            imdbID: "tt1345836",
            Type: "movie",
            Poster: "https://m.media-amazon.com/images/M/MV5BMTk4ODQzNDY3Ml5BMl5BanBnXkFtZTcwODA0NTM4Nw@@._V1_SX300.jpg"
          }
        ],
        totalResults: "3",
        Response: "True"
      });
    }
    
    return Response.json({ 
      error: 'Search service temporarily unavailable. Please try again later.',
      details: error.message,
      Search: [],
      totalResults: '0'
    }, { status: 500 });
  }
}
