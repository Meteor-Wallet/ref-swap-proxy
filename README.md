# Introduction

This is a contract that allows wallet developer to charge some fee to users while performing token swap.

It is designed to use Ref Exchange as the target swapping DEX

## Pre-requisites

-   node & npm installed
-   rust & cargo installed
-   near-cli installed
-   cargo near installed

## How to use this?

For testnet:

```shell
git clone git@github.com:Meteor-Wallet/ref-swap-proxy.git
cd "ref-swap-proxy"
npm install
npm run contract:build
npm run dev
```

---

For mainnet, runs:

```shell
npm run contract:build
npm run dev:mainnet
```
