# Nakara Marketing Site — Status

**Live:** https://nakara-site.onrender.com  
**Repo:** https://github.com/teambattleground-beep/nakara-site  
**Path:** `~/AtlasVault/brand/nakara/website/`  
**Render:** `srv-d9d1cagk1i2s73cp9p5g` · auto-deploy on `main`

## Version history

| Ver | Commit | Notes |
|-----|--------|--------|
| v1 | `e201051` | Initial mockup |
| v2 | `fa2dff9` | Value density |
| v3 | `8a2e863` | HR headcount-planning language (superseded) |
| v4 | `4679720` | Honest pre-launch polish (still HR framing — superseded) |
| v4.1 | `5d53223` | Temporary geometric 中 logo |
| **v5.2** | **`65b8047`** | Hero H1 → You bring the problem. We build the answer. |
| **v5.1** | **`6cc5b19`** | Hero eyebrow: Outcomes. Not software. |
| v5 | **`f9207b2`** | **AI employees / AI solutions for businesses** — correct product narrative |

## Product narrative (locked for public site)

- **Company:** builds **AI employees (digital coworkers)** and **custom AI-powered solutions** for businesses  
- **Brand tagline (footer / TM):** **Headcount. Reinvented.** = flexible capacity via AI teammates — **not** HR software / headcount planning
- **Hero H1 (v5.2):** **You bring the problem. We build the answer.** (JB 2026-07-18)
- **Hero eyebrow (v5.1):** **Outcomes. Not software.** — first-view emphasizes solutions/results + AI employees (JB 2026-07-18)  
- **Audience:** owners, ops, delivery, sales, support — whole business, not HR/Finance/Talent buyers  
- **Model:** configure + operate role-shaped AI workers (service-shaped), not DIY tool license  

## Hard rules

- No pricing  
- No fake stats / logos / G2  
- No dashboards / implementation weeds  
- Feature → benefit → benefit  
- Premium, calm, modern  

## Deploy

```bash
source ~/AtlasVault/Credentials/env.agent.sh
cd ~/AtlasVault/brand/nakara/website
git add -A && git commit -m "..." && git push origin main
```
