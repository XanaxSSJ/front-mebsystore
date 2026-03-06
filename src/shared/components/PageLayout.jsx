"use client";

import Navbar from './Navbar';
import Footer from './Footer';

function PageLayout({ children, className }) {
  return (
    <div className="min-h-screen flex flex-col bg-background-light text-surface selection:bg-primary/20">
      <Navbar />
      <main className={`flex-1 ${className ?? ''}`}>{children}</main>
      <Footer />
    </div>
  );
}

export default PageLayout;
