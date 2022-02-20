import {
    ReserveCacheError,
    ValidationError,
    restoreCache,
    saveCache,
} from "@actions/cache";
import core, { endGroup, info, startGroup } from "@actions/core";
import { dirname, join } from "path";
import { HttpClient } from "@actions/http-client";
import { ITypedResponse } from "@actions/http-client/interfaces";
import { exec } from "@actions/exec";
import { which } from "@actions/io";

export async function resolveVersion(crate: string): Promise<string> {
    const url = `https://crates.io/api/v1/crates/${crate}`;
    const client = new HttpClient("@ructions (https://github.com/ructions/)");

    const resp: ITypedResponse<{
        crate: {
            newest_version: string;
        };
    }> = await client.getJson(url);
    if (resp.result == null) {
        throw new Error("Unable to fetch latest crate version");
    }

    return resp.result.crate.newest_version;
}

export async function get(): Promise<Cargo> {
    try {
        const path = await which("cargo", true);
        return new Cargo(path);
    } catch (error) {
        core.error(
            "cargo is not installed by default for some virtual environments, \
see https://help.github.com/en/articles/software-in-virtual-environments-for-github-actions"
        );
        core.error(
            "To install it, use this action: https://github.com/actions-rs/toolchain"
        );

        throw error;
    }
}

export class Cargo {
    constructor(private readonly path: string) {}

    call<K extends string, V>(
        args: string[],
        options?: Record<K, V>
    ): Promise<number> {
        return exec(this.path, args, options);
    }

    async installCached(
        crate: string,
        {
            version,
            primaryKey,
            restoreKeys = [],
        }: {
            version?: string;
            primaryKey?: string;
            restoreKeys?: string[];
        }
    ): Promise<string> {
        if (version === "latest") {
            version = await resolveVersion(crate);
        }
        if (!primaryKey) {
            return await this.install(crate, version);
        }
        const paths = [join(dirname(this.path))];
        const versionKey = version ?? "latest";
        const crateKeyBase = `${crate}-${versionKey}`;
        const crateKey = `${crateKeyBase}-${primaryKey}`;
        const crateRestoreKeys = restoreKeys.map(
            (key) => `${crateKeyBase}-${key}`
        );
        const cacheKey = await restoreCache(paths, crateKey, crateRestoreKeys);
        if (cacheKey) {
            info(`Using cached \`${crate}\` with version ${versionKey}`);
            return crate;
        }
        const res = await this.install(crate, version);
        info(`Caching \`${crate}\` with key ${crateKey}`);
        try {
            await saveCache(paths, crateKey);
        } catch (error: unknown) {
            if (error instanceof ValidationError) {
                throw error;
            }
            if (error instanceof ReserveCacheError) {
                info(error.message);
            } else {
                const { message } = error as Error;
                info(`[warning]${message}`);
            }
        }
        return res;
    }

    async install(crate: string, version?: string): Promise<string> {
        const args = ["install"];
        if (version) {
            args.push("--version", version);
        }
        args.push(crate);

        try {
            startGroup(`Installing "${crate} = ${version ?? "latest"}"`);
            await this.call(args);
        } finally {
            endGroup();
        }

        return crate;
    }

    async findOrInstall(crate: string, version?: string): Promise<string> {
        try {
            return await which(crate, true);
        } catch (error) {
            info(`\`${crate}\` is not installed, installing it now`);
        }
        return this.installCached(crate, { version });
    }
}
