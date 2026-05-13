# Security Specification for Humaid's Corner

## 1. Data Invariants
- Each record (Income, BazarLog, Bill, EducationExpense, Loan) MUST belong to the authenticated user who created it (`userId == request.auth.uid`).
- Amounts must be positive numbers.
- bazar_logs items must have valid categories and consistent totals (quantity * unitPrice == total).
- Bills must have a valid month (0-11) and year (> 2000).
- Users can only read and write their own data.

## 2. The "Dirty Dozen" Payloads (Examples of what to block)
1. **Identity Spoofing**: Attempt to create an income for another user (`userId: 'stolen_uid'`).
2. **Resource Poisoning**: Use a 1MB string as a category name.
3. **Negative Money**: Create a loan with `amount: -1000`.
4. **Shadow Fields**: Add `isAdmin: true` to a user profile.
5. **Orphaned Writes**: Create a bazar item in a record that doesn't exist.
6. **Timeline Tampering**: Set `createdAt` to a future date from the client.
7. **Cross-User Leakage**: List all `bazar_logs` without a UID filter.
8. **Bill Forgery**: Set `isPaid: true` without a `paidAt` timestamp.
9. **Loan Deletion**: A user deleting a loan record they don't own.
10. **Education Expense Inflation**: Submitting a massive array in `items` or long descriptions.
11. **ID Injection**: Using `../` or special characters in document IDs.
12. **Status Bypass**: Clearing a loan status without full repayment (though logic is client-side, rules should restrict certain field updates).

## 3. Test Runner (Draft)
The `firestore.rules` will be validated against these scenarios.
