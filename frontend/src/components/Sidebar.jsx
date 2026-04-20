import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShieldCheck, FileText,
  BarChart2, Star, UserCircle, LogOut, Zap, ChevronRight, Menu, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const links = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/products',    icon: Package,          label: 'Products'    },
  { to: '/escrow',      icon: ShieldCheck,      label: 'Escrow'      },
  { to: '/invoices',    icon: FileText,          label: 'Invoices'    },
  { to: '/trust-score', icon: Star,             label: 'Trust Score' },
  { to: '/analytics',   icon: BarChart2,        label: 'Analytics'   },
  { to: '/profile',     icon: UserCircle,       label: 'Profile'     },
];

// Bottom tab links (5 most important for mobile)
const tabLinks = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Home'     },
  { to: '/products',    icon: Package,          label: 'Products' },
  { to: '/escrow',      icon: ShieldCheck,      label: 'Escrow'   },
  { to: '/trust-score', icon: Star,             label: 'Score'    },
  { to: '/profile',     icon: UserCircle,       label: 'Profile'  },
];

// ─── Shared sidebar content ───────────────────────────────────────────────────
const SidebarContent = ({ onClose }) => {
  const { business, logout } = useAuth();
  const navigate = useNavigate();

  const initials = (business?.name || 'BZ')
    .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const score = business?.trustScore ?? 0;

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-primary-600 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center shrink-0">
            <Zap size={15} className="text-white" />
          </div>
          <span className="text-white font-display font-700 text-lg tracking-tight">VerifyIt</span>
        </div>
        {/* Close button — mobile only */}
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-primary-300 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Business info */}
      <div className="px-5 py-4 border-b border-primary-600">
        <div className="flex items-center gap-3">
          {business?.profilePicture ? (
            <img src={business.profilePicture} alt=""
              className="w-9 h-9 rounded-xl object-cover ring-2 ring-gold-500" />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-primary-600 ring-2 ring-gold-500 flex items-center justify-center shrink-0">
              <span className="text-white font-display font-700 text-xs">{initials}</span>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate leading-tight">{business?.name}</p>
            <p className="text-primary-300 text-xs mt-0.5">
              {business?.cacNumber ? '✓ CAC Registered' : 'Not verified'}
            </p>
          </div>
        </div>

        {/* Trust score bar */}
        <div className="mt-3 bg-primary-800 rounded-lg px-3 py-2">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-primary-300 text-xs">Trust Score</span>
            <span className="text-white font-display font-700 text-xs">{score}/100</span>
          </div>
          <div className="h-1.5 bg-primary-600 rounded-full overflow-hidden">
            <div className="h-full bg-gold-500 rounded-full transition-all duration-700"
              style={{ width: `${score}%` }} />
          </div>
        </div>

        {business?.isPremium && (
          <div className="mt-2 flex items-center gap-1.5 bg-gold-500/20 rounded-lg px-2.5 py-1.5">
            <Star size={11} className="text-gold-300 fill-gold-300" />
            <span className="text-gold-300 text-xs font-semibold">Premium</span>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150
              ${isActive
                ? 'bg-white/15 text-white'
                : 'text-primary-200 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <Icon size={16} />
              <span>{label}</span>
            </div>
            <ChevronRight size={13} className="opacity-0 group-hover:opacity-60 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-primary-600">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-primary-300 hover:bg-red-500/20 hover:text-red-300 transition-all duration-150"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

// ─── Main Sidebar component ───────────────────────────────────────────────────
const Sidebar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* ── DESKTOP sidebar (lg and above) ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-60 bg-primary-700 flex-col z-30">
        <SidebarContent />
      </aside>

      {/* ── MOBILE top header ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-primary-700 flex items-center justify-between px-4 py-3 shadow-elevated">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gold-500 rounded-lg flex items-center justify-center">
            <Zap size={13} className="text-white" />
          </div>
          <span className="text-white font-display font-700 text-base">VerifyIt</span>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* ── MOBILE drawer overlay ── */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer panel */}
          <div className="relative w-72 bg-primary-700 h-full flex flex-col shadow-elevated animate-slideIn">
            <SidebarContent onClose={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* ── MOBILE bottom tab bar ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 flex items-center">
        {tabLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-xs font-semibold transition-colors
              ${isActive ? 'text-primary-700' : 'text-gray-400 hover:text-primary-500'}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
                <span className="text-[10px]">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
};

export default Sidebar;
