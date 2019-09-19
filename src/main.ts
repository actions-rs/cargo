const os = require('os');
const process = require('process');

import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';

import * as input from './input';

const CROSS_REV: string = '69b8da7da287055127812c9e4b071756c2b98545';

async function getCargo(): Promise<string> {
    try {
        return await io.which('cargo', true);
    } catch (error) {
        core.info('cargo is not installed by default for some virtual environments, \
see https://help.github.com/en/articles/software-in-virtual-environments-for-github-actions');
        core.info('To install it, use this action: https://github.com/actions-rs/toolchain');

        throw error;
    }
}

async function getCross(cargoPath: string): Promise<string> {
    try {
        return await io.which('cross', true);
    } catch (error) {
        core.debug('Unable to find cross, installing it now');
    }

    // Somewhat new Rust is required to compile `cross`
    // (TODO: Not sure what version exactly, should clarify)
    // but if some action will set an override toolchain before this action called
    // (ex. `@actions-rs/toolchain` with `toolchain: 1.31.0`)
    // `cross` compilation will fail.
    //
    // In order to skip this problem and install `cross` globally
    // using the pre-installed system Rust,
    // we are going to jump to the tmpdir (skipping directory override that way)
    // install `cross` from there and then jump back.

    const cwd = process.cwd();
    process.chdir(os.tmpdir());

    try {
        core.startGroup('Install cross');
        core.warning('Git version of cross will be installed, \
see https://github.com/actions-rs/cargo/issues/1');
        await exec.exec(cargoPath, [
            'install',
            '--rev',
            CROSS_REV,
            '--git',
            'https://github.com/rust-embedded/cross.git'
        ]);
    } catch (error) {
        throw error;
    } finally {
        // It is important to chdir back!
        process.chdir(cwd);
        core.endGroup();
    }

    // Expecting it to be in PATH already
    return 'cross';
}

async function run(): Promise<void> {
    const actionInput = input.parse();
    const cargo = await getCargo();

    let program;
    if (actionInput.useCross) {
        program = await getCross(cargo);
    } else {
        program = cargo;
    }

    let args: string[] = [];
    if (actionInput.toolchain) {
        args.push(`+${actionInput.toolchain}`);
    }
    args.push(actionInput.command);
    args = args.concat(actionInput.args);

    await exec.exec(program, args);
}

async function main(): Promise<void> {
    try {
        await run();
    } catch (error) {
        core.setFailed(error.message);
    }
}

main();
