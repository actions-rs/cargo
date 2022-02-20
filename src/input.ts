/**
 * Parse action input into a some proper thing.
 */

import { getInput } from "@actions/core";
import stringArgv from "string-argv";

// Parsed action input
export interface Input {
    command: string;
    toolchain?: string;
    args: string[];
    useCross: boolean;
}

export function get(): Input {
    const command = getInput("command", { required: true });
    const args = stringArgv(getInput("args"));
    let toolchain = getInput("toolchain");
    if (toolchain.startsWith("+")) {
        toolchain = toolchain.slice(1);
    }
    const useCross = getInput("use-cross") === "true";

    return {
        command: command,
        args: args,
        useCross: useCross,
        toolchain: toolchain || undefined,
    };
}
