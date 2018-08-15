# kuroshiro-analyzer-mecab
 
[![Build Status](https://travis-ci.com/hexenq/kuroshiro-analyzer-mecab.svg?branch=master)](https://travis-ci.org/hexenq/kuroshiro-analyzer-mecab)
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
You should have `mecab` and corresponding dictionary installed in your environment. And make sure that your have added `mecab` command to your `$PATH` environment variable. This analyzer will invoke `mecab` from command line when parsing.

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
