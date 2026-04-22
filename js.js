 // ----- ТОВАРЫ -----
    const productsData = [
        { id: 1, name: "Nike Air Force 1 Mid Off-White", category: "LIMITED", price: 29990, img: "https://i.ebayimg.com/images/g/PlEAAOSwK9FnP0lX/s-l1600.jpg" },
        { id: 2, name: "Air Jordan 1 Mid SE Craft", category: "КОЛЛАБОРАЦИЯ", price: 34490, img: "https://n.cdn.cdek.shopping/images/shopping/BYI5sB9ZySm3IKqD.jpg?v=1" },
        { id: 3, name: "Yeezy 500 Utility Black", category: "ПРЕМИУМ", price: 47990, img: "https://e0.pxfuel.com/wallpapers/586/477/desktop-wallpaper-adidas-yeezy-500-utility-black-deals-on-sneakers-sneakers-black-deals-shoes.jpg" },
        { id: 4, name: "New Balance 2002R Protection Pack", category: "НОВИНКА", price: 26990, img: "https://avatars.mds.yandex.net/get-mpic/5098271/2a00000192f273cf37d270827960ea256b17/orig" }
        
    ];

    let cart = []; // { id, name, price, quantity }

    // загрузка из localStorage
    function loadCart() {
        const saved = localStorage.getItem('pg_cart_mono');
        if (saved) {
            try { cart = JSON.parse(saved); } catch(e) { cart = []; }
        } else { cart = []; }
        updateCartUI();
    }

    function saveCart() {
        localStorage.setItem('pg_cart_mono', JSON.stringify(cart));
    }

    function addToCart(productId) {
        const product = productsData.find(p => p.id === productId);
        if (!product) return;
        const existing = cart.find(item => item.id === productId);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
        }
        saveCart();
        updateCartUI();
        showToast(`${product.name} +1`);
        openDrawer(); // открываем корзину после добавления (удобно)
    }

    function changeQuantity(id, delta) {
        const idx = cart.findIndex(item => item.id === id);
        if (idx === -1) return;
        const newQty = cart[idx].quantity + delta;
        if (newQty <= 0) {
            cart.splice(idx, 1);
        } else {
            cart[idx].quantity = newQty;
        }
        saveCart();
        updateCartUI();
    }

    function removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        saveCart();
        updateCartUI();
        showToast("Товар удалён");
    }

    function clearCart() {
        if (cart.length === 0) return;
        cart = [];
        saveCart();
        updateCartUI();
        showToast("Корзина очищена");
    }

    function updateCartUI() {
        // счётчик в иконке
        const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
        document.getElementById('cartCount').innerText = totalItems;

        // отрисовка корзины (drawer)
        const container = document.getElementById('cartItemsContainer');
        const totalBlock = document.getElementById('cartTotalDrawer');
        if (!container) return;

        if (cart.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding: 20px;">Корзина пуста</p>';
            if (totalBlock) totalBlock.innerText = 'Итого: 0 ₽';
            return;
        }

        let html = '';
        let totalSum = 0;
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            totalSum += itemTotal;
            html += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${escapeHtml(item.name)}</h4>
                        <div class="cart-item-price">${item.price.toLocaleString()} ₽</div>
                    </div>
                    <div class="cart-item-actions">
                        <button class="qty-btn" data-id="${item.id}" data-delta="-1">−</button>
                        <span class="item-qty">${item.quantity}</span>
                        <button class="qty-btn" data-id="${item.id}" data-delta="1">+</button>
                        <button class="remove-item" data-id="${item.id}" title="Удалить">✕</button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
        if (totalBlock) totalBlock.innerText = `Итого: ${totalSum.toLocaleString()} ₽`;

        // обработчики кнопок +/-
        document.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.getAttribute('data-id'));
                const delta = parseInt(btn.getAttribute('data-delta'));
                changeQuantity(id, delta);
            });
        });
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.getAttribute('data-id'));
                removeItem(id);
            });
        });
    }

    function escapeHtml(str) {
        return str.replace(/[&<script>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    function showToast(msg) {
        const toast = document.getElementById('toastMessage');
        toast.textContent = msg;
        toast.style.opacity = '1';
        setTimeout(() => { toast.style.opacity = '0'; }, 2000);
    }

    // отрисовка карточек товаров
    function renderProducts() {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;
        grid.innerHTML = '';
        productsData.forEach(prod => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-img"><img src="${prod.img}" alt="${prod.name}"></div>
                <div class="product-info">
                    <div class="product-category">${prod.category}</div>
                    <h3>${prod.name}</h3>
                    <div class="price">${prod.price.toLocaleString()} ₽</div>
                    <button class="btn-card add-btn" data-id="${prod.id}">В корзину →</button>
                </div>
            `;
            grid.appendChild(card);
        });
        document.querySelectorAll('.add-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.getAttribute('data-id'));
                addToCart(id);
            });
        });
    }

    // ----- УПРАВЛЕНИЕ ДРАВЕРОМ -----
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    const openCartBtn = document.getElementById('cartIcon');
    const closeDrawerBtn = document.getElementById('closeDrawerBtn');
    const clearCartDrawerBtn = document.getElementById('clearCartDrawerBtn');

    function openDrawer() {
        drawer.classList.add('open');
        overlay.classList.add('active');
        updateCartUI(); // обновить на случай изменений
    }
    function closeDrawer() {
        drawer.classList.remove('open');
        overlay.classList.remove('active');
    }
    if (openCartBtn) openCartBtn.addEventListener('click', openDrawer);
    if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);
    if (clearCartDrawerBtn) clearCartDrawerBtn.addEventListener('click', () => {
        clearCart();
        updateCartUI();
    });

    // форма обратной связи
    const form = document.getElementById('ddxForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = form.querySelector('input[name="name"]').value;
            alert(`Спасибо, ${name}! Мы свяжемся с вами.`);
            form.reset();
        });
    }

    // плавный скролл
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === "#" || targetId === "") return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    renderProducts();
    loadCart();