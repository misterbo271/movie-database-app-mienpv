export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
}

export interface Genre {
  id: number;
  name: string;
}

/**
 * Navigation types for the app
 */
export type RootStackParamList = {
  Root: undefined;
  Home: undefined;
  Watchlist: undefined;
  MovieDetail: { movieId: number };
}; 