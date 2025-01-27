# Spotify Mixify

A web application that helps users discover new music by creating personalized playlists based on their musical preferences and favorite genres.

## Features

- **Genre-Based Playlist Generation**: Creates unique playlists by analyzing your favorite genres and artists
- **Spotify Integration**: Seamlessly connects with your Spotify account
- **Web Playback**: Listen to generated playlists directly in the browser
- **Library Management**: Save generated playlists to your Spotify library
- **Smart Mixing**: Intelligently combines tracks from different genres based on your listening history

## Tech Stack

- **Frontend**: React + TypeScript
- **State Management**: MobX
- **Dependency Injection**: InversifyJS
- **API Integration**: Spotify Web API, Last.fm API
- **Build Tool**: Vite

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/kaishien/mixify.git
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Spotify API credentials:
```env
VITE_SPOTIFY_CLIENT_ID=your_client_id
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
```

4. Start the development server:
```bash
npm run dev
```
