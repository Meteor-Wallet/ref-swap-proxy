#!/bin/sh
export CONTRACT_ID=$(cat ../neardev/dev-account)

sh build.sh
echo "y" | near deploy $CONTRACT_ID ./build/meteor_ref_swap_proxy.wasm --accountId $CONTRACT_ID
