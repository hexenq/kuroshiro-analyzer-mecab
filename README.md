# kuroshiro-analyzer-mecab
 
[![CI](https://github.com/hexenq/kuroshiro-analyzer-mecab/actions/workflows/ci.yml/badge.svg)](https://github.com/hexenq/kuroshiro-analyzer-mecab/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/kuroshiro-analyzer-mecab.svg)](http://badge.fury.io/js/kuroshiro-analyzer-mecab)

<table>
    <tr>
        <td>Package</td>
        <td colspan=2>kuroshiro-analyzer-mecab</td>
    </tr>
    <tr>
        <td>Description</td>
        <td colspan=2>mecab morphological analyzer for <a href="https://github.com/hexenq/kuroshiro">kuroshiro</a>.</td>
    </tr>
    <tr>
        <td rowspan=2>Compatibility</td>
        <td>Node</td>
        <td>22 or later</td>
    </tr>
    <tr>
        <td>Browser</td>
        <td>✗</td>
    </tr>
</table>

## Pre-requisite
Install `mecab` and a UTF-8 IPADIC-compatible dictionary, and add the `mecab` command to your `PATH`. This analyzer invokes the command when parsing; `init()` only configures the adapter and does not check whether the executable or dictionary is available.

The underlying `mecab-async` package uses shell commands and POSIX-style quoting. Linux/macOS are the intended command-line environments; native Windows shell compatibility is not covered by this package's tests. On Windows, use a Linux Node.js and MeCab environment inside WSL.

For install instructions of `mecab`, you could check the official website of mecab from [here](http://taku910.github.io/mecab/#install).

## Install
```sh
$ npm install kuroshiro-analyzer-mecab@beta
```

The stable 1.x release remains available without the `@beta` tag.

### Migrating from 1.x

Version 2 requires Node.js 22 or later. CommonJS constructor imports, ESM default
imports, the asynchronous `init()` / `parse()` API, and the IPADIC token format
remain available. This analyzer runs only in Node.js and requires an external
MeCab executable and a UTF-8 IPADIC-compatible dictionary.

## Usage with kuroshiro
### Configure analyzer
This analyzer utilizes [mecab](http://taku910.github.io/mecab/) morphological analyzer. 

The [mecab-ipadic-neologd](https://github.com/neologd/mecab-ipadic-neologd) dictionary is recommanded which includes many neologisms (new word) and periodically updated.

```js
import MecabAnalyzer from "kuroshiro-analyzer-mecab";

const analyzer = new MecabAnalyzer();

await kuroshiro.init(analyzer);
```

CommonJS is also supported:

```js
const MecabAnalyzer = require("kuroshiro-analyzer-mecab");
```

### TypeScript

The 2.0 prerelease includes declarations for the constructor, options, and tokens.
Install `@types/node` in TypeScript projects for the Node.js execution options:

```sh
npm install --save-dev @types/node
```

```ts
import MecabAnalyzer from "kuroshiro-analyzer-mecab";

const options: MecabAnalyzer.Options = { execOptions: { timeout: 10000 } };
const analyzer = new MecabAnalyzer(options);
await analyzer.init();
const tokens: MecabAnalyzer.Token[] = await analyzer.parse("日本語");
const readings = tokens.map(token => token.reading ?? token.surface_form);
```

Unknown words and space tokens may have no `reading` or `pronunciation`.
MeCab tokens do not include kuromoji's `verbose` metadata.
For TypeScript compiled to CommonJS, use a default import with interop enabled,
or `import MecabAnalyzer = require("kuroshiro-analyzer-mecab")`.
Native Node ESM and bundler module resolution also support the default import.

### Initialization Parameters
__Example:__
```js
const analyzer = new MecabAnalyzer({
    dictPath: "/usr/lib/mecab/dic/mecab-ipadic-neologd/",
    execOptions: {
        maxBuffer: 200 * 1024,
        timeout: 0
    }
});
```
- `command`: *Optional* mecab command (may have arguments). If set, the param `dictPath` is ignored
- `dictPath`: *Optional* Path of the dictionary mecab used
- `execOptions`: *Optional* The exec options to run mecab command. Example as below:
```js
{
    // Largest amount of data in bytes allowed on stdout or stderr. see https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback.
    maxBuffer: 200 * 1024,

    // Timeout. see https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback.
    timeout: 0
}
``` 

`command` and `dictPath` are trusted configuration, not user input: the dependency invokes a shell and the adapter interpolates `dictPath` into the command. For dictionary paths containing spaces, supply a properly quoted `command` instead. Use MeCab's default IPADIC output format; formats such as `-Owakati` or `-Ochasen` do not match this adapter's field mapping.

## Development

Use Node.js 22.22.2+ on the 22.x line, 24.15.0+ on the 24.x line, or 26+ for development. These stricter requirements come from development tools; the published library requires Node.js 22+. Keep version changes for the release process.

```sh
npm ci
npm test
npm pack --dry-run
```

Use `npm install <package>` or `npm uninstall <package>` when changing dependencies, and commit the updated lockfile. Builds generate CommonJS in `lib/`; `npm pack` rebuilds it automatically. Write commit messages in English using Conventional Commits.

`npm test` checks the adapter with a mocked backend, verifies CommonJS and native ESM default imports from the packed package, and checks TypeScript declarations using CommonJS, native ESM, and bundler resolution. It also runs the compiled Node consumers against empty and space-only input. It does not require a MeCab installation. To exercise real command execution, install MeCab and a UTF-8 IPADIC-compatible dictionary, build the package, then run:

```sh
npm run build
npm run test:integration
```

You can set `MECAB_DICT_PATH` or `MECAB_COMMAND` for the integration test (`MECAB_COMMAND` takes precedence). A missing executable or incompatible dictionary causes the integration test to fail, not skip. CI runs both test layers on Node.js 22.22.2, 24.15.0, and 26 with MeCab and UTF-8 IPADIC.

CI also packs this analyzer and a pinned kuroshiro 2.0 beta core into an isolated consumer, then checks explicit expected conversions through CommonJS and native ESM imports using real MeCab. Update the pinned core revision when changing the tested core.

For an optional release compatibility evaluation, install the desired published analyzer version under an npm alias in that same consumer directory. Set `MECAB_CONSUMER_DIR` to the directory and `MECAB_BASELINE_PACKAGE` to the alias, then run `node test/joint.cjs`. This applies the same expected conversions to the selected baseline; normal CI does not install or require a historical analyzer version.
