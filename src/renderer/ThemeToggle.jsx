import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = ({ variant = 'default' }) => {
  const { theme, toggleTheme, setSystemTheme } = useTheme();

  return (
    <div className={`theme-toggle-container ${variant}`}>
      <button 
        className="theme-toggle-btn"
        onClick={toggleTheme}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
       {theme === 'light' ? (
  <Moon size={44} strokeWidth={1.5} />
) : (
  <Sun size={44} strokeWidth={1.5} />
)}

      </button>
      
      {variant === 'extended' && (
        <button 
          className="theme-system-btn"
          onClick={setSystemTheme}
          title="Use system theme"
          aria-label="Use system theme"
        >
         <Monitor size={28} strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
};

export default ThemeToggle;