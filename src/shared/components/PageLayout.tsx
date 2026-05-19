"use client";

import Navbar from './Navbar';
import Footer from './Footer';
import type { PageLayoutProps } from '@/types/components';

function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col w-full min-w-0 overflow-x-clip bg-background-light text-surface selection:bg-primary/20">
      <Navbar />
      <main className={`flex-1 w-full min-w-0 ${className ?? ''}`}>{children}</main>
      <Footer />
    </div>
  );
}

export default PageLayout;
