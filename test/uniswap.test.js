const {
    network,
    ethers
} = require("hardhat");
const {
    isCallTrace
} = require("hardhat/internal/hardhat-network/stack-traces/message-trace");
const {
    DAI,
    WETH,
    DAI_WHALE,
    WETH_WHALE
} = require("../addresses.js");



describe("UniSwap", async () => {


    it("Should Swap dai for eth", async () => {

        const [deployer] = await ethers.getSigners();
        const ERC_ABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Withdrawal","type":"event"}]

        //account impersonation
        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [DAI_WHALE],
        });

        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [WETH_WHALE],
        });

        //get signers
        const WETH_WH = ethers.provider.getSigner(WETH_WHALE);

        const WETH_CONTRACT = new ethers.Contract(WETH, ERC_ABI, deployer);
        const DAI_CONTRACT = new ethers.Contract(DAI, ERC_ABI, deployer);

        const UniSwap = await ethers.getContractFactory("UniSwap", deployer);
        const uniSwap = await UniSwap.deploy();
        await uniSwap.deployed();

        console.log(`UniSwap @ ${uniSwap.address}`);

        const amountIn = ethers.utils.parseEther('1');

        //get some Weth
        let tx = await WETH_CONTRACT.connect(WETH_WH).transfer(deployer.address, amountIn);

        //approve swap contract
        await WETH_CONTRACT.connect(deployer).approve(uniSwap.address, amountIn);

        // //swap token
        tx = await uniSwap.swapTokenMax(WETH, DAI, amountIn);
        tx.wait();

        const balanceInDecimals = await DAI_CONTRACT.balanceOf(deployer.address);
        const balance = ethers.utils.formatEther(balanceInDecimals);
        console.log(balance.toString());

    })

});