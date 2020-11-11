const { expectRevert, time } = require('@openzeppelin/test-helpers');
const ethers = require('ethers');
const Timelock = artifacts.require('Timelock');
const GovernorAlpha = artifacts.require('GovernorAlpha');

const TenetToken = artifacts.require('TenetToken');
const Tenet = artifacts.require('Tenet');
const MockERC20 = artifacts.require('MockERC20');

function encodeParameters(types, values) {
    const abi = new ethers.utils.AbiCoder();
    return abi.encode(types, values);
}

contract('Governor', ([owner, dev]) => {

    beforeEach(async () => {
        this.lpten = await MockERC20.at("0x8ecc3aa05629ec68A95Ae4594Ab9fAE3CAc76151");
        this.tenet = await Tenet.at("0x0456708156fd2e5a0Eb579199b9fF4821a6870Ae");
        this.tenetToken = await TenetToken.at("0x2d91E4E0C1400160b1723BB9dF99926A4EC9CD75");

        this.gov = await GovernorAlpha.at("0x46bfdf5194DE7a5089AE9d3a8d5721b5427FEd5D");
        this.timelock = await Timelock.at("0x3829BBd530573B2b4ac139FFFEC15CD138829981");
    });

    it('should work', async () => {

        await this.tenetToken.mint(dev, "10000", {from: owner});
        console.log("dev TEN 余额：", (await this.tenetToken.balanceOf(dev)).valueOf());

        await this.tenetToken.delegate(dev, { from: dev });

        await this.tenetToken.transferOwnership(this.tenet.address, { from: owner });

        //  Transfer ownership to timelock contract
         await this.timelock.setPendingAdmin(this.gov.address, { from: owner });
         await this.gov.__acceptAdmin({ from: owner });
         await this.tenet.transferOwnership(this.timelock.address, { from: owner });

        await this.gov.propose(
            [this.tenet.address], ['0'], ['set_devWithdrawStartBlock(uint256)'],
            [encodeParameters(['uint256'], ['5000'])],
            'Set dev withdraw startBlock',
            { from: dev }
        );

        time.advanceBlock();

        await this.gov.castVote('1', true, { from: dev });

        console.log("Advancing 17280 blocks. Will take a while...");

        for (let i = 0; i < 100; ++i) {
            await time.advanceBlock();
        }

        await this.gov.queue('1');

        await time.increase(time.duration.days(3));
        await time.advanceBlock();
        console.log("Now devWithdrawStartBlock is:" + (await this.tenet.devWithdrawStartBlock()));
        await this.gov.execute('1');
        console.log("Now devWithdrawStartBlock is:" + (await this.tenet.devWithdrawStartBlock()));
        assert.equal(((await this.tenet.devWithdrawStartBlock()).valueOf()), '5000');

    });
});
