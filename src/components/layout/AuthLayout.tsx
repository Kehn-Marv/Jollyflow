import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../brand/Logo';
import { images } from '../../data/images';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen w-full bg-paper lg:grid-cols-[1fr_1.05fr]">
      <aside className="on-dark relative hidden overflow-hidden bg-ink p-10 text-paper lg:flex lg:flex-col">
        <Link to="/" aria-label="JolliFlow home" className="self-start"><Logo tone="light" /></Link>
        <div className="relative mt-10 flex-1">
          <div className="absolute inset-0 overflow-hidden rounded-[2rem] border-2 border-paper/10">
            <img src={images.birthday} alt="" className="h-full w-full object-cover opacity-80" />
          </div>
          <div className="absolute bottom-6 left-6 right-6 rounded-2xl border-2 border-ink bg-lime p-5 text-ink shadow-pop">
            <p className="font-display text-2xl font-bold leading-tight">Every event. One clear plan.</p>
            <p className="mt-1 text-sm text-ink/75">Tasks, guests, vendors and every naira — connected.</p>
          </div>
        </div>
      </aside>
      <main className="flex flex-col px-5 py-8 sm:px-10">
        <Link to="/" aria-label="JolliFlow home" className="self-start lg:hidden"><Logo /></Link>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h1 className="text-3xl font-bold text-ink sm:text-4xl">{title}</h1>
          <p className="mt-2 text-smoke">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>);

}