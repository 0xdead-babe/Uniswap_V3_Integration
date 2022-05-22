const BN = require("bn.js");
const {
    DAI,
    WETH,
    DAI_WHALE,
    WETH_WHALE
} = require("../env.js");
const {sendEther} = require("./util.js");

const FlashSwap = artifacts.require("FlashSwap");
const IERC20 = artifacts.require("IERC20");
const UniSwap = artifacts.require("UniSwap");


contract("FlashSwap", async (accounts) => {
    it("Habibi get profit", async () => {


        const uniSwap = await UniSwap.new();
        const flashSwap = await FlashSwap.new(uniSwap.address);
        const wethContract = await IERC20.at(WETH);
        const daiContract = await IERC20.at(DAI);
        const account = accounts[0].address;
        

        console.log(`Uniswap contract @ ${uniSwap.address}`);
        console.log(`FlashSwap contract @ ${flashSwap.address}`);


        let wethFund = (new BN(10).pow(new BN(18)).mul(new BN(100))).toString();
        let daiFund = (new BN(10).pow(new BN(18)).mul(new BN(1700))).toString();
        let daiBorrow = (new BN(10).pow(new BN(18)).mul(new BN(1500))).toString();


        console.log("[*] Executing flashSwap");

        //pretty much sure it's going to be loss

        await daiContract.transfer(flashSwap.address, daiFund, {
            from: DAI_WHALE
        });
        await wethContract.transfer(flashSwap.address, wethFund, {
            from: WETH_WHALE
        })


        const tx = await flashSwap.initFlash({
            token0: DAI,
            token1: WETH,
            fee1: 5000,
            amount0: daiBorrow,
            amount1: 0,
        }, {from:WETH_WHALE});

        for (const log of tx.logs) {
            console.log(log.args.message);
        }

    });
});

//  ["0x6B175474E89094C44Da98b954EedeAC495271d0F", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", 5000, "1500000000000000000000", 0]
