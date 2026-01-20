import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  PhoneCall, 
  HelpCircle, 
  Settings, 
  LogOut, 
  Menu, 
  X
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Service Leads', path: '/leads', icon: <Users size={20} /> },
    { name: 'Quote Requests', path: '/quotes', icon: <FileText size={20} /> },
    { name: 'Expert Requests', path: '/expert', icon: <PhoneCall size={20} /> },
    { name: 'Support Tickets', path: '/support', icon: <HelpCircle size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside 
        className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 ease-in-out flex flex-col fixed h-full z-10`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-center border-b border-slate-700">
          <h1 className={`font-bold text-xl ${!sidebarOpen && 'hidden'}`}>Padhyasoft</h1>
          <span className={`${sidebarOpen && 'hidden'} font-bold text-xl`}>P</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink 
                  to={item.path}
                  className={({ isActive }) => `flex items-center px-6 py-3 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors ${isActive ? 'bg-slate-800 text-white border-r-4 border-blue-500' : ''}`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className={`ml-3 whitespace-nowrap overflow-hidden ${!sidebarOpen && 'hidden'}`}>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={logout}
            className="flex items-center w-full px-2 py-2 text-red-400 hover:bg-slate-800 rounded transition-colors"
          >
            <LogOut size={20} />
            <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        
        {/* Top Navbar */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded text-slate-600">
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
               <p className="text-sm font-semibold text-slate-800">{user?.name || 'Admin'}</p>
               <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
               {user?.name ? user.name.charAt(0) : 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
           <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
