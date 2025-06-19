# Cart Management Strategy

## Overview

This document outlines the comprehensive cart management strategy implemented in the Solar Shop application, addressing guest users, authenticated users, and seamless transitions between the two states.

## Architecture

### Storage Strategy

The cart system uses a hybrid approach:

1. **Guest Users**: Cart data stored in `localStorage`
2. **Authenticated Users**: Cart data stored in Supabase database
3. **NgRx Store**: Always maintains the current cart state for UI reactivity

### Key Components

- `CartService`: Core service handling cart operations and storage logic
- `CartEffects`: NgRx effects for handling cart actions and authentication state changes
- `CartReducer`: State management for cart UI and data
- `SupabaseService`: Database operations for authenticated users

## Cart Lifecycle

### 1. Guest User Experience

**Initial Load:**
- Cart service checks authentication status
- If not authenticated, loads cart from `localStorage`
- If no cart exists, starts with empty cart

**Adding Items:**
- Items added to NgRx store and `localStorage`
- No database operations performed

**Page Reload:**
- Cart service loads from `localStorage`
- No duplication occurs as data is loaded once

### 2. Authenticated User Experience

**Initial Load:**
- Cart service checks authentication status
- If authenticated, loads cart from Supabase database
- Converts database format to local cart format

**Adding Items:**
- Items added to NgRx store
- Items synced to Supabase database in real-time
- No `localStorage` operations

**Page Reload:**
- Cart service loads from Supabase database
- No duplication occurs as data is loaded once

### 3. Guest to Authenticated User Transition

**Login Process:**
1. User logs in successfully
2. `AuthEffects` dispatches `loginSuccess` action
3. `CartEffects` catches `loginSuccess` and dispatches `syncCartOnLogin`
4. `CartService` handles the migration:
   - Retrieves guest cart from `localStorage`
   - Migrates items to Supabase database
   - Merges with existing user cart (if any)
   - Clears `localStorage`
   - Loads merged cart from Supabase

**Migration Logic:**
```typescript
// For each guest cart item:
if (item exists in user's Supabase cart) {
    // Add quantities together
    updateQuantity(existingQuantity + guestQuantity)
} else {
    // Add new item to Supabase
    addNewItem(guestItem)
}
```

### 4. Authenticated to Guest User Transition

**Logout Process:**
1. User logs out
2. `AuthEffects` dispatches `logoutSuccess` action
3. `CartEffects` catches `logoutSuccess` and dispatches `syncCartOnLogout`
4. `CartService` clears current cart and `localStorage`
5. User starts fresh as guest

## Database Strategy

### When to Save to Database

**For Authenticated Users:**
- **Real-time sync**: Every cart operation (add, update, remove) immediately syncs to Supabase
- **No batch operations**: Each change is persisted individually to ensure data consistency
- **Optimistic updates**: UI updates immediately, database sync happens in background

**For Guest Users:**
- **No database operations**: All data stays in `localStorage`
- **Migration on login**: Guest cart data migrated to database during login process

### Database Schema

The `cart_items` table structure:
```sql
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT, -- For guest users (not used in current implementation)
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Avoiding Duplicates

**On Page Reload:**
- Cart service checks authentication status first
- Loads from appropriate source (localStorage vs Supabase)
- No duplicate loading occurs

**On Login:**
- Guest cart items are merged with existing user cart
- Duplicate products have quantities added together
- Unique products are added as new items

**On Cart Operations:**
- Each operation checks if item exists before adding
- Updates existing items instead of creating duplicates

## Best Practices

### 1. Error Handling

**Network Failures:**
- Cart operations continue to work locally even if Supabase sync fails
- Failed operations are logged but don't break the user experience
- Retry mechanisms can be implemented for critical operations

**Data Corruption:**
- Invalid `localStorage` data is cleared automatically
- Database constraints prevent invalid data
- Fallback to empty cart if data cannot be recovered

### 2. Performance Considerations

**Lazy Loading:**
- Cart data is loaded only when needed
- Product details are fetched on-demand when building cart items

**Optimistic Updates:**
- UI updates immediately for better user experience
- Database sync happens in background
- Error states are handled gracefully

### 3. Security

**Authentication Checks:**
- All database operations verify user authentication
- Guest users cannot access authenticated user data
- Session validation on each operation

**Data Validation:**
- Input validation on all cart operations
- Quantity limits enforced
- Price validation against product data

## Implementation Details

### Cart Service Methods

```typescript
// Core operations
addToCart(productId: string, quantity: number): Observable<Cart>
updateCartItem(itemId: string, quantity: number): Observable<Cart>
removeFromCart(itemId: string): Observable<Cart>
clearCart(): Observable<void>

// Authentication handling
private handleUserLogin(userId: string): Promise<void>
private handleUserLogout(): Promise<void>
private migrateGuestCartToSupabase(guestCart: CartItem[], userId: string): Promise<void>

// Storage operations
private loadCartFromStorage(): void
private saveCartToStorage(items: CartItem[]): void
private loadCartFromSupabase(): Promise<void>
```

### NgRx Actions

```typescript
// Authentication sync
syncCartOnLogin: '[Cart] Sync Cart On Login'
syncCartOnLogout: '[Cart] Sync Cart On Logout'
migrateGuestCart: '[Cart] Migrate Guest Cart'

// Standard operations
loadCart: '[Cart] Load Cart'
addToCart: '[Cart] Add To Cart'
updateCartItem: '[Cart] Update Cart Item'
removeFromCart: '[Cart] Remove From Cart'
clearCart: '[Cart] Clear Cart'
```

## Testing Strategy

### Unit Tests

- Test cart service methods in isolation
- Mock Supabase service for database operations
- Test localStorage operations
- Test authentication state changes

### Integration Tests

- Test guest to authenticated user transition
- Test cart persistence across page reloads
- Test error scenarios and recovery

### E2E Tests

- Test complete user journey from guest to checkout
- Test cart synchronization across browser tabs
- Test network failure scenarios

## Future Enhancements

### 1. Session-Based Guest Carts

- Implement session IDs for guest users
- Store guest carts in database with session IDs
- Enable cart sharing across devices for guests

### 2. Cart Expiration

- Implement automatic cart cleanup for inactive users
- Set expiration dates for guest carts
- Notify users before cart expiration

### 3. Cart Analytics

- Track cart abandonment rates
- Monitor conversion from guest to authenticated users
- Analyze cart migration success rates

### 4. Offline Support

- Implement offline cart operations
- Sync when connection is restored
- Handle conflicts between offline and online data

## Troubleshooting

### Common Issues

1. **Cart not persisting after login**
   - Check authentication state in cart service
   - Verify migration logic is working
   - Check database permissions

2. **Duplicate items in cart**
   - Verify item existence check before adding
   - Check quantity merging logic
   - Review database constraints

3. **Cart not loading on page reload**
   - Check localStorage permissions
   - Verify authentication state detection
   - Review error handling in load methods

### Debug Tools

- Browser dev tools for localStorage inspection
- Supabase dashboard for database inspection
- NgRx dev tools for state inspection
- Console logging for operation tracking 