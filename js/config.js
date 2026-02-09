// ========================================
// 🔧 GLOBAL CONFIG - Change here for updates - MrAbhi2k3
// ========================================

// Streaming Source - Change this if domain changes

const CONFIG = {
  // Streaming API
  VIDSRC_BASE: 'https://vidsrcme.su/embed',
  
  // Alternative streaming sources (if main fails)
  VIDSRC_BACKUP: 'https://vidsrc.pro/embed',
  
  // TMDB API Configuration
  TMDB_API_BASE: 'https://api.themoviedb.org/3',
  TMDB_IMAGE_SMALL: 'https://image.tmdb.org/t/p/w500',
  TMDB_IMAGE_LARGE: 'https://image.tmdb.org/t/p/original',
  
  // App Settings
  APP_NAME: 'MovieSync',
  APP_VERSION: '1.0.0',
  CACHE_VERSION: 'moviesync-v1',
  
  // Social Links
  TELEGRAM: 'https://t.me/teleroidgroup',
  GITHUB: 'https://github.com/mrabhi2k3',
  LINKEDIN: 'https://linkedin.com/in/kumaarabhishek',
  
  // Image Placeholders
  PLACEHOLDER_POSTER: `<svg class="w-full h-full" viewBox="0 0 300 450" xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="450" fill="#1a1a1a"/>
    <text x="150" y="225" font-size="14" fill="#666" text-anchor="middle" dominant-baseline="middle">
      No Poster Available
    </text>
  </svg>`,
  
  PLACEHOLDER_BACKDROP: `<svg class="w-full h-full" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
    <rect width="1280" height="720" fill="#0f0f0f"/>
    <text x="640" y="360" font-size="24" fill="#444" text-anchor="middle" dominant-baseline="middle">
      No Backdrop Available
    </text>
  </svg>`
}

// Helper functions to build URLs
const getStreamUrl = (type, id, season = null, episode = null, useImdb = false) => {
  const base = CONFIG.VIDSRC_BASE
  
  if (type === 'movie') {
    return useImdb ? `${base}/movie?imdb=${id}` : `${base}/movie?tmdb=${id}`
  } else if (type === 'tv') {
    return useImdb 
      ? `${base}/tv?imdb=${id}&season=${season}&episode=${episode}&autonext=1`
      : `${base}/tv?tmdb=${id}&season=${season}&episode=${episode}&autonext=1`
  }
}

// Get image URL with fallback
const getImageUrl = (path, size = 'small') => {
  if (!path) return null
  const baseUrl = size === 'large' ? CONFIG.TMDB_IMAGE_LARGE : CONFIG.TMDB_IMAGE_SMALL
  return `${baseUrl}${path}`
}

console.log(`New api site v${CONFIG.APP_VERSION}`)
