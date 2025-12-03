# Changelog - PR #207: Dashboard UI Overhaul

**PR**: [#207](https://github.com/databuddy-analytics/Databuddy/pull/207)  
**Title**: Redesign the dashboard entirely  
**Merged**: December 2, 2025  
**Commits**: 181  
**Files Changed**: 354  
**Additions**: +24,892 | **Deletions**: -23,838

---

## 🎨 Dashboard & UI

### New Components
- **RightSidebar**: Reusable right-hand sidebar component with sections, info cards, docs links, and tips
- **ChartTooltip**: Unified tooltip component for charts with consistent styling
- **DeleteDialog**: Reusable confirmation dialog for deletion actions with optional text input for confirmation
- **LineSlider**: Slider component for selecting values along a line
- **SegmentedControl**: Segmented control component for selecting options
- **KeyboardShortcuts**: Component to display keyboard shortcuts for better accessibility
- **TableEmptyState**: Standardized empty state for tables
- **EmptyState**: Reusable empty state component with customizable icon, title, description, and action button
- **PageHeader**: Reusable component for displaying page titles, descriptions, and optional action buttons
- **ChartContainer** & **ChartTooltip**: Consistent chart rendering components

### UI Refresh
- Extensive styling updates across all `components/ui/*` components:
  - Badges, buttons, tables, sheets, dialogs, tooltips, inputs, tabs
  - Improved hover states and focus rings
  - Better mobile responsiveness
  - Consistent rounded corners (`rounded` instead of `rounded-xl` or `rounded-md`)
  - Updated color schemes and CSS variables
- Refreshed global styles in `globals.css` with new CSS variables for colors, font sizes, and component styles
- Updated authentication pages (login, register, forgot password, magic link) with modern styling
- Improved organization settings pages with better layouts and consistent spacing

### Dashboard Pages
- **Billing Pages**: Refactored billing overview, cost breakdown, and history pages
  - Replaced custom empty states with `EmptyState` component
  - Refactored sidebars to use `RightSidebar` component
  - Updated usage tables with better styling
  - Improved invoice display and status badges
- **Organization Pages**: Complete redesign of organization management
  - Members list with improved role badges
  - Invitations view with better status indicators
  - API keys UI overhaul with scope display and better detail views
  - Website settings with improved layout
  - Danger zone with confirmation dialogs
- **Settings Pages**: New comprehensive settings structure
  - **Account Settings**: Profile photo, basic information, security (2FA, password), connected identities
  - **Appearance Settings**: Theme selection (light/dark/system), chart preferences with preview
  - **Placeholder Pages**: Analytics, Notifications, Privacy, Features, Integrations (coming soon)
  - **Two-Factor Authentication**: Complete 2FA setup and management dialog with QR codes and backup codes

---

## 🔍 Analytics & Queries

### Filter Improvements
- **New Filter Operators**: 
  - `contains`, `not_contains`, `starts_with`, `in`, `not_in`
  - Removed old operators: `like`, `ilike`, `notLike`, `gt`, `gte`, `lt`, `lte`, `isNull`, `isNotNull`
- **Query String Support**: Added `query_string` to common filters and allowed filters for page-related queries
- **Saved Filters**: Complete saved filters system
  - Add, save/rename, apply, duplicate, and manage saved query filters
  - New components: `AddFilters`, `FiltersSection`, `SaveFilterDialog`, `SavedFiltersMenu`
  - Filter hooks: `useFilters`, `useSavedFilters`
- **LIKE Pattern Escaping**: Proper escaping of special characters in LIKE patterns
- **GLOBAL_ALLOWED_FILTERS**: Certain filters now allowed globally regardless of query builder configuration

### Query Architecture Migration
- **Span-Based Tables**: Migrated vitals, errors, and custom events to span-based tables
  - `error_spans`, `web_vitals_spans`, `custom_event_spans`
  - Better support for aggregations with quantile functions
  - Hourly aggregate tables: `error_hourly`, `web_vitals_hourly`, `custom_events_hourly`
- **New Query Builders**:
  - `VitalsBuilders`: `vitals_overview`, `vitals_time_series`, `vitals_by_page`
  - `custom_events_by_path`: Counts custom events by path
  - `custom_events_trends`: Daily trends of custom events
  - `errors_by_type`: Counts errors by type
- **Updated Query Builders**:
  - Error queries migrated to `error_spans` table
  - Vitals queries migrated to `web_vitals_spans` table with EAV format
  - Custom events queries migrated to `custom_event_spans` table
  - All queries now join with `analytics.events` for context (browser, OS, country, region)
- **Aggregate Functions**: 
  - Added `quantile`, `quantileIf`, `minIf`, `maxIf` to aggregate builder
  - Used for richer metric aggregations (p50, p75, p90, p95, p99)

### Analytics Processing
- Simplified funnel/goal analytics processing
- Improved referrer grouping
- Support for `ignoreHistoricData` flag
- Better referrer attribution logic

---

## 🌐 Websites & Billing

### Active Users
- Added `activeUsers` field to website schema and type
- Active users per website now returned alongside mini-chart data
- Improved billing usage aggregation

### Billing Improvements
- Better usage breakdown table with badge display for overage costs
- Improved consumption chart with date range picker and view modes
- Enhanced usage row display with bonus badges

---

## 📤 Exports

- Date range validation for exports
- Improved proto/CSV formatting
- Centralized data fetch logic
- Better error handling and validation

---

## 📦 SDK & Tracker

### SDK Updates
- **Version Bump**: SDK bumped to `2.3.0`
- Refined script injection (excludes server-only props)
- Updated README with better documentation

### Tracker Improvements
- **Error Filtering**: 
  - Skip localhost errors unless in debug mode
  - Better error filtering (ignores browser extensions and generic "Script error.")
  - Improved error batching
- **Performance**:
  - Improved batching/beacon usage
  - Better FPS capture for vitals
  - Vitals FPS batching and processing

---

## 🔐 Authentication & Security

### Two-Factor Authentication
- Complete 2FA setup and management
- Multi-step dialog flow:
  1. Set password (for OAuth users)
  2. Enter current password
  3. Scan QR code
  4. Verify TOTP
  5. Save backup codes
  6. Manage 2FA (disable, regenerate backup codes)
- Uses `QRCodeSVG` for QR code generation
- `InputOTP` component for code input
- Database schema updated with `twoFactorEnabled`, `twoFactorSecret`, `twoFactorBackupCodes`

### Account Management
- **Password Management**: Change password functionality with validation
- **OAuth Users**: Ability to set password for OAuth-only accounts before enabling 2FA
- **Connected Identities**: Display and manage linked social accounts (link/unlink)
- **Profile Updates**: Improved profile form with unsaved changes tracking

### Session Management
- Removed `AuthGuard` from main layout (handled elsewhere)
- Simplified session fetching logic

---

## 🧪 Testing & Types

### E2E Tests
- Updated tests for batching, SPA navigation, sampling/filters
- Improved test coverage for new filter operators

### Type Updates
- Updated `DynamicQueryFilter` type for new operators
- Added `activeUsers` to `Website` type
- Updated validation schemas for new span-based event types
- Refined shared types and filter lists

---

## 📚 Documentation

- Added Bento section to docs
- Multiple copy/style tweaks
- Improved documentation structure

---

## 🛠️ Infrastructure & Backend

### API Changes
- Updated `getAccessibleWebsites` logic for API key access
- Modified `getTimeUnit` to throw error if hourly granularity exceeds `MAX_HOURLY_DAYS`
- Adjusted `parseParam` for dynamic query parameters
- Updated `/types` endpoint to include `allowedFilters` from `filterOptions`
- Modified `/compile` and `/` (execute) endpoints to use `website_id` and `timezone` from query parameters

### Database Schema
- Updated analytics table mappings to use new span-based and hourly aggregate tables
- Removed old `errors`, `web_vitals`, `stripe_*` tables
- Added 2FA fields to user schema

### ClickHouse
- Updated backup metadata to escape LIKE special characters
- Added `s3_use_virtual_addressing = false` to backup/restore queries
- Improved query performance with span-based tables

### RPC Updates
- Updated API keys procedures to include `scopes` in responses
- Added `twoFactor` procedures: `enable`, `verifyTotp`, `generateBackupCodes`, `disable`
- Added `changePassword` procedure
- Updated websites procedures to include `activeUsers`

---

## 🎯 Key Improvements

### User Experience
- **Keyboard Navigation**: Full keyboard support with visible focus rings
- **Mobile Responsiveness**: Better mobile layouts and touch targets
- **Optimistic UI**: Improved loading states and feedback
- **Accessibility**: Better ARIA labels, semantic HTML, and screen reader support

### Performance
- More efficient queries with span-based tables
- Better batching in tracker
- Reduced re-renders with improved state management
- Optimized chart rendering

### Developer Experience
- Reusable components reduce code duplication
- Better type safety with updated TypeScript types
- Centralized filter management
- Improved code organization

---

## 🐛 Bug Fixes

- Fixed conflicting records in database
- Fixed layout shift on refresh
- Fixed skeleton loading issues
- Fixed export escaping
- Fixed keyboard font styling
- Fixed 1px misalignment issues
- Fixed type errors
- Fixed organization slider
- Fixed website settings page
- Fixed transfer website dialog
- Removed duplicate `setPasswordForOAuthUser` function

---

## 🗑️ Removals & Deprecations

- Removed `WARP.md` file
- Removed `@elysiajs/cron` dependency
- Removed `connection_type` query builder (replaced with device types)
- Deprecated performance page (functionality moved to vitals page)
- Removed old settings components (refactored into new structure):
  - `account-deletion.tsx`, `email-form.tsx`, `password-form.tsx`, `profile-form.tsx`
  - `sessions-form.tsx`, `settings-sidebar.tsx`, `timezone-preferences.tsx`, `two-factor-form.tsx`
- Removed old filter components (replaced with new filter system):
  - `delete-all-dialog.tsx`, `delete-filter-dialog.tsx`, `filters-section.tsx`, `add-filters.tsx`

---

## 📊 Statistics

- **Total Changes**: 354 files changed
- **Code Added**: +24,892 lines
- **Code Removed**: -23,838 lines
- **Net Change**: +1,054 lines
- **Commits**: 181 commits
- **Review Comments**: 120 review comments

---

## 🙏 Contributors

- **@izadoesdev** - Primary developer
- **@ameer2468** - Collaborator

---

## 🔗 Related

- [PR #207](https://github.com/databuddy-analytics/Databuddy/pull/207)
- [Commit: 949003d2e8004eed8b06dcff38309d3ce58b446a](https://github.com/databuddy-analytics/Databuddy/commit/949003d2e8004eed8b06dcff38309d3ce58b446a)

