/**
 * Resolves the regional supply warehouse / hub depot name dynamically
 * based on dealer's city, address, or GSTIN state code.
 */
export function getDealerHub(dealer) {
  if (!dealer) return 'Bengaluru Central Depot';
  
  // If dealer already has an explicit hub assigned
  if (dealer.hub && typeof dealer.hub === 'string' && dealer.hub.trim()) {
    return dealer.hub.trim();
  }

  const city = (dealer.city || '').toLowerCase().trim();
  const address = (dealer.address || dealer.deliveryAddress || '').toLowerCase();
  const gstin = (dealer.gstin || '').toUpperCase().trim();

  // 1. Visakhapatnam / Vizag (Andhra Pradesh)
  if (
    city.includes('visakhapatnam') || 
    city.includes('vizag') || 
    address.includes('visakhapatnam') || 
    address.includes('vizag')
  ) {
    return 'Vizag Central Depot Hub';
  }

  // 2. Vijayawada (Andhra Pradesh)
  if (city.includes('vijayawada') || address.includes('vijayawada')) {
    return 'Vijayawada Supply Depot';
  }

  // 3. Guntur (Andhra Pradesh)
  if (city.includes('guntur') || address.includes('guntur')) {
    return 'Guntur Distribution Hub';
  }

  // 4. Tirupati (Andhra Pradesh)
  if (city.includes('tirupati') || address.includes('tirupati')) {
    return 'Tirupati Supply Hub';
  }

  // 5. Hyderabad / Secunderabad (Telangana)
  if (
    city.includes('hyderabad') || 
    city.includes('secunderabad') || 
    address.includes('hyderabad') || 
    address.includes('secunderabad')
  ) {
    return 'Hyderabad Regional Hub';
  }

  // 6. Chennai (Tamil Nadu)
  if (city.includes('chennai') || address.includes('chennai')) {
    return 'Chennai Central Hub';
  }

  // 7. Bengaluru / Bangalore (Karnataka)
  if (
    city.includes('bengaluru') || 
    city.includes('bangalore') || 
    address.includes('bengaluru') || 
    address.includes('bangalore')
  ) {
    return 'Bengaluru Central Depot';
  }

  // 8. GSTIN State Code heuristics if city is missing:
  // 37 = Andhra Pradesh
  if (gstin.startsWith('37')) {
    return 'Vizag Central Depot Hub';
  }
  // 36 = Telangana
  if (gstin.startsWith('36')) {
    return 'Hyderabad Regional Hub';
  }
  // 33 = Tamil Nadu
  if (gstin.startsWith('33')) {
    return 'Chennai Central Hub';
  }
  // 29 = Karnataka
  if (gstin.startsWith('29')) {
    return 'Bengaluru Central Depot';
  }

  // 9. Custom city provided by dealer
  if (dealer.city && typeof dealer.city === 'string' && dealer.city.trim()) {
    const formattedCity = dealer.city.trim();
    return `${formattedCity} Distribution Depot`;
  }

  return 'Bengaluru Central Depot';
}
