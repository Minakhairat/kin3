# Security Specification: Kin Media Production Firestore Security

## Data Invariants
1. Admins have full CRUD access over deliverables, users, admin lists, dynamic packages, promotions, studio expenses, financial transactions, gear inventory, and studio bookings.
2. A client can ONLY read a deliverable if their authenticated email (`request.auth.token.email.lower()`) matches `resource.data.clientEmail.lower()` and `request.auth.token.email_verified == true`.
3. Clients cannot modify or delete deliverables, but can post revision comments on deliverables assigned to their email.
4. Client reviews: Authenticated clients can create review documents with `status == 'pending'` and `authorUid == request.auth.uid`. Anyone can read reviews where `resource.data.status == 'approved'`. Only admins can approve, edit, or delete reviews.
5. Dynamic pricing (`packages_cms`) and promotions (`promotions`) are publicly readable so that visitors and clients can see active rates and limited-time deals; only admins can create, modify, or delete them.
6. Financial ERP collections (`expenses`, `financial_transactions`) contain sensitive business information and are strictly restricted to authenticated studio admins.
7. Studio Gear Inventory (`gear_inventory`): Restricted to authenticated admins.
8. Studio Bookings (`studio_bookings`): Any visitor or client can submit a booking request; admins can read, update status, and manage all bookings. Clients can view their own bookings when authenticated.
9. Bootstrapped admin: `minakhairat96@gmail.com`, `kero@kin-media-production.com`, `Keromaged582@gmail.com`, and `Kenmediaproduction1@gmail.com`, plus any document in `/admins/{userId}`.
10. All document IDs must conform to `isValidId` (`^[a-zA-Z0-9_\-]+$` and length <= 128).
11. String lengths and numeric values are strictly bounded against Denial of Wallet and Resource Poisoning attacks.

## The "Dirty Dozen" Payloads (Must be REJECTED with PERMISSION_DENIED)
1. **Unauthenticated Read of Deliverables**: An unauthenticated user attempts `get` or `list` on `/deliverables/{id}`. (DENIED: `isSignedIn() == false`).
2. **Client Reading Another Client's Deliverable**: Authenticated user with email `clientA@test.com` attempts `get` on deliverable assigned to `clientB@test.com`. (DENIED: `clientEmail != auth.email`).
3. **Client Modifying Deliverable Link**: Authenticated client tries to alter `link` or `clientEmail` in `/deliverables/{id}`. (DENIED: only admin can update deliverables).
4. **Self-Promotion to Admin**: Non-admin user tries to create or update `/admins/{uid}` with their own UID. (DENIED: only existing admin can manage `/admins`).
5. **Client Auto-Approving Their Own Review**: Client submits a review with `status: 'approved'`. (DENIED: client can only submit with `status: 'pending'`).
6. **Client Modifying Another User's Review**: Non-admin user tries to edit or delete someone else's review. (DENIED: only admin can update/delete reviews).
7. **Unauthenticated Read of Studio Financials / Expenses**: Public visitor attempts `get` or `list` on `/expenses` or `/financial_transactions`. (DENIED: admin required).
8. **Client Altering Package Prices**: Non-admin user sends write request to `/packages_cms/{id}` to alter prices. (DENIED: admin write only).
9. **Malicious Long Payload / Denial of Wallet**: Attacker sends a 500KB string for review comment or expense title. (DENIED: `size()` bounds check).
10. **Path Traversal / Malicious ID**: Attacker requests `/reviews/..%2F..%2Fsecret`. (DENIED: `isValidId()` regex guard).
11. **Shadow Fields Injection in Reviews**: User tries to add arbitrary admin privilege fields into a review doc. (DENIED: strict validation blueprint).
12. **Unauthenticated Tampering of Gear Inventory**: Public user attempts to delete or mark equipment as stolen in `/gear_inventory`. (DENIED: admin write only).
