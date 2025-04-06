import { createServer } from 'http';
import { Server } from 'socket.io';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "https://trinklink.de", "https://api.trinklink.de"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// YouTube API Setup
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'AIzaSyBz36QrfiKIhSr60dnMPhIJojvQv_6AHZg';
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

const rooms = new Map();

// Musik-Genres mit aktualisierten YouTube Playlist-IDs
const musicGenres = {
  deutschrap: {
    name: 'Deutscher Rap',
    description: 'Die besten deutschen Rap Hits',
    playlistId: 'RDGMEMKKvuhLDtb_nrDglYSihevQ',
    color: '#ff9800'
  },
  indie: {
    name: 'Indie & Alternative',
    description: 'Independent und Alternative Musik',
    playlistId: 'PLPZaW4n4wuhPRu2OQD5s6N6I7AFK6pZHA',
    color: '#4caf50'
  },
  musical: {
    name: 'Musicals',
    description: 'Die besten Songs aus Musicals',
    playlistId: 'PLiy0XOfUv4hGKvbULOvGBDPcYc6mOjwJX',
    color: '#e91e63'
  },
  rock: {
    name: 'Rock',
    description: 'Rock Klassiker und neue Rock Hits',
    playlistId: 'PL3485902CC4FB6C67',
    color: '#2196f3'
  },
  mixed: {
    name: 'Gemischte Musik',
    description: 'Eine Mischung aus verschiedenen Genres',
    playlistId: 'PL3485902CC4FB6C67', // Fallback auf Rock Playlist
    color: '#9c27b0'
  }
};

// Fallback-Videos, falls YouTube fehlschlägt
const fallbackVideos = [
  { title: 'Lucifer - Blauer Planet', artist: 'Lucifer', videoId: 'ZZhRUFUBB68', thumbnailUrl: 'https://img.youtube.com/vi/ZZhRUFUBB68/mqdefault.jpg', id: 'fallback1' },
  { title: 'Die Ärzte - Männer sind Schweine', artist: 'Die Ärzte', videoId: 'GtiD2Bp6Iqw', thumbnailUrl: 'https://img.youtube.com/vi/GtiD2Bp6Iqw/mqdefault.jpg', id: 'fallback2' },
  { title: 'Rammstein - Du Hast', artist: 'Rammstein', videoId: 'W3q8Od5qJio', thumbnailUrl: 'https://img.youtube.com/vi/W3q8Od5qJio/mqdefault.jpg', id: 'fallback3' },
  { title: 'Sportfreunde Stiller - 54, 74, 90, 2010', artist: 'Sportfreunde Stiller', videoId: 'B4mDQxM5V3I', thumbnailUrl: 'https://img.youtube.com/vi/B4mDQxM5V3I/mqdefault.jpg', id: 'fallback4' },
  { title: 'Peter Fox - Haus am See', artist: 'Peter Fox', videoId: 'gMqIuAJ92tM', thumbnailUrl: 'https://img.youtube.com/vi/gMqIuAJ92tM/mqdefault.jpg', id: 'fallback5' },
  { title: 'Mark Forster - Chöre', artist: 'Mark Forster', videoId: 'UEokBD8NtEs', thumbnailUrl: 'https://img.youtube.com/vi/UEokBD8NtEs/mqdefault.jpg', id: 'fallback6' },
  { title: 'Falco - Rock Me Amadeus', artist: 'Falco', videoId: 'cVikZ8Oe_XA', thumbnailUrl: 'https://img.youtube.com/vi/cVikZ8Oe_XA/mqdefault.jpg', id: 'fallback7' }
];

// Cache für Playlist-Videos, um API-Anfragen zu reduzieren
const playlistCache = new Map();

async function getPlaylistVideos(playlistId, maxResults = 50) {
  // Check cache first
  if (playlistCache.has(playlistId)) {
    console.log(`Using cached playlist items for ${playlistId}`);
    return playlistCache.get(playlistId);
  }
  
  try {
    console.log(`Fetching videos from playlist ${playlistId}`);
    
    // Special handling for Mix playlists (RD* prefix)
    const isMixPlaylist = playlistId.startsWith('RD');
    const endpoint = isMixPlaylist ? 'videos' : 'playlistItems';
    
    // Get playlist videos or video details directly for Mix playlists
    let videoItems = [];
    
    if (isMixPlaylist) {
      // For Mix playlists, we need to first get the video IDs
      const mixResponse = await axios.get(`${YOUTUBE_API_URL}/playlists`, {
        params: {
          part: 'contentDetails',
          id: playlistId,
          key: YOUTUBE_API_KEY
        }
      });
      
      // Get video IDs from the mix playlist
      let videoIds = [];
      try {
        if (mixResponse.data.items && mixResponse.data.items.length > 0) {
          // Get a different endpoint for mix playlists
          const relatedVideosResponse = await axios.get(`${YOUTUBE_API_URL}/playlistItems`, {
            params: {
              part: 'snippet,contentDetails',
              maxResults: maxResults,
              playlistId: playlistId,
              key: YOUTUBE_API_KEY
            }
          });
          
          videoIds = relatedVideosResponse.data.items
            .filter(item => item.snippet && item.contentDetails && item.contentDetails.videoId)
            .map(item => item.contentDetails.videoId);
        }
      } catch (error) {
        console.error('Error fetching mix playlist:', error.message);
        
        // Fallback method for RD playlists: try to get trending videos in the same category
        const trendingResponse = await axios.get(`${YOUTUBE_API_URL}/videos`, {
          params: {
            part: 'snippet,contentDetails',
            chart: 'mostPopular',
            regionCode: 'DE',
            videoCategoryId: '10', // Music category
            maxResults: 30,
            key: YOUTUBE_API_KEY
          }
        });
        
        videoIds = trendingResponse.data.items
          .filter(item => item.id)
          .map(item => item.id);
      }
      
      // If we have video IDs, get detailed info for each
      if (videoIds.length > 0) {
        // Split into chunks of 50 (YouTube API limit)
        const chunks = [];
        for (let i = 0; i < videoIds.length; i += 50) {
          chunks.push(videoIds.slice(i, i + 50));
        }
        
        // Get detailed info for each chunk
        for (const chunk of chunks) {
          const videoDetailsResponse = await axios.get(`${YOUTUBE_API_URL}/videos`, {
            params: {
              part: 'snippet,contentDetails',
              id: chunk.join(','),
              key: YOUTUBE_API_KEY
            }
          });
          
          videoItems = videoItems.concat(videoDetailsResponse.data.items || []);
        }
      }
    } else {
      // Standard playlist
      const response = await axios.get(`${YOUTUBE_API_URL}/playlistItems`, {
        params: {
          part: 'snippet,contentDetails',
          maxResults: maxResults,
          playlistId: playlistId,
          key: YOUTUBE_API_KEY
        }
      });
      
      videoItems = response.data.items || [];
    }
    
    // Format videos from either approach
    const videos = videoItems
      .filter(item => 
        (item.snippet || item.snippet?.title) && 
        item.snippet.title !== 'Private video' && 
        item.snippet.title !== 'Deleted video' &&
        (item.contentDetails?.videoId || item.id)
      )
      .map(item => {
        const videoId = item.contentDetails?.videoId || item.id;
        const title = item.snippet.title.replace(/\([^)]*\)|\[[^\]]*\]/g, '').trim();
        const channelTitle = item.snippet.channelTitle || '';
        
        return {
          title: title,
          artist: extractArtistFromTitle(title, channelTitle),
          videoId: videoId,
          thumbnailUrl: item.snippet.thumbnails?.medium?.url || `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
          id: videoId
        };
      });
    
    if (videos.length > 0) {
      // Save to cache with 1-hour expiration
      playlistCache.set(playlistId, videos);
      setTimeout(() => {
        playlistCache.delete(playlistId);
      }, 3600000); // 1 hour
      
      console.log(`Successfully fetched ${videos.length} videos from playlist ${playlistId}`);
      return videos;
    } else {
      console.warn(`No valid videos found in playlist ${playlistId}`);
      throw new Error("No valid videos found");
    }
  } catch (error) {
    console.error('YouTube API Error:', error.message);
    console.error(`Failed to get videos from playlist ${playlistId}, using fallback`);
    return fallbackVideos;
  }
}

function extractArtistFromTitle(title, channelTitle) {
  // Special case: Try to extract artist from known formats
  const formats = [
    /^(.*?)\s*[-–]\s*(.*)$/,  // Artist - Title
    /^(.*?)\s*[:|]\s*(.*)$/,  // Artist: Title
    /^(.*?)\"\s*(.*?)\"$/,    // "Title" Artist
    /^(.*?)\s*\|\s*(.*)$/     // Artist | Title
  ];
  
  for (const format of formats) {
    const match = title.match(format);
    if (match) {
      // Take the shorter part as the artist name (typically)
      const part1 = match[1].trim();
      const part2 = match[2].trim();
      
      if (part1.length < part2.length) {
        return part1;
      } else {
        return part2;
      }
    }
  }
  
  // Use channel name as fallback but clean it up
  let artist = channelTitle
    .replace(/(VEVO|Official|Music|Channel|Topic|HD|HQ|Video)$/i, '')
    .replace(/Official/i, '')
    .trim();
  
  // Some common suffix removals
  const suffixes = [' - Topic', ' VEVO', ' Music', ' Official'];
  for (const suffix of suffixes) {
    if (artist.endsWith(suffix)) {
      artist = artist.slice(0, -suffix.length).trim();
    }
  }
  
  return artist || "Unbekannter Künstler";
}

async function getMusicVideos(genreKey) {
  const genre = musicGenres[genreKey];
  if (!genre) return fallbackVideos;

  try {
    const playlistId = genre.playlistId;
    console.log(`Getting videos from genre ${genreKey} with playlist ${playlistId}`);
    
    const videos = await getPlaylistVideos(playlistId);
    
    if (videos && videos.length >= 4) {
      return videos;
    } else {
      console.warn(`Not enough videos found for ${genreKey}, using fallback videos`);
      return fallbackVideos;
    }
  } catch (error) {
    console.error('Error fetching from YouTube:', error);
    return fallbackVideos;
  }
}

async function getRandomVideo(genreKey) {
  try {
    const videos = await getMusicVideos(genreKey);
    const randomIndex = Math.floor(Math.random() * videos.length);
    return videos[randomIndex];
  } catch (error) {
    console.error('Error getting random video:', error);
    const randomIndex = Math.floor(Math.random() * fallbackVideos.length);
    return fallbackVideos[randomIndex];
  }
}

async function generateAnswerOptions(correctVideo, genreKey) {
  // Start with the correct video
  const options = [correctVideo];
  
  try {
    // Get videos for this genre
    const genreVideos = await getMusicVideos(genreKey);
    
    // Shuffle the videos
    const shuffledVideos = genreVideos
      .filter(video => video.id !== correctVideo.id)
      .sort(() => Math.random() - 0.5);
    
    // Add three more unique videos
    let uniqueOptions = new Set([correctVideo.id]);
    while (options.length < 4 && shuffledVideos.length > 0) {
      const nextVideo = shuffledVideos.pop();
      if (!uniqueOptions.has(nextVideo.id)) {
        options.push(nextVideo);
        uniqueOptions.add(nextVideo.id);
      }
    }
    
    // If we still don't have 4 options, add from fallback
    while (options.length < 4) {
      const fallbackVideo = fallbackVideos[options.length - 1];
      if (!uniqueOptions.has(fallbackVideo.id)) {
        options.push(fallbackVideo);
        uniqueOptions.add(fallbackVideo.id);
      }
    }
    
    // Shuffle the final array of options
    return options.sort(() => Math.random() - 0.5);
  } catch (error) {
    console.error('Error generating answer options:', error);
    // Fallback with the correct answer plus random fallbacks
    return [correctVideo, ...fallbackVideos.filter(v => v.id !== correctVideo.id).slice(0, 3)]
      .sort(() => Math.random() - 0.5);
  }
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('create_room', ({ playerName }) => {
    if (!playerName) {
      socket.emit('error', 'Bitte gib deinen Namen ein');
      return;
    }
    let roomId;
    do {
      roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (rooms.has(roomId));

    const hostParticipant = { id: socket.id, name: `${playerName} (Host)`, score: 0 };
    rooms.set(roomId, {
      host: socket.id,
      participants: [hostParticipant],
      gameState: 'lobby',
      currentRound: 0,
      scores: {},
      votes: {},
      selectedGenre: null
    });

    socket.join(roomId);
    socket.emit('room_created', { roomId, success: true });
    io.to(roomId).emit('update_participants', rooms.get(roomId).participants);
    console.log(`Room ${roomId} created by ${playerName}`);
  });

  socket.on('join_room', ({ roomId, playerName }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('error', 'Raum nicht gefunden');
      return;
    }
    if (!playerName) {
      socket.emit('error', 'Bitte gib deinen Namen ein');
      return;
    }
    if (room.participants.some(p => p.name.replace(' (Host)', '') === playerName)) {
      socket.emit('error', 'Name bereits vergeben');
      return;
    }

    const newParticipant = { id: socket.id, name: playerName, score: 0 };
    socket.join(roomId);
    room.participants.push(newParticipant);
    io.to(roomId).emit('update_participants', room.participants);
    console.log(`${playerName} joined room ${roomId}`);
  });

  socket.on('start_game', async ({ roomId, mode, genre, playlistId }) => {
    const room = rooms.get(roomId);
    if (!room || socket.id !== room.host) return;

    room.gameState = 'playing';
    room.currentRound = 1;
    
    // Use the genre from the request or default to deutschrap
    room.selectedGenre = genre || 'deutschrap';
    
    // If a specific playlistId was provided, override the default one
    if (playlistId) {
      const genreObject = musicGenres[room.selectedGenre];
      if (genreObject) {
        genreObject.playlistId = playlistId;
      }
    }
    
    io.to(roomId).emit('game_started', { 
      mode,
      genre: room.selectedGenre,
      genreName: musicGenres[room.selectedGenre]?.name || 'Gemischte Musik',
      genreColor: musicGenres[room.selectedGenre]?.color || '#3b82f6'
    });
    
    await startMusicManiaRound(roomId);
  });

  socket.on('select_genre', ({ roomId, genre, playlistId }) => {
    const room = rooms.get(roomId);
    if (!room || socket.id !== room.host) return;

    room.selectedGenre = genre;
    
    // If a specific playlistId was provided, override the default one
    if (playlistId) {
      const genreObject = musicGenres[genre];
      if (genreObject) {
        genreObject.playlistId = playlistId;
      }
    }
    
    io.to(roomId).emit('genre_selected', { 
      genre,
      genreName: musicGenres[genre]?.name || 'Unknown Genre',
      genreColor: musicGenres[genre]?.color || '#3b82f6'
    });
  });

  socket.on('music_mania_vote', ({ roomId, videoId, timeLeft }) => {
    const room = rooms.get(roomId);
    if (!room || room.gameState !== 'playing' || room.votes[socket.id]) return;

    const participant = room.participants.find(p => p.id === socket.id);
    if (!participant) return;

    // Calculate points - faster answers get more points
    const points = Math.floor((timeLeft / 15) * 100);
    room.votes[socket.id] = { videoId, points };
    
    // Update the player's score if they got it right
    if (videoId === room.currentVideo.id) {
      participant.score += points;
    }

    // Check if all players have voted
    if (Object.keys(room.votes).length === room.participants.length) {
      endMusicManiaRound(roomId);
    } else {
      // Update the other players about voting progress
      io.to(roomId).emit('vote_update', {
        totalVotes: Object.keys(room.votes).length,
        totalPlayers: room.participants.length
      });
    }
  });

  socket.on('disconnect', () => {
    for (const [roomId, room] of rooms.entries()) {
      const participantIndex = room.participants.findIndex(p => p.id === socket.id);
      if (participantIndex !== -1) {
        room.participants.splice(participantIndex, 1);
        if (socket.id === room.host) {
          rooms.delete(roomId);
          io.to(roomId).emit('room_closed');
        } else {
          io.to(roomId).emit('update_participants', room.participants);
        }
        break;
      }
    }
  });

  async function startMusicManiaRound(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;

    try {
      // Get a random video based on the selected genre
      const genreKey = room.selectedGenre || 'deutschrap';
      let correctVideo = await getRandomVideo(genreKey);
      
      if (!correctVideo) {
        console.warn('No video found, using fallback');
        correctVideo = fallbackVideos[Math.floor(Math.random() * fallbackVideos.length)];
      }

      // Generate answer options (including the correct video)
      const options = await generateAnswerOptions(correctVideo, genreKey);

      // Reset votes for the new round
      room.votes = {};
      room.currentVideo = correctVideo;
      room.options = options;

      // Send the new round data to clients
      io.to(roomId).emit('music_mania_round', {
        videoId: correctVideo.videoId,
        thumbnailUrl: correctVideo.thumbnailUrl,
        options: options.map(opt => ({ id: opt.id, title: opt.title, artist: opt.artist })),
        round: room.currentRound,
        totalRounds: 10,
        timeLeft: 15, // 15 seconds to guess
        genreColor: musicGenres[genreKey]?.color || '#3b82f6'
      });

      // Automatically end the round after the time limit
      setTimeout(() => {
        const currentRoom = rooms.get(roomId);
        if (currentRoom && currentRoom.currentRound === room.currentRound) {
          endMusicManiaRound(roomId);
        }
      }, 16000); // 15 seconds timer + 1 second buffer
    } catch (error) {
      console.error('Error starting music round:', error);
      
      // Use fallback if there's an error
      const fallbackVideo = fallbackVideos[Math.floor(Math.random() * fallbackVideos.length)];
      room.votes = {};
      room.currentVideo = fallbackVideo;
      room.options = [...fallbackVideos].sort(() => Math.random() - 0.5).slice(0, 4);
      
      io.to(roomId).emit('music_mania_round', {
        videoId: fallbackVideo.videoId,
        thumbnailUrl: fallbackVideo.thumbnailUrl,
        options: room.options.map(opt => ({ id: opt.id, title: opt.title, artist: opt.artist })),
        round: room.currentRound,
        totalRounds: 10,
        timeLeft: 15
      });
      
      setTimeout(() => endMusicManiaRound(roomId), 16000);
    }
  }

  function endMusicManiaRound(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;

    const correctVideoId = room.currentVideo.id;
    
    // Find players who got it wrong
    const incorrectPlayers = room.participants.filter(p => {
      const vote = room.votes[p.id];
      return !vote || vote.videoId !== correctVideoId;
    });
    
    // Calculate who needs to drink
    const losers = incorrectPlayers.map(p => p.name);
    
    // Calculate scores
    const scores = room.participants.map(p => ({ 
      name: p.name, 
      score: p.score 
    }));

    // Increment the round counter
    room.currentRound += 1;

    // Check if game is over (after 10 rounds)
    if (room.currentRound > 10) {
      room.gameState = 'scoreboard';
      io.to(roomId).emit('game_finished', {
        scores: scores.sort((a, b) => b.score - a.score),
        losers,
        correctVideo: room.currentVideo
      });
    } else {
      // Send results and prepare for the next round
      io.to(roomId).emit('round_result', {
        correctVideo: room.currentVideo,
        losers,
        scores: scores.sort((a, b) => b.score - a.score)
      });
      
      // Start next round after a delay
      setTimeout(() => startMusicManiaRound(roomId), 5000);
    }
  }
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});