#!/bin/sh
export HARVEST_MOON_CONTRACT_ID=$(cat ./neardev/dev-account)

sh sh_build.sh
echo "y" | near deploy $HARVEST_MOON_CONTRACT_ID ./build/moon_token.wasm --accountId $HARVEST_MOON_CONTRACT_ID
