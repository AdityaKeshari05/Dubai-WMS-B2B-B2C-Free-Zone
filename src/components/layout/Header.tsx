'use client';

import { Menu, Bell, Search, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getInitials } from '@/lib/utils';
import { useState } from 'react';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-[52px] items-center justify-between border-b border-[#e5e2dc] bg-white/95 px-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="rounded-md p-1.5 text-[#6b7280] hover:bg-[#eef3f5] hover:text-[#1f2937] lg:hidden">
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa3af]" />
          <input
            type="text"
            placeholder="Search or jump to..."
            className="h-8 w-64 rounded-md border border-[#e5e2dc] bg-[#f8faf9] py-1 pl-8 pr-3 text-sm text-[#1f2937] outline-none transition focus:border-[#2490ef] focus:bg-white focus:ring-2 focus:ring-[#2490ef]/15"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button type="button" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => { setNotificationsOpen((open) => !open); setUserMenuOpen(false); }} className="relative rounded-md p-1.5 text-[#6b7280] hover:bg-[#eef3f5] hover:text-[#1f2937]">
            <Bell className="h-5 w-5" />
          </button>
          {notificationsOpen && (
            <div role="status" className="absolute right-0 z-50 mt-1 w-72 rounded-md border border-[#e5e2dc] bg-white p-4 shadow-lg shadow-gray-900/10">
              <p className="text-sm font-semibold text-[#1f2937]">Notifications</p>
              <p className="mt-2 text-sm text-[#7c8591]">You have no new notifications.</p>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => { setUserMenuOpen(!userMenuOpen); setNotificationsOpen(false); }}
            className="flex items-center gap-2 rounded-md p-1 hover:bg-[#eef3f5]"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#2490ef]">
              <span className="text-xs font-semibold text-white">
                {user ? getInitials(user.firstName, user.lastName) : 'U'}
              </span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium leading-none text-[#1f2937]">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-[#7c8591]">{user?.role?.replace('_', ' ')}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-[#9aa3af]" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 z-50 mt-1 w-52 rounded-md border border-[#e5e2dc] bg-white py-1 shadow-lg shadow-gray-900/10">
              <div className="border-b border-[#f0ede8] px-3 py-2">
                <p className="text-sm font-medium text-[#1f2937]">{user?.firstName} {user?.lastName}</p>
                <p className="truncate text-xs text-[#7c8591]">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[#c3423f] hover:bg-[#fff1f0]"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
