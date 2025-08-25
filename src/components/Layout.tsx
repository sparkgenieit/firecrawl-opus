import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen gradient-surface">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
            Firecrawl MVP
          </h1>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
};