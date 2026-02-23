# Registrar Integration

## WHOIS API Integration

The domain-finder script uses WHOIS API to check real-time availability. This is the only source of truth for domain status.

### Supported APIs

**Primary: WhoisXmlApi**
- Free tier available
- Instant availability checks
- Returns registration status with owner info

**Fallback: Domain registrars** (GoDaddy, Namecheap, etc.)
- Direct API queries if needed
- Usually rate-limited for free tier
- Consider for production use

## What "Buyable" Means

A domain is **buyable** (available) when:

1. **WHOIS shows no registrant** — Domain has never been registered
2. **WHOIS shows expired** — Domain was registered but lapsed (rare)
3. **Registrar API confirms available** — Standard availability endpoint returns positive

A domain is **NOT buyable** when:

1. **Active registration found** — WHOIS shows current owner
2. **Registrar says taken** — Official registrar confirms active reservation
3. **Error on lookup** — Treat as unknown/risky (don't recommend)

## Cost Assumptions

- `.ai` domains: $15-50/year (premium registry)
- `.io` domains: $10-30/year
- `.co` domains: $10-25/year

## Rate Limiting

The script caches checked domains to avoid redundant queries. For batches >50 domains, consider spacing queries 2-3 seconds apart to avoid API throttling.

## Manual Verification

Always verify high-priority domains manually with the registrar before committing:

1. Go to registrar's site (e.g., namecheap.com)
2. Search the exact domain name
3. If search shows "Add to cart" → available
4. If search shows "This domain is unavailable" → taken
