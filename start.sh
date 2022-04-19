#!/bin/bash

source .env

ganache-cli --fork $MAINNET_RPC \
--unlock $ACCOUNT_1 \
--unlock $ACCOUNT_2 \
--unlock $ACCOUNT_3 \
--unlock $UNISWAP_V3_ROUTER \
--unlock $DAI_CONTRACT \
--unlock $WETH9 \
--unlock $UNISWAP_V3_QUOTER 
