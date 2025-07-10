
import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import Logo from '../shared/Logo';
import { LayoutDashboard, Users, Library, BarChart2, LogOut, Menu, X } from 'lucide-react';

const AdminLayout: React.FC = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
    };

    const navItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Students', path: '/admin/students', icon: Users },
        { name: 'Subjects', path: '/admin/subjects', icon: Library },
        { name: 'Results', path: '/admin/results', icon: BarChart2 },
    ];

    const sidebarContent = (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b">
                <Logo />
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsSidebarOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'
                            }`
                        }
                    >
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 mt-auto border-t">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-primary">
                        {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-sm">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                </div>
                <Button variant="outline" className="w-full" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex md:w-64 flex-col fixed inset-y-0 z-50 border-r bg-background">
                {sidebarContent}
            </aside>
            
            {/* Mobile Sidebar */}
            {isSidebarOpen && (
                 <div className="md:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setIsSidebarOpen(false)}></div>
            )}
            <aside className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
                {sidebarContent}
            </aside>

            <div className="flex-1 md:pl-64">
                <header className="sticky top-0 z-30 flex items-center justify-between md:justify-end h-16 px-4 bg-background/75 backdrop-blur-sm border-b">
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(true)}>
                        <Menu className="h-6 w-6" />
                    </Button>
                    <p className="text-sm font-medium">Welcome back, {user?.name}!</p>
                </header>
                <main className="p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
