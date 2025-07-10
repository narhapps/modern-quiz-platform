
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import Logo from '../shared/Logo';
import { LayoutDashboard, History, LogOut, Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const StudentLayout: React.FC = () => {
  const { logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My History', path: '/student/history', icon: History },
  ];
  
  const navLinks = (
    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
       {navItems.map((item) => (
          <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                      isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                  }`
              }
          >
              {item.name}
          </NavLink>
      ))}
    </div>
  );


  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-6">
            {navLinks}
          </div>
          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm font-medium">{user?.name}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
         <div className="md:hidden absolute top-16 left-0 right-0 z-40 bg-background border-b pb-4">
             <div className="container flex flex-col items-start gap-4">
                {navLinks}
                <div className="w-full pt-4 border-t">
                  <p className="text-sm font-medium mb-2">{user?.name}</p>
                   <Button variant="outline" className="w-full" onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                </div>
             </div>
         </div>
      )}

      <main className="flex-1">
        <div className="container py-8">
          <Outlet />
        </div>
      </main>
      <footer className="py-4 border-t">
          <div className="container text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} QuizPlatform. All rights reserved.
          </div>
      </footer>
    </div>
  );
};

export default StudentLayout;
