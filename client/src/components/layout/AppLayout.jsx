import { useState, useEffect } from 'react';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import Navbar from '../layout/Navbar';
import CommandPalette from '../command/CommandPalette';

const AppLayout = ({ children }) => {
  const [commandOpen, setCommandOpen] = useState(false);

  // Cmd+K to open command palette
  useKeyboardShortcut('k', () => setCommandOpen(true), { meta: true });

  return (
    <div className="min-h-screen bg-white transition-colors duration-200">
      <Navbar onCommandOpen={() => setCommandOpen(true)} />
      <main className="min-h-[calc(100vh-64px)]">
        {children}
      </main>
      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  );
};

export default AppLayout;
