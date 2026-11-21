const code = '*.{js,jsx,ts,tsx,mjs,cjs}';
// One glob per file: lint-staged runs globs in parallel, and two tools rewriting one file race.
export default {
  [code]: ['eslint --fix', 'prettier --write'],
  [`!(${code})`]: 'prettier --write --ignore-unknown',
};
