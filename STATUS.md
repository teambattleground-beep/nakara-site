# Nakara Marketing Site — Status

**Live:** https://nakara-site.onrender.com  
**Repo:** https://github.com/teambattleground-beep/nakara-site  
**Path:** `~/AtlasVault/brand/nakara/website/`  
**Render:** `srv-d9d1cagk1i2s73cp9p5g` · auto-deploy on `main`

## Version history

| Ver | Commit | Notes |
|-----|--------|--------|
| v1 | `e201051` | Initial 8-section mockup; Geist logo; ~11.7KB |
| v2 | `fa2dff9` | What Nakara Is, use cases, behind product, hero Hired/Departed; ~16.2KB |
| v3 | `8a2e863` | Who it’s for, stop-doing, planning cycle, FAQ, industry language; ~23.3KB |
| v4 | `4679720` | Honest pre-launch; mid-market wedge; working mailto demo; no fake social proof |

## v4 changes (2026-07-17)

**Why:** Competitors (ChartHop, TeamOhana) win with suite breadth + real logos/quotes/metrics. Pre-launch Nakara cannot fake that. Differentiator is calm, narrow, honest headcount clarity for teams that outgrew sheets but don’t need a full people platform.

**Content**
- Hero: *One shared headcount number* + plan vs actual sub
- Removed Sign in, fake logos, placeholder quotes
- Early access / design partner section (honest)
- Softened “live in a week” → days-to-clarity / set expectations on call
- FAQ: “Is Nakara available now?” + clearer fit language
- CTA: real mailto to NakaraLLC@proton.me
- Footer: only real anchors (no Careers/Press/Changelog theater)

**Hard rules still held**
- No pricing  
- No fake stats / real company logos / fake G2  
- No dashboards / implementation weeds  
- No user accounts product flow  
- Feature → benefit → benefit  

## Files

- `index.html` — single page  
- `style.css` — vanilla, brand tokens  
- `script.js` — nav, mobile, FAQ, mailto form, reveals  
- `assets/logo-primary.png`  
- `STATUS.md`  

## Deploy

```bash
source ~/AtlasVault/Credentials/env.agent.sh
cd ~/AtlasVault/brand/nakara/website
git add -A && git commit -m "..." && git push origin main
```

See also: `~/AtlasVault/operations/tech/Website-Deploy-Stack.md`
