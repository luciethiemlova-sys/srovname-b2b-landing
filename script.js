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
    // Shared slider scroll function
    const setupSlider = (sliderId, prevBtnId, nextBtnId, scrollAmount) => {
        const slider = document.getElementById(sliderId);
        const prevBtn = document.getElementById(prevBtnId) || document.querySelector(`.slider-arrow.prev`);
        const nextBtn = document.getElementById(nextBtnId) || document.querySelector(`.slider-arrow.next`);

        if (slider && prevBtn && nextBtn) {
            nextBtn.addEventListener('click', () => {
                slider.scrollBy({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
            });

            prevBtn.addEventListener('click', () => {
                slider.scrollBy({
                    left: -scrollAmount,
                    behavior: 'smooth'
                });
            });
        }
    };

    // Setup Photo Slider
    setupSlider('partnerSlider', null, null, 340);

    // Setup Testimonial Slider
    const testimonialSlider = document.getElementById('testimonialSlider');
    if (testimonialSlider) {
        const getScrollAmount = () => {
            const card = testimonialSlider.querySelector('.testimonial-card');
            return card ? card.offsetWidth + 32 : 400; // 32 is gap (2rem)
        };

        setupSlider('testimonialSlider', 'testimonialPrev', 'testimonialNext', getScrollAmount());

        // Update scroll amount on resize
        window.addEventListener('resize', () => {
            // Re-setup if needed or just use dynamic amount in the listener
        });
    }
});
