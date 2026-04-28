import { Bell, Search, User, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-[#F5F5F5] shrink-0">
      <div className="relative w-96">
        <input 
          type="text" 
          placeholder="Search your airdrops..." 
          className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-full text-sm outline-none border border-transparent focus:border-lime-500 transition-all"
        />
        <Search className="w-4 h-4 absolute left-4 top-2.5 text-gray-500" />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
        </button>
        
        <div className="h-8 w-[1px] bg-gray-100"></div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900">{user?.email?.split('@')[0] || 'User'}</p>
            <p className="text-[10px] text-gray-500">{user?.email || 'user@example.com'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-lime-500 flex items-center justify-center text-white font-bold cursor-pointer">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} title="Sign Out" className="rounded-full text-gray-500">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
