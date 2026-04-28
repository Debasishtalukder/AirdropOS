import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, CheckSquare, Link as LinkIcon, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState } from 'react';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: Home },
    { label: 'Projects', path: '/projects', icon: Grid },
    { label: 'Tasks', path: '/tasks', icon: CheckSquare },
    { label: 'Resources', path: '/resources', icon: LinkIcon },
    // { label: 'Settings', path: '/settings', icon: Settings }, // hide until needed
  ];

  return (
    <aside className={cn(
      "w-[240px] flex-shrink-0 bg-white border-r border-[#F5F5F5] flex flex-col transition-all duration-300 h-screen sticky top-0",
      collapsed && "w-20"
    )}>
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-lime-500 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0">OS</div>
          {!collapsed && <span className="text-xl font-bold tracking-tight text-gray-900 truncate">AirdropOS</span>}
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-colors",
                isActive 
                  ? "bg-gray-50 text-gray-900 font-semibold border-l-4 border-lime-500" 
                  : "text-gray-500 hover:bg-gray-50",
                collapsed && "justify-center border-l-0 px-0 hover:border-l-0"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#F5F5F5]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex items-center gap-3 px-3 py-2 text-gray-500 w-full text-sm rounded-xl hover:bg-gray-50 transition-colors",
            collapsed && "justify-center px-0"
          )}
        >
          {collapsed ? <ChevronRight className="h-5 w-5 shrink-0" /> : <ChevronLeft className="h-5 w-5 shrink-0" />}
          {!collapsed && <span>Collapse Sidebar</span>}
        </button>
      </div>
    </aside>
  );
}
