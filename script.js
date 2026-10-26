const products = [
  {id:1,name:"Caminha Nuvem",description:"Conforto de abraço",price:129.90,category:"Conforto",label:"MAIS AMADO",image:"https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=800&q=80"},
  {id:2,name:"Brinquedo Mordedor",description:"Diversão sem fim",price:39.90,category:"Brinquedos",label:"DIVERSÃO",image:"https://images.unsplash.com/photo-1535294435445-d0c6c9c7c4c7?auto=format&fit=crop&w=800&q=80"},
  {id:3,name:"Comedouro Minimal",description:"Design para todo dia",price:69.90,category:"Cães",label:"DESIGN",image:"https://images.unsplash.com/photo-1589924691995-400dc9acom?auto=format&fit=crop&w=800&q=80"},
  {id:4,name:"Arranhador de Sisal",description:"Diversão para gatinhos",price:89.90,category:"Gatos",label:"GATINHOS",image:"https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80"},
  {id:5,name:"Bolinha Interativa",description:"Movimento e alegria",price:29.90,category:"Brinquedos",label:"PLAY TIME",image:"https://images.unsplash.com/photo-1535294435445-d0c6c9c7c4c7?auto=format&fit=crop&w=800&q=80"},
  {id:6,name:"Manta Aconchego",description:"Um cantinho quentinho",price:79.90,category:"Conforto",label:"ACONCHEGO",image:"https://images.unsplash.com/photo-151猫?auto=format&fit=crop&w=800&q=80"}
];

const money = value => value.toLocaleString("pt-BR", {style:"currency",currency:"BRL"});
let cart = [];
let activeCategory = "Todos";
const productGrid = document.querySelector("#product-grid");
const productSearch = document.querySelector("#product-search");
const cartDrawer = document.querySelector("#cart-drawer");
const cartOverlay = document.querySelector("#cart-overlay");
const toast = document.querySelector("#toast");
let toastTimeout;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2400);
}

function renderProducts() {
  const query = productSearch.value.trim().toLocaleLowerCase("pt-BR");
  const visible = products.filter(product => {
    const categoryMatches = activeCategory === "Todos" || product.category === activeCategory;
    const searchMatches = (product.name + " " + product.description + " " + product.category).toLocaleLowerCase("pt-BR").includes(query);
    return categoryMatches && searchMatches;
  });
  document.querySelector("#product-count").textContent = visible.length + (visible.length === 1 ? " produto" : " produtos");
  productGrid.innerHTML = visible.length ? visible.map(product => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy">
        <span class="product-label">${product.label}</span>
        <button class="quick-add" data-add="${product.id}" aria-label="Adicionar ${product.name} à sacola">+</button>
      </div>
      <div class="product-info"><div><h3>${product.name}</h3><p>${product.description}</p></div><span class="product-price">${money(product.price)}</span></div>
    </article>`).join("") : '<p class="empty-results">Nenhum produto encontrado. Tente outra busca.</p>';
}

function openCart() {
  cartDrawer.classList.add("open");
  cartOverlay.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeCart() {
  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
function addToCart(id) {
  const item = cart.find(entry => entry.id === id);
  if (item) item.quantity += 1;
  else cart.push({id,quantity:1});
  renderCart();
  showToast("Mimo adicionado à sua sacola ♡");
}
function changeQuantity(id, amount) {
  const item = cart.find(entry => entry.id === id);
  if (!item) return;
  item.quantity += amount;
  if (item.quantity <= 0) cart = cart.filter(entry => entry.id !== id);
  renderCart();
}
function removeFromCart(id) {
  cart = cart.filter(entry => entry.id !== id);
  renderCart();
}
function renderCart() {
  const count = cart.reduce((sum,item) => sum + item.quantity,0);
  const total = cart.reduce((sum,item) => sum + products.find(product => product.id === item.id).price * item.quantity,0);
  document.querySelector("#cart-count").textContent = count;
  document.querySelector("#drawer-count").textContent = "(" + count + ")";
  document.querySelector("#cart-subtotal").textContent = money(total);
  const itemsContainer = document.querySelector("#cart-items");
  if (!cart.length) {
    itemsContainer.innerHTML = '<div class="empty-cart"><span>♡</span><h3>Está tão vazinha...</h3><p>Que tal escolher um mimo para seu melhor amigo?</p></div>';
    return;
  }
  itemsContainer.innerHTML = cart.map(item => {
    const product = products.find(entry => entry.id === item.id);
    return `<article class="cart-item">
      <img src="${product.image}" alt="">
      <div><h3>${product.name}</h3><p>${money(product.price)}</p>
        <div class="quantity-controls"><button data-quantity="${product.id}" data-change="-1" aria-label="Diminuir quantidade">−</button><span>${item.quantity}</span><button data-quantity="${product.id}" data-change="1" aria-label="Aumentar quantidade">+</button></div>
        <button class="remove-item" data-remove="${product.id}">Remover</button>
      </div><strong>${money(product.price * item.quantity)}</strong>
    </article>`;
  }).join("");
}

productGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(Number(button.dataset.add));
});
document.querySelector("#cart-items").addEventListener("click", event => {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");
  if (quantityButton) changeQuantity(Number(quantityButton.dataset.quantity), Number(quantityButton.dataset.change));
  if (removeButton) removeFromCart(Number(removeButton.dataset.remove));
});
document.querySelectorAll(".category").forEach(link => link.addEventListener("click", () => {
  activeCategory = link.dataset.category;
  document.querySelectorAll(".category").forEach(category => category.classList.toggle("active", category === link));
  renderProducts();
}));
productSearch.addEventListener("input", renderProducts);
document.querySelector("#search-toggle").addEventListener("click", () => {
  const searchBox = document.querySelector("#search-box");
  searchBox.classList.toggle("visible");
  if (searchBox.classList.contains("visible")) {
    searchBox.scrollIntoView({behavior:"smooth",block:"nearest"});
    productSearch.focus();
  }
});
document.querySelector("#cart-open").addEventListener("click", openCart);
document.querySelector("#cart-close").addEventListener("click", closeCart);
document.querySelector("#continue-shopping").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);
document.addEventListener("keydown", event => { if (event.key === "Escape") closeCart(); });
document.querySelector("#checkout-button").addEventListener("click", () => {
  if (!cart.length) showToast("Sua sacola está vazia por enquanto.");
  else showToast("Checkout demonstrativo — conecte um meio de pagamento para vender.");
});
document.querySelector("#newsletter-form").addEventListener("submit", event => {
  event.preventDefault();
  document.querySelector("#newsletter-message").textContent = "Obrigado! Sua inscrição foi registrada nesta demonstração.";
  event.target.reset();
});
document.querySelector("#year").textContent = new Date().getFullYear();
renderProducts();
renderCart();