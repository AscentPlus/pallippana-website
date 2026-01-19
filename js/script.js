document.addEventListener('DOMContentLoaded', () => {

    // --- Sticky Navbar ---
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- Mobile Menu Toggle ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

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

    // --- Accordion for Programs ---
    const programHeaders = document.querySelectorAll('.program-header');

    programHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;

            // Toggle active class
            header.classList.toggle('active');

            // Toggle max-height for slide effect
            if (header.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = 0;
            }

            // Optional: Close others
            programHeaders.forEach(otherHeader => {
                if (otherHeader !== header && otherHeader.classList.contains('active')) {
                    otherHeader.classList.remove('active');
                    otherHeader.nextElementSibling.style.maxHeight = 0;
                }
            });
        });
    });

    // --- Lightbox for Gallery ---
    const galleryItems = document.querySelectorAll('.gallery-item');
    let lightbox = document.getElementById('lightbox');

    // Create lightbox if it doesn't exist (fallback for pages where it might be missing but script runs or if removed from HTML)
    // However, since we added it to gallery.html, we prioritize using that.
    if (galleryItems.length > 0) {
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.id = 'lightbox';
            lightbox.className = 'lightbox';
            lightbox.innerHTML = `
                <span class="lightbox-close" id="lightbox-close">&times;</span>
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

        let currentIndex = 0;

        const updateImage = (index) => {
            if (index < 0) index = galleryItems.length - 1;
            if (index >= galleryItems.length) index = 0;
            currentIndex = index;

            const item = galleryItems[currentIndex];
            const img = item.querySelector('img');
            lightboxImg.src = img.src;
        };

        galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                currentIndex = index;
                updateImage(currentIndex);
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
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
});
