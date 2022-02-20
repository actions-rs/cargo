import { Cargo, get as getCargo } from "./cargo";
import { debug, endGroup } from "@actions/core";
import { tmpdir } from "os";
import { which } from "@actions/io";

export type Cross = Cargo;

export async function get(): Promise<Cross> {
    const path = await which("cross", true);
    return new Cargo(path);
}

export async function install(version?: string): Promise<Cross> {
    const cargo = await getCargo();

    // Somewhat new Rust is required to compile `cross`
    // (TODO: Not sure what version exactly, should clarify)
    // but if some action will set an override toolchain before this action called
    // (ex. `@ructions/toolchain` with `toolchain: 1.31.0`)
    // `cross` compilation will fail.
    //
    // In order to skip this problem and install `cross` globally
    // using the pre-installed system Rust,
    // we are going to jump to the tmpdir (skipping directory override that way)
    // install `cross` from there and then jump back.

    const cwd = process.cwd();
    process.chdir(tmpdir());

    try {
        const path = await cargo.installCached("cross", { version });
        return new Cargo(path);
    } finally {
        process.chdir(cwd);
        endGroup();
    }
}

export async function getOrInstall(): Promise<Cross> {
    try {
        return await get();
    } catch (error: unknown) {
        debug(String(error));
        return install();
    }
}
