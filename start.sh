#!/bin/bash

source .env

ganache --fork $MAINNET_RPC \
--unlock $USDC \
--unlock $UNISWAP_V3_ROUTER \
--unlock $DAI \
--unlock $WETH \
--unlock $WETH_WHALE \
--unlock $DAI_WHALE \
--unlock $FACTORY \
--unlock $POOL \
-l 100000000 \
-g 36279342005 \
--verbose
