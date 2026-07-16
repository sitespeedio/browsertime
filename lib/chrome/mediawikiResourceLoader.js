// MediaWiki-specific: per-module coverage breakdown for ResourceLoader
// bundles. MediaWiki serves many JS modules concatenated into a single
// load.php response. Each module in the bundle is delimited by an
// mw.loader.impl(...) call whose payload starts with "<name>@<versionHash>".
// Observed format (en.wikipedia.org, MediaWiki 1.4x, July 2026), one call
// per line:
//
//   mw.loader.impl(function(){return["ext.popups.main@4i3g7",function(...
//   mw.loader.impl(function(){return["mediawiki.base@h9kwf",{"main":...
//
// The delimiter is anchored to the start of a line (ResourceLoader emits
// each impl call on its own line), which keeps mw.loader.impl occurrences
// inside string literals from creating phantom modules unless the literal
// happens to reproduce the full delimiter at a line start — an accepted
// limitation. Trailing bundle content after the last module (for example
// mw.loader.state(...)) is attributed to the last module.
const MODULE_DELIMITER =
  /^mw\.loader\.impl\(function\(\)\{return\["([\w.-]+)@([^"]*)",/gm;

export function isResourceLoaderBundle(url, source) {
  return url.includes('load.php') || source.startsWith('mw.loader.impl(');
}

// MediaWiki-specific: stable, short labels for ResourceLoader load.php
// URLs. The raw URLs are >1000 chars and carry a version= parameter
// that changes on every deploy, so any dashboard keying a time series
// on the URL gets a brand-new key every week. The label is derived
// only from the request's role — the version, lang and skin parameters
// are never read — so the same bundle keeps the same label across
// deploys.
//
// Labeling rules (a URL qualifies when its path ends in /load.php):
//   modules=startup                  -> load.php[startup]
//   single module, only=styles       -> load.php[styles:<module>]
//                                       (e.g. load.php[styles:site.styles])
//   single module, otherwise         -> load.php[scripts:<module>]
//   multi-module, only=styles        -> load.php[styles]
//                                       (the top-queue stylesheet batch)
//   multi-module, only=scripts       -> load.php[scripts:<first>]
//                                       where <first> is the first name in
//                                       the sorted expanded modules list
//                                       (e.g. the base bundle
//                                       jquery|mediawiki.base becomes
//                                       load.php[scripts:jquery]); raw
//                                       script batches are disambiguated
//                                       this way so they never collide
//                                       with the general bundle below
//   multi-module, no only param      -> load.php[scripts]
//                                       (the big general batch of packaged
//                                       mw.loader.impl modules)
//
// Several combined (no `only`) batches on one page — the main queue
// plus lazy-loaded batches — intentionally share load.php[scripts]:
// they are the same kind of payload and label-keyed dashboards want
// them summed. Exact identity always remains in the untouched url
// field; the label is additive.
const RESOURCE_LOADER_PATH = /\/load\.php$/;

// Port of MediaWiki's ResourceLoader::expandModuleNames: groups are
// pipe-separated; within a group, "foo.bar,baz" expands to foo.bar and
// foo.baz (the packer only groups modules sharing the prefix before
// their last dot, so suffixes never contain dots).
function expandModuleNames(packed) {
  const names = [];
  for (const group of packed.split('|')) {
    if (!group.includes(',')) {
      if (group) names.push(group);
      continue;
    }
    const pos = group.lastIndexOf('.');
    if (pos === -1) {
      names.push(...group.split(','));
      continue;
    }
    const prefix = group.slice(0, pos);
    for (const suffix of group.slice(pos + 1).split(',')) {
      names.push(`${prefix}.${suffix}`);
    }
  }
  return names.toSorted();
}

export function labelForUrl(url) {
  if (typeof url !== 'string' || !url.includes('load.php')) return;
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return;
  }
  if (!RESOURCE_LOADER_PATH.test(parsed.pathname)) return;

  const only = parsed.searchParams.get('only');
  const modules = expandModuleNames(parsed.searchParams.get('modules') || '');
  if (modules.length === 1 && modules[0] === 'startup') {
    return 'load.php[startup]';
  }
  const kind = only === 'styles' ? 'styles' : 'scripts';
  if (modules.length === 1) {
    return `load.php[${kind}:${modules[0]}]`;
  }
  if (modules.length > 1 && only === 'scripts') {
    return `load.php[scripts:${modules[0]}]`;
  }
  return `load.php[${kind}]`;
}

function moduleBoundaries(source) {
  const boundaries = [];
  for (const match of source.matchAll(MODULE_DELIMITER)) {
    boundaries.push({
      name: match[1],
      version: match[2],
      start: match.index
    });
  }
  return boundaries;
}

// Map a source position from a Chrome trace stack frame to the module
// that owns that byte of the bundle, for per-module CPU attribution.
// Trace event locations (FunctionCall args.data and stackTrace frames)
// are 1-based for both lineNumber and columnNumber — Blink adds 1 to
// V8's 0-based script positions when it emits devtools.timeline
// events. resolve() returns { name, version } when the position lands
// inside a named module, and undefined for the preamble or positions
// outside the source, so callers can bucket unattributable time
// separately. Returns undefined when the source contains no module
// delimiters (e.g. the startup bundle, which is plain JS).
export function resourceLoaderLocationResolver(source) {
  const boundaries = moduleBoundaries(source);
  if (boundaries.length === 0) return;

  const sourceLength = source.length;
  const lineOffsets = [0];
  for (
    let index = source.indexOf('\n');
    index !== -1;
    index = source.indexOf('\n', index + 1)
  ) {
    lineOffsets.push(index + 1);
  }

  return {
    resolve(lineNumber, columnNumber) {
      const line = lineNumber - 1;
      if (line < 0 || line >= lineOffsets.length) return;
      const offset = lineOffsets[line] + (columnNumber - 1);
      if (offset < boundaries[0].start || offset >= sourceLength) return;
      let low = 0;
      let high = boundaries.length - 1;
      while (low < high) {
        const mid = (low + high + 1) >> 1;
        if (boundaries[mid].start <= offset) {
          low = mid;
        } else {
          high = mid - 1;
        }
      }
      const { name, version } = boundaries[low];
      return { name, version };
    }
  };
}

// Intersect the per-byte coverage flags (painted, a Uint8Array where 1 =
// used) with the module boundaries in the bundle source. Module i spans
// [start_i, start_i+1); the last module ends at the end of the source.
// Bytes before the first delimiter go to a '(preamble)' bucket. Returns
// undefined when the source contains no delimiters.
export function resourceLoaderModuleCoverage(source, painted) {
  const boundaries = moduleBoundaries(source);
  if (boundaries.length === 0) return;

  if (boundaries[0].start > 0) {
    boundaries.unshift({ name: '(preamble)', version: '', start: 0 });
  }

  const modules = [];
  for (const [i, boundary] of boundaries.entries()) {
    const end =
      i + 1 < boundaries.length ? boundaries[i + 1].start : source.length;
    const totalBytes = end - boundary.start;
    let usedBytes = 0;
    for (let b = boundary.start; b < end; b++) {
      if (painted[b] === 1) usedBytes++;
    }
    const unusedBytes = totalBytes - usedBytes;
    modules.push({
      name: boundary.name,
      version: boundary.version,
      totalBytes,
      usedBytes,
      unusedBytes,
      unusedPercent: totalBytes > 0 ? (unusedBytes / totalBytes) * 100 : 0
    });
  }
  return modules.toSorted((a, b) => b.unusedBytes - a.unusedBytes);
}
