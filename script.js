/* ============================================================
   GRUPO ICOVI — Script Principal
   Vanilla JS · Sin frameworks · Sin dependencias externas
   ============================================================ */

(function () {
    'use strict';

    /* ----------------------------------------------------------
       1. NAV SCROLL: transparente → sólido
       ---------------------------------------------------------- */
    const header   = document.getElementById('site-header');
    const SCROLL_THRESHOLD = 80;

    function updateNav() {
        if (header) {
            header.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
        }
    }

    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();


    /* ----------------------------------------------------------
       2. MENÚ MOBILE: toggle + trap de foco + cierre con ESC
       ---------------------------------------------------------- */
    const navToggle = document.getElementById('nav-toggle');
    const navMobile = document.getElementById('nav-mobile');
    const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

    function openMenu() {
        navToggle.setAttribute('aria-expanded', 'true');
        navToggle.setAttribute('aria-label', 'Cerrar menú');
        navMobile.classList.add('is-open');
        navMobile.setAttribute('aria-hidden', 'false');
        // Foco al primer enlace
        const first = navMobile.querySelector(FOCUSABLE);
        if (first) first.focus();
    }

    function closeMenu() {
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Abrir menú');
        navMobile.classList.remove('is-open');
        navMobile.setAttribute('aria-hidden', 'true');
        navToggle.focus();
    }

    function isMenuOpen() {
        return navToggle && navToggle.getAttribute('aria-expanded') === 'true';
    }

    if (navToggle && navMobile) {
        navToggle.addEventListener('click', function () {
            isMenuOpen() ? closeMenu() : openMenu();
        });

        // Trap de foco dentro del menú
        navMobile.addEventListener('keydown', function (e) {
            if (!isMenuOpen()) return;
            if (e.key !== 'Tab') return;

            const focusable = Array.from(navMobile.querySelectorAll(FOCUSABLE));
            const first = focusable[0];
            const last  = focusable[focusable.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        });

        // ESC cierra el menú
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && isMenuOpen()) closeMenu();
        });

        // Clics en links del menú cierran el panel
        navMobile.querySelectorAll('.nav__mobile-link, .nav__mobile-cta').forEach(function (link) {
            link.addEventListener('click', closeMenu);
        });
    }


    /* ----------------------------------------------------------
       3. MARQUEE: pausa al hacer hover / focus
       ---------------------------------------------------------- */
    const trustTrack = document.getElementById('trust-track');

    if (trustTrack) {
        const trustBar = trustTrack.closest('.trust-bar__wrapper') || trustTrack.parentElement;

        function pauseMarquee()  { trustTrack.classList.add('is-paused'); }
        function resumeMarquee() { trustTrack.classList.remove('is-paused'); }

        trustBar.addEventListener('mouseenter', pauseMarquee);
        trustBar.addEventListener('mouseleave', resumeMarquee);

        trustTrack.addEventListener('focusin',  pauseMarquee);
        trustTrack.addEventListener('focusout', resumeMarquee);
    }


    /* ----------------------------------------------------------
       4. REVEAL: IntersectionObserver para animaciones de entrada
       ---------------------------------------------------------- */
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    // Delay escalonado para elementos hermanos
                    const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal'));
                    const idx      = siblings.indexOf(entry.target);
                    const delay    = Math.min(idx * 80, 300);

                    setTimeout(function () {
                        entry.target.classList.add('is-visible');
                    }, delay);

                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -48px 0px'
        });

        document.querySelectorAll('.reveal').forEach(function (el) {
            observer.observe(el);
        });
    } else {
        // Sin animaciones: mostrar todo inmediatamente
        document.querySelectorAll('.reveal').forEach(function (el) {
            el.classList.add('is-visible');
        });
    }


    /* ----------------------------------------------------------
       5. FAQ ACCORDION
       ---------------------------------------------------------- */
    document.querySelectorAll('.faq-item__btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            const target   = document.getElementById(btn.getAttribute('aria-controls'));

            if (!target) return;

            if (expanded) {
                // Cerrar
                btn.setAttribute('aria-expanded', 'false');
                target.hidden = true;
            } else {
                // Cerrar otros abiertos (acordeón)
                document.querySelectorAll('.faq-item__btn[aria-expanded="true"]').forEach(function (openBtn) {
                    const openTarget = document.getElementById(openBtn.getAttribute('aria-controls'));
                    openBtn.setAttribute('aria-expanded', 'false');
                    if (openTarget) openTarget.hidden = true;
                });

                // Abrir este
                btn.setAttribute('aria-expanded', 'true');
                target.hidden = false;
            }
        });
    });


    /* ----------------------------------------------------------
       6. VALIDACIÓN DE FORMULARIO + ESTADO DE ÉXITO
       ---------------------------------------------------------- */
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');

    if (contactForm) {

        function showError(input, message) {
            input.classList.add('is-invalid');
            const errorEl = input.parentElement.querySelector('.form-error');
            if (errorEl) errorEl.textContent = message;
        }

        function clearError(input) {
            input.classList.remove('is-invalid');
            const errorEl = input.parentElement.querySelector('.form-error');
            if (errorEl) errorEl.textContent = '';
        }

        function validateField(input) {
            clearError(input);

            if (input.required && !input.value.trim()) {
                showError(input, 'Este campo es obligatorio.');
                return false;
            }

            if (input.type === 'email') {
                const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!re.test(input.value.trim())) {
                    showError(input, 'Ingrese un correo válido.');
                    return false;
                }
            }

            return true;
        }

        // Validación en tiempo real al salir del campo
        contactForm.querySelectorAll('input, select').forEach(function (field) {
            field.addEventListener('blur', function () {
                if (field.value.trim() !== '') validateField(field);
            });
        });

        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const fields  = Array.from(contactForm.querySelectorAll('input[required], select[required]'));
            let   isValid = true;

            fields.forEach(function (field) {
                if (!validateField(field)) isValid = false;
            });

            if (!isValid) {
                const firstError = contactForm.querySelector('.is-invalid');
                if (firstError) firstError.focus();
                return;
            }

            // Estado de éxito (sin back-end: simula envío)
            contactForm.classList.add('is-sent');
            if (formSuccess) {
                formSuccess.hidden = false;
                formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }


    /* ----------------------------------------------------------
       7. SMOOTH SCROLL para anclas internas
       ---------------------------------------------------------- */
    if (!prefersReducedMotion) {
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                const id     = anchor.getAttribute('href');
                const target = id === '#' ? document.body : document.querySelector(id);

                if (!target) return;

                e.preventDefault();

                const offset = header ? header.offsetHeight + 8 : 0;
                const top    = target.getBoundingClientRect().top + window.scrollY - offset;

                window.scrollTo({ top: top, behavior: 'smooth' });

                // Actualizar URL sin salto
                if (history.pushState && id !== '#') {
                    history.pushState(null, '', id);
                }
            });
        });
    }

})();
