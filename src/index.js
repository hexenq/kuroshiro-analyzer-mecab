// Check where we are
let isNode = false;
const isBrowser = (typeof window !== "undefined");
if (!isBrowser && typeof module !== "undefined" && module.exports) {
    isNode = true;
}

/**
 * Mecab Analyzer
 */
class Analyzer {
    /**
     * Constructor
     */
    constructor() {
        this._analyzer = null;
        // Variable Statement
        // ...
        //  if(isNode) { ... }
        //  else { ... }
        // ...
    }

    /**
     * Initialize the analyzer
     * @returns {Promise} Promise object represents the result of initialization
     */
    init() {
        return new Promise((resolve, reject) => {
            if (this._analyzer == null) {
                // Initialize the analyzer
                // ...
                // When finished, set new analyzer and call resolve
                this._analyzer = {
                    analyze: () => [{
                        surface_form: "黒白",
                        reading: "クロシロ"
                    }]
                };
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
            // Parse the input string
            // ...
            const result = this._analyzer.analyze();
            resolve(result);
        });
    }
}

export default Analyzer;
