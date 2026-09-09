# Block BRANCH_ADMIN Login for Maintenance Module

## Context
SPARTA is a single SSO portal that integrates login for Maintenance, Building, and Energy modules.
For the Maintenance module, there is a business rule: users with the role `BRANCH_ADMIN` should only be able to receive emails. They should not be able to log in to SPARTA or access the Maintenance module dashboard.
However, currently, these users can log in, are prompted to change their default branch password, and can proceed to access the Maintenance module (and subsequently the BMS dashboard).

## Goal
Prevent `BRANCH_ADMIN` users (who only have this role in the Maintenance module and no other valid module accesses) from logging in to SPARTA entirely. If they have other valid module accesses (e.g., Building), they should still be able to log in, but the Maintenance module should not be accessible or visible to them.

## Proposed Design

### 1. Filter Module Access at the Repository Layer
In `apps/api/src/modules/auth/auth.repository.ts`, the `mapUserRecord` function currently maps the user's active module accesses.
We will add a filter to explicitly exclude the `MAINTENANCE` module if the user's role for that module is `BRANCH_ADMIN`.

```typescript
// Inside mapUserRecord
access: user.accesses
  .filter((access) => {
    if (!access.module.isActive) return false;
    
    // Block UI access for BRANCH_ADMIN in maintenance
    if (access.moduleId === "MAINTENANCE" && access.role === "BRANCH_ADMIN") {
      return false;
    }
    
    return true;
  })
  .sort(...)
  .map(...)
```

### 2. Block Login if No Module Access Remains
In `apps/api/src/modules/auth/auth.service.ts`, during the `login` process, after fetching the user but before verifying the password (or prompting for a password change), we will check if the user has any module accesses left after the filtering.

If `user.access.length === 0`, it means the user's only role(s) are email-only roles (like `BRANCH_ADMIN` in Maintenance). We will immediately block the login attempt and throw a 403 Forbidden error.

```typescript
if (user.access.length === 0) {
  throw new AuthError(
    "Role Anda saat ini hanya dikonfigurasi untuk menerima notifikasi email dan tidak memiliki akses ke modul.", 
    403, 
    "NO_UI_ACCESS"
  );
}
```

### 3. Benefits of this Approach
- Blocks the user at the very beginning of the login process, preventing them from being forced into a password change flow that they don't need.
- Provides a clear and explicit error message explaining why they cannot log in.
- Automatically handles edge cases where a user might be a `BRANCH_ADMIN` in Maintenance but a standard `USER` in Building (they will be able to log in to Building, but Maintenance won't appear on their dashboard).

## Security and Verification
- **Testing**: We will run tests against the login endpoint using a user with `BRANCH_ADMIN` role in `MAINTENANCE` to ensure they receive a 403 error.
- **Frontend Handling**: The frontend `login-page.tsx` already handles and displays error messages from `AuthError` gracefully, so no frontend changes are required.
