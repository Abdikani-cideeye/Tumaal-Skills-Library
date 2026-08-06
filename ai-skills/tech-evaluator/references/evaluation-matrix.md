# Technology Evaluation Matrix — Reference

## How to Score Each Dimension

Use this matrix when running the `tech-evaluator` skill. Each dimension is scored 0–10.
The final weighted score determines the ranking. Hard disqualifiers override scores.

---

## Dimension 1: Scale Fit (Weight: 30%)

**Question:** Can this technology handle 10× the projected peak load without requiring a
fundamental re-architecture?

| Score | Meaning |
|---|---|
| 9–10 | Proven at 10× scale with published case studies; linear scaling |
| 7–8 | Proven at scale with minor tuning; well-documented scaling path |
| 5–6 | Scales with significant operational investment (custom sharding, etc.) |
| 3–4 | Known scaling ceiling below the project's 3-year projection |
| 1–2 | Documented performance issues at current projected scale |
| 0 | Cannot meet current load requirements |

**Scale benchmarks to search for:**
- RPS (requests per second) benchmarks
- P99 latency under load
- Connection limits and pooling behavior
- Horizontal scaling story (stateless? leader election needed?)

---

## Dimension 2: Security Posture (Weight: 25%)

**Question:** Does this technology default to secure configuration, and how quickly are
vulnerabilities patched?

| Score | Meaning |
|---|---|
| 9–10 | Zero critical CVEs in 24mo; patches released <7 days; secure defaults |
| 7–8 | No critical CVEs in 12mo; active security team; minor issues patched quickly |
| 5–6 | 1-2 critical CVEs in 24mo, all patched; reasonable patch cadence |
| 3–4 | Multiple CVEs; slow patch response; insecure defaults require manual hardening |
| 1–2 | Active unpatched critical CVEs; no security team |
| 0 | Known backdoor, supply-chain compromise, or abandoned with known exploits |

**Security signals to search for:**
- CVE database: `nvd.nist.gov/vuln/search`
- GitHub Security Advisories on the repository
- npm audit score / Socket.dev risk score
- Whether secure config requires explicit opt-in vs. default-on

---

## Dimension 3: Community Health (Weight: 20%)

**Question:** Will this project be maintained, improved, and supported in 3 years?

| Score | Meaning |
|---|---|
| 9–10 | Corporate-backed or CNCF-level; growing downloads; <48h issue response |
| 7–8 | Strong community; stable downloads; active releases; responsive maintainers |
| 5–6 | Moderate activity; small team; issues addressed within weeks |
| 3–4 | Slowing activity; maintainer burnout signals; release cadence dropped |
| 1–2 | Last commit >6mo ago; issues unresponded for months |
| 0 | Archived, abandoned, or transferred to unknown maintainer |

**Community signals to search for:**
- npm weekly downloads trend (growing/stable/declining?)
- GitHub: stars trend, contributors count, PR response time
- Corporate backing (check company behind maintainers)
- `CHANGELOG.md` — is it updated regularly?
- Hacker News discussion sentiment

---

## Dimension 4: Operational Cost (Weight: 15%)

**Question:** What is the total cost of running and maintaining this in production?

| Score | Meaning |
|---|---|
| 9–10 | Fully managed; excellent observability; zero ops overhead |
| 7–8 | Managed with minor config; good docs; standard monitoring |
| 5–6 | Self-hosted option practical; moderate ops complexity |
| 3–4 | Significant ops investment; custom monitoring setup required |
| 1–2 | High ops complexity; specialized knowledge required; expensive |
| 0 | Prohibitive cost or ops complexity for the team size |

**Cost factors to evaluate:**
- Managed vs. self-hosted hosting cost at projected scale
- Observability story (metrics, traces, logs built-in or external?)
- Debugging story (how hard is production debugging?)
- Cold start time (for serverless/edge deployments)
- Memory footprint (affects hosting tier)

---

## Dimension 5: Migration Cost (Weight: 10%)

**Question:** How painful is it to replace this technology if it turns out to be the wrong
choice in 18 months?

| Score | Meaning |
|---|---|
| 9–10 | Standard interfaces (SQL, HTTP, POSIX); trivial to swap |
| 7–8 | Moderate coupling; migration is a 1-week project |
| 5–6 | Proprietary APIs but adapters exist; 1–4 week migration |
| 3–4 | Deep coupling; migration requires significant refactor |
| 1–2 | Vendor lock-in; migration is a 3–6 month project |
| 0 | Effectively irreversible (data format, protocol, or vendor contract) |

**Migration signals to evaluate:**
- Does it use standard protocols (SQL, REST, gRPC) or proprietary ones?
- Are there migration tools or adapters to alternatives?
- Is data exportable in standard formats?
- What is the migration story from the official docs?

---

## Weighted Score Calculator

```
Final Score = (Scale × 0.30) + (Security × 0.25) + (Community × 0.20) + (Ops × 0.15) + (Migration × 0.10)
```

**Example:**
| Technology | Scale (30%) | Security (25%) | Community (20%) | Ops (15%) | Migration (10%) | Total |
|---|---|---|---|---|---|---|
| Option A | 8 × 0.30 = 2.40 | 9 × 0.25 = 2.25 | 7 × 0.20 = 1.40 | 8 × 0.15 = 1.20 | 6 × 0.10 = 0.60 | **7.85** |
| Option B | 7 × 0.30 = 2.10 | 8 × 0.25 = 2.00 | 9 × 0.20 = 1.80 | 7 × 0.15 = 1.05 | 8 × 0.10 = 0.80 | **7.75** |

---

## Hard Disqualifiers (Override All Scores)

If any of these are true, the technology is **eliminated** regardless of score:

1. **Active unpatched critical CVE** — do not recommend
2. **Zero commits in last 6 months** for a critical-path dependency
3. **No SLA** for a service that requires 99.9%+ availability at this project's scale
4. **Supply-chain risk flags** on Socket.dev (typosquatting, obfuscated code, malicious maintainer)
5. **No data export mechanism** for a primary data store (vendor lock-in is a business risk, not just technical)

---

## Red Flags That Require Explicit Mention

These don't disqualify but MUST be disclosed in the recommendation:
- Major breaking version released in last 3 months → ecosystem instability
- Primary maintainer announced reduced involvement
- Significant open security issues (even if not yet CVE-assigned)
- Benchmark numbers come from the vendor's own marketing material (not independent)
- Technology requires expertise your team doesn't have
