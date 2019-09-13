/**
 * Parse action input into a some proper thing.
 */

import * as core from '@actions/core';
import * as exec from '@actions/exec';

import stringArgv from 'string-argv';

// Workaround for a GH bug: https://github.com/actions/toolkit/issues/127
//
// For input `all-features: true` it will generate the `INPUT_ALL-FEATURES: true`
// env variable, which looks too weird.
// Here we are trying to get proper name `INPUT_NO_DEFAULT_FEATURES` first,
// and if it does not exist, trying the `INPUT_NO-DEFAULT-FEATURES`
function getInput(name: string): string {
    const inputFullName = name.replace(/-/g, '_');
    let value = core.getInput(inputFullName);
    if (value.length > 0) {
        return value
    }

    return core.getInput(name)
}

function getInputBool(name: string): boolean {
    const value = getInput(name);
    if (value && (value == 'true' || value == '1')) {
        return true;
    } else {
        return false;
    }
}


// Parsed action input
export interface Input {
    command: string,
    toolchain?: string,
    args: string[],
    useCross: boolean,
}

export function parse(): Input {
    const command = getInput('command');
    const args = stringArgv(getInput('args'));
    let toolchain = getInput('toolchain');
    if (toolchain.startsWith('+')) {
        toolchain = toolchain.slice(1);
    }
    const useCross = getInputBool('use-cross');

    return {
        command: command,
        args: args,
        useCross: useCross,
        toolchain: toolchain || undefined
    }
}
