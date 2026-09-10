import { type ReactNode } from 'react';
import { Layers } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-root">
      {/* Ambient mesh blobs */}
      <div className="bg-blob bg-blob--1" aria-hidden="true" />
      <div className="bg-blob bg-blob--2" aria-hidden="true" />
      <div className="bg-blob bg-blob--3" aria-hidden="true" />

      {/* Sticky top nav */}
      <nav className="app-nav" aria-label="Application navigation">
        <div className="app-nav__brand">
          <div className="app-nav__logo" aria-hidden="true">
            <Layers size={20} strokeWidth={1.75} />
          </div>
          <span className="app-nav__title">Flat Name Converter</span>
        </div>
        <span className="app-nav__pill">flat_Name_Convention</span>
      </nav>

      <div className="app-container">
        {/* Hero header */}
        <header className="app-header">
          <div className="app-header__eyebrow" aria-hidden="true">
            <span className="app-header__eyebrow-dot" />
            Excel Point Data Lookup
          </div>
          <h1 className="app-header__title">Shyju Flat Name Converter Tool</h1>
          <p className="app-header__subtitle">
            Upload your Excel workbook and instantly look up structured point data by primary key
          </p>
        </header>

        {/* Main content */}
        <main className="app-main" role="main">
          {children}
        </main>

        {/* Footer */}
        <footer className="app-footer" aria-label="Application footer">
          Only the <code>flat_Name_Convention</code> sheet is read — all other sheets are ignored
        </footer>
      </div>
    </div>
  );
}
