// Cart management utilities
function addToCart(product) {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  
  // Find selected option
  const optionSelect = document.querySelector(`[data-product-id="${product.id}"] select`);
  if (!optionSelect) {
    alert('Please select an option');
    return;
  }

  const selectedOption = optionSelect.value;
  if (!selectedOption) {
    alert('Please select an option');
    return;
  }

  // Check if item already in cart
  const existingItem = cart.find(item => 
    item.id === product.id && item.option === selectedOption
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      option: selectedOption,
      quantity: 1,
      image: product.image
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Show feedback
  const btn = document.querySelector(`[data-product-id="${product.id}"] .add-to-cart-btn`);
  const originalText = btn.textContent;
  btn.textContent = '✓ Added to cart';
  btn.style.background = 'var(--ok)';
  
  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = '';
  }, 2000);
}

function getCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function updateCartIcon() {
  const count = getCartCount();
  const badge = document.getElementById('cart-badge');
  if (badge) {
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }
  }
}

// Update cart icon on page load
window.addEventListener('load', updateCartIcon);
