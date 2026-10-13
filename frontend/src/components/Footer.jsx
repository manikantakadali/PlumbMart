import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Droplets, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  ShieldAlert
} from 'lucide-react';

export default function Footer({ onCategoryClick }) {
  return (
    <footer className="bg-slate-100 border-t border-slate-200 text-slate-600 text-sm mt-16">
      
      {/* Main Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center shadow-md shadow-blue-500/20">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                Plumb<span className="text-blue-600">Mart</span>
              </span>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              India&apos;s premier digital plumbing procurement platform connecting retail homeowners, certified plumbers, and wholesale building material dealers with genuine certified pipes, fittings, sanitaryware, and booster pumps.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-2">
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>100% Genuine Brands</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Next-Day Delivery</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span>Easy 7-Day Returns</span>
              </div>
            </div>
          </div>

          {/* Catalog Categories */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Hardware Catalog
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onCategoryClick && onCategoryClick('Pipes & Tubes')} className="hover:text-blue-600 transition">
                  CPVC &amp; UPVC Pipes
                </button>
              </li>
              <li>
                <button onClick={() => onCategoryClick && onCategoryClick('Fittings & Valves')} className="hover:text-blue-600 transition">
                  Concealed Brass Valves
                </button>
              </li>
              <li>
                <button onClick={() => onCategoryClick && onCategoryClick('Bath & Faucets')} className="hover:text-blue-600 transition">
                  Basin Taps &amp; Showers
                </button>
              </li>
              <li>
                <button onClick={() => onCategoryClick && onCategoryClick('Pumps & Motors')} className="hover:text-blue-600 transition">
                  Self-Priming Pumps
                </button>
              </li>
              <li>
                <button onClick={() => onCategoryClick && onCategoryClick('Tools & Sealants')} className="hover:text-blue-600 transition">
                  Pipe Wrenches &amp; Sealants
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Links & Roles */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Role Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/customer" className="hover:text-blue-600 transition flex items-center gap-1.5">
                  <span>Customer Dashboard</span>
                </Link>
              </li>
              <li>
                <Link to="/dealer" className="hover:text-blue-600 transition flex items-center gap-1.5">
                  <span>Dealer B2B Dashboard</span>
                </Link>
              </li>
              <li>
                <Link to="/plumber" className="hover:text-blue-600 transition flex items-center gap-1.5">
                  <span>Plumber Partner Dashboard</span>
                </Link>
              </li>
              <li className="pt-2">
                <Link to="/admin/login" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800 transition">
                  <ShieldAlert className="w-3 h-3 text-blue-400" />
                  <span>Admin Console</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support Info */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Demo Support Desk
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-900 block font-semibold">+91 98765 43210</span>
                  <span className="text-[11px] text-slate-500">Toll-free Helpdesk</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-900 block font-semibold">support@plumbmart-demo.com</span>
                  <span className="text-[11px] text-slate-500">Instant Response</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-700 block font-medium">Plot No. 42, Industrial Zone</span>
                  <span className="text-[11px] text-slate-500">Bengaluru, Karnataka, 560001</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-700 block font-medium">Mon - Sat: 8 AM - 8 PM</span>
                  <span className="text-[11px] text-slate-500">Sunday Closed</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Sub-footer */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 PlumbMart Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-900 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-900 cursor-pointer">Terms of Service</span>
            <span className="text-slate-400 font-mono">Demo Build v2.1</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
