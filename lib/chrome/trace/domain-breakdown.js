/**
 * First-party vs third-party main-thread rollup.
 *
 * cpu.urls answers "which URL costs the most main-thread time";
 * this answers the level above it — how much of the main thread the
 * site's own code uses versus embedded third parties, and which
 * domains those third parties are. Each task's self-time is credited
 * to its most-specific attributable URL (attributableURLs.at(-1),
 * same choice as script-costs.js) so a task counts once — cpu.urls
 * deliberately credits the full URL chain, which would double-count
 * across domains here. Tasks with no attributable URL are
 * browser-internal work no domain owns and are skipped.
 *
 * First-party is decided by registrable domain: the last two labels
 * of the hostname, so every subdomain of the tested page's domain is
 * first-party (en.wikipedia.org and upload.wikimedia.org roll up to
 * wikipedia.org / wikimedia.org). Deliberately NOT a full public
 * suffix list — two-level public suffixes (co.uk, com.au, …) group
 * one label too high, which is acceptable for a rollup and avoids
 * carrying an eTLD+1 dependency.
 *
 * Returns:
 *   { firstPartyDomain, firstParty, thirdParty,
 *     domains: [{ domain, value, firstParty }, …] }
 * Times in ms rounded to one decimal; domains sorted by value desc
 * and noise-filtered to entries above 10 ms, matching cpu.urls. The
 * firstParty / thirdParty totals include the filtered-out remainder.
 */

import { compute } from './main-thread-tasks.js';

const REPORT_LIMIT_MS = 10;

function round(ms) {
  return Math.round(ms * 10) / 10;
}

function registrableDomain(hostname) {
  const labels = hostname.split('.');
  return labels.length <= 2 ? hostname : labels.slice(-2).join('.');
}

function domainOf(url) {
  try {
    const { hostname } = new URL(url);
    return hostname ? registrableDomain(hostname) : undefined;
  } catch {
    return;
  }
}

export function computeDomainBreakdown(trace, pageUrl) {
  const firstPartyDomain = registrableDomain(new URL(pageUrl).hostname);
  const byDomain = new Map();

  for (const task of compute(trace)) {
    const url = task.attributableURLs.at(-1);
    if (!url) continue;
    const domain = domainOf(url);
    if (!domain) continue;
    byDomain.set(domain, (byDomain.get(domain) || 0) + task.selfTime);
  }

  let firstParty = 0;
  let thirdParty = 0;
  const domains = [];
  for (const [domain, value] of byDomain) {
    const isFirstParty = domain === firstPartyDomain;
    if (isFirstParty) {
      firstParty += value;
    } else {
      thirdParty += value;
    }
    if (value > REPORT_LIMIT_MS) {
      domains.push({ domain, value: round(value), firstParty: isFirstParty });
    }
  }
  domains.sort((a, b) => b.value - a.value);

  return {
    firstPartyDomain,
    firstParty: round(firstParty),
    thirdParty: round(thirdParty),
    domains
  };
}
