document.addEventListener('DOMContentLoaded', () => {
  showWelcomeNotification()
})

const showWelcomeNotification = () => {
  const notification = document.createElement('div')
  notification.id = 'welcomeNotification'
  notification.className = 'fixed inset-0 bg-black/95 backdrop-blur-lg z-[200] flex items-center justify-center p-4 animate-fadeIn'
  
  notification.innerHTML = `
    <div class="relative max-w-md w-full bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
      <!-- Animated Border Gradient -->
      <div class="absolute inset-0 rounded-2xl p-[3px] bg-gradient-to-r from-red-600 via-red-500 to-red-600 animate-gradient-xy">
        <div class="h-full w-full bg-neutral-900 rounded-2xl"></div>
      </div>
      
      <!-- Content -->
      <div class="relative z-10 p-8">
        <!-- Close Button -->
        <button id="closeBtn" class="absolute top-4 right-4 w-10 h-10 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition transform hover:scale-110 shadow-lg">
          <i class="fas fa-times text-xl"></i>
        </button>
        
        <!-- Logo & Title -->
        <div class="text-center mb-6">
          <div class="flex items-center justify-center gap-3 mb-3">
            <img src="/assets/favicon.ico" class="h-12 w-12" alt="MovieSync">
            <h2 class="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">MovieSync</h2>
          </div>
          <p class="text-gray-400 text-sm">Your Ultimate Streaming Destination</p>
        </div>
        
        <!-- Join Message -->
        <div class="bg-neutral-800 rounded-xl p-5 mb-5">
          <div class="flex items-center gap-3 mb-3">
            <i class="fab fa-telegram text-3xl text-blue-400"></i>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-white">Join Our Community!</h3>
              <p class="text-gray-400 text-sm">Get latest updates & projects</p>
            </div>
          </div>
          <a href="https://t.me/teleroidgroup" target="_blank" rel="noopener noreferrer" class="block w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105 text-center shadow-lg">
            <i class="fab fa-telegram mr-2"></i>Join Telegram Channel
          </a>
        </div>
        
        <!-- Social Links -->
        <div class="grid grid-cols-2 gap-3 mb-5">
          <a href="https://github.com/mrabhi2k3" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-gray-300 hover:text-white py-3 px-4 rounded-lg transition">
            <i class="fab fa-github text-xl"></i>
            <span class="font-semibold">GitHub</span>
          </a>
          <a href="https://www.linkedin.com/in/kumaarabhishek" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-gray-300 hover:text-white py-3 px-4 rounded-lg transition">
            <i class="fab fa-linkedin text-xl"></i>
            <span class="font-semibold">LinkedIn</span>
          </a>
        </div>
        
        <!-- Disclaimer with Animated Red Border -->
        <div class="relative mb-4">
          <div class="absolute inset-0 rounded-lg bg-gradient-to-r from-red-600 via-red-500 to-red-600 animate-gradient-xy blur-sm opacity-75"></div>
          <div class="relative bg-red-900/20 border-2 border-red-600/50 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <i class="fas fa-exclamation-triangle text-red-500 text-xl mt-1 flex-shrink-0"></i>
              <div>
                <p class="text-red-400 text-xs leading-relaxed">
                  <strong class="text-red-500">Disclaimer:</strong> This site does not store any files on its server. All contents are provided by non-affiliated third parties. We do not host, upload, or link to any video, films, media file, live streams, etc.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Educational Purpose Notice -->
        <div class="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 mb-4">
          <div class="flex items-start gap-3">
            <i class="fas fa-graduation-cap text-blue-400 text-lg mt-1 flex-shrink-0"></i>
            <p class="text-blue-300 text-xs leading-relaxed">
              <strong>Educational Purpose:</strong> This project is created solely for educational purposes. I do not intend to do anything wrong or promote piracy. This is a demonstration of web development skills.
            </p>
          </div>
        </div>
        
        <!-- Continue Button -->
        <button id="continueBtn" class="w-full mt-5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold py-3 px-6 rounded-lg transition transform hover:scale-105 shadow-lg">
          Continue to Stream <i class="fas fa-arrow-right ml-2"></i>
        </button>
      </div>
    </div>
  `
  
  document.body.appendChild(notification)
  document.body.style.overflow = 'hidden'
  
  // Add event listener to continue button
  document.getElementById('continueBtn').addEventListener('click', closeWelcomeNotification)
  
  // Add event listener to close button
  document.getElementById('closeBtn').addEventListener('click', closeWelcomeNotification)
}

const closeWelcomeNotification = () => {
  const notification = document.getElementById('welcomeNotification')
  if (notification) {
    notification.classList.add('animate-fadeOut')
    setTimeout(() => {
      notification.remove()
      document.body.style.overflow = ''
    }, 300)
  }
}

window.closeWelcomeNotification = closeWelcomeNotification

// Add animation styles
const style = document.createElement('style')
style.textContent = `
  @keyframes gradient-xy {
    0%, 100% {
      background-position: 0% 50%;
      background-size: 400% 400%;
    }
    25% {
      background-position: 100% 50%;
    }
    50% {
      background-position: 100% 100%;
    }
    75% {
      background-position: 0% 100%;
    }
  }
  
  .animate-gradient-xy {
    animation: gradient-xy 3s ease infinite;
  }
  
  @keyframes fadeOut {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.95);
    }
  }
  
  .animate-fadeOut {
    animation: fadeOut 0.3s ease-out forwards;
  }
  
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  .animate-scaleIn {
    animation: scaleIn 0.4s ease-out forwards;
  }
`
document.head.appendChild(style)
