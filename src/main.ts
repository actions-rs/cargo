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
        await exec.exec('cargo', ['install', 'cross']);
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

    let args: string[] = [];
    if (actionInput.toolchain) {
        args.push(`+${actionInput.toolchain}`);
    }

    args = args.concat(actionInput.args);

    try {
        await exec.exec(program, args);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
