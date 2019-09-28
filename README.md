# Rust `cargo` Action

![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)
[![Gitter](https://badges.gitter.im/actions-rs/community.svg)](https://gitter.im/actions-rs/community)

This GitHub Action runs specified [`cargo`](https://github.com/rust-lang/cargo)
command on a Rust language project.

## Example workflow

```yaml
on: [push]

name: CI

jobs:
  build_and_test:
    name: Rust project
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@master
      - uses: actions-rs/cargo@v1
        with:
          command: build
          args: --release --all-features
```

See [additional recipes here](https://github.com/actions-rs/meta).

## Inputs

| Name        | Required | Description                                                              | Type   | Default |
| ------------| :------: | -------------------------------------------------------------------------| ------ | --------|
| `command`   | ✓        | Cargo command to run, ex. `check` or `build`                             | string |         |
| `toolchain` |          | Rust toolchain name to use                                               | string |         |
| `args`      |          | Arguments for the cargo command                                          | string |         |     
| `use-cross` |          | Use [`cross`](https://github.com/rust-embedded/cross) instead of `cargo` | bool   | false   |

## Virtual environments

Note that `cargo` is not available by default for some [virtual environments](https://help.github.com/en/articles/software-in-virtual-environments-for-github-actions);
for example, as for 2019-09-15, `macOS` env is missing it.

You can use [`actions-rs/toolchain`](https://github.com/actions-rs/toolchain)
to install the Rust toolchain with `cargo` included.

## Cross

In order to make cross-compilation an easy process,
this Action can install [cross](https://github.com/rust-embedded/cross)
tool on demand if `use-cross` input is enabled; `cross` executable will be invoked
then instead of `cargo` automatically.

All consequent calls of this Action in the same job will use the same `cross` installed.

```yaml
on: [push]

name: ARMv7 build

jobs:
  linux_arm7:
    name: Linux ARMv7
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@master
      - uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          target: armv7-unknown-linux-gnueabihf
          override: true
      - uses: actions-rs/cargo@v1
        with:
          use-cross: true
          command: build
          args: --target armv7-unknown-linux-gnueabihf
```
