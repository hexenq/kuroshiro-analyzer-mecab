// Check where we are
import Mecab from "mecab-async";

/**
 * Mecab Analyzer
 */
class Analyzer {
    /**
     * Constructor
     * @param {string} [command] mecab command. If set, the param `dictPath` is ignored.
     * @param {string} [dictPath] Path of the dictionary mecab used.
     * @param {Object} [execOptions] The exec options to run mecab command.
     * @param {Number} [execOptions.maxBuffer] Largest amount of data in bytes allowed on stdout or stderr. see https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback.
     * @param {Number} [execOptions.timeout] Timeout. see https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback.
     */
    constructor({ command, dictPath, execOptions } = {}) {
        this._analyzer = null;
        this._execOptions = execOptions || {};
        if (command) {
            this._command = command;
        }
        else if (dictPath) {
            this._command = `mecab -d ${dictPath}`;
        }
        else {
            this._command = "mecab";
        }
    }

    /**
     * Initialize the analyzer
     * @returns {Promise} Promise object represents the result of initialization.
     */
    init() {
        return new Promise((resolve, reject) => {
            if (this._analyzer == null) {
                this._analyzer = new Mecab();
                this._analyzer.command = this._command;
                this._analyzer.options = this._execOptions;
                this._analyzer.parser = data => ({
                    surface_form: data[0],
                    pos: data[1],
                    pos_detail_1: data[2],
                    pos_detail_2: data[3],
                    pos_detail_3: data[4],
                    conjugated_type: data[5],
                    conjugated_form: data[6],
                    basic_form: data[7],
                    reading: data[8],
                    pronunciation: data[9]
                });
                resolve();
            }
            else {
                reject(new Error("This analyzer has already been initialized."));
            }
        });
    }

    /**
     * Parse the given string
     * @param {*} str input string.
     * @returns {Promise} Promise object represents the result of parsing.
     * @example The standard of the output.
     * [{
     *     surface_form: '黒白',    // [Required] 表層形
     *     pos: '名詞',               // 品詞 (Part Of Speech)
     *     pos_detail_1: '一般',      // 品詞細分類1
     *     pos_detail_2: '*',        // 品詞細分類2
     *     pos_detail_3: '*',        // 品詞細分類3
     *     conjugated_type: '*',     // 活用型
     *     conjugated_form: '*',     // 活用形
     *     basic_form: '黒白',      // 基本形
     *     reading: 'クロシロ',       // [Required if japanese token] 読み
     *     pronunciation: 'クロシロ',  // 発音
     *     verbose: { }               // Other properties (Customized)
     * }]
     */
    parse(str = "") {
        const parseToken = (token) => {
            if (token === "") return Promise.resolve([]);
            return new Promise((resolve, reject) => {
                this._analyzer.parseFormat(token, (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });
        };
        return new Promise((resolve, reject) => {
            const tokens = str.split(" ");
            Promise.all(tokens.map(parseToken)).then((results) => {
                let result = [];
                for (let i = 0; i < results.length; i++) {
                    if (i === results.length - 1) {
                        result = result.concat(results[i]);
                    }
                    else {
                        result = result.concat(results[i]);
                        result.push({
                            surface_form: " ",
                            pos: "記号",
                            pos_detail_1: "空白",
                            pos_detail_2: "*",
                            pos_detail_3: "*",
                            conjugated_type: "*",
                            conjugated_form: "*",
                            basic_form: "*"
                        });
                    }
                }
                resolve(result);
            }).catch(err => reject(err));
        });
    }
}

export default Analyzer;
