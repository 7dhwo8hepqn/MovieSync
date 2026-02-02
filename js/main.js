const TMDB_KEYS = ['fb7bb23f03b6994dafc674c074d01761','e55425032d3d0f371fc776f302e7c09b','8301a21598f8b45668d5711a814f01f6','8cf43ad9c085135b9479ad5cf6bbcbda','da63548086e399ffc910fbc08526df05','13e53ff644a8bd4ba37b3e1044ad24f3','269890f657dddf4635473cf4cf456576','a2f888b27315e62e471b2d587048f32e','8476a7ab80ad76f0936744df0430e67c','5622cafbfe8f8cfe358a29c53e19bba0','ae4bd1b6fce2a5648671bfc171d15ba4','257654f35e3dff105574f97fb4b97035','2f4038e83265214a0dcd6ec2eb3276f5','9e43f45f94705cc8e1d5a0400d19a7b7','af6887753365e14160254ac7f4345dd2','06f10fc8741a672af455421c239a1ffc','09ad8ace66eec34302943272db0e8d2c']

const IMDB_KEYS = ['4b447405','eb0c0475','7776cbde','ff28f90b','6c3a2d45','b07b58c8','ad04b643','a95b5205','777d9323','2c2c3314','b5cff164','89a9f57d','73a9858a','efbd8357']

// Use CONFIG from config.js
const TMDB_API = CONFIG.TMDB_API_BASE
const TMDB_IMG = CONFIG.TMDB_IMAGE_SMALL
const TMDB_BACK = CONFIG.TMDB_IMAGE_LARGE
const VIDSRC = CONFIG.VIDSRC_BASE

let keyIndex = 0
let imdbKeyIndex = 0

const getKey = () => TMDB_KEYS[keyIndex++ % TMDB_KEYS.length]
const getIMDBKey = () => IMDB_KEYS[imdbKeyIndex++ % IMDB_KEYS.length]

const fetchAPI = async (url) => {
  try {
    const res = await fetch(url)
    return res.ok ? await res.json() : {results: []}
  } catch {
    return {results: []}
  }
}

const app = document.getElementById('app')
const searchInput = document.getElementById('searchInput')
const menuToggle = document.getElementById('menuToggle')
const sidebar = document.getElementById('sidebar')
const closeSidebar = document.getElementById('closeSidebar')
const loadingOverlay = document.getElementById('loadingOverlay')

const showLoader = () => {
  if (loadingOverlay) {
    loadingOverlay.classList.remove('hidden')
    loadingOverlay.classList.add('flex')
  }
}

const hideLoader = () => {
  if (loadingOverlay) {
    loadingOverlay.classList.add('hidden')
    loadingOverlay.classList.remove('flex')
  }
}

const toggleSidebar = () => {
  const isClosing = !sidebar.classList.contains('-translate-x-full')
  sidebar.classList.toggle('-translate-x-full')
  document.body.classList.toggle('sidebar-collapsed', isClosing)
  
  if (isClosing) {
    menuToggle.classList.remove('hidden')
    menuToggle.classList.add('flex')
  } else {
    menuToggle.classList.add('hidden')
    menuToggle.classList.remove('flex')
  }
}

menuToggle?.addEventListener('click', toggleSidebar)
closeSidebar?.addEventListener('click', toggleSidebar)

const searchSuggestions = document.getElementById('searchSuggestions')

let searchTimeout
searchInput?.addEventListener('input', async (e) => {
  clearTimeout(searchTimeout)
  const query = e.target.value.trim()
  
  if (query.length > 2) {
    // Show suggestions
    const data = await fetchAPI(`${TMDB_API}/search/multi?api_key=${getKey()}&query=${encodeURIComponent(query)}`)
    const suggestions = data.results.filter(i => i.poster_path).slice(0, 5)
    
    if (suggestions.length > 0 && searchSuggestions) {
      searchSuggestions.innerHTML = suggestions.map(item => `
        <div class="flex items-center gap-3 p-3 hover:bg-neutral-800 cursor-pointer transition" onclick="showDetails(${item.id}, '${item.media_type}')">
          <img src="${TMDB_IMG}${item.poster_path}" class="w-12 h-16 object-cover rounded" alt="${item.title || item.name}">
          <div class="flex-1">
            <p class="font-semibold text-sm">${item.title || item.name}</p>
            <p class="text-xs text-gray-400">${(item.release_date || item.first_air_date || '').split('-')[0]} • ${item.media_type === 'movie' ? 'Movie' : 'TV Show'}</p>
          </div>
          <i class="fas fa-star text-yellow-500 text-xs"></i>
          <span class="text-xs text-gray-400">${item.vote_average?.toFixed(1) || 'N/A'}</span>
        </div>
      `).join('')
      searchSuggestions.classList.remove('hidden')
    } else {
      searchSuggestions.classList.add('hidden')
    }
    
    // Trigger search after delay
    searchTimeout = setTimeout(() => {
      searchContent(query)
      searchSuggestions.classList.add('hidden')
    }, 1500)
  } else {
    searchSuggestions.classList.add('hidden')
    if (query.length === 0) {
      navigate(window.location.pathname)
    }
  }
})

// Handle Enter key for immediate search
searchInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    clearTimeout(searchTimeout)
    const query = e.target.value.trim()
    if (query.length > 0) {
      searchContent(query)
      if (searchSuggestions) {
        searchSuggestions.classList.add('hidden')
      }
    }
  }
})

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('#searchInput') && searchSuggestions) {
    searchSuggestions.classList.add('hidden')
  }
})

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    document.getElementById('searchModal').classList.remove('hidden')
    document.getElementById('modalSearchInput').focus()
  }
  if (e.key === 'Escape') {
    closeSearchModal()
    closeModal()
  }
})

const closeSearchModal = () => {
  document.getElementById('searchModal').classList.add('hidden')
  document.getElementById('searchResults').innerHTML = ''
  document.getElementById('modalSearchInput').value = ''
}

document.getElementById('modalSearchInput')?.addEventListener('input', async (e) => {
  const query = e.target.value.trim()
  if (query.length < 2) {
    document.getElementById('searchResults').innerHTML = ''
    return
  }
  const data = await fetchAPI(`${TMDB_API}/search/multi?api_key=${getKey()}&query=${encodeURIComponent(query)}`)
  const results = document.getElementById('searchResults')
  results.innerHTML = data.results.filter(i => i.poster_path).slice(0, 20).map(item => `
    <div class="cursor-pointer group" onclick="showDetails(${item.id}, '${item.media_type}')">
      <img src="${TMDB_IMG}${item.poster_path}" class="rounded-lg w-full aspect-[2/3] object-cover group-hover:scale-105 transition">
      <p class="mt-2 text-sm font-semibold line-clamp-2">${item.title || item.name}</p>
    </div>
  `).join('')
})

const createPoster = (item, type) => {
  const title = item.title || item.name
  const rating = item.vote_average?.toFixed(1) || 'N/A'
  const year = (item.release_date || item.first_air_date || '').split('-')[0]
  
  // Use placeholder if no poster available
  const posterUrl = item.poster_path 
    ? `${TMDB_IMG}${item.poster_path}` 
    : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"%3E%3Crect fill="%23262626" width="300" height="450"/%3E%3Ctext fill="%23666" font-family="Arial" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E'
  
  return `
    <div class="poster-card group cursor-pointer" onclick="showDetails(${item.id}, '${type || item.media_type}')">
      <div class="relative overflow-hidden rounded-lg">
        <img src="${posterUrl}" class="w-full aspect-[2/3] object-cover transform group-hover:scale-110 transition-transform duration-300" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22450%22 viewBox=%220 0 300 450%22%3E%3Crect fill=%22%23262626%22 width=%22300%22 height=%22450%22/%3E%3Ctext fill=%22%23666%22 font-family=%22Arial%22 font-size=%2220%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENo Image%3C/text%3E%3C/svg%3E'">
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div class="absolute bottom-0 p-3 w-full">
            <h3 class="font-bold text-sm line-clamp-2">${title}</h3>
            <p class="text-xs text-gray-300 mt-1">${year}</p>
          </div>
        </div>
        <span class="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
          <i class="fas fa-star"></i> ${rating}
        </span>
      </div>
    </div>
  `
}

const createRail = (title, items, type) => {
  if (!items || items.length === 0) return ''
  // Show all items, not just those with posters
  if (items.length === 0) return ''
  
  return `
    <section class="mb-10 animate-fadeIn">
      <h2 class="text-xl md:text-2xl font-bold mb-4 px-4 flex items-center gap-2">
        ${title}
      </h2>
      <div class="flex gap-3 md:gap-4 overflow-x-auto pb-4 px-4 scrollbar-hide snap-x snap-mandatory">
        ${items.map(i => createPoster(i, type)).join('')}
      </div>
    </section>
  `
}

let heroData = []
let heroIndex = 0
let heroInterval = null

const renderHero = () => {
  if (!heroData.length) return
  const item = heroData[heroIndex % heroData.length]
  if (!item.backdrop_path) {
    heroIndex++
    return
  }
  
  const title = item.title || item.name
  const overview = item.overview || ''
  const type = item.media_type || 'movie'
  const year = (item.release_date || item.first_air_date || '').split('-')[0]
  const rating = item.vote_average?.toFixed(1) || 'N/A'
  
  const hero = document.getElementById('hero')
  if (hero) {
    hero.innerHTML = `
      <div class="relative h-[60vh] md:h-[80vh] rounded-xl overflow-hidden animate-fadeIn">
        <img src="${TMDB_BACK}${item.backdrop_path}" class="absolute inset-0 w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        <div class="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-3xl">
          <div class="flex items-center gap-3 mb-3">
            <span class="bg-red-600 px-3 py-1 rounded-full text-sm font-bold">${type.toUpperCase()}</span>
            <span class="text-yellow-400 font-semibold"><i class="fas fa-star"></i> ${rating}</span>
            <span class="text-gray-300">${year}</span>
          </div>
          <h1 class="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-2xl">${title}</h1>
          <p class="text-sm md:text-base lg:text-lg mb-6 line-clamp-3 text-gray-200">${overview}</p>
          <div class="flex flex-wrap gap-3">
            <button onclick="showDetails(${item.id}, '${type}')" class="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg">
              <i class="fas fa-play"></i> Watch Now
            </button>
            <button onclick="showDetails(${item.id}, '${type}')" class="px-8 py-3 bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg font-bold transition-all flex items-center gap-2">
              <i class="fas fa-info-circle"></i> More Info
            </button>
          </div>
        </div>
      </div>
    `
  }
  heroIndex++
}

const loadHome = async () => {
  showLoader()
  app.innerHTML = '<div id="hero" class="px-4 mb-8"></div><div id="content"></div>'
  
  const [trending, trendingWeek, popularMovies, popularTV, topRated, upcoming] = await Promise.all([
    fetchAPI(`${TMDB_API}/trending/all/day?api_key=${getKey()}`),
    fetchAPI(`${TMDB_API}/trending/all/week?api_key=${getKey()}`),
    fetchAPI(`${TMDB_API}/movie/popular?api_key=${getKey()}`),
    fetchAPI(`${TMDB_API}/tv/popular?api_key=${getKey()}`),
    fetchAPI(`${TMDB_API}/movie/top_rated?api_key=${getKey()}`),
    fetchAPI(`${TMDB_API}/movie/upcoming?api_key=${getKey()}`)
  ])
  
  heroData = trending.results || []
  if (heroData.length) {
    renderHero()
    if (heroInterval) clearInterval(heroInterval)
    heroInterval = setInterval(renderHero, 6000)
  }
  
  const content = document.getElementById('content')
  if (content) {
    content.innerHTML = `
      ${createRail('<i class="fas fa-fire text-red-500"></i> Trending Today', trending.results)}
      ${createRail('<i class="fas fa-chart-line text-blue-500"></i> Trending This Week', trendingWeek.results)}
      ${createRail('<i class="fas fa-film text-purple-500"></i> Popular Movies', popularMovies.results, 'movie')}
      ${createRail('<i class="fas fa-tv text-green-500"></i> Popular TV Shows', popularTV.results, 'tv')}
      ${createRail('<i class="fas fa-star text-yellow-500"></i> Top Rated Movies', topRated.results, 'movie')}
      ${createRail('<i class="fas fa-calendar text-pink-500"></i> Upcoming Movies', upcoming.results, 'movie')}
    `
  }
  hideLoader()
}

const loadMovies = async () => {
  showLoader()
  app.innerHTML = '<div id="hero" class="px-4 mb-8"></div><div id="content"></div>'
  
  const [popular, topRated, nowPlaying, upcoming] = await Promise.all([
    fetchAPI(`${TMDB_API}/movie/popular?api_key=${getKey()}`),
    fetchAPI(`${TMDB_API}/movie/top_rated?api_key=${getKey()}`),
    fetchAPI(`${TMDB_API}/movie/now_playing?api_key=${getKey()}`),
    fetchAPI(`${TMDB_API}/movie/upcoming?api_key=${getKey()}`)
  ])
  
  const featured = popular.results?.[0]
  if (featured && featured.backdrop_path) {
    const title = featured.title || featured.name
    const overview = featured.overview || ''
    const year = (featured.release_date || '').split('-')[0]
    const rating = featured.vote_average?.toFixed(1) || 'N/A'
    
    document.getElementById('hero').innerHTML = `
      <div class="relative h-[60vh] md:h-[80vh] rounded-xl overflow-hidden animate-fadeIn">
        <img src="${TMDB_BACK}${featured.backdrop_path}" class="absolute inset-0 w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        <div class="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-3xl">
          <div class="flex items-center gap-3 mb-3">
            <span class="bg-red-600 px-3 py-1 rounded-full text-sm font-bold">MOVIE</span>
            <span class="text-yellow-400 font-semibold"><i class="fas fa-star"></i> ${rating}</span>
            <span class="text-gray-300">${year}</span>
          </div>
          <h1 class="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-2xl">${title}</h1>
          <p class="text-sm md:text-base lg:text-lg mb-6 line-clamp-3 text-gray-200">${overview}</p>
          <div class="flex flex-wrap gap-3">
            <button onclick="showDetails(${featured.id}, 'movie')" class="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg">
              <i class="fas fa-play"></i> Watch Now
            </button>
            <button onclick="showDetails(${featured.id}, 'movie')" class="px-8 py-3 bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg font-bold transition-all flex items-center gap-2">
              <i class="fas fa-info-circle"></i> More Info
            </button>
          </div>
        </div>
      </div>
    `
  }
  
  document.getElementById('content').innerHTML = `
    ${createRail('<i class="fas fa-fire"></i> Popular Movies', popular.results, 'movie')}
    ${createRail('<i class="fas fa-star"></i> Top Rated', topRated.results, 'movie')}
    ${createRail('<i class="fas fa-ticket-alt"></i> Now Playing', nowPlaying.results, 'movie')}
    ${createRail('<i class="fas fa-calendar"></i> Upcoming', upcoming.results, 'movie')}
  `
  hideLoader()
}

const loadSeries = async () => {
  showLoader()
  app.innerHTML = '<div id="hero" class="px-4 mb-8"></div><div id="content"></div>'
  
  const [popular, topRated, onAir, airingToday] = await Promise.all([
    fetchAPI(`${TMDB_API}/tv/popular?api_key=${getKey()}`),
    fetchAPI(`${TMDB_API}/tv/top_rated?api_key=${getKey()}`),
    fetchAPI(`${TMDB_API}/tv/on_the_air?api_key=${getKey()}`),
    fetchAPI(`${TMDB_API}/tv/airing_today?api_key=${getKey()}`)
  ])
  
  const featured = popular.results?.[0]
  if (featured && featured.backdrop_path) {
    const title = featured.title || featured.name
    const overview = featured.overview || ''
    const year = (featured.first_air_date || '').split('-')[0]
    const rating = featured.vote_average?.toFixed(1) || 'N/A'
    
    document.getElementById('hero').innerHTML = `
      <div class="relative h-[60vh] md:h-[80vh] rounded-xl overflow-hidden animate-fadeIn">
        <img src="${TMDB_BACK}${featured.backdrop_path}" class="absolute inset-0 w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        <div class="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-3xl">
          <div class="flex items-center gap-3 mb-3">
            <span class="bg-green-600 px-3 py-1 rounded-full text-sm font-bold">TV SHOW</span>
            <span class="text-yellow-400 font-semibold"><i class="fas fa-star"></i> ${rating}</span>
            <span class="text-gray-300">${year}</span>
          </div>
          <h1 class="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-2xl">${title}</h1>
          <p class="text-sm md:text-base lg:text-lg mb-6 line-clamp-3 text-gray-200">${overview}</p>
          <div class="flex flex-wrap gap-3">
            <button onclick="showDetails(${featured.id}, 'tv')" class="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg">
              <i class="fas fa-play"></i> Watch Now
            </button>
            <button onclick="showDetails(${featured.id}, 'tv')" class="px-8 py-3 bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg font-bold transition-all flex items-center gap-2">
              <i class="fas fa-info-circle"></i> More Info
            </button>
          </div>
        </div>
      </div>
    `
  }
  
  document.getElementById('content').innerHTML = `
    ${createRail('<i class="fas fa-fire"></i> Popular TV Shows', popular.results, 'tv')}
    ${createRail('<i class="fas fa-star"></i> Top Rated', topRated.results, 'tv')}
    ${createRail('<i class="fas fa-broadcast-tower"></i> On The Air', onAir.results, 'tv')}
    ${createRail('<i class="fas fa-play-circle"></i> Airing Today', airingToday.results, 'tv')}
  `
  hideLoader()
}

const loadTrending = async () => {
  showLoader()
  app.innerHTML = '<div id="hero" class="px-4 mb-8"></div><div id="content"></div>'
  
  const [day, week] = await Promise.all([
    fetchAPI(`${TMDB_API}/trending/all/day?api_key=${getKey()}`),
    fetchAPI(`${TMDB_API}/trending/all/week?api_key=${getKey()}`)
  ])
  
  const featured = day.results?.[0]
  if (featured && featured.backdrop_path) {
    const title = featured.title || featured.name
    const overview = featured.overview || ''
    const type = featured.media_type || 'movie'
    const year = (featured.release_date || featured.first_air_date || '').split('-')[0]
    const rating = featured.vote_average?.toFixed(1) || 'N/A'
    
    document.getElementById('hero').innerHTML = `
      <div class="relative h-[60vh] md:h-[80vh] rounded-xl overflow-hidden animate-fadeIn">
        <img src="${TMDB_BACK}${featured.backdrop_path}" class="absolute inset-0 w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        <div class="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-3xl">
          <div class="flex items-center gap-3 mb-3">
            <span class="bg-orange-600 px-3 py-1 rounded-full text-sm font-bold">TRENDING</span>
            <span class="text-yellow-400 font-semibold"><i class="fas fa-star"></i> ${rating}</span>
            <span class="text-gray-300">${year}</span>
          </div>
          <h1 class="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-2xl">${title}</h1>
          <p class="text-sm md:text-base lg:text-lg mb-6 line-clamp-3 text-gray-200">${overview}</p>
          <div class="flex flex-wrap gap-3">
            <button onclick="showDetails(${featured.id}, '${type}')" class="px-8 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-bold transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg">
              <i class="fas fa-play"></i> Watch Now
            </button>
            <button onclick="showDetails(${featured.id}, '${type}')" class="px-8 py-3 bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg font-bold transition-all flex items-center gap-2">
              <i class="fas fa-info-circle"></i> More Info
            </button>
          </div>
        </div>
      </div>
    `
  }
  
  document.getElementById('content').innerHTML = `
    ${createRail('<i class="fas fa-fire"></i> Trending Today', day.results)}
    ${createRail('<i class="fas fa-chart-line"></i> Trending This Week', week.results)}
  `
  hideLoader()
}

const searchContent = async (query) => {
  showLoader()
  app.innerHTML = `<div class="px-4 mb-8"><h1 class="text-3xl font-bold">Search Results for "${query}"</h1></div><div id="content"></div>`
  
  const trimmedQuery = query.trim()
  
  // Check if query is IMDB ID (tt followed by digits)
  const imdbMatch = trimmedQuery.match(/^(tt\d{7,})$/i)
  if (imdbMatch) {
    const imdbId = imdbMatch[1].toLowerCase()
    const data = await fetchAPI(`${TMDB_API}/find/${imdbId}?api_key=${getKey()}&external_source=imdb_id`)
    
    const allResults = []
    if (data.movie_results && data.movie_results.length > 0) {
      data.movie_results.forEach(movie => {
        movie.media_type = 'movie'
        allResults.push(movie)
      })
    }
    if (data.tv_results && data.tv_results.length > 0) {
      data.tv_results.forEach(tv => {
        tv.media_type = 'tv'
        allResults.push(tv)
      })
    }
    
    document.getElementById('content').innerHTML = `
      <div class="px-4">
        ${allResults.length > 0 ? `
          <p class="text-gray-400 mb-4">Found by IMDB ID: ${imdbId}</p>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            ${allResults.map(item => createPoster(item, item.media_type)).join('')}
          </div>
        ` : `
          <div class="text-center py-20">
            <i class="fas fa-search text-6xl text-gray-700 mb-4"></i>
            <h3 class="text-2xl font-bold text-gray-400 mb-2">No Results Found</h3>
            <p class="text-gray-500">IMDB ID "${imdbId}" not found in database</p>
          </div>
        `}
      </div>
    `
    hideLoader()
    return
  }
  
  // Check if query is pure TMDB ID (only digits)
  const tmdbMatch = trimmedQuery.match(/^\d{1,}$/)
  if (tmdbMatch) {
    const tmdbId = tmdbMatch[0]
    
    // Try both movie and TV
    const [movieData, tvData] = await Promise.all([
      fetchAPI(`${TMDB_API}/movie/${tmdbId}?api_key=${getKey()}`),
      fetchAPI(`${TMDB_API}/tv/${tmdbId}?api_key=${getKey()}`)
    ])
    
    const allResults = []
    if (movieData && movieData.id && !movieData.status_code) {
      movieData.media_type = 'movie'
      allResults.push(movieData)
    }
    if (tvData && tvData.id && !tvData.status_code) {
      tvData.media_type = 'tv'
      allResults.push(tvData)
    }
    
    document.getElementById('content').innerHTML = `
      <div class="px-4">
        ${allResults.length > 0 ? `
          <p class="text-gray-400 mb-4">Found by TMDB ID: ${tmdbId}</p>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            ${allResults.map(item => createPoster(item, item.media_type)).join('')}
          </div>
        ` : `
          <div class="text-center py-20">
            <i class="fas fa-search text-6xl text-gray-700 mb-4"></i>
            <h3 class="text-2xl font-bold text-gray-400 mb-2">No Results Found</h3>
            <p class="text-gray-500">TMDB ID "${tmdbId}" not found</p>
          </div>
        `}
      </div>
    `
    hideLoader()
    return
  }
  
  // Regular text search with year detection
  // Extract year from query if present (e.g., "kill 2023" or "avatar 2022")
  const yearMatch = query.match(/\b(19\d{2}|20\d{2})\b/)
  const year = yearMatch ? yearMatch[0] : null
  const searchQuery = year ? query.replace(year, '').trim() : query
  
  // Perform multiple searches for better results
  const searches = [
    fetchAPI(`${TMDB_API}/search/multi?api_key=${getKey()}&query=${encodeURIComponent(query)}`)
  ]
  
  // If year is detected, also search movies and TV shows with year filter
  if (year) {
    searches.push(
      fetchAPI(`${TMDB_API}/search/movie?api_key=${getKey()}&query=${encodeURIComponent(searchQuery)}&year=${year}`),
      fetchAPI(`${TMDB_API}/search/movie?api_key=${getKey()}&query=${encodeURIComponent(searchQuery)}&primary_release_year=${year}`),
      fetchAPI(`${TMDB_API}/search/tv?api_key=${getKey()}&query=${encodeURIComponent(searchQuery)}&first_air_date_year=${year}`)
    )
  }
  
  const responses = await Promise.all(searches)
  
  // Combine and deduplicate results
  const allResults = []
  const seenIds = new Set()
  
  responses.forEach(data => {
    if (data.results) {
      data.results.forEach(item => {
        const uniqueId = `${item.id}_${item.media_type || 'unknown'}`
        // Show all results, not just those with posters
        if (!seenIds.has(uniqueId)) {
          seenIds.add(uniqueId)
          allResults.push(item)
        }
      })
    }
  })
  
  // Sort by popularity
  allResults.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
  
  document.getElementById('content').innerHTML = `
    <div class="px-4">
      ${allResults.length > 0 ? `
        <p class="text-gray-400 mb-4">Found ${allResults.length} result${allResults.length !== 1 ? 's' : ''}</p>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          ${allResults.map(item => createPoster(item, item.media_type)).join('')}
        </div>
      ` : `
        <div class="text-center py-20">
          <i class="fas fa-search text-6xl text-gray-700 mb-4"></i>
          <h3 class="text-2xl font-bold text-gray-400 mb-2">No Results Found</h3>
          <p class="text-gray-500">Try different keywords or check your spelling</p>
        </div>
      `}
    </div>
  `
  hideLoader()
}

const showDetails = async (id, type) => {
  showLoader()
  const details = await fetchAPI(`${TMDB_API}/${type}/${id}?api_key=${getKey()}&append_to_response=videos,credits,similar,external_ids`)
  hideLoader()
  
  if (!details.id) return
  
  const title = details.title || details.name
  const overview = details.overview || 'No overview available'
  const rating = details.vote_average?.toFixed(1) || 'N/A'
  const year = (details.release_date || details.first_air_date || '').split('-')[0]
  const runtime = details.runtime || (details.episode_run_time?.[0]) || 'N/A'
  const genres = details.genres?.map(g => g.name).join(', ') || ''
  const cast = details.credits?.cast?.slice(0, 10).map(c => c.name).join(', ') || 'N/A'
  const backdrop = details.backdrop_path ? `${TMDB_BACK}${details.backdrop_path}` : ''
  const poster = details.poster_path ? `${TMDB_IMG}${details.poster_path}` : ''
  const imdbId = details.external_ids?.imdb_id || ''
  const country = details.production_countries?.[0]?.name || details.origin_country?.[0] || ''
  
  let seasons = ''
  if (type === 'tv' && details.seasons) {
    seasons = `
      <div class="mt-6">
        <h3 class="text-xl font-bold mb-3"><i class="fas fa-list"></i> Seasons & Episodes</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          ${details.seasons.filter(s => s.season_number > 0).map(s => `
            <button onclick="selectEpisode(${id}, ${s.season_number}, 1)" class="bg-neutral-800 hover:bg-neutral-700 p-4 rounded-lg transition text-left">
              <p class="font-semibold">Season ${s.season_number}</p>
              <p class="text-sm text-gray-400">${s.episode_count} Episodes</p>
            </button>
          `).join('')}
        </div>
      </div>
    `
  }
  
  const similar = details.similar?.results?.slice(0, 10) || []
  
  const modal = document.createElement('div')
  modal.id = 'detailModal'
  modal.className = 'fixed inset-0 bg-black/95 z-[60] overflow-y-auto animate-fadeIn'
  modal.onclick = (e) => e.target === modal && closeModal()
  
  modal.innerHTML = `
    <div class="min-h-screen p-4 md:p-8">
      <div class="max-w-6xl mx-auto bg-neutral-900 rounded-xl overflow-hidden">
        <button onclick="closeModal()" class="absolute top-6 right-6 z-10 w-12 h-12 bg-black/80 hover:bg-black rounded-full flex items-center justify-center text-2xl transition">
          <i class="fas fa-times"></i>
        </button>
        
        ${backdrop ? `
          <div class="relative h-[40vh] md:h-[60vh]">
            <img src="${backdrop}" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent"></div>
          </div>
        ` : ''}
        
        <div class="p-6 md:p-8 ${backdrop ? '-mt-32 relative z-10' : ''}">
          <div class="flex flex-col md:flex-row gap-6">
            ${poster ? `<img src="${poster}" class="w-48 rounded-lg shadow-2xl">` : ''}
            <div class="flex-1">
              <h2 class="text-3xl md:text-4xl font-bold mb-3">${title} ${year ? `(${year})` : ''}</h2>
              
              <div class="flex flex-wrap gap-3 mb-4">
                ${runtime !== 'N/A' ? `<span class="bg-neutral-800 px-3 py-1 rounded-full text-sm">${runtime}m</span>` : ''}
                ${country ? `<span class="bg-neutral-800 px-3 py-1 rounded-full text-sm">${country}</span>` : ''}
                ${genres.split(', ').map(g => `<span class="bg-red-600 px-3 py-1 rounded-full text-sm">${g}</span>`).join('')}
              </div>
              
              <div class="flex items-center gap-4 mb-4">
                <span class="text-2xl text-yellow-400 font-bold"><i class="fas fa-star"></i> ${rating}</span>
                ${imdbId ? `<a href="https://www.imdb.com/title/${imdbId}" target="_blank" class="text-yellow-400 hover:text-yellow-300 transition"><i class="fab fa-imdb text-3xl"></i></a>` : ''}
              </div>
              
              <h3 class="text-xl font-bold mb-2">Plot</h3>
              <p class="text-gray-300 leading-relaxed mb-6">${overview}</p>
              
              <h3 class="text-xl font-bold mb-2">Cast</h3>
              <p class="text-gray-300 mb-6">${cast}</p>
            </div>
          </div>
          
          <div class="mt-6">
            <button onclick="${type === 'movie' ? `playMovie(${id}, '${imdbId}', '${title.replace(/'/g, "\\'")}', '${year}', '${rating}')` : `selectEpisode(${id}, 1, 1, '${title.replace(/'/g, "\\'")}', '${year}', '${rating}')`}" class="w-full md:w-auto px-12 py-4 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg">
              <i class="fas fa-play mr-2"></i> ${type === 'movie' ? 'Play Movie' : 'Watch Season 1 Episode 1'}
            </button>
          </div>
          
          ${seasons}
          
          ${similar.length ? `
            <div class="mt-8">
              <h3 class="text-xl font-bold mb-4"><i class="fas fa-film"></i> You May Also Like</h3>
              <div class="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                ${similar.map(s => createPoster(s, type)).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `
  
  document.body.appendChild(modal)
  document.body.style.overflow = 'hidden'
}

const playMovie = (id, imdbId, title, year, rating) => {
  const url = imdbId ? `${VIDSRC}/movie?imdb=${imdbId}` : `${VIDSRC}/movie?tmdb=${id}`
  openPlayer(url, { title, year, rating })
}

const selectEpisode = async (tvId, season, episode, title, year, rating) => {
  const [tvDetails, seasonDetails] = await Promise.all([
    fetchAPI(`${TMDB_API}/tv/${tvId}?api_key=${getKey()}&append_to_response=external_ids`),
    fetchAPI(`${TMDB_API}/tv/${tvId}/season/${season}?api_key=${getKey()}&append_to_response=external_ids`)
  ])
  
  const imdbId = tvDetails.external_ids?.imdb_id || seasonDetails.external_ids?.imdb_id
  const episodeData = seasonDetails.episodes?.find(ep => ep.episode_number === episode)
  const episodeTitle = episodeData ? `${title} - S${season}E${episode}: ${episodeData.name}` : `${title} - S${season}E${episode}`
  
  const url = imdbId 
    ? `${VIDSRC}/tv?imdb=${imdbId}&season=${season}&episode=${episode}&autonext=1`
    : `${VIDSRC}/tv?tmdb=${tvId}&season=${season}&episode=${episode}&autonext=1`
  
  openPlayer(url, { title: episodeTitle, year, rating })
}

const openPlayer = (url, meta = {}) => {
  closeModal()
  const player = document.createElement('div')
  player.id = 'playerModal'
  player.className = 'fixed inset-0 bg-black z-[70] animate-fadeIn'
  player.innerHTML = `
    <div class="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/90 to-transparent p-4 md:p-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h3 class="text-lg md:text-2xl font-bold">${meta.title || 'Now Playing'}</h3>
          <div class="text-sm text-gray-300 flex items-center gap-3">
            ${meta.year ? `<span>${meta.year}</span>` : ''}
            ${meta.rating ? `<span class="text-yellow-400"><i class=\"fas fa-star\"></i> ${meta.rating}</span>` : ''}
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button onclick="enterPlayerFullscreen()" class="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full flex items-center justify-center transition" title="Fullscreen">
            <i class="fas fa-expand"></i>
          </button>
          <button onclick="closePlayer()" class="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-xl transition" title="Close">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
    <iframe id="playerFrame" src="${url}" class="w-full h-full" frameborder="0" allowfullscreen allow="autoplay; fullscreen; picture-in-picture" referrerpolicy="origin"></iframe>
  `
  document.body.appendChild(player)
}

const enterPlayerFullscreen = () => {
  const frame = document.getElementById('playerFrame')
  if (frame?.requestFullscreen) {
    frame.requestFullscreen()
  }
}

const closePlayer = () => {
  document.getElementById('playerModal')?.remove()
}

const closeModal = () => {
  document.getElementById('detailModal')?.remove()
  document.body.style.overflow = ''
}

const loadPage = async (url) => {
  try {
    const res = await fetch(url)
    const html = await res.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    app.innerHTML = doc.body.innerHTML
  } catch {
    navigate('/')
  }
}

const navigate = (path) => {
  history.pushState({}, '', path)
  render(path)
  
  // Close sidebar and show hamburger menu
  sidebar.classList.add('-translate-x-full')
  document.body.classList.add('sidebar-collapsed')
  menuToggle.classList.remove('hidden')
  menuToggle.classList.add('flex')
  
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-route') === path)
  })
}

const render = (path) => {
  if (heroInterval) clearInterval(heroInterval)
  window.scrollTo(0, 0)
  
  if (path === '/' || path === '/index.html') {
    loadHome()
  } else if (path === '/movies') {
    loadMovies()
  } else if (path === '/series') {
    loadSeries()
  } else if (path === '/trending') {
    loadTrending()
  } else if (path === '/about') {
    loadPage('/pages/about.html')
  } else if (path === '/privacy') {
    loadPage('/pages/privacy.html')
  } else if (path === '/dmca') {
    loadPage('/pages/dmca.html')
  } else {
    loadHome()
  }
}

window.onpopstate = () => render(location.pathname)

document.querySelectorAll('a[href]').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href')
    if (href.startsWith('/') && !href.includes('.')) {
      e.preventDefault()
      navigate(href)
    }
  })
})

if (location.pathname === '/index.html') {
  history.replaceState({}, '', '/')
}

// Initialize sidebar state - start with sidebar visible on desktop, hidden on mobile
if (window.innerWidth >= 768) {
  sidebar.classList.remove('-translate-x-full')
  document.body.classList.remove('sidebar-collapsed')
  menuToggle.classList.add('hidden')
  menuToggle.classList.remove('flex')
} else {
  sidebar.classList.add('-translate-x-full')
  document.body.classList.add('sidebar-collapsed')
  menuToggle.classList.remove('hidden')
  menuToggle.classList.add('flex')
}

// Add click handlers to nav links in sidebar
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault()
    const path = link.getAttribute('data-route')
    navigate(path)
  })
})

render(location.pathname)

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {})
}
