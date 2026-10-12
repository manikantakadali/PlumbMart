import React, { useState } from 'react';
import {
  Package,
  BookOpen,
  Award,
  Search,
  Filter,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ArrowRight,
  Layers,
  Wrench,
  Ban,
  RefreshCw,
  Tag
} from 'lucide-react';
import PlumberProductRequestModal from './PlumberProductRequestModal';

export default function PlumberProducts({
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
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'requests'
  const [requestStatusFilter, setRequestStatusFilter] = useState('all');
  const [selectedProductForRequest, setSelectedProductForRequest] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);
  const [cancelError, setCancelError] = useState('');
  const [expandedProductDetailId, setExpandedProductDetailId] = useState(null);

  // Filter requests
  const filteredRequests = (productRequests || []).filter((req) => {
    if (requestStatusFilter !== 'all' && req.status !== requestStatusFilter) {
      return false;
    }
    return true;
  });

  const handleCancel = async (requestId) => {
    setCancelError('');
    setCancelingId(requestId);
    try {
      await onCancelRequest(requestId);
    } catch (err) {
      setCancelError(err.data?.error || err.message || 'Failed to cancel request');
    } finally {
      setCancelingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'FULFILLED':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'REJECTED':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'CANCELLED':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
  };

  const pendingRequestsCount = (productRequests || []).filter((r) => r.status === 'PENDING').length;

  return (
    <div className="space-y-4 py-2 pb-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Package className="w-4 h-4 text-purple-400" />
            <span>Products &amp; Requirements</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Technical specs, installation guidelines &amp; material requirements
          </p>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Tabs: Catalog vs My Requests */}
      <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'catalog'
              ? 'bg-purple-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Product Catalog ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'requests'
              ? 'bg-purple-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>
            My Requests ({productRequests.length})
            {pendingRequestsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[9px] font-bold">
                {pendingRequestsCount}
              </span>
            )}
          </span>
        </button>
      </div>

      {/* Error alert */}
      {(error || cancelError) && (
        <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{cancelError || error}</span>
        </div>
      )}

      {/* TAB 1: PRODUCT CATALOG & SPECS */}
      {activeTab === 'catalog' && (
        <div className="space-y-3.5">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Search products by name, SKU or brand..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Categories Pill Bar */}
          {categories.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              <button
                onClick={() => onSelectCategory && onSelectCategory('all')}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
                  selectedCategory === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory && onSelectCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition flex items-center gap-1 ${
                    selectedCategory === cat.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <span>{cat.name}</span>
                  {cat.productCount !== undefined && (
                    <span className="text-[10px] opacity-70">({cat.productCount})</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="space-y-3 animate-pulse">
              <div className="h-36 bg-slate-800/60 rounded-2xl"></div>
              <div className="h-36 bg-slate-800/60 rounded-2xl"></div>
            </div>
          )}

          {/* Empty Catalog State */}
          {!isLoading && products.length === 0 && (
            <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 my-2 space-y-2">
              <Package className="w-8 h-8 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">No Products Found</h3>
              <p className="text-xs text-slate-400">
                Try adjusting your search query or selected category.
              </p>
            </div>
          )}

          {/* Product Cards List */}
          {!isLoading && products.length > 0 && (
            <div className="space-y-3">
              {products.map((prod) => {
                const isExpanded = expandedProductDetailId === prod.id;

                return (
                  <div
                    key={prod.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow"
                  >
                    <div className="flex items-start gap-3">
                      {prod.image && (
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-mono text-purple-400">
                            {prod.sku} • {prod.categoryName}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[10px] border border-purple-500/30 flex items-center gap-1 shrink-0">
                            <Award className="w-3 h-3 text-amber-400" /> +{prod.plumberPoints} Pts
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white line-clamp-2">
                          {prod.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="text-slate-400">
                            Brand: <strong className="text-slate-200">{prod.brand}</strong>
                          </span>
                          <span className="text-slate-500">•</span>
                          <span
                            className={`font-semibold ${
                              prod.inStock ? 'text-emerald-400' : 'text-slate-500'
                            }`}
                          >
                            {prod.availability || (prod.inStock ? 'In Stock' : 'Out of Stock')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Technical Specifications */}
                    <div className="text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                      <strong className="text-purple-300">Engineering Specs:</strong>{' '}
                      {prod.specifications}
                    </div>

                    {/* Plumber Installation Guideline Note */}
                    <div className="text-[11px] text-amber-200 bg-amber-950/20 p-2.5 rounded-xl border border-amber-500/30">
                      <strong className="text-amber-300">Installation Guideline:</strong>{' '}
                      {prod.installationNote}
                    </div>

                    {/* Card Actions */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() =>
                          setExpandedProductDetailId(isExpanded ? null : prod.id)
                        }
                        className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                      >
                        {isExpanded ? 'Hide Specs' : 'Technical BoM'}
                      </button>

                      <button
                        onClick={() => setSelectedProductForRequest(prod)}
                        className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 flex items-center justify-center gap-1.5 transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Request Material</span>
                      </button>
                    </div>

                    {/* Expanded Technical BoM Details */}
                    {isExpanded && (
                      <div className="p-3 rounded-xl bg-slate-900 border border-purple-500/30 space-y-2 text-xs text-slate-300 animate-slide-up">
                        <div className="font-bold text-purple-300 text-[11px]">
                          Technical Compliance &amp; Installation BoM:
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div>Unit of Dispatch: <strong className="text-white">{prod.unit || 'Piece'}</strong></div>
                          <div>Zoho Sync SKU: <strong className="text-white font-mono">{prod.sku}</strong></div>
                          <div>Loyalty Verification: <strong className="text-amber-400">Scan Barcode / BoM</strong></div>
                          <div>Reward Credit: <strong className="text-emerald-400 font-mono">+{prod.plumberPoints} Pts</strong></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY PRODUCT REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-3.5">
          {/* Status Filter Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {['all', 'PENDING', 'APPROVED', 'FULFILLED', 'REJECTED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setRequestStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
                  requestStatusFilter === st
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {st === 'all' ? 'All Status' : st}
              </button>
            ))}
          </div>

          {/* Empty Requests State */}
          {filteredRequests.length === 0 && (
            <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 my-2 space-y-2">
              <Package className="w-8 h-8 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">No Product Requests</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                You have not submitted any product requirements under this status. Switch to the Product Catalog to request materials for your assigned sites.
              </p>
            </div>
          )}

          {/* Requests List */}
          {filteredRequests.length > 0 && (
            <div className="space-y-3">
              {filteredRequests.map((req) => {
                const isPending = req.status === 'PENDING';

                return (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 shadow"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-purple-400">
                        {req.id}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                          req.status
                        )}`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-bold text-white flex items-center justify-between">
                        <span>{req.productName}</span>
                        <span className="font-mono text-purple-300 font-bold bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                          Qty: {req.quantity}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {req.sku} {req.categoryName ? `• ${req.categoryName}` : ''}
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                      <strong className="text-slate-400">Requirement Reason:</strong>{' '}
                      {req.reason}
                    </div>

                    {/* Linked Activity & Remarks */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-slate-400">
                      {req.activityId && (
                        <div>
                          Linked Activity: <strong className="text-purple-300 font-mono">{req.activityId}</strong>
                        </div>
                      )}
                      {req.remarks && (
                        <div>Remarks: <span className="text-slate-300">{req.remarks}</span></div>
                      )}
                    </div>

                    {/* Admin notes if any */}
                    {req.adminNotes && (
                      <div className="text-[11px] text-emerald-300 bg-emerald-950/20 p-2 rounded-xl border border-emerald-500/20">
                        <strong>Dispatch Note:</strong> {req.adminNotes}
                      </div>
                    )}

                    {/* Footer Date & Cancel Option */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                      <span className="text-[10px] text-slate-500">
                        Submitted: {req.createdAt ? new Date(req.createdAt).toLocaleDateString('en-IN') : 'Recently'}
                      </span>

                      {isPending && (
                        <button
                          onClick={() => handleCancel(req.id)}
                          disabled={cancelingId === req.id}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 text-[10px] font-semibold transition flex items-center gap-1"
                        >
                          <Ban className="w-3 h-3 text-rose-400" />
                          <span>{cancelingId === req.id ? 'Cancelling...' : 'Cancel Request'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Product Request Modal */}
      {selectedProductForRequest && (
        <PlumberProductRequestModal
          product={selectedProductForRequest}
          activeActivities={activeActivities}
          onClose={() => setSelectedProductForRequest(null)}
          onSubmitRequest={async (reqData) => {
            if (onSubmitRequest) {
              await onSubmitRequest(reqData);
            }
          }}
        />
      )}
    </div>
  );
}
