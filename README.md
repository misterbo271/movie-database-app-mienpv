# Movie Database App (Technical Test - Mien PV)

A React Native mobile application for browsing movies using The Movie Database (TMDB) API.

## Screenshots (iPhone 15 real device)

<div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 16px; justify-content: center;">
  <img src="./screenshots/screen_1.png" width="240" alt="Home Screen" />
  <img src="./screenshots/screen_2.png" width="240" alt="Search Results" />
  <img src="./screenshots/screen_3.png" width="240" alt="Movie Details" />
  <img src="./screenshots/screen_4.png" width="240" alt="Watchlist Screen" />
  <img src="./screenshots/screen_5.png" width="240" alt="User Profile" />
</div>

## App Demo

<div align="center">
  <img src="./screenshots/app_demo.gif" width="300" alt="App Demo" />
</div>

## Features

- Browse popular, top rated, upcoming and now playing movies
- Search for movies by title
- View detailed movie information including:
  - Overview
  - Release date
  - Rating
  - Cast
  - Similar movies
- Sort movies by popularity, rating or release date
- Infinite scroll loading
- Responsive grid layout
- Clean and modern UI

## Technical Details

- Built with React Native and TypeScript
- Uses TMDB API for movie data
- State management with MobX
- Custom reusable UI components
- Optimized performance with:
  - Efficient list rendering
  - Image caching
  - Debounced search
  - Pagination

## Getting Started

1. Clone the repository
2. Install dependencies with `yarn install`
3. Add your TMDB API key to `.env` file
4. Run on iOS: `yarn ios`
5. Run on Android: `yarn android`

Note: You'll need to add your screenshots to a `/screenshots` directory in the project root for the images to display properly.
