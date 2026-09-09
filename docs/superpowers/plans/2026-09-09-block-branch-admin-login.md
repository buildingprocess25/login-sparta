# Block BRANCH_ADMIN Login for Maintenance Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Block users from logging in if their only role is `BRANCH_ADMIN` in the Maintenance module, or hide the Maintenance module from their dashboard if they have other valid module accesses.

**Architecture:** Filter the `user.accesses` mapped from the Prisma query in `auth.repository.ts` to exclude `MAINTENANCE` if the `role` is `BRANCH_ADMIN`. In `auth.service.ts`, before proceeding with login and password checks, throw a 403 `AuthError` if the user's access list is empty.

**Tech Stack:** TypeScript, Node.js, Prisma

## Global Constraints

- Avoid breaking existing login behavior for normal `USER` and `SYSTEM_ADMIN` roles.
- Ensure the error code returned is 403 when blocked, so the frontend correctly renders the error.

---

### Task 1: Update Auth Repository

**Files:**
- Modify: `D:\MAGANG-ALFA\login-sparta\apps\api\src\modules\auth\auth.repository.ts`

**Interfaces:**
- Consumes: Prisma `UserModuleAccess` data including the `role` field.
- Produces: Updated `AuthUserRecord` with filtered `access` array.

- [ ] **Step 1: Modify `mapUserRecord` function**

Update the mapping logic to filter out `MAINTENANCE` module accesses for the `BRANCH_ADMIN` role.

```typescript
// Replace lines in D:\MAGANG-ALFA\login-sparta\apps\api\src\modules\auth\auth.repository.ts
function mapUserRecord(user: PrismaAuthUser): AuthUserRecord {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    branchName: user.branch.name,
    validBranchNames: user.validBranchNames,
    passwordHash: user.passwordHash,
    passwordState: user.passwordState,
    role: user.role,
    status: user.status,
    failedLoginCount: user.failedLoginCount,
    lockedUntil: user.lockedUntil,
    lastLoginAt: user.lastLoginAt,
    access: user.accesses
      .filter((access) => {
        if (!access.module.isActive) return false;
        if (access.moduleId === "MAINTENANCE" && access.role === "BRANCH_ADMIN") {
          return false;
        }
        return true;
      })
      .sort((left, right) => left.module.sortOrder - right.module.sortOrder)
      .map((access) => moduleIdMap[access.moduleId]),
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/api/src/modules/auth/auth.repository.ts
git commit -m "feat(auth): exclude maintenance module for branch_admin in user mapping"
```

---

### Task 2: Block Login in Auth Service

**Files:**
- Modify: `D:\MAGANG-ALFA\login-sparta\apps\api\src\modules\auth\auth.service.ts`

**Interfaces:**
- Consumes: Updated `AuthUserRecord` from Task 1.
- Produces: `AuthError` on empty access list.

- [ ] **Step 1: Modify `login` function**

Check for empty access right after checking `isUserLocked` and before checking the password.

```typescript
// Add this check inside the login method in D:\MAGANG-ALFA\login-sparta\apps\api\src\modules\auth\auth.service.ts
    if (isUserLocked(user, now)) {
      throw new AuthError("Akun SPARTA sedang dikunci.", 403, "USER_LOCKED")
    }

    if (user.access.length === 0) {
      throw new AuthError(
        "Role Anda saat ini hanya dikonfigurasi untuk menerima notifikasi email dan tidak memiliki akses ke modul.", 
        403, 
        "NO_UI_ACCESS"
      )
    }

    const isPasswordValid = await this.verifyPassword(user, input.password)
```

- [ ] **Step 2: Commit**

```bash
git add apps/api/src/modules/auth/auth.service.ts
git commit -m "feat(auth): block login if user has no ui module access"
```

---

### Task 3: Verify Fix (Manual Testing)

**Files:**
- Execute script to verify behavior.

- [ ] **Step 1: Test with script**
Run a local test script or start the dev server to test the login with a known `BRANCH_ADMIN` account (`rexzy71@gmail.com`). Verify that a 403 is thrown.
