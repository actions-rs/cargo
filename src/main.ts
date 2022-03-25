import path from "path";

import * as core from "@actions/core";

import * as input from "./input";
import { Cargo, Cross } from "@actions-rs/core";

export async function run(
    actionInput: input.Input
): Promise<{ code: number; stdout: string; stderr: string }> {
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

    let stdout = "";
    let stderr = "";

    const options = {
        listeners: {
            stdout: (data: Buffer) => {
                stdout += data.toString();
            },
            stderr: (data: Buffer) => {
                stderr += data.toString();
            },
        },
    };

    const code = await program.call(args, options);

    return { code, stdout, stderr };
}

async function main(): Promise<void> {
    const matchersPath = path.join(__dirname, ".matchers");
    console.log(`::add-matcher::${path.join(matchersPath, "rust.json")}`);

    const actionInput = input.get();

    try {
        const { stdout, stderr } = await run(actionInput);
        core.startGroup("setting outputs");
        console.log("stdout: ", stdout.slice(0, 50), "...");
        core.setOutput("stdout", stdout);
        console.log("stderr: ", stderr.slice(0, 50), "...");
        core.setOutput("stderr", stderr);
        core.endGroup();
    } catch (error) {
        core.setFailed((<Error>error).message);
    }
}

void main();
