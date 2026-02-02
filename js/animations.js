document.addEventListener('DOMContentLoaded', () => {
  initAnimations()
})

const initAnimations = () => {
  observeElements()
  addHoverEffects()
  addScrollAnimations()
  addPageTransitions()
}

const observeElements = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-slideUp')
        entry.target.style.opacity = '1'
        entry.target.style.transform = 'translateY(0)'
      }
    })
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  })

  const animateOnScroll = () => {
    const elements = document.querySelectorAll('.poster-card, .rail, h1, h2, h3')
    elements.forEach(el => {
      if (!el.classList.contains('observed')) {
        el.style.opacity = '0'
        el.style.transform = 'translateY(30px)'
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
        observer.observe(el)
        el.classList.add('observed')
      }
    })
  }

  animateOnScroll()
  
  const mutationObserver = new MutationObserver(() => {
    animateOnScroll()
  })

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true
  })
}

const addHoverEffects = () => {
  document.addEventListener('mouseover', (e) => {
    const card = e.target.closest('.poster-card')
    if (card) {
      card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      card.style.transform = 'translateY(-8px)'
      card.style.boxShadow = '0 20px 40px rgba(225, 29, 72, 0.3)'
    }

    const button = e.target.closest('button')
    if (button && !button.id) {
      button.style.transition = 'all 0.2s ease'
      button.style.transform = 'scale(1.05)'
    }

    const navLink = e.target.closest('.nav-link')
    if (navLink) {
      navLink.style.transition = 'all 0.2s ease'
      navLink.style.transform = 'translateX(5px)'
    }
  })

  document.addEventListener('mouseout', (e) => {
    const card = e.target.closest('.poster-card')
    if (card) {
      card.style.transform = 'translateY(0)'
      card.style.boxShadow = 'none'
    }

    const button = e.target.closest('button')
    if (button && !button.id) {
      button.style.transform = 'scale(1)'
    }

    const navLink = e.target.closest('.nav-link')
    if (navLink && !navLink.classList.contains('active')) {
      navLink.style.transform = 'translateX(0)'
    }
  })
}

const addScrollAnimations = () => {
  let lastScroll = 0
  const header = document.querySelector('header')
  const sidebar = document.getElementById('sidebar')

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset

    if (header) {
      if (currentScroll > lastScroll && currentScroll > 100) {
        header.style.transform = 'translateY(-100%)'
        header.style.transition = 'transform 0.3s ease'
      } else {
        header.style.transform = 'translateY(0)'
      }
    }

    lastScroll = currentScroll

    const scrolled = window.pageYOffset
    const parallaxElements = document.querySelectorAll('[style*="background-image"]')
    parallaxElements.forEach(el => {
      if (el.classList.contains('relative') || el.parentElement?.id === 'hero') {
        const speed = 0.5
        el.style.transform = `translateY(${scrolled * speed}px)`
      }
    })
  }, { passive: true })
}

const addPageTransitions = () => {
  const app = document.getElementById('app')
  
  const originalNavigate = window.navigate
  if (typeof originalNavigate === 'function') {
    window.navigate = function(...args) {
      if (app) {
        app.style.opacity = '0'
        app.style.transform = 'translateY(20px)'
        app.style.transition = 'opacity 0.3s ease, transform 0.3s ease'
      }

      setTimeout(() => {
        originalNavigate.apply(this, args)
        
        setTimeout(() => {
          if (app) {
            app.style.opacity = '1'
            app.style.transform = 'translateY(0)'
          }
        }, 50)
      }, 300)
    }
  }
}

const addRippleEffect = (e) => {
  const button = e.currentTarget
  const ripple = document.createElement('span')
  const rect = button.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)
  const x = e.clientX - rect.left - size / 2
  const y = e.clientY - rect.top - size / 2

  ripple.style.width = ripple.style.height = `${size}px`
  ripple.style.left = `${x}px`
  ripple.style.top = `${y}px`
  ripple.classList.add('ripple')

  const rippleContainer = button.querySelector('.ripple')
  if (rippleContainer) {
    rippleContainer.remove()
  }

  button.appendChild(ripple)

  setTimeout(() => ripple.remove(), 600)
}

document.addEventListener('click', (e) => {
  const button = e.target.closest('button, .poster-card')
  if (button) {
    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ripple = document.createElement('div')
    ripple.style.position = 'absolute'
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`
    ripple.style.width = '0'
    ripple.style.height = '0'
    ripple.style.borderRadius = '50%'
    ripple.style.background = 'rgba(255, 255, 255, 0.5)'
    ripple.style.transform = 'translate(-50%, -50%)'
    ripple.style.animation = 'ripple 0.6s ease-out'
    ripple.style.pointerEvents = 'none'

    button.style.position = 'relative'
    button.style.overflow = 'hidden'
    button.appendChild(ripple)

    setTimeout(() => ripple.remove(), 600)
  }
}, { passive: true })

const style = document.createElement('style')
style.textContent = `
  @keyframes ripple {
    to {
      width: 500px;
      height: 500px;
      opacity: 0;
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.9);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  .animate-slideUp {
    animation: slideUp 0.6s ease-out forwards;
  }

  .animate-fadeIn {
    animation: fadeIn 0.4s ease-out forwards;
  }

  .animate-scaleIn {
    animation: scaleIn 0.3s ease-out forwards;
  }

  .poster-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .poster-card:hover {
    z-index: 10;
  }

  button {
    position: relative;
    overflow: hidden;
  }

  .nav-link {
    transition: all 0.2s ease;
  }

  .nav-link.active {
    transform: translateX(5px);
  }

  #hero img {
    transition: transform 8s ease;
  }

  #hero:hover img {
    transform: scale(1.05);
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  * {
    scroll-behavior: smooth;
  }
`
document.head.appendChild(style)
