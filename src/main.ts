import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';

import * as input from './input';

async function getCross(): Promise<string> {
    try {
        return await io.which('cross', true);
    } catch (error) {
        core.warning('Unable to find cross, installing it now');
    }

    try {
        // Latest `cross` (0.1.15) is kinda broken right now,
        // using hardcoded version till the fix lands
        // https://github.com/rust-embedded/cross/issues/306
        await exec.exec('cargo', ['install', '--version', '0.1.14', 'cross']);
    } catch (error) {
        core.setFailed(error.message);
    }

    return 'cross';
}

async function run() {
    const actionInput = input.parse();

    let program;
    if (actionInput.useCross) {
        program = await getCross();
    } else {
        program = 'cargo';
    }

    let args: string[] = [actionInput.command];
    if (actionInput.toolchain) {
        args.push(`+${actionInput.toolchain}`);
    }

    args = args.concat(actionInput.args);
    console.log(program, args);

    try {
        await exec.exec(program, args);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
