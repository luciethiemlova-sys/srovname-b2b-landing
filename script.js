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
// Partner Slider Controls
document.addEventListener('DOMContentLoaded', () => {

    // Generic infinite-loop index-based slider
    const setupInfiniteSlider = (sliderId, prevBtnSelector, nextBtnSelector, itemSelector, visibleCount) => {
        const slider = document.getElementById(sliderId);
        if (!slider) return;

        const prevBtn = document.querySelector(prevBtnSelector);
        const nextBtn = document.querySelector(nextBtnSelector);
        if (!prevBtn || !nextBtn) return;

        const items = slider.querySelectorAll(itemSelector);
        if (!items.length) return;

        let currentIndex = 0;
        const total = items.length;

        const scrollToIndex = (index) => {
            // Wrap around
            if (index >= total) index = 0;
            if (index < 0) index = total - 1;
            currentIndex = index;

            const item = items[currentIndex];
            // Scroll the slider so the target item is visible at the left
            slider.scrollTo({
                left: item.offsetLeft,
                behavior: 'smooth'
            });
        };

        nextBtn.addEventListener('click', () => scrollToIndex(currentIndex + (visibleCount || 1)));
        prevBtn.addEventListener('click', () => scrollToIndex(currentIndex - (visibleCount || 1)));
    };

    // Setup Photo Slider (shows ~3 photos, step by 1)
    const partnerWrapper = document.querySelector('.partner-slider-wrapper');
    if (partnerWrapper) {
        const prevBtn = partnerWrapper.querySelector('.slider-arrow.prev');
        const nextBtn = partnerWrapper.querySelector('.slider-arrow.next');
        setupInfiniteSlider('partnerSlider',
            '#active-partners .slider-arrow.prev',
            '#active-partners .slider-arrow.next',
            '.partner-slide',
            1
        );
        // Fallback: if querySelector above doesn't find them, bind directly
        if (prevBtn && nextBtn) {
            const slider = document.getElementById('partnerSlider');
            const items = slider ? slider.querySelectorAll('.partner-slide') : [];
            let idx = 0;
            const goTo = (i) => {
                if (!items.length) return;
                if (i >= items.length) i = 0;
                if (i < 0) i = items.length - 1;
                idx = i;
                slider.scrollTo({ left: items[idx].offsetLeft, behavior: 'smooth' });
            };
            nextBtn.onclick = () => goTo(idx + 1);
            prevBtn.onclick = () => goTo(idx - 1);
        }
    }

    // Setup Testimonial Slider (infinite loop)
    const testimonialWrapper = document.querySelector('.testimonial-slider-wrapper');
    if (testimonialWrapper) {
        const prevBtn = document.getElementById('testimonialPrev');
        const nextBtn = document.getElementById('testimonialNext');
        const slider = document.getElementById('testimonialSlider');
        const items = slider ? slider.querySelectorAll('.testimonial-card') : [];
        let idx = 0;

        const goTo = (i) => {
            if (!items.length) return;
            if (i >= items.length) i = 0;
            if (i < 0) i = items.length - 1;
            idx = i;
            slider.scrollTo({ left: items[idx].offsetLeft, behavior: 'smooth' });
        };

        if (nextBtn) nextBtn.addEventListener('click', () => goTo(idx + 1));
        if (prevBtn) prevBtn.addEventListener('click', () => goTo(idx - 1));
    }
});
