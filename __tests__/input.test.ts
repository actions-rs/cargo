import * as input from "../src/input";

const testEnvVars = {
    INPUT_COMMAND: "build",
    // There are few unnecessary spaces here to check that args parser works properly
    INPUT_ARGS:
        "   --release --target x86_64-unknown-linux-gnu    --no-default-features --features unstable       ",
    "INPUT_USE-CROSS": "true",
    INPUT_TOOLCHAIN: "+nightly",
};

describe("actions-rs/cargo/input", () => {
    beforeEach(() => {
        for (const key in testEnvVars)
            process.env[key] = testEnvVars[key as keyof typeof testEnvVars];
    });

    it("Parses action input into cargo input", () => {
        const result = input.get();

        expect(result.command).toBe("build");
        expect(result.args).toStrictEqual([
            "--release",
            "--target",
            "x86_64-unknown-linux-gnu",
            "--no-default-features",
            "--features",
            "unstable",
        ]);
        expect(result.useCross).toBe(true);
        expect(result.toolchain).toBe("nightly");
    });
});
