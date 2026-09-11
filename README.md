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
        <td>✓ (>=6)</td>
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
$ npm install kuroshiro-analyzer-mecab
```

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

Use Node.js 22.13+ on the 22.x line or Node.js 24+ for development. This applies to development tools, not the published library's Node.js runtime compatibility. Keep version changes for the release process.

```sh
npm ci
npm test
npm pack --dry-run
```

Use `npm install <package>` or `npm uninstall <package>` when changing dependencies, and commit the updated lockfile. Builds generate CommonJS in `lib/`; `npm pack` rebuilds it automatically. Write commit messages in English using Conventional Commits.

`npm test` checks the adapter with a mocked backend and verifies CommonJS, native ESM default imports and ES2015 output syntax. It does not require a MeCab installation. To exercise real command execution, install MeCab and a UTF-8 IPADIC-compatible dictionary, build the package, then run:

```sh
npm run build
npm run test:integration
```

You can set `MECAB_DICT_PATH` or `MECAB_COMMAND` for the integration test (`MECAB_COMMAND` takes precedence). A missing executable or incompatible dictionary causes the integration test to fail, not skip. CI runs both test layers on Node.js 22 and 24 with MeCab and UTF-8 IPADIC. Actual legacy Node.js runtime checks are still needed before release; syntax checks alone are not sufficient.

CI also packs this analyzer and a pinned maintained kuroshiro core into an isolated consumer, then compares real MeCab tokens and conversions against the published `kuroshiro-analyzer-mecab@1.0.1`. The joint check covers CommonJS and native ESM imports; update the pinned core revision and tarball versions in the workflow when changing the compatibility baseline.
