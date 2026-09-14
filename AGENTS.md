# Repository Guidance

## Compatibility

- Preserve the asynchronous `init()` and `parse()` API and token output format.
- Preserve CommonJS constructor imports and ESM default imports.
- This analyzer is Node-only and invokes an external MeCab command; do not add browser bundles.
- Keep Node.js runtime compatibility separate from development-tool requirements.
- Do not change the package version until preparing a release.

## Development

- Use `npm ci` for an unchanged lockfile; use `npm install` or `npm uninstall` for intentional dependency changes and commit the lockfile.
- Run `npm test` and `npm pack --dry-run` before submitting changes.
- Run `npm run test:integration` with real MeCab and a UTF-8 IPADIC-compatible dictionary; mocked tests do not replace this check.
- Edit `src/` and build configuration, not generated files in `lib/`.
- Write commit messages in English using Conventional Commits.
