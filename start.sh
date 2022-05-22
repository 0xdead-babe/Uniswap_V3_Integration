#!/bin/bash

source .env

ganache-cli --fork $MAINNET_RPC \
--unlock $USDC \
--unlock $UNISWAP_V3_ROUTER \
--unlock $DAI \
--unlock $WETH \
--unlock $WETH_WHALE \
--unlock $DAI_WHALE \
--unlock $FACTORY \
-l 100000000 \
--verbose
