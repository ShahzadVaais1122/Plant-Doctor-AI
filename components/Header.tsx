import React from 'react';
import { LeafIcon } from './icons/LeafIcon';

interface HeaderProps {
    language: 'en' | 'ur';
    onLanguageChange: (lang: 'en' | 'ur') => void;
}

const LanguageButton: React.FC<{
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
            isActive
                ? 'bg-brand-green text-white shadow'
                : 'text-brand-gray hover:bg-brand-green-light'
        }`}
    >
        {children}
    </button>
);


const Header: React.FC<HeaderProps> = ({ language, onLanguageChange }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
            <LeafIcon className="h-8 w-8 text-brand-green" />
            <h1 className="ml-3 text-2xl font-bold text-brand-gray-dark tracking-tight">
              Plant Doctor AI
            </h1>
        </div>
        <div className="flex items-center space-x-2 bg-brand-gray-light p-1 rounded-full">
            <LanguageButton onClick={() => onLanguageChange('en')} isActive={language === 'en'}>
                English
            </LanguageButton>
            <LanguageButton onClick={() => onLanguageChange('ur')} isActive={language === 'ur'}>
                اردو
            </LanguageButton>
        </div>
      </div>
    </header>
  );
};

export default Header;
