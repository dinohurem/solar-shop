export interface NavbarState {
    isMobileMenuOpen: boolean;
    currentLanguage: 'en' | 'hr';
}

const getInitialLanguage = (): 'en' | 'hr' => {
    if (typeof window !== 'undefined' && window.localStorage) {
        const savedLanguage = localStorage.getItem('selectedLanguage');

        if (savedLanguage === 'en' || savedLanguage === 'hr') {
            return savedLanguage;
        }
    }
    return 'hr'; // Default to Croatian
};

export const initialNavbarState: NavbarState = {
    isMobileMenuOpen: false,
    currentLanguage: getInitialLanguage(),
}; 