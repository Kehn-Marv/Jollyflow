import React from 'react';
import { Outlet } from 'react-router-dom';
import { PublicNav } from './PublicNav';
import { PublicFooter } from './PublicFooter';

export function PublicLayout() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-paper">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-lime focus:px-4 focus:py-2 focus:font-semibold">
        Skip to content
      </a>
      <PublicNav />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>);

}