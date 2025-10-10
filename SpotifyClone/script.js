/* ===== PULSE MUSIC PLAYER - ENHANCED JAVASCRIPT ===== */
(() => {
  'use strict';

  // ===== GLOBAL STATE =====
  let isPlaying = false;
  let currentTrackIndex = 0;
  let progress = 0;
  let animationFrame = null;
  let playSpeed = 1;
  let isShuffled = false;
  let isRepeating = false;
  let volume = 0.7;
  let isDragging = false;
  let isFloatingPlayerVisible = false;

  // ===== ENHANCED PLAYLIST DATA =====
  const tracks = [
    { 
      title: "Midnight Drive", 
      artist: "Various Artists", 
      art: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=60&h=60&fit=crop&crop=center", 
      duration: 204,
      genre: "Electronic",
      year: 2023
    },
    { 
      title: "Lo-Fi Mornings", 
      artist: "Beat Collective", 
      art: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=60&h=60&fit=crop&crop=center", 
      duration: 180,
      genre: "Lo-Fi",
      year: 2023
    },
    { 
      title: "Synthwave 88", 
      artist: "Neon Nights", 
      art: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=60&h=60&fit=crop&crop=center", 
      duration: 220,
      genre: "Synthwave",
      year: 2023
    },
    { 
      title: "Ambient Dreams", 
      artist: "Space Waves", 
      art: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=60&h=60&fit=crop&crop=center", 
      duration: 195,
      genre: "Ambient",
      year: 2023
    },
    { 
      title: "Future Bass", 
      artist: "Electro Lab", 
      art: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=60&h=60&fit=crop&crop=center", 
      duration: 168,
      genre: "Future Bass",
      year: 2023
    }
  ];

  // ===== DOM ELEMENTS =====
  const elements = {
    // Player controls
    playBtn: document.getElementById('play'),
    prevBtn: document.getElementById('prev'),
    nextBtn: document.getElementById('next'),
    shuffleBtn: document.getElementById('shuffle'),
    repeatBtn: document.getElementById('repeat'),
    
    // Hero controls
    heroPlay: document.getElementById('hero-play'),
    heroSave: document.getElementById('hero-save'),
    heroMore: document.getElementById('hero-more'),
    
    // Progress
    progress: document.getElementById('progress'),
    progressBar: document.getElementById('progress-bar'),
    progressHandle: document.getElementById('progress-handle'),
    timeElapsed: document.getElementById('time-elapsed'),
    duration: document.getElementById('duration'),
    
    // Volume
    volume: document.getElementById('volume'),
    
    // Track info
    playerArt: document.getElementById('player-art'),
    trackTitle: document.getElementById('track-title'),
    trackArtist: document.getElementById('track-artist'),
    
    // UI Elements
    main: document.querySelector('.main'),
    sidebar: document.querySelector('.sidebar'),
    player: document.querySelector('.player'),
    floatingPlayer: document.getElementById('floating-player'),
    
    // Cards and overlays
    playOverlays: document.querySelectorAll('.play-overlay'),
    cards: document.querySelectorAll('.card'),
    
    // Sections
    sections: document.querySelectorAll('.section'),
    reveals: document.querySelectorAll('.reveal')
  };

  // ===== UTILITY FUNCTIONS =====
  const utils = {
    formatTime: (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    clamp: (value, min, max) => Math.min(Math.max(value, min), max),

    lerp: (start, end, factor) => start + (end - start) * factor,

    debounce: (func, wait) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    throttle: (func, limit) => {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },

    easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
  };

  // ===== PLAYER FUNCTIONS =====
  const player = {
    loadTrack: (index) => {
      const track = tracks[index];
      elements.trackTitle.textContent = track.title;
      elements.trackArtist.textContent = track.artist;
      elements.duration.textContent = utils.formatTime(track.duration);
      elements.playerArt.src = track.art;
    progress = 0;
      player.updateProgressUI();
      
      // Update floating player
      const floatingArt = elements.floatingPlayer.querySelector('img');
      const floatingTitle = elements.floatingPlayer.querySelector('.floating-title');
      const floatingArtist = elements.floatingPlayer.querySelector('.floating-artist');
      
      if (floatingArt) floatingArt.src = track.art;
      if (floatingTitle) floatingTitle.textContent = track.title;
      if (floatingArtist) floatingArtist.textContent = track.artist;
      
      // Add loading animation
      elements.playerArt.style.opacity = '0.7';
      setTimeout(() => {
        elements.playerArt.style.opacity = '1';
      }, 300);
    },

    play: () => {
      if (isPlaying) {
        player.pause();
        return;
      }
      
      isPlaying = true;
      elements.playBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
        </svg>
      `;
      
      if (elements.heroPlay) {
        elements.heroPlay.innerHTML = '<span class="btn-icon">⏸</span>Pause';
      }
      
      player.startProgressAnimation();
      player.showFloatingPlayer();
    },

    pause: () => {
      isPlaying = false;
      elements.playBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
      `;
      
      if (elements.heroPlay) {
        elements.heroPlay.innerHTML = '<span class="btn-icon">▶</span>Play';
      }
      
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
      
      player.hideFloatingPlayer();
    },

    next: () => {
      if (isShuffled) {
        currentTrackIndex = Math.floor(Math.random() * tracks.length);
      } else {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
      }
      player.loadTrack(currentTrackIndex);
      if (isPlaying) {
        player.startProgressAnimation();
      }
      player.animateTrackChange();
    },

    prev: () => {
      currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
      player.loadTrack(currentTrackIndex);
      if (isPlaying) {
        player.startProgressAnimation();
      }
      player.animateTrackChange();
    },

    toggleShuffle: () => {
      isShuffled = !isShuffled;
      elements.shuffleBtn.style.color = isShuffled ? 'var(--accent-green)' : 'var(--text-secondary)';
    },

    toggleRepeat: () => {
      isRepeating = !isRepeating;
      elements.repeatBtn.style.color = isRepeating ? 'var(--accent-green)' : 'var(--text-secondary)';
    },

    startProgressAnimation: () => {
      const animate = () => {
        if (!isPlaying) return;
        
        progress += playSpeed * 0.016; // ~60fps
        player.updateProgressUI();
        
        const currentTrack = tracks[currentTrackIndex];
        if (progress >= currentTrack.duration) {
          if (isRepeating) {
            progress = 0;
          } else {
            player.next();
      return;
    }
        }
        
        animationFrame = requestAnimationFrame(animate);
      };
      animate();
    },

    updateProgressUI: () => {
      const currentTrack = tracks[currentTrackIndex];
      const percentage = Math.min(100, (progress / currentTrack.duration) * 100);
      
      elements.progress.style.width = percentage + '%';
      elements.timeElapsed.textContent = utils.formatTime(Math.floor(progress));
      
      // Update floating player progress
      const floatingProgress = elements.floatingPlayer.querySelector('.floating-progress-bar');
      if (floatingProgress) {
        floatingProgress.style.width = percentage + '%';
      }
    },

    seekTo: (percentage) => {
      const currentTrack = tracks[currentTrackIndex];
      progress = currentTrack.duration * percentage;
      player.updateProgressUI();
    },

    setVolume: (vol) => {
      volume = utils.clamp(vol, 0, 1);
      elements.volume.value = volume;
      playSpeed = 0.6 + volume * 1.4; // Visual effect
      elements.volume.title = Math.round(volume * 100) + '%';
    },

    showFloatingPlayer: () => {
      if (isFloatingPlayerVisible) return;
      
      isFloatingPlayerVisible = true;
      elements.floatingPlayer.classList.add('show');
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        player.hideFloatingPlayer();
      }, 3000);
    },

    hideFloatingPlayer: () => {
      if (!isFloatingPlayerVisible) return;
      
      isFloatingPlayerVisible = false;
      elements.floatingPlayer.classList.remove('show');
    },

    animateTrackChange: () => {
      elements.playerArt.style.transform = 'scale(0.9) rotate(-5deg)';
      elements.playerArt.style.opacity = '0.7';
      
      setTimeout(() => {
        elements.playerArt.style.transform = 'scale(1) rotate(0deg)';
        elements.playerArt.style.opacity = '1';
      }, 300);
    }
  };

  // ===== SCROLL ANIMATIONS =====
  const scrollAnimations = {
    init: () => {
      // Intersection Observer for reveal animations
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('show');
          }
        });
      }, observerOptions);

      elements.reveals.forEach(el => observer.observe(el));

      // Scroll-based background animation
      scrollAnimations.setupBackgroundAnimation();
      
      // Parallax effects
      scrollAnimations.setupParallaxEffects();
      
      // Progress indicator
      scrollAnimations.setupProgressIndicator();
    },

    setupBackgroundAnimation: () => {
      let ticking = false;
      
      const updateBackground = () => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        const scrollProgress = scrollY / (documentHeight - windowHeight);
        const intensity = Math.min(scrollProgress * 0.3, 0.3);
        
        // Dynamic background gradient
        document.body.style.background = `
          linear-gradient(
            180deg,
            rgba(7,16,23,${1 - intensity}) 0%,
            rgba(7,19,26,${1 - intensity * 0.5}) 50%,
            rgba(10,10,10,1) 100%
          )
        `;
        
        ticking = false;
      };

      const requestTick = () => {
        if (!ticking) {
          requestAnimationFrame(updateBackground);
          ticking = true;
        }
      };

      window.addEventListener('scroll', requestTick, { passive: true });
    },

    setupParallaxEffects: () => {
      const parallaxElements = document.querySelectorAll('.hero-art');
      
      window.addEventListener('scroll', utils.throttle(() => {
        const scrollY = window.scrollY;
        
        parallaxElements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const speed = 0.03; // Very subtle parallax for hero only
          
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            const yPos = -(scrollY * speed);
            el.style.transform = `translateY(${yPos}px)`;
          }
        });
      }, 16));
    },

    setupProgressIndicator: () => {
      const progressBar = document.createElement('div');
      progressBar.className = 'scroll-progress';
      progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: var(--gradient-primary);
        z-index: 1000;
        transition: width 0.1s ease;
      `;
      document.body.appendChild(progressBar);

      window.addEventListener('scroll', utils.throttle(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        progressBar.style.width = scrollPercent + '%';
      }, 16));
    }
  };

  // ===== CARD INTERACTIONS =====
  const cardInteractions = {
    init: () => {
      elements.cards.forEach(card => {
        cardInteractions.setupCardHover(card);
        cardInteractions.setupCardClick(card);
      });
      
      elements.playOverlays.forEach(overlay => {
        overlay.addEventListener('click', (e) => {
          e.stopPropagation();
          cardInteractions.playCardTrack(overlay.closest('.card'));
        });
      });
    },

    setupCardHover: (card) => {
      const image = card.querySelector('img');
      const overlay = card.querySelector('.play-overlay');
      
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px) scale(1.02)';
        if (image) image.style.transform = 'scale(1.03)';
        if (overlay) overlay.style.opacity = '1';
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
        if (image) image.style.transform = 'scale(1)';
        if (overlay) overlay.style.opacity = '0';
      });
    },

    setupCardClick: (card) => {
      card.addEventListener('click', () => {
        cardInteractions.playCardTrack(card);
      });
    },

    playCardTrack: (card) => {
      const title = card.querySelector('strong')?.textContent;
      const artist = card.querySelector('small')?.textContent;
      
      // Find matching track
      const trackIndex = tracks.findIndex(track => 
        track.title === title || track.artist === artist
      );
      
      if (trackIndex !== -1) {
        currentTrackIndex = trackIndex;
        player.loadTrack(currentTrackIndex);
        player.play();
        
        // Scroll to player
        elements.player.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  // ===== CAROUSEL FUNCTIONALITY =====
  const carousel = {
    init: () => {
      const carousels = document.querySelectorAll('.carousel');
      
      carousels.forEach(carouselEl => {
        carousel.setupDragScroll(carouselEl);
        carousel.setupTouchScroll(carouselEl);
        carousel.setupKeyboardScroll(carouselEl);
      });
    },

    setupDragScroll: (carouselEl) => {
      let isDown = false;
      let startX;
      let scrollLeft;

      carouselEl.addEventListener('mousedown', (e) => {
        isDown = true;
        carouselEl.classList.add('active');
        startX = e.pageX - carouselEl.offsetLeft;
        scrollLeft = carouselEl.scrollLeft;
      });

      carouselEl.addEventListener('mouseleave', () => {
        isDown = false;
        carouselEl.classList.remove('active');
      });

      carouselEl.addEventListener('mouseup', () => {
        isDown = false;
        carouselEl.classList.remove('active');
      });

      carouselEl.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carouselEl.offsetLeft;
        const walk = (x - startX) * 2;
        carouselEl.scrollLeft = scrollLeft - walk;
      });
    },

    setupTouchScroll: (carouselEl) => {
      let startX;
      let scrollLeft;

      carouselEl.addEventListener('touchstart', (e) => {
        startX = e.touches[0].pageX - carouselEl.offsetLeft;
        scrollLeft = carouselEl.scrollLeft;
      });

      carouselEl.addEventListener('touchmove', (e) => {
        if (!startX) return;
        const x = e.touches[0].pageX - carouselEl.offsetLeft;
        const walk = (x - startX) * 2;
        carouselEl.scrollLeft = scrollLeft - walk;
      });

      carouselEl.addEventListener('touchend', () => {
        startX = null;
      });
    },

    setupKeyboardScroll: (carouselEl) => {
      carouselEl.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          carouselEl.scrollBy({ left: -200, behavior: 'smooth' });
        } else if (e.key === 'ArrowRight') {
          carouselEl.scrollBy({ left: 200, behavior: 'smooth' });
        }
      });
    }
  };

  // ===== EVENT LISTENERS =====
  const eventListeners = {
    init: () => {
      // Player controls
      elements.playBtn.addEventListener('click', player.play);
      elements.prevBtn.addEventListener('click', player.prev);
      elements.nextBtn.addEventListener('click', player.next);
      elements.shuffleBtn.addEventListener('click', player.toggleShuffle);
      elements.repeatBtn.addEventListener('click', player.toggleRepeat);

      // Hero controls
      if (elements.heroPlay) {
        elements.heroPlay.addEventListener('click', player.play);
      }
      
      if (elements.heroSave) {
        elements.heroSave.addEventListener('click', () => {
          elements.heroSave.innerHTML = '<span class="btn-icon">✓</span>Saved';
          setTimeout(() => {
            elements.heroSave.innerHTML = '<span class="btn-icon">♡</span>Save';
          }, 2000);
        });
      }

      // Progress bar
      elements.progressBar.addEventListener('click', (e) => {
        const rect = elements.progressBar.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = utils.clamp(x / rect.width, 0, 1);
        player.seekTo(percentage);
      });

      // Volume control
      elements.volume.addEventListener('input', (e) => {
        player.setVolume(parseFloat(e.target.value));
      });

      // Keyboard shortcuts
      document.addEventListener('keydown', eventListeners.handleKeyboard);

      // Window events
      window.addEventListener('resize', utils.debounce(eventListeners.handleResize, 250));
      
      // Scroll events
      window.addEventListener('scroll', utils.throttle(eventListeners.handleScroll, 16));

      // Visibility change (pause when tab is hidden)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && isPlaying) {
          // Optionally pause when tab is hidden
          // player.pause();
        }
      });
    },

    handleKeyboard: (e) => {
      // Prevent default for music player shortcuts
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          player.play();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          player.prev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          player.next();
          break;
        case 'KeyS':
          if (e.ctrlKey) {
            e.preventDefault();
            player.toggleShuffle();
          }
          break;
        case 'KeyR':
          if (e.ctrlKey) {
            e.preventDefault();
            player.toggleRepeat();
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          player.setVolume(volume + 0.1);
          break;
        case 'ArrowDown':
      e.preventDefault();
          player.setVolume(volume - 0.1);
          break;
      }
    },

    handleResize: () => {
      // Handle responsive adjustments
      const isMobile = window.innerWidth <= 768;
      
      if (isMobile) {
        elements.sidebar.style.position = 'relative';
        elements.player.style.left = '16px';
        elements.player.style.right = '16px';
      } else {
        elements.sidebar.style.position = 'fixed';
        elements.player.style.left = '304px';
        elements.player.style.right = '24px';
      }
    },

    handleScroll: () => {
      // Hide/show player based on scroll direction
      const scrollY = window.scrollY;
      const lastScrollY = window.lastScrollY || 0;
      
      if (scrollY > lastScrollY && scrollY > 100) {
        elements.player.style.transform = 'translateY(100px)';
      } else {
        elements.player.style.transform = 'translateY(0)';
      }
      
      window.lastScrollY = scrollY;
    }
  };

  // ===== PERFORMANCE OPTIMIZATIONS =====
  const performance = {
    init: () => {
      // Preload images
      performance.preloadImages();
      
      // Setup intersection observer for lazy loading
      performance.setupLazyLoading();
      
      // Optimize animations
      performance.optimizeAnimations();
    },

    preloadImages: () => {
      const imageUrls = tracks.map(track => track.art);
      imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
      });
    },

    setupLazyLoading: () => {
      const images = document.querySelectorAll('img[data-src]');
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
    });
  });

      images.forEach(img => imageObserver.observe(img));
    },

    optimizeAnimations: () => {
      // Add will-change for animated elements
      const animatedElements = document.querySelectorAll('.card, .player, .floating-player');
      animatedElements.forEach(el => {
        el.style.willChange = 'transform, opacity';
      });
    }
  };

  // ===== HERO SLIDESHOW =====
  const heroSlideshow = {
    currentSlide: 0,
    totalSlides: 5,
    isPlaying: true,
    slideInterval: null,
    
    slides: [
      {
        title: "Neon Nights",
        subtitle: "Curated beats, chill vibes and fresh releases. Tune in and unwind with the perfect soundtrack for your night.",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop&crop=center",
        gradient: "linear-gradient(135deg, #1DB954, #2ecc71)"
      },
      {
        title: "Electric Dreams",
        subtitle: "High-energy electronic music that will get you moving. Perfect for your workout or party playlist.",
        image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=600&h=600&fit=crop&crop=center",
        gradient: "linear-gradient(135deg, #e74c3c, #f39c12)"
      },
      {
        title: "Midnight City",
        subtitle: "Urban beats and city sounds that capture the essence of modern life. From dawn to dusk.",
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=600&fit=crop&crop=center",
        gradient: "linear-gradient(135deg, #9b59b6, #8e44ad)"
      },
      {
        title: "Synthwave Vibes",
        subtitle: "Retro-futuristic sounds that transport you to another dimension. A journey through time and space.",
        image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&h=600&fit=crop&crop=center",
        gradient: "linear-gradient(135deg, #3498db, #2980b9)"
      },
      {
        title: "Cyber Pulse",
        subtitle: "Cutting-edge electronic music that pushes boundaries. Experience the future of sound today.",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop&crop=center",
        gradient: "linear-gradient(135deg, #f1c40f, #f39c12)"
      }
    ],

    init: () => {
      heroSlideshow.setupIndicators();
      heroSlideshow.startSlideshow();
      heroSlideshow.preloadImages();
    },

    startSlideshow: () => {
      heroSlideshow.slideInterval = setInterval(() => {
        heroSlideshow.nextSlide();
      }, 4000); // Change slide every 4 seconds
    },

    nextSlide: () => {
      heroSlideshow.currentSlide = (heroSlideshow.currentSlide + 1) % heroSlideshow.totalSlides;
      heroSlideshow.updateSlide();
    },

    goToSlide: (slideIndex) => {
      heroSlideshow.currentSlide = slideIndex;
      heroSlideshow.updateSlide();
    },

    updateSlide: () => {
      const slide = heroSlideshow.slides[heroSlideshow.currentSlide];
      
      // Update background slides
      document.querySelectorAll('.slide').forEach((slideEl, index) => {
        slideEl.classList.toggle('active', index === heroSlideshow.currentSlide);
      });

      // Update title slideshow
      document.querySelectorAll('.title-slide').forEach((titleEl, index) => {
        titleEl.classList.toggle('active', index === heroSlideshow.currentSlide);
        titleEl.textContent = heroSlideshow.slides[index].title;
      });

      // Update subtitle slideshow
      document.querySelectorAll('.subtitle-slide').forEach((subtitleEl, index) => {
        subtitleEl.classList.toggle('active', index === heroSlideshow.currentSlide);
        subtitleEl.textContent = heroSlideshow.slides[index].subtitle;
      });

      // Update hero artwork with smooth transition
      const heroArtwork = document.getElementById('hero-artwork');
      if (heroArtwork) {
        heroArtwork.style.opacity = '0.7';
        setTimeout(() => {
          heroArtwork.src = slide.image;
          heroArtwork.style.opacity = '1';
        }, 300);
      }

      // Update indicators
      document.querySelectorAll('.indicator').forEach((indicator, index) => {
        indicator.classList.toggle('active', index === heroSlideshow.currentSlide);
      });

      // Update hero background gradient
      const heroBackground = document.querySelector('.hero-background');
      if (heroBackground) {
        heroBackground.style.background = slide.gradient;
      }
    },

    setupIndicators: () => {
      document.querySelectorAll('.indicator').forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
          heroSlideshow.goToSlide(index);
          heroSlideshow.pauseSlideshow();
          setTimeout(() => {
            heroSlideshow.resumeSlideshow();
          }, 8000); // Resume after 8 seconds
        });
      });
    },

    pauseSlideshow: () => {
      if (heroSlideshow.slideInterval) {
        clearInterval(heroSlideshow.slideInterval);
        heroSlideshow.isPlaying = false;
      }
    },

    resumeSlideshow: () => {
      if (!heroSlideshow.isPlaying) {
        heroSlideshow.isPlaying = true;
        heroSlideshow.startSlideshow();
      }
    },

    preloadImages: () => {
      heroSlideshow.slides.forEach(slide => {
        const img = new Image();
        img.src = slide.image;
      });
    }
  };

  // ===== LOADING ANIMATIONS =====
  const loadingAnimations = {
    init: () => {
      loadingAnimations.setupEntranceAnimations();
      loadingAnimations.setupStaggeredReveals();
    },

    setupEntranceAnimations: () => {
      // Add entrance animation to main elements
      const elements = [
        { selector: '.sidebar', delay: 0 },
        { selector: '.hero', delay: 200 },
        { selector: '.section', delay: 400 }
      ];

      elements.forEach(({ selector, delay }) => {
        const element = document.querySelector(selector);
        if (element) {
          element.style.opacity = '0';
          element.style.transform = 'translateY(30px)';
          
          setTimeout(() => {
            element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
          }, delay);
        }
      });
    },

    setupStaggeredReveals: () => {
      const cards = document.querySelectorAll('.card');
      cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
          card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, 600 + (index * 100)); // Staggered reveal
      });
    }
  };

  // ===== TOOLTIP SYSTEM =====
  const tooltipSystem = {
    tooltip: null,
    currentElement: null,
    showTimeout: null,
    hideTimeout: null,

    init: () => {
      tooltipSystem.tooltip = document.getElementById('tooltip');
      tooltipSystem.setupTooltips();
    },

    setupTooltips: () => {
      const elementsWithTooltips = document.querySelectorAll('[data-tooltip]');
      
      elementsWithTooltips.forEach(element => {
        element.addEventListener('mouseenter', (e) => {
          tooltipSystem.showTooltip(e.target, e.target.dataset.tooltip);
        });
        
        element.addEventListener('mouseleave', () => {
          tooltipSystem.hideTooltip();
        });
        
        element.addEventListener('mousemove', (e) => {
          tooltipSystem.updateTooltipPosition(e);
        });
      });
    },

    showTooltip: (element, text) => {
      if (tooltipSystem.hideTimeout) {
        clearTimeout(tooltipSystem.hideTimeout);
        tooltipSystem.hideTimeout = null;
      }

      tooltipSystem.showTimeout = setTimeout(() => {
        if (tooltipSystem.tooltip && text) {
          tooltipSystem.currentElement = element;
          tooltipSystem.tooltip.textContent = text;
          tooltipSystem.tooltip.classList.add('show');
          tooltipSystem.updateTooltipPosition({ clientX: 0, clientY: 0 });
        }
      }, 500); // 500ms delay before showing
    },

    hideTooltip: () => {
      if (tooltipSystem.showTimeout) {
        clearTimeout(tooltipSystem.showTimeout);
        tooltipSystem.showTimeout = null;
      }

      tooltipSystem.hideTimeout = setTimeout(() => {
        if (tooltipSystem.tooltip) {
          tooltipSystem.tooltip.classList.remove('show');
          tooltipSystem.currentElement = null;
        }
      }, 100);
    },

    updateTooltipPosition: (e) => {
      if (!tooltipSystem.tooltip || !tooltipSystem.currentElement) return;

      const rect = tooltipSystem.currentElement.getBoundingClientRect();
      const tooltipRect = tooltipSystem.tooltip.getBoundingClientRect();
      
      let x = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
      let y = rect.top - tooltipRect.height - 10;
      
      // Keep tooltip within viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      if (x < 10) x = 10;
      if (x + tooltipRect.width > viewportWidth - 10) {
        x = viewportWidth - tooltipRect.width - 10;
      }
      
      if (y < 10) {
        y = rect.bottom + 10;
        tooltipSystem.tooltip.classList.add('tooltip-bottom');
      } else {
        tooltipSystem.tooltip.classList.remove('tooltip-bottom');
      }
      
      tooltipSystem.tooltip.style.left = x + 'px';
      tooltipSystem.tooltip.style.top = y + 'px';
    }
  };

  // ===== ENHANCED INTERACTIONS =====
  const enhancedInteractions = {
    init: () => {
      enhancedInteractions.setupNavigation();
      enhancedInteractions.setupPlaylistInteractions();
      enhancedInteractions.setupSectionInteractions();
      enhancedInteractions.setupVolumeMute();
      enhancedInteractions.setupQueueModal();
      enhancedInteractions.setupDeviceModal();
    },

    setupNavigation: () => {
      document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const href = link.getAttribute('href');
          
          // Update active state
          document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
          link.classList.add('active');
          
          // Scroll to section
          if (href.startsWith('#')) {
            const target = document.querySelector(href);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth' });
            }
          }
          
          // Show feedback
          link.style.transform = 'scale(0.95)';
          setTimeout(() => {
            link.style.transform = '';
          }, 150);
        });
      });
    },

    setupPlaylistInteractions: () => {
      // Create playlist button
      const createPlaylist = document.querySelector('.create-playlist');
      if (createPlaylist) {
        createPlaylist.addEventListener('click', () => {
          createPlaylist.innerHTML = '<span class="icon">✓</span>Playlist Created!';
          createPlaylist.style.background = 'var(--gradient-primary)';
          setTimeout(() => {
            createPlaylist.innerHTML = '<span class="icon">+</span>Create Playlist';
            createPlaylist.style.background = '';
          }, 2000);
        });
      }

      // Playlist items
      document.querySelectorAll('.playlist-item').forEach(item => {
        item.addEventListener('click', () => {
          document.querySelectorAll('.playlist-item').forEach(i => i.classList.remove('active'));
          item.classList.add('active');
          
          // Simulate loading playlist
          const playlistName = item.querySelector('span:last-child').textContent;
          console.log(`Loading playlist: ${playlistName}`);
        });
      });
    },

    setupSectionInteractions: () => {
      document.querySelectorAll('.section-more').forEach(button => {
        button.addEventListener('click', () => {
          button.innerHTML = 'Loading...';
          button.style.color = 'var(--accent-green)';
          setTimeout(() => {
            button.innerHTML = 'Show all';
            button.style.color = '';
          }, 1500);
        });
      });
    },

    setupVolumeMute: () => {
      const volumeBtn = document.querySelector('.volume-btn');
      if (volumeBtn) {
        volumeBtn.addEventListener('click', () => {
          if (volume > 0) {
            player.setVolume(0);
            volumeBtn.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 5 6 9H2v6h4l5 4V5Z"/>
                <path d="M23 9l-6 6M17 9l6 6"/>
              </svg>
            `;
          } else {
            player.setVolume(0.7);
            volumeBtn.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 5 6 9H2v6h4l5 4V5Z"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
              </svg>
            `;
          }
        });
      }
    },

    setupQueueModal: () => {
      const queueBtn = document.querySelector('.queue-btn');
      if (queueBtn) {
        queueBtn.addEventListener('click', () => {
          // Create and show queue modal
          const modal = document.createElement('div');
          modal.className = 'queue-modal';
          modal.innerHTML = `
            <div class="modal-content">
              <h3>Up Next</h3>
              <div class="queue-list">
                ${tracks.map((track, index) => `
                  <div class="queue-item ${index === currentTrackIndex ? 'current' : ''}">
                    <img src="${track.art}" alt="${track.title}">
                    <div class="queue-info">
                      <strong>${track.title}</strong>
                      <small>${track.artist}</small>
                    </div>
                    ${index === currentTrackIndex ? '<span class="current-indicator">▶</span>' : ''}
                  </div>
                `).join('')}
              </div>
              <button class="close-queue">Close</button>
            </div>
          `;
          
          document.body.appendChild(modal);
          
          // Close modal
          modal.querySelector('.close-queue').addEventListener('click', () => {
            modal.remove();
          });
          
          modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
          });
        });
      }
    },

    setupDeviceModal: () => {
      const deviceBtn = document.querySelector('.device-btn');
      if (deviceBtn) {
        deviceBtn.addEventListener('click', () => {
          // Create and show device modal
          const modal = document.createElement('div');
          modal.className = 'device-modal';
          modal.innerHTML = `
            <div class="modal-content">
              <h3>Connect to a Device</h3>
              <div class="device-list">
                <div class="device-item">
                  <div class="device-icon">🔊</div>
                  <div class="device-info">
                    <strong>This Computer</strong>
                    <small>Currently playing</small>
                  </div>
                  <div class="device-status active">Connected</div>
                </div>
                <div class="device-item">
                  <div class="device-icon">📱</div>
                  <div class="device-info">
                    <strong>iPhone (John's iPhone)</strong>
                    <small>Available</small>
                  </div>
                  <div class="device-status">Connect</div>
                </div>
                <div class="device-item">
                  <div class="device-icon">🎧</div>
                  <div class="device-info">
                    <strong>AirPods Pro</strong>
                    <small>Available</small>
                  </div>
                  <div class="device-status">Connect</div>
                </div>
              </div>
              <button class="close-device">Close</button>
            </div>
          `;
          
          document.body.appendChild(modal);
          
          // Close modal
          modal.querySelector('.close-device').addEventListener('click', () => {
            modal.remove();
          });
          
          modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
          });
        });
      }
    }
  };

  // ===== INITIALIZATION =====
  const init = () => {
    // Initialize all modules
    player.loadTrack(currentTrackIndex);
    player.setVolume(volume);
    
    // Initialize new systems
    tooltipSystem.init();
    enhancedInteractions.init();
    
    // Initialize slideshow and animations
    heroSlideshow.init();
    loadingAnimations.init();
    
    scrollAnimations.init();
    cardInteractions.init();
    carousel.init();
    eventListeners.init();
    performance.init();

    // Add loading complete class
    setTimeout(() => {
      document.body.classList.add('loaded');
    }, 1000);
    
    // Show welcome message
    console.log('🎵 Pulse Music Player initialized successfully!');
    console.log('🎹 Keyboard shortcuts: Space (play/pause), ← → (prev/next), ↑ ↓ (volume)');
    console.log('🎨 Colorful slideshow with dynamic content loaded!');
    console.log('💡 Hover over buttons to see tooltips!');
  };

  // ===== START THE APPLICATION =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ===== EXPOSE GLOBAL API =====
  window.PulsePlayer = {
    player,
    utils,
    tracks,
    currentTrack: () => tracks[currentTrackIndex],
    isPlaying: () => isPlaying,
    volume: () => volume
  };

})();