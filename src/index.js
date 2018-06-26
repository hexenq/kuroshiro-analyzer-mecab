// Check where we are
import Mecab from "mecab-async";

/**
 * Mecab Analyzer
 */
class Analyzer {
    /**
     * Constructor
     */
    constructor() {
        this._analyzer = null;
    }

    /**
     * Initialize the analyzer
     * @returns {Promise} Promise object represents the result of initialization
     */
    init() {
        return new Promise((resolve, reject) => {
            if (this._analyzer == null) {
                this._analyzer = new Mecab();
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
     * @param {*} str input string
     * @returns {Promise} Promise object represents the result of parsing
     * @example The standard of the output
     * [{
     *     surface_form: '黒白',    // [Required] 表層形
     *     pos: '名詞',               // 品詞 (Part Of Speech)
     *     pos_detail_1: '一般',      // 品詞細分類1
     *     pos_detail_2: '*',        // 品詞細分類2
     *     pos_detail_3: '*',        // 品詞細分類3
     *     conjugated_type: '*',     // 活用型
     *     conjugated_form: '*',     // 活用形
     *     basic_form: '黒白',      // 基本形
     *     reading: 'クロシロ',       // [Required] 読み
     *     pronunciation: 'クロシロ',  // 発音
     *     verbose: { }               // Other properties (Customized)
     * }]
     */
    parse(str = "") {
        return new Promise((resolve, reject) => {
            this._analyzer.parseFormat(str, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    }
}

export default Analyzer;
