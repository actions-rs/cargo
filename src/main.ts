import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';

import * as input from './input';

const CROSS_REV: string = '69b8da7da287055127812c9e4b071756c2b98545';

async function getCross(): Promise<string> {
    try {
        return await io.which('cross', true);
    } catch (error) {
        core.debug('Unable to find cross, installing it now');
    }

    try {
        core.startGroup('Install cross');
        core.warning('Git version of cross will be installed, \
see https://github.com/actions-rs/cargo/issues/1');
        await exec.exec('cargo', [
            'install',
            '--rev',
            CROSS_REV,
            '--git',
            'https://github.com/rust-embedded/cross.git'
        ]);
    } catch (error) {
        core.setFailed(error.message);
        throw new Error(error);
    } finally {
        core.endGroup();
    }

    // Expecting it to be in PATH already
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
    args.push(actionInput.command);
    args = args.concat(actionInput.args);

    try {
        await exec.exec(program, args);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
