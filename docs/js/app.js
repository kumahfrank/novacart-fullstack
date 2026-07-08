document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('site-header');
  const footer = document.getElementById('site-footer');

  if (header) {
    header.innerHTML = `
      <nav class="navbar navbar-expand-lg sticky-top">
        <div class="container">
          <a class="navbar-brand logo" href="index.html">NovaCart</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#main-nav" aria-controls="main-nav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="main-nav">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
              <li class="nav-item"><a class="nav-link" href="shop.html">Shop</a></li>
              <li class="nav-item"><a class="nav-link" href="about.html">About</a></li>
              <li class="nav-item"><a class="nav-link" href="contact.html">Contact</a></li>
              <li class="nav-item"><a class="nav-link" href="faq.html">FAQ</a></li>
              <li class="nav-item"><a class="nav-link" href="admin.html">Admin</a></li>
            </ul>
            <form class="d-flex me-3" role="search" onsubmit="event.preventDefault(); window.location.href='shop.html';">
              <input class="form-control" type="search" placeholder="Search products" aria-label="Search" />
            </form>
            <div class="d-flex align-items-center gap-2">
              <button class="btn btn-outline-secondary btn-sm" id="theme-toggle" aria-label="Toggle theme"><i class="fa-solid fa-moon"></i></button>
              <a class="btn btn-outline-secondary position-relative" href="login.html"><i class="fa-solid fa-user"></i></a>
              <a class="btn btn-outline-secondary position-relative" href="cart.html"><i class="fa-solid fa-cart-shopping"></i><span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary" data-cart-count>0</span></a>
              <a class="btn btn-outline-secondary position-relative" href="#"><i class="fa-solid fa-heart"></i><span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" data-wishlist-count>0</span></a>
            </div>
          </div>
        </div>
      </nav>
    `;
  }

  if (footer) {
    footer.innerHTML = `
      <footer class="footer mt-5">
        <div class="container">
          <div class="row g-4">
            <div class="col-lg-4">
              <h3 class="h5 fw-bold mb-3">NovaCart</h3>
              <p class="text-light-emphasis">Premium shopping for modern lifestyles, built for performance and simplicity.</p>
            </div>
            <div class="col-lg-2">
              <h4 class="h6 fw-bold mb-3">Shop</h4>
              <ul class="list-unstyled">
                <li><a href="shop.html">All products</a></li>
                <li><a href="shop.html">Featured</a></li>
                <li><a href="shop.html">New arrivals</a></li>
              </ul>
            </div>
            <div class="col-lg-2">
              <h4 class="h6 fw-bold mb-3">Support</h4>
              <ul class="list-unstyled">
                <li><a href="contact.html">Contact us</a></li>
                <li><a href="faq.html">FAQ</a></li>
                <li><a href="about.html">About us</a></li>
              </ul>
            </div>
            <div class="col-lg-4">
              <h4 class="h6 fw-bold mb-3">Newsletter</h4>
              <p class="text-light-emphasis">Subscribe for deals and new arrivals.</p>
              <form class="newsletter-form">
                <div class="input-group">
                  <input type="email" class="form-control" placeholder="Email" />
                  <button class="btn btn-primary" type="submit">Go</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  // Initialize UI and shared behavior
  renderCartCount();
  renderWishlistCount();
  renderHomeSections();
  populateCategoryFilter();
  attachShopListeners();
  renderShopProducts();
  renderProductDetail();
  renderCart();
  renderCheckout();
  renderWishlist();
  initializeFormValidation();

  const themeToggle = document.getElementById('theme-toggle');
  const storedTheme = localStorage.getItem('novacart.theme') || 'light';
  document.documentElement.setAttribute('data-bs-theme', storedTheme);
  document.body.classList.toggle('dark-mode', storedTheme === 'dark');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
      document.body.classList.toggle('dark-mode', next === 'dark');
      document.documentElement.setAttribute('data-bs-theme', next);
      localStorage.setItem('novacart.theme', next);
      showToast(`Switched to ${next} mode`);
    });
  }

  const scrollTopButton = document.getElementById('scroll-top');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollTopButton.style.display = 'block';
    } else {
      scrollTopButton.style.display = 'none';
    }
  });
  scrollTopButton?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const heroSlides = document.querySelectorAll('.hero-slider .slide');
  let currentSlide = 0;
  if (heroSlides.length) {
    setInterval(() => {
      heroSlides.forEach(slide => slide.classList.remove('active'));
      currentSlide = (currentSlide + 1) % heroSlides.length;
      heroSlides[currentSlide].classList.add('active');
    }, 5000);
  }

  fetch('/api/products')
    .then(response => response.json())
    .then(data => {
      if (Array.isArray(data.products) && data.products.length) {
        showToast(`Loaded ${data.products.length} products from the backend`);
      }
    })
    .catch(() => {
      showToast('Backend unavailable, using local storefront data');
    });

  document.querySelectorAll('[data-add-cart]').forEach(button => {
    button.addEventListener('click', () => addToCart(Number(button.getAttribute('data-add-cart'))));
  });

  document.querySelectorAll('[data-wishlist-id]').forEach(button => {
    button.addEventListener('click', () => toggleWishlist(Number(button.getAttribute('data-wishlist-id'))));
  });

  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      showToast('Subscribed successfully');
      form.reset();
    });
  });

  setTimeout(() => {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }, 600);
});
