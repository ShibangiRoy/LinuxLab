import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { DashboardView } from './views/DashboardView';
import { WorkspaceView } from './views/WorkspaceView';
import { TracksView } from './views/TracksView';
import { CommandLibraryView } from './views/CommandLibraryView';
import { SandboxView } from './views/SandboxView';
import { ProfileView } from './views/ProfileView';
import { StorageService } from './services/storage';
import { UserProfile } from './types';

export const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(() => StorageService.getCurrentUser());
  const [theme, setTheme] = useState<'dark' | 'light'>(() => StorageService.getTheme());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    StorageService.setTheme(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    StorageService.setTheme(nextTheme);
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    StorageService.logout();
    setUser(null);
  };

  return (
    <HashRouter>
      <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        theme === 'dark' ? 'bg-[#0B0F0E] text-neutral-100' : 'bg-[#F8FAFC] text-black'
      }`}>
        {/* Anti-Slop Top Navigation */}
        <Navbar
          user={user}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
        />

        {/* View Routing */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<DashboardView user={user} onOpenAuth={handleOpenAuth} />} />
            <Route path="/tracks" element={<TracksView />} />
            <Route path="/lesson/:id" element={<WorkspaceView />} />
            <Route path="/commands" element={<CommandLibraryView />} />
            <Route path="/sandbox" element={<SandboxView />} />
            <Route
              path="/profile"
              element={
                <ProfileView
                  user={user}
                  onUpdateUser={(u) => setUser(u)}
                  onOpenAuth={handleOpenAuth}
                  onLogout={handleLogout}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Authentication & Onboarding Modal */}
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={(loggedInUser) => setUser(loggedInUser)}
        />
      </div>
    </HashRouter>
  );
};

export default App;
