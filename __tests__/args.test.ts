import * as args from '../src/args'

const testEnvVars = {
    INPUT_COMMAND: 'build',
    INPUT_ARGS: '--release --target x86_64-unknown-linux-gnu --no-default-features --features unstable',
    'INPUT_USE-CROSS': 'true',
    INPUT_TOOLCHAIN: '+nightly'
}

describe('actions-rs/check', () => {
    beforeEach(() => {
    for (const key in testEnvVars)
        process.env[key] = testEnvVars[key as keyof typeof testEnvVars]
    })

    it('Parses action input into cargo input', async () => {
        const result = args.parse();

        expect(result.command).toBe('build');
        expect(result.args).toStrictEqual([
            '--release',
            '--target',
            'x86_64-unknown-linux-gnu',
            '--no-default-features',
            '--features',
            'unstable'
        ]);
        expect(result.useCross).toBe(true);
        expect(result.toolchain).toBe('nightly');
    });
});
