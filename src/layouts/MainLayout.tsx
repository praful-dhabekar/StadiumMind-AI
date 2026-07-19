import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Topbar } from '../components/Topbar';
import { Sidebar } from '../components/Sidebar';

/**
 * Primary layout component wrapping the responsive navigation sidebar, topbar header, and nested route content.
 *
 * @returns React MainLayout container element
 */
export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-stadium-950 flex flex-col">
      {/* Skip navigation — WCAG 2.4.1: Bypass Blocks */}
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <Topbar onToggleSidebar={toggleSidebar} />
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
