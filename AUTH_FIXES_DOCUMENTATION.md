# 🔧 Auth System - Bug Fixes & Best Practices

## 📋 Summary of Issues Fixed

### ❌ **Issue #1: Social Connections Not Appearing**
**Root Cause**: Missing `signInGoogleButton={true}` prop

**Solution Applied**:
- ✅ Added explicit `signInGoogleButton={true}` to `SignInForm` and `SignUpForm`
- ✅ Improved logic in `AuthLayout` to explicitly check `signInGoogleButton === true`
- Already correct in: `ResetPasswordForm`, `ForgotPasswordForm`, `VerifyEmailForm`

**Files Updated**:
- `components/ui/core/feauture/auth/sign-in-form.tsx`
- `components/ui/core/feauture/auth/sign-up-form.tsx`
- `components/ui/core/layout/auth-layout.tsx`

---

### ❌ **Issue #2: Maximum Call Stack Size Exceeded**
**Root Cause**: Infinite recursion in focus handler

```typescript
// ❌ BEFORE (INFINITE LOOP):
const handleFocus = (e: any) => {
  setIsFocused(true);
  onFocus?.(e);
  toggleKeyboard(); // ← This calls ref.current?.focus()
};

const toggleKeyboard = () => {
  if (!Keyboard.isVisible()) {
    ref.current?.focus(); // ← This triggers onFocus again!
  }
};
// Result: handleFocus → toggleKeyboard → ref.focus() → onFocus → toggleKeyboard → ... ♻️ INFINITE LOOP
```

**The Problem Chain**:
1. User presses TextInput → `onFocus` triggered
2. `handleFocus` calls `toggleKeyboard()`
3. `toggleKeyboard()` calls `ref.current?.focus()`
4. `.focus()` triggers `onFocus` again
5. Loop repeats until stack overflows

**Solution Applied** in `components/ui/fragments/custom-ui/form/input-form.tsx`:

```typescript
// ✅ AFTER (FIXED):
const handleFocus = useCallback(
  (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
    // ❌ REMOVED: toggleKeyboard() - prevents infinite loop
    // Focus is already happening via TextInput component
  },
  [onFocus]
);

const handlePressablePress = useCallback(() => {
  if (disabled) return;
  if (Keyboard.isVisible()) {
    Keyboard.dismiss();
  } else {
    // Add delay to prevent re-triggering focus handlers
    setTimeout(() => {
      if (ref && 'current' in ref && ref.current) {
        ref.current.focus();
      }
    }, 100);
  }
}, [ref, disabled]);
```

---

## 🎯 Best Practices Implemented

### 1. **Memory Management - useCallback**
```typescript
// ✅ Prevents unnecessary re-renders and infinite loops
const handleFocus = useCallback((e: any) => {
  setIsFocused(true);
  onFocus?.(e);
}, [onFocus]);
```

**Why**: Without `useCallback`, every render creates a new function reference, causing re-renders and potentially triggering handlers multiple times.

---

### 2. **Performance - useMemo**
```typescript
// ✅ BEFORE: Recalculated every render
const currentTheme = colorScheme ?? 'light';
const primary = '#03a1fc';
const mutedForeground = THEME[currentTheme].mutedForeground;

// ✅ AFTER: Only recalculated when colorScheme changes
const themeColors = useMemo(() => {
  const currentTheme = colorScheme ?? 'light';
  return {
    primary: '#03a1fc',
    mutedForeground: THEME[currentTheme].mutedForeground,
    destructive: THEME[currentTheme].destructive,
    background: THEME[currentTheme].card,
  };
}, [colorScheme]);
```

**Why**: Prevents expensive color calculations on every render, improving performance.

---

### 3. **Animated Styles Dependencies**
```typescript
// ✅ Proper dependency array in useAnimatedStyle
const animatedLabelStyle = useAnimatedStyle(() => {
  // Animation logic
}, [error, themeColors.destructive, themeColors.mutedForeground, themeColors.primary]);
```

**Why**: Ensures animations update only when necessary dependencies change, preventing stale closures.

---

### 4. **Keyboard Interaction Safety**
```typescript
// ✅ Add delay to prevent rapid focus/blur cycles
setTimeout(() => {
  ref.current?.focus();
}, 100);
```

**Why**: Gives React Native time to process keyboard state changes, preventing race conditions.

---

### 5. **Explicit Boolean Checks**
```typescript
// ✅ Instead of:
{signInGoogleButton && (...)}

// ✅ Use:
{signInGoogleButton === true && (...)}
```

**Why**: More explicit, prevents falsy value bugs (0, '', null acting like false).

---

## 🧪 Testing Checklist

After applying these fixes, test the following:

- [ ] **Sign In Form**
  - [ ] Tap email input → keyboard appears
  - [ ] Tab to password → no crash
  - [ ] Click show/hide password → works smoothly
  - [ ] Social buttons appear (Google, Apple, GitHub)
  - [ ] Link to Sign Up appears at bottom

- [ ] **Sign Up Form**
  - [ ] Email input accepts text
  - [ ] Password input shows/hides correctly
  - [ ] Social buttons visible
  - [ ] Link to Sign In appears

- [ ] **Forgot Password Form**
  - [ ] Email input works
  - [ ] Submit button responds
  - [ ] **NO social buttons** (correct - signInGoogleButton={false})

- [ ] **Reset Password Form**
  - [ ] Password and code inputs work
  - [ ] **NO social buttons** (correct - signInGoogleButton={false})

- [ ] **Verify Email Form**
  - [ ] OTP input works (auto-focus on mount)
  - [ ] **NO social buttons** (correct - signInGoogleButton={false})
  - [ ] Resend button has countdown

- [ ] **Performance**
  - [ ] No console errors
  - [ ] No "Maximum call stack size exceeded" errors
  - [ ] Smooth animations when keyboard appears/disappears
  - [ ] No lag when typing

---

## 📚 Key React Native + Reanimated Patterns

### Pattern 1: Safe Ref Access
```typescript
// ✅ Correct
if (ref && 'current' in ref && ref.current) {
  ref.current.focus();
}

// ❌ Unsafe
ref.current?.focus(); // During focus handler - infinite loop!
```

---

### Pattern 2: Animated Keyboard Tracking
```typescript
const keyboard = useAnimatedKeyboard();

const animatedButtonStyle = useAnimatedStyle(() => {
  return {
    bottom: keyboard.height.value > 0
      ? keyboard.height.value + smallPadding
      : largerPadding,
  };
}, [smallPadding, largerPadding]);
```

---

### Pattern 3: Floating Label Animation
```typescript
const shouldFloat = isFocused || (value && value.length > 0);

useEffect(() => {
  animationProgress.value = withSpring(shouldFloat ? 1 : 0, {
    damping: 20,
    stiffness: 300,
    mass: 0.5,
  });
}, [shouldFloat]); // Only when focus state or value changes
```

---

## 🚀 Next Steps for Further Optimization

1. **Add Error Boundary**
   ```typescript
   <ErrorBoundary>
     <AuthLayout {...props}>
       {children}
     </AuthLayout>
   </ErrorBoundary>
   ```

2. **Add Input Debouncing** (if handling expensive validations)
   ```typescript
   const debouncedValidation = useCallback(
     debounce((value) => validateEmail(value), 300),
     []
   );
   ```

3. **Memoize Form Components**
   ```typescript
   export const SignInForm = React.memo(function SignInForm() {
     // ...
   });
   ```

4. **Add Loading States Monitoring**
   ```typescript
   useEffect(() => {
     console.log('Loading state:', isSubmitting);
   }, [isSubmitting]);
   ```

---

## 🔍 Common Pitfalls to Avoid

| ❌ Bad | ✅ Good | Reason |
|--------|--------|--------|
| Calling focus inside focus handler | Separate Pressable handler | Prevents infinite loops |
| Inline function in dependencies | useCallback for callbacks | Prevents re-renders |
| Creating objects every render | useMemo for objects | Improves performance |
| Keyboard.dismiss without delay | Add setTimeout | Prevents race conditions |
| Falsy value checks | Explicit === true/false | Prevents type coercion bugs |

---

## 📞 Support References

- [React Native Reanimated Docs](https://docs.swmansion.com/react-native-reanimated/)
- [React useCallback Hook](https://react.dev/reference/react/useCallback)
- [React useMemo Hook](https://react.dev/reference/react/useMemo)
- [Clerk Auth Documentation](https://clerk.com/)

---

**Last Updated**: April 6, 2026
**Auth System Version**: 1.0 (Fixed)
