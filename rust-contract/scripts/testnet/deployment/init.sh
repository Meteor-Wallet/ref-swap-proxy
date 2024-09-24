#!/bin/sh

export CONTRACT_ID=$(cat ../neardev/dev-account)
export REF_CONTRACT_ID=ref-finance-101.testnet

near call "$REF_CONTRACT_ID" storage_deposit --accountId $CONTRACT_ID --gas 300000000000000 --deposit 4
