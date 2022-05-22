// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

import "@uniswap/v3-core/contracts/interfaces/callback/IUniswapV3FlashCallback.sol";
import "@uniswap/v3-core/contracts/libraries/LowGasSafeMath.sol";

import "@uniswap/v3-periphery/contracts/base/PeripheryPayments.sol";
import "@uniswap/v3-periphery/contracts/libraries/PoolAddress.sol";
import "@uniswap/v3-periphery/contracts/libraries/CallbackValidation.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

import {UniSwap} from "./UniSwap.sol";
import {KyberNetworkProxy as IKyberNetworkProxy} from "./interfaces/KyberNetworkProxy.sol";
import "hardhat/console.sol";

//refrence:https://www.youtube.com/watch?v=eM4UidkvB-o
//refrence: https://medium.com/coinmonks/tutorial-of-flash-swaps-of-uniswap-v3-73c0c846b822

//procedure
//borrow 1500 dai from dai/usdc pool
//contract doesn't borrow any usdc
//swap dai for uni on kyber network protocol
//swap uni for dai on uniswap
//pay back borrowed amount and send profit to deployer address

contract FlashSwap is
    IUniswapV3FlashCallback,
    PeripheryImmutableState,
    PeripheryPayments
{
    using LowGasSafeMath for uint256;
    using LowGasSafeMath for int256;

    address private constant router =
        0xE592427A0AEce92De3Edee1F18E0157C05861564;
    address private constant _WETH9 =
        0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address private constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address private constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address private constant _factory =
        0x1F98431c8aD98523631AE4a59f267346ea31F984;

    UniSwap public immutable swapper;

    event LOG(string message);

    struct FlashParams {
        address token0;
        address token1;
        uint24 fee1;
        uint256 amount0;
        uint256 amount1;
    }

    struct FlashCallbackData {
        uint256 amount0;
        uint256 amount1;
        address payer;
        PoolAddress.PoolKey poolKey;
    }

    constructor(UniSwap _swapAddress)
        PeripheryImmutableState(_factory, _WETH9)
    {
        swapper = _swapAddress;
    }

    function transferWrapperUniSwap(
        address _inputToken,
        address _outputToken,
        uint256 _amountSwap
    ) private returns (uint256) {
        //approve swapper to spend token
        TransferHelper.safeApprove(_inputToken, address(swapper), _amountSwap);
        //IERC20(_token1).approve(router, _amountSwap);
        uint256 amount_out = swapper.swapTokenMax(
            _inputToken,
            _outputToken,
            _amountSwap
        );
        return amount_out;
    }

    function uniswapV3FlashCallback(
        uint256 fee0,
        uint256 fee1,
        bytes calldata data
    ) external override {
        //decode params that was passed from flash function
        FlashCallbackData memory decoded = abi.decode(
            data,
            (FlashCallbackData)
        );
        //verify if callback is coming from original pool
        CallbackValidation.verifyCallback(factory, decoded.poolKey);

        //approve router to spend tokens

        address token0 = decoded.poolKey.token0; // DAI
        address token1 = decoded.poolKey.token1; // WETH
        uint256 amount_swap = decoded.amount0;

        // Dai -> usdc

        log_balances();
        uint256 amountOut1 = transferWrapperUniSwap(token0, USDC, amount_swap);

        log_balances();

        // USDC -> WETH
        uint256 amountOut2 = transferWrapperUniSwap(USDC, WETH9, amountOut1);

        log_balances();

        // WETH -> DAI

        uint256 finalSwap = transferWrapperUniSwap(WETH9, DAI, amountOut2);

        log_balances();

        uint256 amount0Owed = LowGasSafeMath.add(decoded.amount0, fee0);
        uint256 amount1Owed = LowGasSafeMath.add(decoded.amount1, fee1);

        if (amount0Owed > 0)
            pay(token0, address(this), msg.sender, amount0Owed);
        if (amount1Owed > 0)
            pay(token1, address(this), msg.sender, amount1Owed);
    }

    function initFlash(FlashParams memory params) external {
        PoolAddress.PoolKey memory poolKey = PoolAddress.PoolKey({
            token0: params.token0,
            token1: params.token1,
            fee: params.fee1
        });
        IUniswapV3Pool pool = IUniswapV3Pool(
            PoolAddress.computeAddress(factory, poolKey)
        );
        pool.flash(
            address(this),
            params.amount0,
            params.amount1,
            abi.encode(
                FlashCallbackData({
                    amount0: params.amount0,
                    amount1: params.amount1,
                    payer: msg.sender,
                    poolKey: poolKey
                })
            )
        );
    }

    function log_balances() private view {
        uint256 balance_weth = IERC20(_WETH9).balanceOf(address(this));
        uint256 balance_dai = IERC20(DAI).balanceOf(address(this));
        uint256 balance_usdc = IERC20(USDC).balanceOf(address(this));

        console.log(
            "WETH: %s.%s",
            balance_weth / 1e18,
            balance_weth - (balance_weth / 1e18) * 1e18
        );
        console.log(
            "DAI: %s.%s",
            balance_dai / 1e18,
            balance_dai - (balance_dai / 1e18) * 1e18
        );
        console.log(
            "USDC: %s.%s",
            balance_usdc / 1e6,
            balance_usdc - (balance_usdc / 1e6) * 1e6
        );
        console.log("---------------------------------------------");
    }
}
