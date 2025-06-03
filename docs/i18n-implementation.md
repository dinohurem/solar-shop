# Internationalization (i18n) Implementation

## Overview
This project implements a custom internationalization system supporting Croatian (hr) and English (en) languages.

## Features
- **Default Language**: Croatian (hr)
- **Supported Languages**: Croatian (hr) and English (en)
- **Language Persistence**: Selected language is stored in localStorage
- **Real-time Switching**: Content changes immediately when language is toggled
- **Form Validation**: Error messages are translated

## Components

### 1. TranslationService (`src/app/shared/services/translation.service.ts`)
Main service that handles all translation logic:
- Manages current language state
- Stores all translations in memory
- Provides translation methods
- Persists language preference in localStorage

### 2. TranslatePipe (`src/app/shared/pipes/translate.pipe.ts`)
Angular pipe for use in templates:
```html
{{ 'auth.welcome' | translate }}
{{ 'auth.passwordMinLength' | translate: {field: 'Password', length: 6} }}
```

### 3. Navbar Integration
The navbar component synchronizes with the translation service to:
- Display the correct language flag and text
- Toggle between Croatian and English
- Update all navigation labels

## Usage

### In Templates
```html
<!-- Simple translation -->
<h1>{{ 'auth.welcome' | translate }}</h1>

<!-- Translation with parameters -->
<p>{{ 'auth.passwordMinLength' | translate: {field: 'Password', length: 6} }}</p>
```

### In Components
```typescript
import { TranslationService } from '../path/to/translation.service';

constructor(private translationService: TranslationService) {}

// Get translation
const message = this.translationService.translate('auth.welcome');

// Get translation with parameters
const error = this.translationService.translate('auth.required', { field: 'Email' });

// Change language
this.translationService.setLanguage('hr'); // or 'en'
```

## Translation Keys Structure

### Navigation (`nav.*`)
- `nav.products` - Products menu item
- `nav.offers` - Offers menu item
- `nav.sustainability` - Sustainability menu item
- `nav.blog` - Blog menu item
- `nav.company` - Company menu item
- `nav.contact` - Contact menu item

### Authentication (`auth.*`)
- `auth.welcome` - Welcome message
- `auth.signIn` - Sign in text
- `auth.email` - Email field label
- `auth.password` - Password field label
- `auth.signInButton` - Sign in button text
- `auth.forgotPassword` - Forgot password link
- `auth.required` - Required field error (with {field} parameter)
- `auth.invalidEmail` - Invalid email error
- `auth.passwordMinLength` - Password length error (with {field} and {length} parameters)

### Profile (`profile.*`)
- `profile.profile` - Profile menu item
- `profile.adminDashboard` - Admin dashboard menu item
- `profile.signOut` - Sign out button

### Common (`common.*`)
- `common.loading` - Loading text
- `common.save` - Save button
- `common.cancel` - Cancel button
- Various other common UI elements

### Contact (`contact.*`)
- `contact.phone` - Phone number
- `contact.email` - Email address

### Language (`language.*`)
- `language.current` - Current language display name

## Language Files Location
All translations are stored in `TranslationService` under the `translations` object:
- `translations.hr` - Croatian translations
- `translations.en` - English translations

## Default Behavior
1. **Default Language**: Croatian (hr)
2. **Language Detection**: Checks localStorage for saved preference
3. **Fallback**: If no saved preference, defaults to Croatian
4. **State Sync**: Navbar state and translation service stay synchronized

## Adding New Translations

### 1. Add to TranslationService
```typescript
// In translations.hr
newSection: {
  newKey: 'Croatian Text'
}

// In translations.en  
newSection: {
  newKey: 'English Text'
}
```

### 2. Use in Templates
```html
{{ 'newSection.newKey' | translate }}
```

### 3. Use in Components
```typescript
const text = this.translationService.translate('newSection.newKey');
```

## Language Switching Flow
1. User clicks language selector in navbar
2. Navbar dispatches `toggleLanguage()` action
3. Navbar state updates (hr ↔ en)
4. Navbar component calls `translationService.setLanguage()`
5. TranslationService updates current language
6. TranslationService saves preference to localStorage
7. All components using TranslatePipe automatically update

## Files Modified for i18n
- `src/app/shared/services/translation.service.ts` (new)
- `src/app/shared/pipes/translate.pipe.ts` (new)
- `src/app/features/b2c/navbar/navbar.component.ts`
- `src/app/features/b2c/navbar/store/navbar.state.ts`
- `src/app/features/b2c/navbar/store/navbar.reducer.ts`
- `src/app/core/auth/components/login/login.component.ts`
- `src/app/core/auth/components/login/login.component.html`
- `src/app/core/auth/services/auth.service.ts`
- `src/app/core/auth/store/auth.effects.ts` 