# Onboarding & Dashboard Fixes

## Issues Fixed

### 1. Missing Radio Group Component
**Problem**: `@/components/ui/radio-group` component didn't exist
**Solution**: Created the component at `src/components/ui/radio-group.tsx`

### 2. Missing Radix UI Dependencies
**Problem**: Required Radix UI packages were not installed
**Solution**: Installed the following packages:
```bash
npm install @radix-ui/react-radio-group @radix-ui/react-slider @radix-ui/react-switch
```

### 3. Convex API Import Path
**Problem**: TypeScript couldn't resolve `@/convex/_generated/api`
**Solution**: Updated `tsconfig.json` to include:
```json
"paths": {
  "@/*": ["./src/*"],
  "@/convex/*": ["./convex/*"]
}
```

### 4. Wrong Convex Function Name
**Problem**: Onboarding was calling `createOrUpdateUserProfile` but function is `createOrUpdateProfile`
**Solution**: Already correctly using `api.userProfiles.createOrUpdateProfile` on line 26

## How to Access Features

### Step 1: Start Convex (REQUIRED - Keep this running)
```bash
cd aigymtrainer
npx convex dev
```

### Step 2: Start Next.js (in a separate terminal)
```bash
cd aigymtrainer  
npm run dev
```

### Step 3: Access the App
1. Open browser: http://localhost:3000
2. Sign in with your account
3. Go to onboarding: http://localhost:3000/onboarding
4. Complete all 8 steps:
   - Welcome
   - Basic Info (age, gender, height, weight)
   - Fitness Goals
   - Medical Info
   - Diet Preferences
   - Mental Health
   - Equipment & Schedule
   - Budget
   - Final Preferences

5. After completing onboarding, you'll be redirected to: http://localhost:3000/dashboard

### Step 4: View Dashboard Features
On the dashboard, you'll see tabs for:
- ✅ Overview - Profile summary and stats
- ✅ Fitness Progress - Track your workout progress
- ✅ Diet - Manage your nutrition
- ✅ Mental Health - Track mental wellness
- ✅ Schedule - View workout schedule
- ✅ Achievements - See your earned badges

## Important Notes

1. **Convex MUST be running** - Without it, the app won't be able to fetch/save data
2. **Complete onboarding first** - Dashboard features only show after onboarding is complete
3. **Clear cache if issues persist**:
   ```bash
   Remove-Item -Recurse -Force .next
   npm run dev
   ```

## Files Modified

1. `src/components/ui/radio-group.tsx` - Created
2. `tsconfig.json` - Updated paths mapping
3. `package.json` - Added Radix UI dependencies
4. `src/app/onboarding/page.tsx` - Already using correct function name

## Verification Checklist

- [ ] Convex is running (`npx convex dev`)
- [ ] Next.js is running (`npm run dev`)
- [ ] No TypeScript errors in terminal
- [ ] Can access http://localhost:3000
- [ ] Can sign in successfully
- [ ] Can access http://localhost:3000/onboarding
- [ ] Can complete all onboarding steps
- [ ] Can access http://localhost:3000/dashboard
- [ ] Dashboard shows all tabs and features

---

**Date**: October 1, 2025
**Status**: ✅ Fixed - Ready for Testing
