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

// Intersect the per-byte coverage flags (painted, a Uint8Array where 1 =
// used) with the module boundaries in the bundle source. Module i spans
// [start_i, start_i+1); the last module ends at the end of the source.
// Bytes before the first delimiter go to a '(preamble)' bucket. Returns
// undefined when the source contains no delimiters.
export function resourceLoaderModuleCoverage(source, painted) {
  const boundaries = [];
  for (const match of source.matchAll(MODULE_DELIMITER)) {
    boundaries.push({
      name: match[1],
      version: match[2],
      start: match.index
    });
  }
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
