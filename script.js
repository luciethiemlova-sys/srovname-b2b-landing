// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        // Change icon to X when open
        const icon = mobileMenuBtn.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
    });

    // Close mobile menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    });
}

// FAQ Accordion
document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const faqItem = button.parentElement;

        // Close other items
        document.querySelectorAll('.faq-item').forEach(item => {
            if (item !== faqItem) {
                item.classList.remove('faq-open');
            }
        });

        faqItem.classList.toggle('faq-open');
    });
});

// Scroll Reveal Animation
const revealElements = document.querySelectorAll('.reveal');

const scrollReveal = () => {
    revealElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (elementTop < windowHeight - 50) {
            element.classList.add('active');
        }
    });
};

window.addEventListener('scroll', scrollReveal);
// Trigger once on load
window.addEventListener('DOMContentLoaded', scrollReveal);

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Form Submission with AJAX and Redirect – Double Opt-In
// ⚠️ Po nasazení Google Apps Scriptu nahraďte URL níže vaší GAS Web App URL
const GAS_URL = "https://script.google.com/macros/s/AKfycbxJY3pRgz5tmJzMEn2MCfCzP2E2uh8PWbjzFdL_dzIEciLLjCJL2nDcD62RYdhe7-I9/exec";

const registrationForm = document.getElementById('registration-form');

if (registrationForm) {
    // Přepsat action formuláře na GAS URL
    registrationForm.action = GAS_URL;

    registrationForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const form = e.target;
        const button = form.querySelector('button[type="submit"]');
        const originalButtonText = button.innerHTML;

        // Change button state
        button.disabled = true;
        button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Odesílám...';

        const formData = new FormData(form);

        try {
            // Skrytý iframe – nejspolehlivější metoda pro GAS bez CORS problémů
            const iframe = document.createElement('iframe');
            iframe.name = 'gas-iframe-' + Date.now();
            iframe.style.display = 'none';
            document.body.appendChild(iframe);

            const hiddenForm = document.createElement('form');
            hiddenForm.method = 'POST';
            hiddenForm.action = GAS_URL;
            hiddenForm.target = iframe.name;
            hiddenForm.style.display = 'none';

            for (const [key, value] of formData.entries()) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = value;
                hiddenForm.appendChild(input);
            }

            document.body.appendChild(hiddenForm);
            hiddenForm.submit();

            // Počkáme chvíli a přesměrujeme
            setTimeout(() => {
                const email = formData.get('email');
                window.location.href = `/dekujeme.html?email=${encodeURIComponent(email)}`;
            }, 1500);

        } catch (error) {
            alert('Chyba při odesílání. Zkontrolujte prosím své připojení k internetu.');
            resetButton();
        }

        function resetButton() {
            button.disabled = false;
            button.innerHTML = originalButtonText;
        }
    });
}
// Partner & Testimonial Sliders
document.addEventListener('DOMContentLoaded', () => {
    /**
     * Seamless Infinite Slider
     * @param {string} sliderId 
     * @param {string} prevBtnSelector 
     * @param {string} nextBtnSelector 
     * @param {string} itemSelector 
     * @param {number} step - how many items to scroll
     */
    const setupSeamlessSlider = (sliderId, prevBtnSelector, nextBtnSelector, itemSelector, step = 1) => {
        const slider = document.getElementById(sliderId);
        if (!slider) return;

        const prevBtn = document.querySelector(prevBtnSelector);
        const nextBtn = document.querySelector(nextBtnSelector);
        if (!prevBtn || !nextBtn) return;

        let items = Array.from(slider.querySelectorAll(itemSelector));
        if (items.length < 2) return;

        const originalCount = items.length;

        // Clone items for infinite effect
        // We clone a few items to ensure the view is always filled during transition
        const clonesBefore = items.slice(-3).map(item => item.cloneNode(true));
        const clonesAfter = items.slice(0, 3).map(item => item.cloneNode(true));

        clonesBefore.reverse().forEach(clone => slider.insertBefore(clone, slider.firstChild));
        clonesAfter.forEach(clone => slider.appendChild(clone));

        // State
        let isTransitioning = false;
        // Start at the index 3 (because we prepended 3 clones)
        let currentIndex = 3;

        const updatePosition = (smooth = true) => {
            const allItems = slider.querySelectorAll(itemSelector);
            const targetItem = allItems[currentIndex];
            if (!targetItem) return;

            // Calculate exact left scroll to center the item
            const scrollLeftPos = targetItem.offsetLeft - (slider.offsetWidth - targetItem.offsetWidth) / 2;

            if (!smooth) {
                // Temporarily disable scroll-snap to prevent browser snapping from fighting our instant jump
                const originalSnap = slider.style.scrollSnapType;
                slider.style.scrollSnapType = 'none';
                slider.scrollTo({ left: scrollLeftPos, behavior: 'auto' });
                // Re-enable in the next frame
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        slider.style.scrollSnapType = originalSnap || '';
                    });
                });
            } else {
                slider.scrollTo({
                    left: scrollLeftPos,
                    behavior: 'smooth'
                });
            }
        };

        // Scroll to initial position
        setTimeout(() => updatePosition(false), 100);

        const handleRotation = () => {
            if (isTransitioning) return;
            isTransitioning = true;

            // After smooth scroll finishes, check if we are on clones and jump back
            setTimeout(() => {
                const totalItems = slider.querySelectorAll(itemSelector).length;
                
                if (currentIndex >= totalItems - 3) {
                    // We are at the end clones, jump to start real items
                    currentIndex = 3 + (currentIndex % originalCount);
                    updatePosition(false);
                } else if (currentIndex < 3) {
                    // We are at the start clones, jump to end real items
                    currentIndex = (totalItems - 3 - originalCount) + (currentIndex % originalCount);
                    updatePosition(false);
                }
                isTransitioning = false;
            }, 600); // 600ms is standard for smooth scrolling
        };

        nextBtn.addEventListener('click', () => {
            if (isTransitioning) return;
            currentIndex += step;
            updatePosition(true);
            handleRotation();
        });

        prevBtn.addEventListener('click', () => {
            if (isTransitioning) return;
            currentIndex -= step;
            updatePosition(true);
            handleRotation();
        });

        // Handle window resize (re-center)
        window.addEventListener('resize', () => {
            if (!isTransitioning) updatePosition(false);
        });
    };

    // Initialize Partner Photos Slider
    setupSeamlessSlider(
        'partnerSlider',
        '#active-partners .slider-arrow.prev',
        '#active-partners .slider-arrow.next',
        '.partner-slide',
        1
    );

    // Initialize Testimonials Slider
    setupSeamlessSlider(
        'testimonialSlider',
        '#testimonialPrev',
        '#testimonialNext',
        '.testimonial-card',
        1
    );
});
