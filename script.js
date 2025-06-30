document.addEventListener("DOMContentLoaded", () => {
	/**
	 * Handles the fixed header behavior on scroll.
	 * Adds a 'scrolled' class to the header for styling.
	 */
	const handleHeaderScroll = () => {
		const header = document.querySelector(".main-header");
		if (window.scrollY > 50) {
			header.classList.add("scrolled");
		} else {
			header.classList.remove("scrolled");
		}
	};

	/**
	 * Toggles the mobile navigation menu.
	 * Manages 'is-active' classes for the hamburger button and nav panel.
	 * Disables body scroll when menu is open.
	 */
	const setupMobileMenu = () => {
		const hamburger = document.getElementById("hamburger-menu");
		const navMenu = document.querySelector(".main-nav");

		if (!hamburger || !navMenu) return;

		hamburger.addEventListener("click", () => {
			hamburger.classList.toggle("is-active");
			navMenu.classList.toggle("is-active");

			if (navMenu.classList.contains("is-active")) {
				document.body.style.overflow = "hidden";
				hamburger.setAttribute("aria-expanded", "true");
			} else {
				document.body.style.overflow = "";
				hamburger.setAttribute("aria-expanded", "false");
			}
		});

		navMenu.querySelectorAll("a").forEach((link) => {
			link.addEventListener("click", () => {
				hamburger.classList.remove("is-active");
				navMenu.classList.remove("is-active");
				document.body.style.overflow = "";
				hamburger.setAttribute("aria-expanded", "false");
			});
		});
	};

	/**
	 * Initializes the FAQ accordion functionality.
	 * Questions expand/collapse on click.
	 */
	const setupFaqAccordion = () => {
		const faqItems = document.querySelectorAll(".faq-item");

		faqItems.forEach((item) => {
			const questionButton = item.querySelector(".faq-question");
			const answerPanel = item.querySelector(".faq-answer");

			if (!questionButton || !answerPanel) return;

			questionButton.addEventListener("click", () => {
				const isExpanded = questionButton.getAttribute("aria-expanded") === "true";

				questionButton.setAttribute("aria-expanded", !isExpanded);
				if (!isExpanded) {
					answerPanel.style.maxHeight = answerPanel.scrollHeight + "px";
				} else {
					answerPanel.style.maxHeight = "0";
				}
			});
		});
	};

	/**
	 * Initializes the testimonial carousel with manual dot navigation.
	 * Automatically cycles through slides and pauses on hover.
	 */
	const setupTestimonialCarousel = () => {
		const carousel = document.querySelector(".testimonial-carousel");
		if (!carousel) return;

		const slidesContainer = carousel.querySelector(".testimonial-slides");
		const slides = slidesContainer.querySelectorAll(".testimonial-slide");
		const dotsContainer = carousel.querySelector(".carousel-dots");

		if (slides.length <= 1) return;

		let currentSlide = 0;
		let intervalId = null;
		let startX = 0;

		// Crear puntos de navegación
		slides.forEach((_, i) => {
			const dot = document.createElement("button");
			dot.classList.add("dot");
			dot.setAttribute("aria-label", `Ir al testimonio ${i + 1}`);
			dot.addEventListener("click", () => goToSlide(i));
			dotsContainer.appendChild(dot);
		});

		const dots = dotsContainer.querySelectorAll(".dot");

		const goToSlide = (index) => {
			slides[currentSlide].classList.remove("active");
			dots[currentSlide].classList.remove("active");
			currentSlide = index;
			slides[currentSlide].classList.add("active");
			dots[currentSlide].classList.add("active");
			resetTimer();
		};

		const nextSlide = () => goToSlide((currentSlide + 1) % slides.length);
		const prevSlide = () => goToSlide((currentSlide - 1 + slides.length) % slides.length);

		const resetTimer = () => {
			clearInterval(intervalId);
			intervalId = setInterval(nextSlide, 5000);
		};

		// Arrastre simple
		const handleTouchStart = (e) => {
			startX = (e.touches || [e])[0].clientX;
		};

		const handleTouchEnd = (e) => {
			if (!startX) return;
			const endX = (e.changedTouches || [e])[0].clientX;
			const diff = startX - endX;

			if (Math.abs(diff) > 50) {
				// Mínimo 50px para cambiar
				diff > 0 ? nextSlide() : prevSlide();
			}
			startX = 0;
		};

		// Event listeners
		slidesContainer.addEventListener("mousedown", handleTouchStart);
		slidesContainer.addEventListener("mouseup", handleTouchEnd);
		slidesContainer.addEventListener("touchstart", handleTouchStart);
		slidesContainer.addEventListener("touchend", handleTouchEnd);

		// Pausar en hover
		carousel.addEventListener("mouseenter", () => clearInterval(intervalId));
		carousel.addEventListener("mouseleave", resetTimer);

		// Inicializar
		goToSlide(0);
	};

	/**
	 * Sets up the Intersection Observer for fade-in animations on scroll.
	 * Elements with the 'fade-in' class will become visible as they enter the viewport.
	 */
	const setupScrollAnimations = () => {
		const faders = document.querySelectorAll(".fade-in");

		const appearOptions = {
			threshold: 0.15,
			rootMargin: "0px 0px -50px 0px",
		};

		const appearOnScroll = new IntersectionObserver((entries, observer) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) {
					return;
				} else {
					entry.target.classList.add("visible");
					observer.unobserve(entry.target);
				}
			});
		}, appearOptions);

		faders.forEach((fader) => {
			appearOnScroll.observe(fader);
		});
	};

	/**
	 * Handles the contact form validation and submission logic.
	 */
	const setupContactForm = () => {
		const form = document.getElementById("contact-form");
		if (!form) return;

		const EMAIL_CONFIG = {
			publicKey: "1vi1fsa21HJtjOfi3",
			serviceId: "service_t4fkzpg",
			templateId: "template_t0wwp0e",
		};

		// Inicializar EmailJS
		emailjs.init(EMAIL_CONFIG.publicKey);

		const nameInput = document.getElementById("name");
		const emailInput = document.getElementById("email");
		const messageInput = document.getElementById("message");
		const successMessage = document.getElementById("form-success-message");

		const showError = (input, message) => {
			const formGroup = input.parentElement;
			const errorDisplay = formGroup.querySelector(".error-message");
			input.classList.add("invalid");
			errorDisplay.textContent = message;
		};

		const hideError = (input) => {
			const formGroup = input.parentElement;
			const errorDisplay = formGroup.querySelector(".error-message");
			input.classList.remove("invalid");
			errorDisplay.textContent = "";
		};

		const validateEmail = (email) => {
			const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			return re.test(String(email).toLowerCase());
		};

		form.addEventListener("submit", (e) => {
			e.preventDefault();
			let isValid = true;

			// Limpiar errores anteriores
			hideError(nameInput);
			hideError(emailInput);
			hideError(messageInput);
			successMessage.textContent = "";

			// Validar campos
			if (nameInput.value.trim() === "") {
				showError(nameInput, "El nombre es obligatorio.");
				isValid = false;
			}

			if (emailInput.value.trim() === "") {
				showError(emailInput, "El email es obligatorio.");
				isValid = false;
			} else if (!validateEmail(emailInput.value)) {
				showError(emailInput, "Por favor, introduce un email válido.");
				isValid = false;
			}

			if (messageInput.value.trim() === "") {
				showError(messageInput, "El mensaje no puede estar vacío.");
				isValid = false;
			}

			// Si es válido, enviar con EmailJS
			if (isValid) {
				console.log("Enviando formulario...");

				emailjs
					.sendForm(EMAIL_CONFIG.serviceId, EMAIL_CONFIG.templateId, form)
					.then(() => {
						successMessage.textContent = "¡Gracias! Tu mensaje ha sido enviado con éxito.";
						form.reset();
					})
					.catch((error) => {
						console.error("Error al enviar:", error);
						successMessage.textContent = "Error al enviar. Inténtalo de nuevo.";
					});
			}
		});
	};

	// --- INITIALIZE ALL MODULES ---
	window.addEventListener("scroll", handleHeaderScroll);
	setupMobileMenu();
	setupFaqAccordion();
	setupTestimonialCarousel();
	setupScrollAnimations();
	setupContactForm();
});
