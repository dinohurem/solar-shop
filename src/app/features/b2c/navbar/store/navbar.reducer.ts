import { createReducer, on } from '@ngrx/store';
import { NavbarActions } from './navbar.actions';
import { NavbarState, initialNavbarState } from './navbar.state';

export const navbarReducer = createReducer(
    initialNavbarState,
    on(NavbarActions.initializeNavbar, (state) => ({
        ...state,
    })),
    on(NavbarActions.toggleMobileMenu, (state) => ({
        ...state,
        isMobileMenuOpen: !state.isMobileMenuOpen,
    })),
    on(NavbarActions.toggleLanguage, (state) => ({
        ...state,
        currentLanguage: (state.currentLanguage === 'en' ? 'hr' : 'en') as 'en' | 'hr',
    }))
); 