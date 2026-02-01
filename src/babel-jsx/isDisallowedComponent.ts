const disallowedNames: { [key: string]: true } = {
  Fragment: true,
  "React.Fragment": true,
  Suspense: true,
  "React.Suspense": true,
};

// React Three Fiber components use lowercase names that look like HTML but aren't
// They don't support DOM attributes like data-locatorjs
const r3fPatterns = [
  /^mesh$/,
  /^group$/,
  /^fog$/,
  /^color$/,
  /^ambientLight$/,
  /^directionalLight$/,
  /^pointLight$/,
  /^spotLight$/,
  /Geometry$/,
  /Material$/,
  /Helper$/,
  /Controls$/,
  /Camera$/,
];

export function isDisallowedComponent(name: string) {
  if (disallowedNames[name]) return true;
  if (name.match(/Provider$/)) return true;
  // Check R3F patterns
  for (const pattern of r3fPatterns) {
    if (pattern.test(name)) return true;
  }
  return false;
}
