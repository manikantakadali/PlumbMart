// Dealer Cart Utility with LocalStorage persistence and event synchronization

const STORAGE_KEY = 'plumbmart_dealer_cart';

export function getDealerCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading dealer cart:', err);
    return [];
  }
}

export function saveDealerCart(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('dealer_cart_updated', { detail: items }));
    return true;
  } catch (err) {
    console.error('Error saving dealer cart:', err);
    return false;
  }
}

export function addToDealerCart(product, quantity = 1) {
  const current = getDealerCart();
  const existingIndex = current.findIndex(item => item.id === product.id);

  const unitPrice = product.dealerPrice || product.price;
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
        stock: product.stock || 50,
        moq: product.moq || 1,
        image: product.image,
        quantity: qtyToAdd,
        zohoWorkbook: product.zohoWorkbook || { sheet: 'Master_Inventory_Live' }
      }
    ];
  }

  saveDealerCart(updated);
  return updated;
}

export function updateDealerCartQuantity(productId, quantity) {
  const current = getDealerCart();
  let updated;

  if (quantity <= 0) {
    updated = current.filter(item => item.id !== productId);
  } else {
    updated = current.map(item =>
      item.id === productId ? { ...item, quantity } : item
    );
  }

  saveDealerCart(updated);
  return updated;
}

export function removeFromDealerCart(productId) {
  const current = getDealerCart();
  const updated = current.filter(item => item.id !== productId);
  saveDealerCart(updated);
  return updated;
}

export function clearDealerCart() {
  saveDealerCart([]);
  return [];
}

export function getDealerCartTotals(items = null) {
  const cart = items || getDealerCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gst = Math.round(subtotal * 0.18); // 18% GST (Input Tax Credit)
  const shipping = subtotal >= 10000 || subtotal === 0 ? 0 : 450;
  const grandTotal = subtotal + gst + shipping;

  return {
    itemCount: count,
    uniqueCount: cart.length,
    subtotal,
    gst,
    shipping,
    grandTotal
  };
}
