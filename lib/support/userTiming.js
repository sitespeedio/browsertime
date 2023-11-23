export function filterAllowlisted(userTimings, allowlistRegex) {
  const allowed = new RegExp(allowlistRegex);
  userTimings.marks = userTimings.marks.filter(mark => allowed.test(mark.name));
  userTimings.measures = userTimings.measures.filter(measure =>
    allowed.test(measure.name)
  );
}
