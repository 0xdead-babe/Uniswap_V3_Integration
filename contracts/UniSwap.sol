// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

import "./interfaces/ISwapRouter.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract UniSwap {
    address private constant router =
        0xE592427A0AEce92De3Edee1F18E0157C05861564;
    address private constant daiToken =
        0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address private constant WETH9 = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address private constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;

    ISwapRouter public uniswapRouter = ISwapRouter(router);

    function convertExactEthToDai(address _recipient) external payable {
        require(msg.value > 0, "Must pass non 0 ETH amount");

        uint256 deadline = block.timestamp; //prone to manipulation pass from frontend
        address tokenIn = WETH9;
        address tokenOut = daiToken;
        uint24 fee = 3000;
        address recipient = _recipient;
        uint256 amountIn = msg.value;
        uint256 amountOutMinimum = 1;
        uint160 sqrtPriceLimitX96 = 0;

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams(
                tokenIn,
                tokenOut,
                fee,
                recipient,
                deadline,
                amountIn,
                amountOutMinimum,
                sqrtPriceLimitX96
            );

        uniswapRouter.exactInputSingle{value: msg.value}(params);
    }

    function convertExactDaiToEth(uint256 _daiAmount, address _recipient)
        external
    {
        require(_daiAmount > 0, "Dai amount must be greater than zero");

        //transfer required amount of DAI to this contract

        IERC20(daiToken).transferFrom(msg.sender, address(this), _daiAmount);
        IERC20(daiToken).approve(router, _daiAmount);

        uint256 deadline = block.timestamp;
        address tokenIn = daiToken;
        address tokenOut = WETH9;
        uint24 fee = 3000;
        address recipient = _recipient;
        uint256 amountIn = _daiAmount;
        uint256 amountOutMinimum = 0;
        uint160 sqrtPriceLimitX96 = 0;

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams(
                tokenIn,
                tokenOut,
                fee,
                recipient,
                deadline,
                amountIn,
                amountOutMinimum,
                sqrtPriceLimitX96
            );

        uniswapRouter.exactInputSingle(params);
    }

    //multi hop swap
    //swap using intermediary pool
    //swap DAI TO USDC AND TO WETH9

    function exactInputMultiHop(uint256 _amountIn, address _recipient)
        external
    {
        IERC20(daiToken).transferFrom(msg.sender, address(this), _amountIn);
        IERC20(daiToken).approve(router, _amountIn);

        uint24 fee = 3000;

        ISwapRouter.ExactInputParams memory params = ISwapRouter
            .ExactInputParams({
                path: abi.encodePacked(daiToken, fee, USDC, fee, WETH9),
                recipient: _recipient,
                deadline: block.timestamp,
                amountIn: _amountIn,
                amountOutMinimum: 0
            });

        uniswapRouter.exactInput(params);
    }

    //generalized swapper function
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
