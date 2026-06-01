# Tasks: Pajak / SPT Tahunan Implementation

## Task 1: Database Migration - Create tax_settings and tax_report_snapshots Tables
**Status:** not_started
**Type:** database
**Depends on:** (none)

Create database migration to add two new tables for tax feature without modifying existing tables.

### Sub-tasks
- [x] Create migration file with tax_settings table (id, user_id, tax_year, ptkp_status, calculation_method, manual_pph21_withheld, manual_commission_tax_withheld, manual_tax_paid, notes, created_at, updated_at)
- [ ] Create migration file with tax_report_snapshots table (id, user_id, tax_year, report_json, created_at, updated_at)
- [ ] Add UNIQUE constraints on (user_id, tax_year) for both tables
- [ ] Add foreign key references to users table with ON DELETE CASCADE
- [ ] Run migration to verify no errors
- [ ] Verify tables created in database

## Task 2: Create Tax Calculation Helper Functions
**Status:** not_started
**Type:** backend
**Depends on:** Task 1

Implement core calculation functions in lib/tax-helpers.ts and lib/tax-calculations.ts.

### Sub-tasks
- [ ] Create lib/tax-calculations.ts with PTKP_VALUES mapping (TK/0-3, K/0-3)
- [ ] Create lib/tax-calculations.ts with TAX_BRACKETS array (5%, 15%, 25%, 30%, 35%)
- [ ] Implement calculatePTKP(ptkpStatus: string): number
- [ ] Implement calculateNetIncome(totalIncome: number, totalExpense: number): number
- [ ] Implement calculatePKP(netIncome: number, ptkp: number): number
- [ ] Implement calculateProgressiveTax(pkp: number): {totalTax, breakdown}
- [ ] Implement calculateUMKMFinalTax(bruto: number): {totalTax, basis}
- [ ] Implement calculateTaxStatus(taxDue: number, taxPaid: number): 'kurang_bayar' | 'lebih_bayar' | 'nihil'
- [ ] Implement calculateTaxDifference(taxDue: number, taxPaid: number): number
- [ ] Write unit tests for all calculation functions

## Task 3: Create Tax Helper Functions for Data Fetching
**Status:** not_started
**Type:** backend
**Depends on:** Task 1

Implement data fetching helper functions in lib/tax-helpers.ts.

### Sub-tasks
- [ ] Implement getTaxYearTransactions(userId: string, year: number): Promise<Transaction[]>
- [ ] Implement getIncomeByCategory(userId: string, year: number): Promise<Map<string, number>>
- [ ] Implement getExpenseByCategory(userId: string, year: number): Promise<Map<string, number>>
- [ ] Implement getAccountBalances(userId: string): Promise<Map<string, number>>
- [ ] Implement getAssetsSummary(userId: string, year: number): Promise<{cars, investments}>
- [ ] Implement getDebtReceivableSummary(userId: string): Promise<{debts, receivables}>
- [ ] Implement calculateTaxSummary(userId, year, ptkpStatus, method, taxPaid): Promise<TaxSummary>
- [ ] Add error handling for database queries
- [ ] Write integration tests for data fetching functions

## Task 4: Create Tax Settings API Endpoint
**Status:** not_started
**Type:** backend
**Depends on:** Task 1, Task 2

Implement POST /api/tax/settings endpoint for saving tax settings.

### Sub-tasks
- [ ] Create app/api/tax/settings/route.ts
- [ ] Implement POST handler to save/update tax_settings
- [ ] Add user authorization check (verify userId from session)
- [ ] Add input validation (year, ptkpStatus, calculationMethod)
- [ ] Add error handling and response formatting
- [ ] Test endpoint with valid and invalid inputs

## Task 5: Create Tax Summary API Endpoint
**Status:** not_started
**Type:** backend
**Depends on:** Task 2, Task 3

Implement GET /api/tax/summary endpoint for fetching tax calculations.

### Sub-tasks
- [ ] Create app/api/tax/summary/route.ts
- [ ] Implement GET handler to fetch tax summary for a year
- [ ] Add user authorization check
- [ ] Add query parameter validation (year)
- [ ] Call calculateTaxSummary helper function
- [ ] Format response with all calculation details
- [ ] Add error handling and caching strategy

## Task 6: Create Tax Report API Endpoint
**Status:** not_started
**Type:** backend
**Depends on:** Task 3, Task 5

Implement GET /api/tax/report endpoint for complete tax report data.

### Sub-tasks
- [ ] Create app/api/tax/report/route.ts
- [ ] Implement GET handler to fetch complete report
- [ ] Include settings, summary, income details, expense details
- [ ] Add user authorization check
- [ ] Format response for PDF generation
- [ ] Add error handling

## Task 7: Create PDF Generation Utility
**Status:** not_started
**Type:** backend
**Depends on:** Task 3

Implement PDF generation in lib/tax-pdf-generator.ts.

### Sub-tasks
- [ ] Create lib/tax-pdf-generator.ts
- [ ] Implement generateTaxPDF(reportData, userName, year): Promise<Buffer>
- [ ] Add dark premium theme styling (#090C12)
- [ ] Include all sections: header, settings, summary, income, expense, breakdown, assets
- [ ] Add disclaimer at bottom
- [ ] Format currency values as Rupiah
- [ ] Test PDF generation with sample data

## Task 8: Create Tax Export PDF API Endpoint
**Status:** not_started
**Type:** backend
**Depends on:** Task 6, Task 7

Implement POST /api/tax/export-pdf endpoint for PDF download.

### Sub-tasks
- [ ] Create app/api/tax/export-pdf/route.ts
- [ ] Implement POST handler to generate and return PDF
- [ ] Add user authorization check
- [ ] Call generateTaxPDF utility
- [ ] Set proper response headers for file download
- [ ] Add error handling
- [ ] Test PDF download functionality

## Task 9: Create Tax Settings Card Component
**Status:** not_started
**Type:** frontend
**Depends on:** Task 4

Implement components/tax-settings-card.tsx component.

### Sub-tasks
- [ ] Create tax-settings-card.tsx component
- [ ] Add year selector dropdown (default to current year)
- [ ] Add PTKP status selector with 8 options
- [ ] Add calculation method toggle (Progressive/UMKM)
- [ ] Implement auto-save to database on change
- [ ] Add loading and error states
- [ ] Style with glass-premium theme
- [ ] Test component rendering and interactions

## Task 10: Create Tax Summary Card Component
**Status:** not_started
**Type:** frontend
**Depends on:** Task 5

Implement components/tax-summary-card.tsx component.

### Sub-tasks
- [ ] Create tax-summary-card.tsx component
- [ ] Display large PPh amount with color coding
- [ ] Display tax status badge (Kurang Bayar/Lebih Bayar/Nihil)
- [ ] Display tax year and PTKP status
- [ ] Add visual indicators for status
- [ ] Style with hero card design
- [ ] Add responsive layout for mobile/desktop
- [ ] Test component with different tax statuses

## Task 11: Create Tax Details Table Component
**Status:** not_started
**Type:** frontend
**Depends on:** Task 5

Implement components/tax-details-table.tsx component.

### Sub-tasks
- [ ] Create tax-details-table.tsx reusable table component
- [ ] Support different table types (summary, income, expense, breakdown)
- [ ] Add column headers and data rows
- [ ] Format currency values as Rupiah
- [ ] Add responsive layout for mobile
- [ ] Style with soft-card theme
- [ ] Test with different data sets

## Task 12: Create Tax Breakdown Component
**Status:** not_started
**Type:** frontend
**Depends on:** Task 5

Implement components/tax-breakdown.tsx component.

### Sub-tasks
- [ ] Create tax-breakdown.tsx component
- [ ] Implement conditional rendering for Progressive method
- [ ] Implement conditional rendering for UMKM Final method
- [ ] Display tax breakdown table with layers/rates
- [ ] Format currency values as Rupiah
- [ ] Add responsive layout
- [ ] Style with soft-card theme
- [ ] Test both calculation methods

## Task 13: Create Tax Page Main Component
**Status:** not_started
**Type:** frontend
**Depends on:** Task 9, Task 10, Task 11, Task 12

Implement app/(app)/tax/page.tsx main page component.

### Sub-tasks
- [ ] Create app/(app)/tax/page.tsx
- [ ] Add page header with title and subtitle
- [ ] Integrate tax-settings-card component
- [ ] Integrate tax-summary-card component
- [ ] Add calculation summary section
- [ ] Add income details section
- [ ] Add expense details section
- [ ] Add tax breakdown section
- [ ] Add assets & liabilities section
- [ ] Add export PDF and copy summary buttons
- [ ] Add disclaimer at bottom
- [ ] Implement data fetching with proper error handling
- [ ] Add loading states
- [ ] Test page rendering and interactions

## Task 14: Add Tax Menu Item to Navigation
**Status:** not_started
**Type:** frontend
**Depends on:** Task 13

Add "Pajak / SPT Tahunan" menu item to navigation.

### Sub-tasks
- [ ] Update components/nav.tsx to add tax menu item
- [ ] Update components/bottom-navigation.tsx to add tax menu item
- [ ] Add appropriate icon for tax menu
- [ ] Test navigation links
- [ ] Verify menu appears on both desktop and mobile

## Task 15: Implement Copy Summary Functionality
**Status:** not_started
**Type:** frontend
**Depends on:** Task 13

Implement copy summary to clipboard functionality.

### Sub-tasks
- [ ] Create utility function to format summary text
- [ ] Implement copy to clipboard functionality
- [ ] Add success toast notification
- [ ] Handle copy errors gracefully
- [ ] Test on different browsers
- [ ] Verify text format is readable

## Task 16: Write Unit Tests for Calculation Functions
**Status:** not_started
**Type:** testing
**Depends on:** Task 2

Write comprehensive unit tests for tax calculation functions.

### Sub-tasks
- [ ] Create lib/__tests__/tax-calculations.test.ts
- [ ] Test calculatePTKP() with all 8 statuses
- [ ] Test calculateProgressiveTax() with various PKP amounts
- [ ] Test calculateUMKMFinalTax() with various bruto amounts
- [ ] Test calculateNetIncome() with positive/negative/zero cases
- [ ] Test calculatePKP() with edge cases
- [ ] Test calculateTaxStatus() with all three statuses
- [ ] Achieve >90% code coverage
- [ ] All tests pass

## Task 17: Write Integration Tests for Data Fetching
**Status:** not_started
**Type:** testing
**Depends on:** Task 3

Write integration tests for data fetching functions.

### Sub-tasks
- [ ] Create lib/__tests__/tax-helpers.integration.test.ts
- [ ] Test getTaxYearTransactions() with correct filtering
- [ ] Test getIncomeByCategory() with correct grouping
- [ ] Test getExpenseByCategory() with correct grouping
- [ ] Test calculateTaxSummary() complete workflow
- [ ] Test with sample data in test database
- [ ] All tests pass

## Task 18: Write Property-Based Tests for Tax Calculations
**Status:** not_started
**Type:** testing
**Depends on:** Task 2

Write property-based tests using fast-check library.

### Sub-tasks
- [ ] Create lib/__tests__/tax-calculations.pbt.test.ts
- [ ] Implement Property 1: PPh Terutang >= 0
- [ ] Implement Property 2: PKP = max(0, NetIncome - PTKP)
- [ ] Implement Property 3: Difference = PPh - TaxPaid
- [ ] Implement Property 4: Total Income = Sum(categories)
- [ ] Implement Property 5: Total Expense = Sum(categories)
- [ ] Run property tests with 100+ iterations
- [ ] All properties pass

## Task 19: Write E2E Tests for Tax Page
**Status:** not_started
**Type:** testing
**Depends on:** Task 13

Write end-to-end tests for tax page functionality.

### Sub-tasks
- [ ] Create e2e/tax.spec.ts
- [ ] Test: Open tax page → Settings loaded with current year
- [ ] Test: Change PTKP status → Calculations update
- [ ] Test: Change calculation method → Display updates
- [ ] Test: Enter tax paid → Difference recalculates
- [ ] Test: Export PDF → File downloads
- [ ] Test: Copy summary → Text in clipboard
- [ ] All E2E tests pass

## Task 20: Verify No Breaking Changes to Existing Features
**Status:** not_started
**Type:** testing
**Depends on:** Task 14

Verify that existing features still work correctly.

### Sub-tasks
- [ ] Test Dashboard page loads and displays data
- [ ] Test Transactions page CRUD operations
- [ ] Test Categories page functionality
- [ ] Test Accounts page functionality
- [ ] Test Cars page functionality
- [ ] Test Debts page functionality
- [ ] Test Reports page functionality
- [ ] Test Settings page functionality
- [ ] Verify no data loss or corruption
- [ ] All existing features work correctly

## Task 21: Build and Verify No Compilation Errors
**Status:** not_started
**Type:** verification
**Depends on:** Task 20

Run build to verify no compilation errors.

### Sub-tasks
- [ ] Run `npm run build`
- [ ] Verify no TypeScript errors
- [ ] Verify no Next.js warnings
- [ ] Verify build completes successfully
- [ ] Check bundle size is reasonable
- [ ] Verify all assets are included

## Task 22: Manual Testing on Mobile and Desktop
**Status:** not_started
**Type:** testing
**Depends on:** Task 21

Perform manual testing on various devices.

### Sub-tasks
- [ ] Test on iPhone (iOS Safari) - fullscreen mode, Add to Home Screen
- [ ] Test on Android (Chrome) - adaptive icon display
- [ ] Test on desktop (Chrome, Firefox, Safari)
- [ ] Verify responsive layout on all screen sizes
- [ ] Test all interactive elements
- [ ] Verify PDF export works
- [ ] Verify copy summary works
- [ ] Test with various tax scenarios

## Task 23: Documentation and Deployment Preparation
**Status:** not_started
**Type:** documentation
**Depends on:** Task 22

Create documentation and prepare for deployment.

### Sub-tasks
- [ ] Create user documentation for tax feature
- [ ] Document API endpoints
- [ ] Create deployment checklist
- [ ] Verify environment variables are set
- [ ] Test on staging environment
- [ ] Create rollback plan if needed
- [ ] Prepare release notes

## Task 24: Final Review and Sign-off
**Status:** not_started
**Type:** review
**Depends on:** Task 23

Final review of all implementation.

### Sub-tasks
- [ ] Review all code for quality and standards
- [ ] Verify all requirements are met
- [ ] Verify all tests pass
- [ ] Verify no performance issues
- [ ] Verify security considerations are addressed
- [ ] Get stakeholder sign-off
- [ ] Ready for production deployment
