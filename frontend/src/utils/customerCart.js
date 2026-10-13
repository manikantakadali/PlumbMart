// Customer Cart Utility with LocalStorage persistence and event synchronization

const STORAGE_KEY = 'plumbmart_customer_cart';

export function getCustomerCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading customer cart:', err);
    return [];
  }
}

export function saveCustomerCart(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('customer_cart_updated', { detail: items }));
    return true;
  } catch (err) {
    console.error('Error saving customer cart:', err);
    return false;
  }
}

export function addToCustomerCart(product, quantity = 1) {
  const current = getCustomerCart();
  const existingIndex = current.findIndex(item => item.id === product.id);

  const unitPrice = product.price; // Retail price for customer
  const qtyToAdd = Math.max(1, quantity);

  let updated;
  if (existingIndex > -1) {
    updated = [...current];
    updated[existingIndex] = {
      ...updated[existingIndex],
      quantity: updated[existingIndex].quantity + qtyToAdd,
      price: unitPrice
    };
  } else {
    updated = [
      ...current,
      {
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        sku: product.sku || ('SKU-' + product.id),
        price: unitPrice,
        mrp: product.mrp || product.price,
        image: product.image,
        quantity: qtyToAdd
      }
    ];
  }

  saveCustomerCart(updated);
  return updated;
}

export function updateCustomerCartQuantity(productId, quantity) {
  const current = getCustomerCart();
  let updated;

  if (quantity <= 0) {
    updated = current.filter(item => item.id !== productId);
  } else {
    updated = current.map(item =>
      item.id === productId ? { ...item, quantity } : item
    );
  }

  saveCustomerCart(updated);
  return updated;
}

export function removeFromCustomerCart(productId) {
  const current = getCustomerCart();
  const updated = current.filter(item => item.id !== productId);
  saveCustomerCart(updated);
  return updated;
}

export function clearCustomerCart() {
  saveCustomerCart([]);
  return [];
}

export function getCustomerCartTotals(items = null) {
  const cart = items || getCustomerCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gst = Math.round(subtotal * 0.18); // 18% GST included or added
  const shipping = subtotal >= 1000 || subtotal === 0 ? 0 : 99; // Free delivery over ₹1000
  const grandTotal = subtotal + gst + shipping;

  return {
    count,
    subtotal,
    gst,
    shipping,
    grandTotal
  };
}
