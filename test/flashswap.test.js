const {
    ethers,
    network
} = require("hardhat");

const {
    DAI,
    WETH,
    DAI_WHALE,
    WETH_WHALE
} = require("../addresses.js");


describe("FlashSwap", async () => {

    it("Should FlashSwap", async () => {
        const [deployer] = await ethers.getSigners();

        const UniSwap = await ethers.getContractFactory("UniSwap", deployer);
        const uniSwap = await UniSwap.deploy();
        await uniSwap.deployed();

        const FlashSwap = await ethers.getContractFactory("FlashSwap", deployer);
        const flashSwap = await FlashSwap.deploy(uniSwap.address);
        await flashSwap.deployed();

        console.log(`UniSwap @ ${uniSwap.address}`);
        console.log(`FlashSwap @ ${flashSwap.address}`);

        const ERC_ABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Withdrawal","type":"event"}]

        //impersonate account

        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [DAI_WHALE],
        });

        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [WETH_WHALE],
        });

        //get signers
        const DAI_WH = await ethers.provider.getSigner(DAI_WHALE);
        const WETH_WH = await ethers.provider.getSigner(WETH_WHALE);

        const WETH_CONTRACT = new ethers.Contract(WETH, ERC_ABI, deployer);
        const DAI_CONTRACT = new ethers.Contract(DAI, ERC_ABI, deployer);

        //funding contract because it moght be loss
        let tx = await DAI_CONTRACT.connect(DAI_WH).transfer(flashSwap.address, ethers.utils.parseEther('10'));
        tx = await WETH_CONTRACT.connect(WETH_WH).transfer(flashSwap.address, ethers.utils.parseEther('2'));

        const flashParams = {
            token0: DAI,
            token1: WETH,
            fee1: 500,
            amount0: ethers.utils.parseEther('1500'),
            amount1: 0
        }

        tx = await flashSwap.initFlash(flashParams);
        await tx.wait();

    });
});