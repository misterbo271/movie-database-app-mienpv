/**
 * Application configuration
 * Contains API keys, base URLs, and other global settings
 */

const CBConfigs = {
  // The Movie Database API
  tmdb: {
    baseUrl: 'https://api.themoviedb.org/3',
    apiKey: '6364a958a93061e6094ef134c08942e4',
    accessToken: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2MzY0YTk1OGE5MzA2MWU2MDk0ZWYxMzRjMDg5NDJlNCIsIm5iZiI6MTc0MjU0ODYyMi44MzYsInN1YiI6IjY3ZGQyZThlNGFhOTY2Y2U4YzY5Nzc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.EpUJC5k6lwAxltmHeYEYQe0fxRfpU1q0kqYFPg3Qjb4',
    imageBaseUrl: 'https://media.themoviedb.org/t/p',
    posterSize: {
      small: 'w185',
      medium: 'w342',
      large: 'w500',
      original: 'original'
    }
  }
};

export default CBConfigs; 