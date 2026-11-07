// ============================================================================
// FAMZPUFF // PROJECT: CAESAR - CORE REACTIVE APPLICATION ENGINE
// Cart, Wishlist, Currency, Search, Nicotine Strength Guide & PDP Hydration
// ============================================================================

(function () {
  'use strict';

  // State
  let currentCurrency = localStorage.getItem('velora_currency') || 'USD';
  const currencyRates = {
    USD: { symbol: '$', rate: 1.0, prefix: true },
    PKR: { symbol: 'PKR ', rate: 275.0, prefix: true },
    EUR: { symbol: '€', rate: 0.92, prefix: true },
    GBP: { symbol: '£', rate: 0.79, prefix: true }
  };

  // Initial cart with FamzPuff vapes & pods
  let cart = JSON.parse(localStorage.getItem('velora_cart')) || [
    {
      id: "FP-001",
      name: "FamzPuff Pro 15,000 Puffs — Obsidian Black",
      priceUSD: 24.99,
      pricePKR: 6800,
      image: "https://images.unsplash.com/photo-1579165466814-e646cfa4a3be?auto=format&fit=crop&w=400&q=80",
      color: "Blackberry Ice",
      size: "5% (50mg)",
      quantity: 1
    },
    {
      id: "FP-003",
      name: "FamzPuff Pod System Pro Kit",
      priceUSD: 39.99,
      pricePKR: 10900,
      image: "https://images.unsplash.com/photo-1534126511673-b6899657816a?auto=format&fit=crop&w=400&q=80",
      color: "Pitch Black Carbon",
      size: "Kit + 2 Pods",
      quantity: 1
    }
  ];

  let wishlist = JSON.parse(localStorage.getItem('velora_wishlist')) || ["FP-001", "FP-010"];

  function saveCart() {
    localStorage.setItem('velora_cart', JSON.stringify(cart));
    updateCartBadges();
    renderCartDrawer();
  }

  function saveWishlist() {
    localStorage.setItem('velora_wishlist', JSON.stringify(wishlist));
    updateWishlistBadges();
  }

  // 1. CURRENCY CONVERSION & FORMATTING
  function formatPrice(usd, pkr) {
    if (currentCurrency === 'PKR' && pkr) {
      return `PKR ${pkr.toLocaleString()}`;
    }
    const config = currencyRates[currentCurrency] || currencyRates.USD;
    const converted = usd * config.rate;
    if (currentCurrency === 'PKR') {
      return `PKR ${Math.round(converted).toLocaleString()}`;
    }
    return `${config.symbol}${converted.toFixed(2)}`;
  }

  function setCurrency(currency) {
    if (!currencyRates[currency]) return;
    currentCurrency = currency;
    localStorage.setItem('velora_currency', currency);
    document.querySelectorAll('.currency-label').forEach(el => el.textContent = `${currency} ▾`);
    renderAllPrices();
    renderCartDrawer();
  }

  function renderAllPrices() {
    document.querySelectorAll('[data-price-usd]').forEach(el => {
      const usd = parseFloat(el.getAttribute('data-price-usd'));
      const pkr = parseFloat(el.getAttribute('data-price-pkr')) || null;
      el.textContent = formatPrice(usd, pkr);
    });
  }

  // 2. CART DRAWER MECHANICS
  function openCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-backdrop');
    if (!drawer) return;
    drawer.classList.remove('translate-x-full');
    if (backdrop) backdrop.classList.remove('opacity-0', 'pointer-events-none');
    document.body.classList.add('overflow-hidden');
  }

  function closeCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-backdrop');
    if (!drawer) return;
    drawer.classList.add('translate-x-full');
    if (backdrop) backdrop.classList.add('opacity-0', 'pointer-events-none');
    document.body.classList.remove('overflow-hidden');
  }

  function addToCart(product, color, size, qty = 1) {
    const existingIndex = cart.findIndex(item => item.id === product.id && item.color === color && item.size === size);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += qty;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        priceUSD: product.priceUSD,
        pricePKR: product.pricePKR,
        image: product.images ? product.images[0] : (product.image || ''),
        color: color || (product.colorways ? product.colorways[0].name : 'Default Flavor'),
        size: size || (product.sizes ? product.sizes[0] : 'Standard'),
        quantity: qty
      });
    }
    saveCart();
    openCartDrawer();
  }

  function updateCartQuantity(index, delta) {
    if (!cart[index]) return;
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    saveCart();
  }

  function removeCartItem(index) {
    cart.splice(index, 1);
    saveCart();
  }

  function updateCartBadges() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('#cart-count, .cart-count-badge').forEach(el => {
      el.textContent = totalCount;
    });
  }

  function renderCartDrawer() {
    const listEl = document.getElementById('cart-items-list');
    const subtotalEl = document.getElementById('cart-subtotal');
    const progressText = document.getElementById('free-shipping-text');
    const progressBar = document.getElementById('free-shipping-bar');
    if (!listEl) return;

    if (cart.length === 0) {
      listEl.innerHTML = `
        <div class="py-16 text-center text-caesar-ash">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-caesar-border flex items-center justify-center text-2xl">💨</div>
          <p class="font-sans font-semibold text-caesar-white mb-2">Your Vapor Bag is Empty</p>
          <p class="text-xs text-caesar-slate max-w-xs mx-auto mb-6">Explore the FamzPuff device vault to stock up on premium vapes and pods.</p>
          <a href="shop.html" class="inline-block px-6 py-3 rounded-lg bg-caesar-burgundy text-caesar-white font-sans text-xs font-bold uppercase tracking-wider">Explore Vault</a>
        </div>
      `;
      if (subtotalEl) subtotalEl.textContent = formatPrice(0, 0);
      if (progressText) progressText.innerHTML = `Add <span class="font-bold text-caesar-white">$99.00</span> more for FREE Express Shipping!`;
      if (progressBar) progressBar.style.width = '0%';
      return;
    }

    let subtotalUSD = 0;
    let subtotalPKR = 0;

    listEl.innerHTML = cart.map((item, index) => {
      subtotalUSD += item.priceUSD * item.quantity;
      subtotalPKR += (item.pricePKR || item.priceUSD * 275) * item.quantity;
      return `
        <div class="flex gap-4 py-4 border-b border-caesar-border">
          <img src="${item.image}" alt="${item.name}" class="w-20 h-24 object-cover rounded-lg bg-[#0A0A0C] border border-caesar-border flex-shrink-0" />
          <div class="flex-1 flex flex-col justify-between">
            <div>
              <div class="flex items-start justify-between gap-2">
                <a href="product.html?id=${item.id}" class="font-sans text-sm font-semibold text-caesar-white hover:text-caesar-burgundy-light leading-snug line-clamp-1">${item.name}</a>
                <button onclick="window.VeloraApp.removeCartItem(${index})" class="text-caesar-slate hover:text-caesar-white text-xs p-1">✕</button>
              </div>
              <p class="text-xs text-caesar-ash mt-1">${item.color} · <span class="font-mono text-caesar-white">${item.size}</span></p>
            </div>
            <div class="flex items-center justify-between mt-3">
              <div class="flex items-center border border-caesar-border rounded bg-caesar-surface">
                <button onclick="window.VeloraApp.updateCartQuantity(${index}, -1)" class="w-7 h-7 flex items-center justify-center text-caesar-ash hover:text-caesar-white font-mono">-</button>
                <span class="w-7 text-center font-mono text-xs text-caesar-white">${item.quantity}</span>
                <button onclick="window.VeloraApp.updateCartQuantity(${index}, 1)" class="w-7 h-7 flex items-center justify-center text-caesar-ash hover:text-caesar-white font-mono">+</button>
              </div>
              <span class="font-mono text-sm font-bold text-caesar-white">${formatPrice(item.priceUSD * item.quantity, item.pricePKR * item.quantity)}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotalUSD, subtotalPKR);

    // Free shipping threshold = $99
    const threshold = 99.00;
    const progress = Math.min((subtotalUSD / threshold) * 100, 100);
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (progressText) {
      if (subtotalUSD >= threshold) {
        progressText.innerHTML = `✨ You have unlocked <span class="text-caesar-burgundy-light font-bold">FREE Express Discreet Shipping</span>!`;
      } else {
        const remaining = threshold - subtotalUSD;
        progressText.innerHTML = `Add <span class="font-bold text-caesar-white">${formatPrice(remaining, remaining * 275)}</span> more for <span class="text-caesar-burgundy-light font-bold">FREE Shipping</span>!`;
      }
    }
  }

  // 3. WISHLIST
  function toggleWishlist(productId, btnEl) {
    const idx = wishlist.indexOf(productId);
    if (idx > -1) {
      wishlist.splice(idx, 1);
      if (btnEl) btnEl.innerHTML = '♡';
    } else {
      wishlist.push(productId);
      if (btnEl) btnEl.innerHTML = '♥';
    }
    saveWishlist();
  }

  function updateWishlistBadges() {
    document.querySelectorAll('#wishlist-count, .wishlist-count-badge').forEach(el => {
      el.textContent = wishlist.length;
    });
  }

  // 4. SEARCH MODAL
  function openSearchModal() {
    const modal = document.getElementById('search-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    const input = document.getElementById('search-input');
    if (input) {
      input.value = '';
      input.focus();
      handleSearch('');
    }
    document.body.classList.add('overflow-hidden');
  }

  function closeSearchModal() {
    const modal = document.getElementById('search-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }

  function handleSearch(query) {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer || !window.VELORA_CATALOG) return;

    const q = (query || '').trim().toLowerCase();
    const filtered = window.VELORA_CATALOG.filter(p => {
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.division.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.leadHook && p.leadHook.toLowerCase().includes(q))
      );
    }).slice(0, 8);

    if (filtered.length === 0) {
      resultsContainer.innerHTML = `
        <div class="col-span-full py-12 text-center text-caesar-ash">
          No vape or pod device found matching "<span class="text-caesar-white font-semibold">${query}</span>".
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = filtered.map(p => `
      <a href="product.html?id=${p.id}" class="group bg-caesar-card border border-caesar-border rounded-xl p-3 flex gap-3 hover:border-caesar-burgundy transition-colors">
        <img src="${p.images[0]}" alt="${p.name}" class="w-16 h-20 object-cover rounded-lg bg-[#0A0A0C] border border-caesar-border flex-shrink-0" />
        <div class="flex-1 flex flex-col justify-between">
          <div>
            <span class="font-mono text-[10px] text-caesar-burgundy-light uppercase tracking-wider">${p.category}</span>
            <h4 class="font-sans text-xs font-semibold text-caesar-white group-hover:text-caesar-burgundy-light mt-0.5 line-clamp-1">${p.name}</h4>
          </div>
          <span class="font-mono text-xs font-bold text-caesar-white">${formatPrice(p.priceUSD, p.pricePKR)}</span>
        </div>
      </a>
    `).join('');
  }

  // 5. NICOTINE STRENGTH & POD GUIDE MODAL
  function openSizeGuide() {
    const modal = document.getElementById('size-guide-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  }

  function closeSizeGuide() {
    const modal = document.getElementById('size-guide-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }

  function calculateRecommendedSize() {
    const habit = document.getElementById('fit-height')?.value || '10'; // cigarettes or puffs equivalent
    const experience = document.getElementById('fit-weight')?.value || 'intermediate';
    const output = document.getElementById('fit-recommendation-output');

    let recommendation = '5% (50mg Nicotine Salt)';
    if (habit < 5) recommendation = '0% or 2% (20mg Salt)';
    else if (habit <= 15) recommendation = '2% (20mg Salt) or Refillable Pod (0.8Ω)';
    else recommendation = '5% (50mg Salt) — FamzPuff Pro 15K';

    if (output) {
      output.innerHTML = `Recommended Strength: <span class="text-caesar-burgundy-light font-bold text-sm">${recommendation}</span>`;
    }
  }

  // 6. PDP HYDRATION ENGINE
  function hydrateProductDetail() {
    const pdpTitle = document.getElementById('pdp-title');
    if (!pdpTitle || !window.VELORA_CATALOG) return;

    const urlParams = new URLSearchParams(window.location.search);
    const prodId = urlParams.get('id') || 'FP-001';
    const product = window.getVeloraProduct(prodId);

    // Breadcrumbs
    const bcCat = document.getElementById('pdp-bc-category');
    const bcTitle = document.getElementById('pdp-bc-title');
    if (bcCat) bcCat.textContent = product.category;
    if (bcTitle) bcTitle.textContent = product.name;

    // Headings & Status
    pdpTitle.innerHTML = product.name.replace(' — ', '<br/>— ');
    const statusPill = document.getElementById('pdp-status-pill');
    if (statusPill) statusPill.textContent = product.statusBadge || 'FamzPuff Authentic';

    // Pricing
    const priceEl = document.getElementById('pdp-price');
    const compareEl = document.getElementById('pdp-compare-price');
    const badgeEl = document.getElementById('pdp-discount-badge');

    if (priceEl) {
      priceEl.setAttribute('data-price-usd', product.priceUSD);
      priceEl.setAttribute('data-price-pkr', product.pricePKR || '');
      priceEl.textContent = formatPrice(product.priceUSD, product.pricePKR);
    }
    if (compareEl) {
      if (product.comparePriceUSD) {
        compareEl.setAttribute('data-price-usd', product.comparePriceUSD);
        compareEl.setAttribute('data-price-pkr', product.comparePricePKR || '');
        compareEl.textContent = formatPrice(product.comparePriceUSD, product.comparePricePKR);
        compareEl.classList.remove('hidden');
      } else {
        compareEl.classList.add('hidden');
      }
    }
    if (badgeEl) {
      if (product.discountBadge) {
        badgeEl.textContent = product.discountBadge;
        badgeEl.classList.remove('hidden');
      } else {
        badgeEl.classList.add('hidden');
      }
    }

    // Lead hook & description
    const hookEl = document.getElementById('pdp-hook');
    if (hookEl) hookEl.textContent = product.leadHook || product.description;

    // Images gallery
    const mainImg = document.getElementById('pdp-main-image');
    const thumbRail = document.getElementById('pdp-thumbnail-rail');
    if (mainImg && product.images && product.images.length > 0) {
      mainImg.src = product.images[0];
      mainImg.alt = product.name;
    }

    if (thumbRail && product.images) {
      thumbRail.innerHTML = product.images.map((imgUrl, i) => `
        <div class="thumb-item cursor-pointer w-20 h-24 sm:w-22 sm:h-26 rounded-xl overflow-hidden border-2 transition-all ${i === 0 ? 'border-caesar-black ring-2 ring-caesar-burgundy/30' : 'border-caesar-border-light hover:border-caesar-burgundy'}" onclick="window.VeloraApp.switchPdpImage('${imgUrl}', this)">
          <img src="${imgUrl}" alt="${product.name} angle ${i + 1}" class="w-full h-full object-cover" />
        </div>
      `).join('');
    }

    // Flavors / Colorways
    const swatchContainer = document.getElementById('pdp-swatches');
    const selectedColorLabel = document.getElementById('selected-color-name');
    let activeColor = product.colorways ? product.colorways[0].name : 'Default Flavor';
    if (selectedColorLabel) selectedColorLabel.textContent = activeColor;

    if (swatchContainer && product.colorways) {
      swatchContainer.innerHTML = product.colorways.map((cw, i) => `
        <button type="button" class="swatch-btn w-9 h-9 rounded-full border-2 transition-all ${i === 0 ? 'ring-2 ring-offset-2 ring-caesar-black border-white' : 'border-caesar-border hover:scale-105'}" style="background-color: ${cw.hex}" title="${cw.name}" onclick="window.VeloraApp.selectPdpColor('${cw.name}', this)"></button>
      `).join('');
    }

    // Nicotine Strengths / Sizes
    const sizeContainer = document.getElementById('pdp-sizes');
    const selectedSizeLabel = document.getElementById('selected-size-label');
    let activeSize = product.sizes ? product.sizes[0] : '5% (50mg)';
    if (selectedSizeLabel) selectedSizeLabel.textContent = activeSize;

    if (sizeContainer && product.sizes) {
      sizeContainer.innerHTML = product.sizes.map((s) => `
        <button type="button" class="size-btn h-11 px-3 rounded-lg border font-mono text-xs font-semibold uppercase transition-all ${s === activeSize ? 'bg-caesar-black text-caesar-white border-caesar-burgundy border-b-2' : 'border-caesar-border-light text-caesar-black hover:border-caesar-burgundy'}" onclick="window.VeloraApp.selectPdpSize('${s}', this)">${s}</button>
      `).join('');
    }

    // Add to cart buttons
    const addBtn = document.getElementById('pdp-add-to-cart');
    if (addBtn) {
      addBtn.onclick = () => {
        addToCart(product, activeColor, activeSize, 1);
      };
    }
    const mobileAddBtn = document.getElementById('pdp-mobile-add-btn');
    if (mobileAddBtn) {
      mobileAddBtn.onclick = () => {
        addToCart(product, activeColor, activeSize, 1);
      };
    }

    // Wishlist PDP button
    const pdpWishBtn = document.getElementById('pdp-wishlist-toggle');
    if (pdpWishBtn) {
      const isFav = wishlist.includes(product.id);
      pdpWishBtn.innerHTML = isFav ? '♥' : '♡';
      pdpWishBtn.onclick = () => toggleWishlist(product.id, pdpWishBtn);
    }

    // Render Cross Sell "You May Also Like"
    const crossSellContainer = document.getElementById('pdp-cross-sell-grid');
    if (crossSellContainer) {
      const others = window.VELORA_CATALOG.filter(p => p.id !== product.id).slice(0, 4);
      crossSellContainer.innerHTML = others.map(item => `
        <div class="group bg-white border border-caesar-border-light rounded-2xl p-3 hover:border-caesar-burgundy transition-all">
          <a href="product.html?id=${item.id}" class="block bg-caesar-alabaster rounded-xl h-[300px] overflow-hidden mb-3.5 relative">
            <img src="${item.images[0]}" alt="${item.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-104" />
          </a>
          <div class="flex items-center justify-between px-1 pb-1">
            <div>
              <a href="product.html?id=${item.id}" class="font-sans text-sm font-semibold text-caesar-black hover:text-caesar-burgundy block">${item.name}</a>
              <span class="font-mono text-xs font-bold text-caesar-black" data-price-usd="${item.priceUSD}" data-price-pkr="${item.pricePKR || ''}">${formatPrice(item.priceUSD, item.pricePKR)}</span>
            </div>
            <button onclick="window.VeloraApp.toggleWishlist('${item.id}', this)" class="w-8 h-8 rounded-full border border-caesar-border-light flex items-center justify-center text-caesar-black hover:text-caesar-burgundy">
              ${wishlist.includes(item.id) ? '♥' : '♡'}
            </button>
          </div>
        </div>
      `).join('');
    }
  }

  function switchPdpImage(url, clickedEl) {
    const mainImg = document.getElementById('pdp-main-image');
    if (mainImg) {
      mainImg.style.opacity = '0';
      setTimeout(() => {
        mainImg.src = url;
        mainImg.style.opacity = '1';
      }, 150);
    }
    document.querySelectorAll('.thumb-item').forEach(el => {
      el.classList.remove('border-caesar-black', 'ring-2', 'ring-caesar-burgundy/30');
      el.classList.add('border-caesar-border-light');
    });
    if (clickedEl) {
      clickedEl.classList.remove('border-caesar-border-light');
      clickedEl.classList.add('border-caesar-black', 'ring-2', 'ring-caesar-burgundy/30');
    }
  }

  function selectPdpColor(colorName, clickedEl) {
    const label = document.getElementById('selected-color-name');
    if (label) label.textContent = colorName;
    document.querySelectorAll('.swatch-btn').forEach(btn => {
      btn.classList.remove('ring-2', 'ring-offset-2', 'ring-caesar-black', 'border-white');
      btn.classList.add('border-caesar-border');
    });
    if (clickedEl) {
      clickedEl.classList.remove('border-caesar-border');
      clickedEl.classList.add('ring-2', 'ring-offset-2', 'ring-caesar-black', 'border-white');
    }
  }

  function selectPdpSize(size, clickedEl) {
    const label = document.getElementById('selected-size-label');
    if (label) label.textContent = size;
    document.querySelectorAll('.size-btn').forEach(btn => {
      btn.classList.remove('bg-caesar-black', 'text-caesar-white', 'border-caesar-burgundy', 'border-b-2');
      btn.classList.add('border-caesar-border-light', 'text-caesar-black');
    });
    if (clickedEl) {
      clickedEl.classList.remove('border-caesar-border-light', 'text-caesar-black');
      clickedEl.classList.add('bg-caesar-black', 'text-caesar-white', 'border-caesar-burgundy', 'border-b-2');
    }
  }

  function switchPdpTab(tabName, clickedBtn) {
    document.querySelectorAll('.pdp-tab-btn').forEach(btn => {
      btn.classList.remove('text-caesar-black', 'border-caesar-burgundy');
      btn.classList.add('text-caesar-slate', 'border-transparent');
    });
    if (clickedBtn) {
      clickedBtn.classList.remove('text-caesar-slate', 'border-transparent');
      clickedBtn.classList.add('text-caesar-black', 'border-caesar-burgundy');
    }

    document.querySelectorAll('.pdp-tab-panel').forEach(panel => {
      panel.classList.add('hidden');
    });
    const activePanel = document.getElementById(`pdp-tab-${tabName}`);
    if (activePanel) {
      activePanel.classList.remove('hidden');
    }
  }

  // 7. INITIALIZATION ON DOM READY
  document.addEventListener('DOMContentLoaded', () => {
    updateCartBadges();
    updateWishlistBadges();
    renderCartDrawer();
    renderAllPrices();

    // Currency Switcher Dropdown
    const currBtn = document.getElementById('currency-switcher');
    const currMenu = document.getElementById('currency-dropdown');
    if (currBtn && currMenu) {
      currBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currMenu.classList.toggle('hidden');
      });
      document.addEventListener('click', () => {
        currMenu.classList.add('hidden');
      });
    }

    // Cart Drawer triggers
    document.querySelectorAll('#cart-drawer-trigger, .open-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openCartDrawer();
      });
    });
    const cartCloseBtn = document.getElementById('cart-close-btn');
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCartDrawer);
    const cartBackdrop = document.getElementById('cart-backdrop');
    if (cartBackdrop) cartBackdrop.addEventListener('click', closeCartDrawer);

    // Search modal triggers
    document.querySelectorAll('#search-trigger, .open-search-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openSearchModal();
      });
    });
    const searchCloseBtn = document.getElementById('search-close-btn');
    if (searchCloseBtn) searchCloseBtn.addEventListener('click', closeSearchModal);

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
    }

    // Keyboard shortcut (Cmd/Ctrl + K) for search
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearchModal();
      }
      if (e.key === 'Escape') {
        closeSearchModal();
        closeCartDrawer();
        closeSizeGuide();
      }
    });

    // Size Guide modal
    document.querySelectorAll('#open-size-guide, .open-size-guide-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openSizeGuide();
      });
    });
    const sizeGuideClose = document.getElementById('size-guide-close-btn');
    if (sizeGuideClose) sizeGuideClose.addEventListener('click', closeSizeGuide);

    // Club newsletter form
    const clubForm = document.getElementById('club-signup-form');
    if (clubForm) {
      clubForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = clubForm.querySelector('input[type="email"]');
        if (input && input.value) {
          const successBox = document.getElementById('club-signup-success');
          if (successBox) successBox.classList.remove('hidden');
          clubForm.classList.add('hidden');
        }
      });
    }

    // Category carousel prev/next buttons
    const catPrev = document.getElementById('cat-prev');
    const catNext = document.getElementById('cat-next');
    const catSlider = document.getElementById('category-slider');
    if (catPrev && catNext && catSlider) {
      catPrev.addEventListener('click', () => {
        catSlider.scrollBy({ left: -280, behavior: 'smooth' });
      });
      catNext.addEventListener('click', () => {
        catSlider.scrollBy({ left: 280, behavior: 'smooth' });
      });
    }

    hydrateProductDetail();
  });

  // Global API
  window.VeloraApp = {
    addToCart,
    updateCartQuantity,
    removeCartItem,
    openCartDrawer,
    closeCartDrawer,
    toggleWishlist,
    setCurrency,
    formatPrice,
    openSearchModal,
    closeSearchModal,
    openSizeGuide,
    closeSizeGuide,
    switchPdpImage,
    selectPdpColor,
    selectPdpSize,
    switchPdpTab
  };

})();
