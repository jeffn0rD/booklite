# Security and Authentication Policy

Application: Lightweight bookkeeping for independent consultants (<50 clients)  
Stack: Astro/Svelte (CF Pages), Fastify (Railway), Supabase/PostgreSQL (RLS), Cloudflare Storage  
Tenancy: Single-user per tenant; isolation by user_id. Roles: User, Admin.

Version: 1.0  
Owner: Security/Platform Team  
Status: Draft for implementation  
Last updated: [fill at publish]

---

## 1. Authentication

### 1.1 Identity Provider
- Supabase Auth as primary IdP.
- Supported auth methods:
  - Email/password (primary)
  - Magic link (optional)
  - TOTP MFA (User optional; Admin required)
  - Future: OAuth/OIDC providers (Google, GitHub). External identities mapped to internal user_id with unchanged RLS.

### 1.2 Tokens and Sessions
- Access Token
  - Type: JWT (RS256), audience "authenticated".
  - Lifetime: 15 minutes.
  - Claims: sub (user_id), role (User|Admin), iat, exp, session_id, email_verified, mfa (bool), provider, org (null).
- Refresh Token
  - Type: Rotating opaque token managed by Supabase.
  - Lifetime: 30 days sliding; rotation on each refresh.
  - One token per device/session; server tracks session_id.
- Session Storage and Transport
  - Web: refresh token in httpOnly, Secure, SameSite=Lax cookie on app domain; access token held in memory.
  - Native/CLI: keychain/secure enclave for refresh token; access token in volatile memory.
  - CSRF: state-changing endpoints protected by CSRF token when cookie-based auth is in use (double-submit or SameSite=Lax + CSRF header).
- Rotation Strategy
  - Proactive refresh at T−5 minutes of access exp.
  - On 401 invalid_token: one silent refresh attempt; if fails, sign-out.
  - Refresh token rotation: invalidate previous token upon use; reuse detection locks session and requires re-auth.
- Logout
  - Client calls POST /auth/logout.
  - Server revokes refresh token (Supabase session revoke), clears cookie, invalidates session_id.
- Device/Session Management
  - Endpoint to list devices (session_id, created_at, last_used_at, user-agent, IP) and revoke individually.
  - Remote revoke triggers immediate 401 for subsequent requests (short cache TTL).

### 1.3 MFA
- Admin: mandatory TOTP (RFC 6238), enforced at login and sensitive admin endpoints.
- User: optional TOTP; recommended during onboarding.
- Recovery codes: 10 one-time codes on setup; storage hashed (Argon2id).
- Step-up: if mfa=false claim or long-idle session (>12h), require MFA to finalize invoices/void/official copy creation.

### 1.4 SSO (Future)
- OAuth/OIDC providers; on first login, user must confirm email and consent. Admin SSO requires enforced MFA at IdP or app-level.

---

## 2. Password Policy

### 2.1 Requirements
- Length: minimum 12, maximum 256 characters.
- Complexity: must satisfy either:
  - 3 of 4 character classes (upper, lower, digit, symbol), or
  - Strength score ≥ 3 via zxcvbn with custom dictionary (business name, email local-part, app name).
- Disallow:
  - Top 10k breached/common passwords (HIBP-like list).
  - Passwords containing email, business name, or obvious patterns (e.g., "Password2025!").
  - Leading/trailing whitespace.
- Examples
  - Accept: "gale-pilot!oak 1977", "S3lfB1ll!ng—Fox".
  - Reject: "Consulting123!", "passwordpassword", "john@doe.com!!".

### 2.2 Validation and Lockout
- Rate limits: login 5/min per IP + user-based exponential backoff (2^n seconds up to 15 minutes after 10 failures).
- Temporary lock: 10 failed attempts → 15-minute lock for that account from that IP; CAPTCHA after 5 failed attempts/session.
- Notification: email on locked account and on password change.

### 2.3 Storage and Upgrades
- Hashing: Argon2id with parameters
  - memory_cost >= 64 MB
  - time_cost >= 3
  - parallelism 1–2
  - 16-byte random salt (per user)
- Optional pepper: KMS-managed secret; prepend before hashing.
- Rehash policy: on login, if parameters outdated, transparently rehash and update.
- Rotation: update Argon2 parameters annually based on benchmarking.

---

## 3. Authorization

### 3.1 Model
- Roles:
  - User: access restricted to rows where user_id = auth.uid() by RLS.
  - Admin: platform operator; uses isolated admin API and DB role that bypasses tenant RLS; all actions audited.
- Principle of least privilege across API and DB roles.
- No team/multi-user tenancy in v1; one human per tenant account.

### 3.2 RLS Policies (Tenant Data)
- USING: user_id = auth.uid()
- WITH CHECK: user_id = auth.uid()
- Applied on: user_profiles, clients, projects, documents, document_line_items, payments, expenses, categories, attachments, email_logs, number_sequences, notes, tax_rates, official_copies.
- Same-user guard on FKs:
  - Deferred constraint triggers assert child.user_id = parent.user_id on insert/update (documents→clients/projects, payments→documents, etc.).

### 3.3 CRUD Matrix

Legend: C=create, R=read, U=update, D=delete; "Self" means constrained by RLS.

- Auth session: User C/R/U/D self; Admin R/D any.
- user_profiles: User C/R/U/D self; Admin R any, U with audit.
- clients, projects, documents, document_line_items, payments, expenses, categories, notes, tax_rates, attachments (metadata):
  - User: C/R/U/D (Self)
  - Admin: R any; U/D with audit. Deletes should be soft where applicable.
- email_logs, official_copies:
  - User: R (Self); C by system.
  - Admin: R any.
- number_sequences:
  - User: C/R/U/D (Self)
  - Admin: R any; U with audit.
- Reporting:
  - User: R (Self data)
  - Admin: R any.

### 3.4 Sensitive Operations and Business Rules
- Documents finalize: requires profile completeness; sets number, issue_date; generates official copy; rate-limited; requires MFA if step-up needed.
- Void invoice: only if balance_due_cents = 0; audit entry required.
- Payments modify: recompute invoice status and materialized totals via DB function; no negative balances.
- Expense billing linkage: only when billing_status='unbilled' and invoice.type='invoice'; updates billing_status to 'billed'.
- Official copies: immutable; new copies are appended by event_type (send|finalize); warns on re-render if data differs.

---

## 4. API Endpoint Access Control

Base path: /api/v1 (User API, RLS-backed)  
Admin base: /admin/v1 (Admin-only; separate service account DB role, bypass RLS)

Authentication required for all except login/refresh and well-defined public health.

### 4.1 User API
- Auth
  - POST /auth/login – Public; rate-limited
  - POST /auth/refresh – Refresh cookie required
  - POST /auth/logout – Authenticated
  - POST /auth/mfa/challenge – Authenticated
  - POST /auth/mfa/verify – Authenticated
- Me/Settings
  - GET/PUT /me/profile – User
  - GET/PUT /me/settings/numbering – User
  - GET/PUT /me/settings/email-templates – User
- Clients
  - GET/POST /clients – User
  - GET/PUT/DELETE /clients/:id – User
- Projects
  - GET/POST /projects – User
  - GET/PUT/DELETE /projects/:id – User
- Documents
  - GET/POST /documents – User
  - GET/PUT/DELETE /documents/:id – User
  - POST /documents/:id/finalize – User, MFA step-up if required
  - POST /documents/:id/send-email – User
  - GET /documents/:id/pdf – User (signed URL)
  - GET /documents/:id/official-copy – User
  - POST /documents/:id/void – User (invoice only)
  - POST /documents/:id/convert/quote-to-invoice – User
  - POST /documents/:id/convert/quote-to-project – User
- Line Items
  - GET/POST /documents/:id/line-items – User
  - PUT/DELETE /line-items/:lineItemId – User
- Payments
  - GET/POST /invoices/:id/payments – User
  - PUT/DELETE /payments/:paymentId – User
- Expenses
  - GET/POST /expenses – User
  - GET/PUT/DELETE /expenses/:id – User
  - POST /invoices/:id/expenses/add – User
- Categories
  - GET/POST /categories – User
  - GET/PUT/DELETE /categories/:id – User
- Attachments
  - POST /attachments/upload – User (returns signed upload URL + metadata)
  - GET /attachments/:id/signed-url – User
  - DELETE /attachments/:id – User
- Tax Rates
  - GET/POST /tax-rates – User
  - GET/PUT/DELETE /tax-rates/:id – User
- Email Logs
  - GET /documents/:id/email-logs – User
- Reporting
  - GET /reports/pnl – User
  - GET /reports/project-profitability – User
  - GET /reports/balance-sheet – User
  - GET /reports/ar-aging – User
  - GET /exports/:type.csv – User

Error codes:
- 401 Unauthorized: missing/invalid token; expired without valid refresh; revoked session.
- 403 Forbidden: valid token but role insufficient or RLS prevented access.
- 422 Unprocessable Entity: schema validation failed.
- 409 Conflict: business rule violation (e.g., void with nonzero balance).
- 429 Too Many Requests: rate limiting.

### 4.2 Admin API
- GET /admin/health – Admin
- GET /admin/tenants – Admin
- GET /admin/tenant/:userId – Admin
- POST /admin/tenant/:userId/revoke-sessions – Admin
- GET /admin/logs – Admin (filterable)
- POST /admin/impersonate/:userId – Admin, break-glass; time-limited token with "impersonated_sub" claim; mandatory justification; banner in UI.

Admin transport:
- Separate subdomain or path with WAF rule.
- Admin JWT uses distinct audience and issuer claim; different signing key or scope.

---

## 5. Security Controls

### 5.1 Input Validation
- Fastify AJV JSON schemas per endpoint:
  - Enforce lengths as per DB constraints.
  - Enums for statuses/types.
  - Numeric bounds: cents ≥ 0; tax 0–100; padding 2–10.
  - Email format; RFC3339 dates.
  - Reject additionalProperties.
- Server-side computation
  - Recompute document and line totals; ignore client-provided totals.
  - Enforce status transitions via stored procedures.
- Sanitization
  - Strip dangerous HTML from user-entered notes with allowlist (or store as plaintext).
  - Normalize Unicode (NFC) for unique checks (names).

### 5.2 Rate Limiting and Abuse Controls
- Global: 100 requests/min/IP.
- Auth:
  - /auth/login: 5/min/IP + per-user backoff; CAPTCHA after 5 failures.
  - /auth/refresh: 20/min/IP.
- Sensitive operations:
  - finalize/send/official copy: 20/min/user.
  - attachments: 30/min/user; max 10 MB receipt, 20 MB PDF; per-day cap 500 MB/user.
- Admin API: stricter—50/min/IP; anomalies alerting.
- Cloudflare WAF: bot management enabled on auth routes.

### 5.3 CORS
- Allowed origins: exact allowlist per environment (prod app domain(s), staging).
- Methods: GET, POST, PUT, DELETE, OPTIONS.
- Headers: Authorization, Content-Type, X-Request-Id, X-Csrf-Token.
- Credentials: true (for refresh cookie).
- Preflight cache: 600 seconds.

### 5.4 Security Headers
- HSTS: max-age=31536000; includeSubDomains; preload.
- CSP (tight by environment):
  - default-src 'self';
  - img-src 'self' data: https://*.cloudflare.com;
  - font-src 'self';
  - script-src 'self';
  - connect-src 'self' https://*.supabase.co https://api.email-provider.com;
  - frame-ancestors 'none';
  - object-src 'none';
- X-Content-Type-Options: nosniff.
- X-Frame-Options: DENY.
- Referrer-Policy: no-referrer.
- Permissions-Policy: geolocation=(), microphone=(), camera=().

### 5.5 Data Encryption
- In transit: TLS 1.2+ end-to-end (client↔CF, CF↔origin, origin↔Supabase, origin↔Cloudflare R2).
- At rest:
  - Postgres: managed encryption by Supabase; encrypted volumes and backups.
  - R2: server-side encryption enabled.
  - Application secrets: managed via Railway secrets + KMS; no secrets in code or logs.
- Sensitive tokens
  - Email provider API keys in KMS; rotate quarterly.
  - Optional per-user SMTP tokens: encrypted with app KMS; decrypt on send.
- Hashing: Argon2id for passwords and recovery codes.

### 5.6 Storage and Files
- Attachments
  - Only metadata stored in DB; files in Cloudflare R2 buckets: receipts, pdfs, logos.
  - Signed URLs (short TTL: 5 minutes); scope to user; include content-disposition and content-type.
  - Validate MIME and file signatures server-side; compute and store SHA-256 for integrity.
  - Antivirus scan hook (if available) for uploaded files; quarantine on detection.
- PDF generation
  - Runs in sandboxed worker/container.
  - Disallow external resource fetch except whitelisted fonts/assets.
  - Embed metadata (document id, hash, generated_at).

### 5.7 Auditing and Logging
- Structured logs
  - Fields: request_id, user_id, role, ip, user-agent, path, method, status, latency_ms, error_code.
- Audit events (immutable store)
  - Admin: login, impersonation start/stop, tenant data access, session revoke, configuration changes.
  - User: finalize document, send email, void invoice, delete entity, change password/MFA, export/import.
  - Contents: actor_id, role, action, target_type/id, before/after hash or limited diff, result, reason (for void/impersonation), created_at.
- Retention
  - App logs: 30 days warm, 180 days cold.
  - Audit logs: 7 years (aligned with financial record retention).
- Access
  - Restricted to ops with least privilege; quarterly access review.

### 5.8 DB Security and Integrity
- RLS on all tenant tables.
- Deferrable constraints/triggers to enforce same-user for FKs.
- Minimal SUPERUSER/owner roles; app uses limited DB role.
- Migrations reviewed; change control with rollback plan.

### 5.9 CSRF and Clickjacking
- CSRF token required for cookie-auth state-changing routes.
- SameSite=Lax cookies.
- X-Frame-Options DENY and CSP frame-ancestors 'none'.

### 5.10 Availability and DoS
- Cloudflare CDN/WAF in front.
- Rate limits per user/IP.
- Pagination and query limits for heavy endpoints.
- Background jobs with backoff and idempotency keys.

---

## 6. Compliance and Governance

### 6.1 Financial Record Retention
- Retain documents (invoices, quotes), payments, expenses, official copies, and email logs for ≥ 7 years.
- Official copies are immutable; new events produce additional records (event_type send|finalize).
- Deletion:
  - Soft delete where possible; prevent deletion of unpaid invoices.
  - Purge attachments when referencing rows are deleted and retention satisfied.

### 6.2 Privacy and Data Subject Requests
- Minimal PII: client names/emails/addresses.
- Data export: user-initiated export (CSV/JSON snapshots) for all entities scoped by user_id.
- Deletion:
  - Account deletion requires confirmation; data purged after legal retention windows.
- DSR SLA: acknowledge within 7 days; fulfill within 30 days.
- Subprocessors: Supabase, Cloudflare, Railway; list publicly and notify on changes.

### 6.3 PCI Scope
- App does not store/process card PAN; all payments are recorded as offline entries or via PSP tokens (future).
- If PSP added: use hosted fields/redirect; store only token and last4/brand; never log PAN/CVV.

### 6.4 Security Program
- Vulnerability disclosure policy public; security@ email monitored.
- Dependency scanning weekly; criticals remediated within 7 days, highs within 30 days.
- Annual penetration test; results tracked to closure.
- SBOM maintained per release.

### 6.5 Backups and DR
- DB backups: daily full + point-in-time (if enabled), 30-day retention.
- R2 lifecycle: versioning enabled; 30-day lifecycle for deleted versions.
- Restore tests: quarterly restore dry-run to staging; report findings.
- RTO: 8 hours; RPO: 24 hours (or better if PITR).
- Incident runbooks for DB restore and config secrets rotation.

### 6.6 Access Control and Admin Governance
- Admin accounts separate from User accounts; enforced MFA.
- Break-glass process:
  - Request ticket + justification; time-bound access grant (e.g., 1 hour) via ephemeral token.
  - All actions audited and reviewed post hoc.
- Quarterly access review for Admins and service accounts.

---

## 7. Error Handling and Responses

- 400 Bad Request: invalid query/path formatting.
- 401 Unauthorized: missing/invalid/expired access token; refresh failure.
- 403 Forbidden: role/tenant access denied or RLS block.
- 404 Not Found: entity not found under tenant.
- 409 Conflict: status/transition or unique constraint violation.
- 422 Unprocessable Entity: schema validation error.
- 429 Too Many Requests: rate limit exceeded.
- 500 Internal Server Error: unexpected; includes request_id for support.

Responses exclude sensitive internals; include machine-readable error codes and user-friendly messages.

---

## 8. Environment and Deployment

- Secrets via platform secret store; rotated quarterly or on incident.
- Per-environment configurations for:
  - Allowed CORS origins
  - CSP connect-src endpoints
  - Cookie domain/secure flags
  - Email provider keys/sender domains
- Build-time SBOM; immutable deploys; rollbacks available.

---

## 9. Monitoring and Alerts

- Metrics: auth success/failure rates, refresh success, 401/403/429 counts, finalize/void attempts, signed URL issuance, storage errors.
- Alerts:
  - Spike in login failures per IP/user.
  - Anomalous Admin activity (outside business hours; large data reads).
  - Excessive finalize/send operations per user.
  - Reuse of refresh token (rotation failure).
- Dashboard: SLOs for auth latency (<250ms p95), error budgets.

---

## 10. Implementation Details and Pseudocode

### 10.1 Access Token Check (Fastify preHandler)
```ts
// Extract bearer token, verify JWT (RS256), attach claims to request.user
// Enforce role-based access on route config; else 403
// For User API, pass through to Supabase RLS with JWT in PostgREST or via service key + set auth.uid() using Supabase middleware
```

### 10.2 Refresh Flow
```ts
// POST /auth/refresh
// read httpOnly refresh cookie; call Supabase refresh
// on success: set new refresh cookie (rotation), return new access JWT; else 401
```

### 10.3 RLS Same-User Trigger Example
```sql
create function assert_same_user() returns trigger language plpgsql as $$
begin
  if new.user_id <> (select user_id from clients where id = new.client_id) then
    raise exception 'cross-tenant reference';
  end if;
  return new;
end; $$;
```

### 10.4 Official Copy Generation
```ts
// On finalize/send: render PDF, upload to R2, create attachments row,
// insert official_copies(document_id, pdf_attachment_id, email_body)
// Warn on re-render if hash of current doc != hash at official copy time
```

---

## 11. Change Management

- All policy changes tracked in version control.
- Security review required for changes to:
  - Token lifetimes
  - MFA requirements
  - RLS policies
  - Admin bypass mechanisms
- Communicate breaking changes to stakeholders with migration guidance.

---

## 12. Acceptance Criteria (Go-Live)

- [ ] All endpoints have JSON schemas and tests for 401/403/422/429.
- [ ] RLS enabled on all tenant tables; cross-tenant FKs enforced.
- [ ] MFA enforced for Admin; optional for User with UI support and recovery codes.
- [ ] Rate limiting configured and load-tested.
- [ ] CSP, HSTS, and other headers verified in production.
- [ ] Backup/restore drill completed successfully.
- [ ] Audit logging pipeline operational with retention configured.
- [ ] Secrets stored in KMS/secret store; no secrets in code or images.
- [ ] Pen-test findings addressed; no criticals outstanding.