/**
 * Parse action input into a some proper thing.
 */

import { input } from "action-core";

import stringArgv from "string-argv";

// Parsed action input
// export interface Input {
//    command: string;
//    toolchain?: string;
//    args: string[];
//    useCross: boolean;
// }

export function get() {
    const command = input.getInput("command", { required: true });
    const args = stringArgv(input.getInput("args"));
    let toolchain = input.getInput("toolchain");
    if (toolchain.startsWith("+")) {
        toolchain = toolchain.slice(1);
    }
    const useCross = input.getInputBool("use-cross");
    return {
        command,
        args,
        useCross,
        toolchain: toolchain || undefined,
    };
}
