# Rust `cargo` Action

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
          toolchain: nightly
          arguments: --release --all-features
      - uses: actions-rs/cargo@v1
        with:
          command: test
          toolchain: nightly
          arguments: --all-targets
```

## Inputs

* `command` (*required*) - Cargo command to run (ex. `check` or `build`)
* `toolchain` - Rust toolchain to use (without the `+` sign, ex. `nightly`)
* `args` - Arguments for the cargo command
* `use-cross` - Use [`cross`](https://github.com/rust-embedded/cross) instead of `cargo` (default: `false`)

## Why?

Why is it needed when you can just do the `-run: cargo build` step?

Because it can call [cross](https://github.com/rust-embedded/cross) instead of `cargo`
if needed. If `cross` is not installed, it will be installed automatically on a first call.

In a future this Action might be available to install other cargo subcommands on demand too.
