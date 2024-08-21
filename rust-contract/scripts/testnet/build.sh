#!/bin/sh
set -e
RUSTFLAGS='-C link-arg=-s' cargo build --target wasm32-unknown-unknown --release
cp ../../target/wasm32-unknown-unknown/release/meteor_swap_proxy.wasm build/meteor-swap-proxy.wasm