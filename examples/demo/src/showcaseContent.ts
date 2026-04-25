export const SHOWCASE_CONTENT = `# PR #2847 — Checkout v3 Refactor

CodeSentinel has finished analyzing this pull request. The review found **3 blocking issues** that must be resolved before merge: one SQL injection vector, one exposed secret in logs, and one authorization bypass path.

@agent[name: CodeSentinel, role: AI Security + Quality Reviewer, status: done, latency: 4.2s, tools: AST Analysis|Semgrep|Test Runner|Coverage Map, goal: Block insecure merges before they reach main]

---

## Changed Files


@fileheat[title: "47 files ", files: "src/checkout/processor.ts:98:modified|src/checkout/validator.ts:82:modified|src/auth/session.ts:71:added|src/billing/charge.ts:65:modified|src/db/queries.ts:91:modified|src/db/migrations/0031.sql:55:added|src/api/webhooks.ts:44:modified|src/utils/logger.ts:38:modified|tests/checkout.test.ts:30:added|tests/billing.test.ts:18:deleted"]



---

## Module Dependency Graph

The refactor split the monolithic checkout controller into four focused modules. Two new dependency edges introduce coupling that did not exist in v2 — both are flagged below.

@servicemap[title: "Checkout v3 module graph"; note: "New edges highlighted. billing to logger is the leak path."; nodes: api,API Layer,0,80,active,POST /checkout|validator,Input Validator,220,0,done,schema v3|processor,Checkout Processor,220,160,blocked,SQL blocker|billing,Billing Module,460,80,blocked,secret leak|db,DB Query Layer,460,240,active,parameterized|logger,Logger,680,80,blocked,logs PII; edges: api>validator>validate request|api>processor>process|processor>db>query|processor>billing>charge|billing>logger>audit trail|validator>processor>pass through]

---

## Security Blockers

@signal[title: SQL injection in processor.ts:114, tone: critical, score: 9.4, trend: new, note: User-controlled input interpolated directly into a raw SQL string. Parameterized query required.]

@signal[title: Secret written to structured log in billing.ts:67, tone: critical, score: 8.8, trend: new, note: stripe_secret_key appears in the audit trail object passed to logger.info. Strip before logging.]

> [!WARNING]
> A third path in session.ts:203 allows an authenticated user to skip the authorization check if the request carries a \`x-internal: 1\` header. Any browser request can set this header.

@signal[title: Authorization bypass via x-internal header in session.ts:203, tone: warning, score: 7.1, trend: new, note: The internal-request fast path trusts a client-supplied header with no IP allowlist or HMAC verification.]

---

## Test Coverage

Coverage dropped in the two highest-risk modules. The deleted billing test file accounts for most of the regression.

@kpi[label: Checkout Processor, value: 61%, change: -14%, period: vs main]
@kpi[label: Billing Module, value: 48%, change: -31%, period: vs main]
@kpi[label: Auth + Session, value: 83%, change: +6%, period: vs main]

@gauge[label: Checkout Processor, value: 61, max: 100, unit: %, warn: 75, crit: 65]
@gauge[label: Billing Module, value: 48, max: 100, unit: %, warn: 75, crit: 65]
@gauge[label: Auth + Session, value: 83, max: 100, unit: %, warn: 75, crit: 65]

> [!NOTE]
> The 65% threshold is enforced by CI. Both Checkout Processor and Billing Module will fail the coverage gate on the current branch.

---

## Performance Signals

Checkout p95 latency trended up across the last 7 commits on this branch. The regression correlates with the new validation layer running full schema checks on every request — including read-only status pings that do not require them.

Checkout p95 latency (ms, last 7 commits): @sparkline[38, 41, 45, 49, 58, 62, 71]
DB query time (ms): @sparkline[11, 12, 11, 14, 18, 21, 19]
Bundle size delta (kb): @sparkline[0, 0, 2, 2, 8, 8, 8]

---

## New Dependencies Introduced

@release[name: zod v3.22 (schema validation), status: beta, eta: Pinned at rc.2, owner: Archit]
@release[name: stripe-node v14 (billing SDK), status: live, eta: Stable, owner: Platform]

---

## Review Status

\`\`\`steps
- [done] Static analysis complete
  AST scan, Semgrep ruleset, and secret-pattern match finished in 4.2 s across 47 files.

- [done] Dependency audit complete
  Two new packages added. zod is pinned at a release candidate — pin to a stable release before merging.

- [active] Waiting on author fixes
  Three blockers filed as inline comments. Processor SQL fix is in progress per author's last commit.

- [planned] Re-run coverage gate
  Coverage check will re-run automatically once the billing test file is restored or replaced.

- [planned] Final approval
  Two approvals required. Security lead must approve given the SQL and secret findings.
\`\`\`

---

## Author Action Items

- [ ] Fix SQL injection in \`src/db/queries.ts:114\` — replace string interpolation with parameterized \`$1\` binding
- [ ] Strip \`stripe_secret_key\` from the logger payload in \`src/billing/charge.ts:67\` before calling \`logger.info\`
- [ ] Remove the \`x-internal\` header fast path in \`src/auth/session.ts:203\` or gate it behind an IP allowlist
- [ ] Restore or rewrite \`tests/billing.test.ts\` — coverage gate will block merge until Billing Module reaches 65%
- [ ] Pin \`zod\` to a stable release (currently \`3.22.0-rc.2\`)
- [ ] Add validation guard on status-ping routes to skip full schema parse — fixes the p95 regression

---

:::card{title="Upgrade to CodeSentinel Pro for team-wide enforcement"}
The free tier analyzed this PR in isolation. Pro adds merge blocking at the branch protection level, a historical exploit pattern database, auto-fix suggestions with one-click PR commits, and Slack + Linear integration so blockers surface in your existing workflow — not just in the review tab.
:::

@payment[amount: $79, plan: CodeSentinel Pro, desc: Automatic merge blocking, exploit pattern database, auto-fix PRs, and Slack or Linear integration for every repository in your organization.]

::button[Enable merge protection]{href="#" variant="primary"}

::button[View full audit log]{href="#" variant="secondary"}

::input{type="text" placeholder="Ask CodeSentinel about another file, rule, or fix..." label="Follow-up"}
`;
