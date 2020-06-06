import path from "path";

import * as core from "@actions/core";

import * as input from "./input";
import { Cargo, Cross } from "@actions-rs/core";

export async function run(actionInput: input.Input): Promise<void> {
    let program;
    if (actionInput.useCross) {
        program = await Cross.getOrInstall();
    } else {
        program = await Cargo.get();
    }

    let args: string[] = [];
    if (actionInput.toolchain) {
        args.push(`+${actionInput.toolchain}`);
    }
    args.push(actionInput.command);
    args = args.concat(actionInput.args);

    await program.call(args);
}

async function main(): Promise<void> {
    const matchersPath = path.join(__dirname, ".matchers");
    console.log(`::add-matcher::${path.join(matchersPath, "rust.json")}`);

    const actionInput = input.get();

    try {
        await run(actionInput);
    } catch (error) {
        core.setFailed((<Error>error).message);
    }
}

void main();
