// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

import "./interfaces/ISwapRouter.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract UniSwap {
    address private constant router = 0xE592427A0AEce92De3Edee1F18E0157C05861564;
    address private constant daiToken = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address private constant WETH9 = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address private constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;

    ISwapRouter public uniswapRouter = ISwapRouter(router);

    function swapTokenMax(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn
    ) external returns (uint256) {
        
        IERC20(_tokenIn).transferFrom(msg.sender, address(this), _amountIn);
        IERC20(_tokenIn).approve(router, _amountIn);

        uint256 amountOut = uniswapRouter.exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: _tokenIn,
                tokenOut: _tokenOut,
                fee: 3000,
                recipient: msg.sender,
                deadline: block.timestamp,
                amountIn: _amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            })
        );

        return amountOut;
    }
}
