import { Input, get } from "./input";
import { get as getCargo } from "./cargo";
import { getOrInstall as getOrInstallCross } from "./cross";
import { join } from "path";
import { setFailed } from "@actions/core";

export async function run(actionInput: Input): Promise<void> {
    let program;
    if (actionInput.useCross) {
        program = await getOrInstallCross();
    } else {
        program = await getCargo();
    }

    const args: string[] = [];
    if (actionInput.toolchain) {
        args.push(`+${actionInput.toolchain}`);
    }
    args.push(actionInput.command);

    await program.call(args.concat(actionInput.args));
}

async function main(): Promise<void> {
    const matchersPath = join(__dirname, ".matchers");
    console.log(`::add-matcher::${join(matchersPath, "rust.json")}`);

    const actionInput = get();

    try {
        await run(actionInput);
    } catch (error) {
        setFailed((<Error>error).message);
    }
}

void main();
