import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PenTool, LogOut, User as UserIcon, BookOpen, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path ? "text-indigo-600 font-semibold" : "text-gray-600 hover:text-indigo-600";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white group-hover:bg-indigo-700 transition-colors">
                  <BookOpen size={20} />
                </div>
                <span className="font-bold text-xl text-gray-900 tracking-tight">Gemini<span className="text-indigo-600">Blog</span></span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden sm:flex sm:items-center sm:space-x-8">
              <Link to="/" className={isActive('/')}>Explore</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/write" className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${location.pathname === '/write' ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md'}`}>
                    <PenTool size={16} />
                    <span>Write</span>
                  </Link>
                  <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                     <span className="text-sm font-medium text-gray-700 hidden md:block">{user?.username}</span>
                     <img src={user?.avatar} alt={user?.username} className="w-8 h-8 rounded-full bg-gray-200" />
                     <button onClick={() => logout()} className="text-gray-400 hover:text-red-500 transition-colors" title="Logout">
                       <LogOut size={20} />
                     </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium">Log in</Link>
                  <Link to="/register" className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">Get Started</Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="sm:hidden bg-white border-b">
            <div className="pt-2 pb-3 space-y-1">
              <Link to="/" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800" onClick={() => setIsMenuOpen(false)}>Explore</Link>
              {isAuthenticated && (
                 <Link to="/write" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800" onClick={() => setIsMenuOpen(false)}>Write a Story</Link>
              )}
            </div>
            <div className="pt-4 pb-4 border-t border-gray-200">
              {isAuthenticated ? (
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <img className="h-10 w-10 rounded-full" src={user?.avatar} alt="" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user?.username}</div>
                    <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                  </div>
                  <button onClick={() => { logout(); setIsMenuOpen(false); }} className="ml-auto flex-shrink-0 bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <div className="mt-3 px-2 space-y-1">
                  <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Log in</Link>
                  <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 hover:text-indigo-500 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Create Account</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} GeminiBlog Demo. Built with React, Tailwind, and Google Gemini.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;