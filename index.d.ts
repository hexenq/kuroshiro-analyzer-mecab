import type { ExecOptions } from "node:child_process";

export = MecabAnalyzer;

declare class MecabAnalyzer {
    static readonly default: typeof MecabAnalyzer;

    constructor(options?: MecabAnalyzer.Options);
    init(): Promise<void>;
    parse(str?: string): Promise<MecabAnalyzer.Token[]>;
}

declare namespace MecabAnalyzer {
    interface Options {
        /** Trusted shell command. Takes precedence over dictPath. */
        command?: string;
        /** Trusted dictionary path, interpolated into the shell command. */
        dictPath?: string;
        execOptions?: ExecOptions;
    }

    interface Token {
        surface_form: string;
        pos: string;
        pos_detail_1: string;
        pos_detail_2: string;
        pos_detail_3: string;
        conjugated_type: string;
        conjugated_form: string;
        basic_form: string;
        /** Unknown words and synthetic space tokens may have no reading. */
        reading?: string;
        pronunciation?: string;
    }
}
