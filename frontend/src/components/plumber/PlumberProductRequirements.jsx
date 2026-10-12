import React from 'react';
import PlumberProducts from './PlumberProducts';

/**
 * Backward compatibility wrapper for PlumberProductRequirements
 */
export default function PlumberProductRequirements({
  technicalCatalog = [],
  products = [],
  categories = [],
  productRequests = [],
  activeActivities = [],
  isLoading = false,
  error = null,
  onRetry,
  onSelectCategory,
  selectedCategory = 'all',
  searchQuery = '',
  onSearchChange,
  onSubmitRequest,
  onCancelRequest
}) {
  const combinedProducts = products.length > 0 ? products : technicalCatalog;

  return (
    <PlumberProducts
      products={combinedProducts}
      categories={categories}
      productRequests={productRequests}
      activeActivities={activeActivities}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      onSelectCategory={onSelectCategory}
      selectedCategory={selectedCategory}
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      onSubmitRequest={onSubmitRequest}
      onCancelRequest={onCancelRequest}
    />
  );
}
