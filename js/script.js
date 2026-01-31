document.addEventListener('DOMContentLoaded', () => {
    // --- Clean URL Logic ---
    const cleanURL = () => {
        try {
            if (window.history.replaceState && window.location.protocol !== 'file:') {
                // Mask the URL to show only the root domain
                window.history.replaceState(null, document.title, '/');
            }
        } catch (e) {
            console.warn("Could not clean URL:", e);
        }
    };

    // Initial clean on page load
    cleanURL();


    // --- Dynamic Gallery Rendering ---
    const galleryGrid = document.getElementById('gallery-grid');
    if (galleryGrid && typeof ALL_IMAGES !== 'undefined') {
        ALL_IMAGES.forEach((imageData, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.setAttribute('data-index', index);

            // Google Drive Direct Link format
            const imageUrl = `https://lh3.googleusercontent.com/d/${imageData.id}=w1000`;

            item.innerHTML = `
                <img src="${imageUrl}" alt="${imageData.alt || 'Gallery Image'}" loading="lazy">
                <div class="gallery-overlay"><span>+</span></div>
            `;
            galleryGrid.appendChild(item);
        });
    }

    // --- Dynamic Media Cards Rendering ---
    const mediaGrid = document.getElementById('media-grid');
    if (mediaGrid && typeof ALL_CARDS !== 'undefined') {
        ALL_CARDS.forEach((cardData, index) => {
            const card = document.createElement('div');
            card.className = 'media-card';
            card.setAttribute('data-index', index);
            // Google Drive Direct Link format for smaller cards
            const imageUrl = `https://lh3.googleusercontent.com/d/${cardData.id}=w400`;
            card.innerHTML = `
                <img src="${imageUrl}" alt="${cardData.alt || 'Media Card'}" loading="lazy">
            `;
            mediaGrid.appendChild(card);
        });
    }


    // --- Lightbox for Gallery ---
    // Use event delegation for gallery items since they are dynamic
    const getGalleryItems = () => document.querySelectorAll('.gallery-item, .media-card');
    let lightbox = document.getElementById('lightbox');

    // Create lightbox if it doesn't exist (fallback for pages where it might be missing but script runs or if removed from HTML)
    // However, since we added it to gallery.html, we prioritize using that.
    const itemsForLightbox = getGalleryItems();
    if (itemsForLightbox.length > 0) {
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.id = 'lightbox';
            lightbox.className = 'lightbox';
            lightbox.innerHTML = `
                <span class="lightbox-close" id="lightbox-close">&times;</span>
                <div class="lightbox-controls">
                    <button class="lightbox-btn" id="lightbox-share" title="Share">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                    </button>
                    <button class="lightbox-btn" id="lightbox-download" title="Download">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="9" x2="12" y2="15"/></svg>
                    </button>
                </div>
                <button class="lightbox-nav prev" id="lightbox-prev">&#10094;</button>
                <img src="" alt="Zoomed Image" id="lightbox-img">
                <button class="lightbox-nav next" id="lightbox-next">&#10095;</button>
            `;
            document.body.appendChild(lightbox);
        }

        const lightboxImg = lightbox.querySelector('img');
        const lightboxClose = lightbox.querySelector('.lightbox-close');
        const prevBtn = lightbox.querySelector('.prev');
        const nextBtn = lightbox.querySelector('.next');
        const shareBtn = lightbox.querySelector('#lightbox-share');
        const downloadBtn = lightbox.querySelector('#lightbox-download');

        let currentIndex = 0;

        const updateImage = (index) => {
            const items = getGalleryItems();
            if (index < 0) index = items.length - 1;
            if (index >= items.length) index = 0;
            currentIndex = index;

            const item = items[currentIndex];
            const img = item.querySelector('img');
            lightboxImg.src = img.src;
        };

        // --- Download Logic ---
        const downloadImage = async () => {
            const imageUrl = lightboxImg.src;
            const btn = downloadBtn;
            const originalContent = btn.innerHTML;
            try {
                btn.innerHTML = '<span style="font-size: 0.7rem; color: var(--accent-gold);">Wait...</span>';
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;                
                a.download = `pallippana-image-${Date.now()}.jpeg`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                btn.innerHTML = originalContent;
            } catch (error) {
                console.error("Download failed:", error);
                window.open(imageUrl, '_blank');
                btn.innerHTML = originalContent;
            }
        };
        // --- Share Logic ---
        const shareImage = async () => {
            const imageUrl = lightboxImg.src;
            const btn = shareBtn;
            const originalContent = btn.innerHTML;
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'Pallippana 2026',
                        text: 'Check out this visual from Pallippana 2026',
                        url: imageUrl // Share the actual image URL now
                    });
                } catch (err) {
                    if (err.name !== 'AbortError') console.error("Share failed:", err);
                }
            } else {
                // Fallback: Copy Link
                try {
                    await navigator.clipboard.writeText(imageUrl);
                    btn.innerHTML = '<span style="font-size: 0.7rem; color: var(--accent-gold);">Copied!</span>';
                    setTimeout(() => {
                        btn.innerHTML = originalContent;
                    }, 2000);
                } catch (err) {
                    console.error("Copy failed:", err);
                }
            }
        };

        // Use event delegation for dynamic items
        document.addEventListener('click', (e) => {
            const item = e.target.closest('.gallery-item, .media-card');
            if (item) {
                const items = getGalleryItems();
                // Convert NodeList to Array to find index
                currentIndex = Array.from(items).indexOf(item);
                if (currentIndex === -1) return; // Not in currently visible set
                updateImage(currentIndex);
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        };

        lightboxClose.addEventListener('click', closeLightbox);

        // Navigation events
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            updateImage(currentIndex - 1);
        });

        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            updateImage(currentIndex + 1);
        });

        if (shareBtn) shareBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            shareImage();
        });
        if (downloadBtn) downloadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            downloadImage();
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;

            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowLeft") updateImage(currentIndex - 1);
            if (e.key === "ArrowRight") updateImage(currentIndex + 1);
        });
    }

    // --- Sticky Navbar ---
    const navbar = document.querySelector('.navbar');
    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    // Re-check after a delay to catch browser auto-scroll to anchors
    setTimeout(handleScroll, 100);
    setTimeout(handleScroll, 500);

    // --- Mobile Menu Toggle ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // Change icon (optional simplistic toggle)
            menuToggle.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
        });

        // Close menu when clicking a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.textContent = '☰';
            });
        });
    }

    // --- Smooth Scrolling ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Offset for fixed header
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });

                // Clean the URL after a short delay to allow scroll to initiate
                setTimeout(cleanURL, 100);
            }
        });
    });


    // --- Fade In Animation Details ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(element => {
        observer.observe(element);
    });

    // --- Program Slider Logic ---
    const sliderTrack = document.querySelector('.program-slider-track');
    const programCards = document.querySelectorAll('.program-card');

    if (sliderTrack && programCards.length > 0) {
        // 1. Double Cloning for robust infinite loop (Prepend and Append)
        // const cardWidth = 300;
        // const gap = 32;
        // const step = cardWidth + gap;
        const totalCards = programCards.length;

        // Prepend clones
        [...programCards].reverse().forEach(card => {
            const clone = card.cloneNode(true);
            clone.classList.add('clone');
            sliderTrack.insertBefore(clone, sliderTrack.firstChild);
        });

        // Append clones
        programCards.forEach(card => {
            const clone = card.cloneNode(true);
            clone.classList.add('clone');
            sliderTrack.appendChild(clone);
        });

        // Current index starts at the first card of the original set
        let currentIndex = totalCards;
        let isTransitioning = false;

        const getSlideStep = () => {
            const card = programCards[0]; // Use original card for measurement
            if (!card) return 332; // Fallback
            const style = window.getComputedStyle(sliderTrack);
            const gap = parseFloat(style.gap) || 32;
            return card.offsetWidth + gap;
        };

        const updateSliderPosition = (withTransition = true) => {
            const step = getSlideStep();
            const card = programCards[0];
            if (!card) return;

            // Centering Logic (Only for mobile/tablet where card width is dynamic/centered)
            // TranslateX = - (Index * Step) + (WrapperWidth - CardWidth)/2 - WrapperPaddingLeft
            const wrapper = document.querySelector('.program-slider-wrapper');
            let centerOffset = 0;
            // Match the CSS breakpoint for mobile card width (850px)
            if (wrapper && window.innerWidth <= 850) {
                const wrapperWidth = wrapper.offsetWidth;
                const cardWidth = card.offsetWidth;
                const style = window.getComputedStyle(wrapper);
                const paddingLeft = parseFloat(style.paddingLeft) || 0;

                centerOffset = (wrapperWidth - cardWidth) / 2 - paddingLeft;
            }

            const offset = -(currentIndex * step) + centerOffset;

            sliderTrack.style.transition = withTransition ? 'transform 0.5s ease-in-out' : 'none';
            sliderTrack.style.transform = `translateX(${offset}px)`;
        };

        // Window Resize Handler
        window.addEventListener('resize', () => {
            updateSliderPosition(false);
        });

        const handleSeamlessLoop = () => {
            if (currentIndex >= totalCards * 2) {
                // We're on the appended set, jump back to original set
                currentIndex -= totalCards;
                updateSliderPosition(false);
            } else if (currentIndex < totalCards) {
                // We're on the prepended set, jump forward to original set
                currentIndex += totalCards;
                updateSliderPosition(false);
            }
            isTransitioning = false;
        };

        const slideNext = () => {
            if (isTransitioning) return;
            isTransitioning = true;
            currentIndex++;
            updateSliderPosition(true);
            setTimeout(handleSeamlessLoop, 500); // Wait for transition
        };

        const slidePrev = () => {
            if (isTransitioning) return;
            isTransitioning = true;
            currentIndex--;
            updateSliderPosition(true);
            setTimeout(handleSeamlessLoop, 500); // Wait for transition
        };

        let autoSlideInterval;
        const autoSlideDelay = 3000;

        const startAutoSlide = () => {
            stopAutoSlide();
            autoSlideInterval = setInterval(slideNext, autoSlideDelay);
        };

        const stopAutoSlide = () => {
            clearInterval(autoSlideInterval);
        };

        // Initialize position
        const initSlider = () => {
            updateSliderPosition(false);
            // Re-run after a short delay to account for any late layout shifts/font loads
            setTimeout(() => updateSliderPosition(false), 100);
            startAutoSlide();
        };

        if (document.readyState === 'complete') {
            initSlider();
        } else {
            window.addEventListener('load', initSlider);
        }

        // Pause on Hover
        sliderTrack.addEventListener('mouseenter', stopAutoSlide);
        sliderTrack.addEventListener('mouseleave', startAutoSlide);

        // Manual Controls
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                stopAutoSlide();
                slidePrev();
            });

            nextBtn.addEventListener('click', () => {
                stopAutoSlide();
                slideNext();
            });

            prevBtn.addEventListener('mouseenter', stopAutoSlide);
            nextBtn.addEventListener('mouseenter', stopAutoSlide);
        }

        // Resize Listener
        window.addEventListener('resize', () => {
            // Stop auto slide temporarily to prevent conflict or jumpiness
            stopAutoSlide();
            // Recalculate position
            sliderTrack.style.transition = 'none'; // Instant update
            updateSliderPosition();
            // Debounce or just restart auto slide?
            // Simple restart
            startAutoSlide();
        });

        // 3. Navigation interaction (Replacing Modal)
        // Use event delegation for original and cloned cards
        sliderTrack.addEventListener('click', (e) => {
            const card = e.target.closest('.program-card');
            if (!card) return;

            // Get day number from data-day="Day X"
            const dayText = card.getAttribute('data-day');
            const dayNumber = dayText.replace('Day ', '');

            // Navigate to day-wise.html with hash
            window.location.href = `day-wise.html#day-${dayNumber}`;
        });
    }
    // 4. Day-wise Detail Page Scroll logic
    if (window.location.pathname.includes('day-wise.html')) {
        const scrollToDay = () => {
            const hash = window.location.hash;
            if (hash && hash.startsWith('#day-')) {
                const target = document.querySelector(hash);
                if (target) {
                    setTimeout(() => {
                        const headerOffset = 100;
                        const elementPosition = target.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: "smooth"
                        });
                    }, 100); // Small delay to ensure page is ready
                }
            }
        };

        // Run on load
        window.addEventListener('load', () => {
            scrollToDay();
            setTimeout(cleanURL, 200);
        });
        // Run on hash change (if already on page)
        window.addEventListener('hashchange', () => {
            scrollToDay();
            setTimeout(cleanURL, 200);
        });
    }
});
