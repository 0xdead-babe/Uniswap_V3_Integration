const BN = require("bn.js");

const UniSwap = artifacts.require("UniSwap");
const IERC20 = artifacts.require("IERC20");


contract("Uniswap", (accounts) => {
    const DAI_CONTRACT = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const WETH9 = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

    const TO = accounts[5];
    const FROM_ACCOUNT = accounts[0];
    const DAI_ACCOUNT = "0x7344E478574aCBe6DaC9dE1077430139E17EEc3D";

    it("should swap dai for weth", async () => {
        const tokenIn = await IERC20.at(WETH9);
        const tokenOut = await IERC20.at(DAI_CONTRACT);
        const testUniSwap = await UniSwap.new();
        const amountIn = new BN(10).pow(new BN(18)).mul(new BN(1)); //1 Ether

        await testUniSwap.convertExactEthToDai(TO, {
            from: FROM_ACCOUNT,
            value: amountIn
        });

        const balanceInDecimals = await tokenOut.balanceOf(TO);
        const balance = await web3.utils.fromWei(balanceInDecimals.toString(), 'ether')
        console.log(balance);
    });

    it("should swap weth for dai", async () => {
        const tokenIn = await IERC20.at(DAI_CONTRACT);
        const tokenOut = await IERC20.at(WETH9);
        const testUniSwap = await UniSwap.new();
        const amountIn = new BN(10).pow(new BN(18)).mul(new BN(100)); //100 DAI

        await tokenIn.approve(testUniSwap.address, amountIn, {
            from: DAI_ACCOUNT
        });

        await testUniSwap.convertExactDaiToEth(amountIn, TO, {
            from: DAI_ACCOUNT,
        })

        const balanceInDecimals = await tokenOut.balanceOf(TO);
        const balance = await web3.utils.fromWei(balanceInDecimals.toString(), 'ether')
        console.log(balance.toString());
    })

    it("should swap using intermediary pool", async () => {
        const tokenIn = await IERC20.at(DAI_CONTRACT);
        const tokenOut = await IERC20.at(WETH9);
        const testUniSwap = await UniSwap.new();
        const recipient = accounts[4];
        const amountIn = new BN(10).pow(new BN(18)).mul(new BN(100)); // 100 DAI 

        await tokenIn.approve(testUniSwap.address, amountIn, {
            from: DAI_ACCOUNT
        });

        await testUniSwap.exactInputMultiHop(amountIn, recipient, {
            from: DAI_ACCOUNT
        });

        const balanceInDecimals = await tokenOut.balanceOf(recipient);
        const balance = await web3.utils.fromWei(balanceInDecimals.toString(), 'ether');
        console.log(balance);
    })
})