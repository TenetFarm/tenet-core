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
        this.lpten = await MockERC20.at("0xB432D8119f371db45F790a49EE19872Bf678A820");
        this.tenet = await Tenet.at("0xB465c6ACc3Ec8408b8A086A897791B162a834b68");
        this.tenetToken = await TenetToken.at("0xA6B59936F529b83b3Eb172f6645C8a9B677D4e63");

        this.gov = await GovernorAlpha.at("0x55F7285f6f071f92af5A5880f92138733657Bb81");
        this.timelock = await Timelock.at("0x24B77af59179B1F275Aa5DcB2AEbBee769AF76f2");
    });

    it('test set update Contract', async () => {
        this.new_tenet = await Tenet.new(this.tenetToken.address,this.lpten.address,owner,0,1000,1000,10,2,8,1000);

        

        await this.tenetToken.mint(dev, "10000", {from: owner});
        console.log("dev ten bal：", (await this.tenetToken.balanceOf(dev)).valueOf());

        await this.tenetToken.delegate(dev, { from: dev });

        await this.tenetToken.transferOwnership(this.tenet.address, { from: owner });

        //  Transfer ownership to timelock contract
         await this.timelock.setPendingAdmin(this.gov.address, { from: owner });
         await this.gov.__acceptAdmin({ from: owner });
         await this.tenet.transferOwnership(this.timelock.address, { from: owner });

        await this.gov.propose(
            [this.tenet.address], ['0'], ['set_updateContract(uint256,address)'],
            [encodeParameters(['uint256','address'], ['100',this.new_tenet.address])],
            'set update Contract',
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
        console.log("Now updateBlock is:" + (await this.tenet.updateBlock()));
        console.log("Now newContractAddr is:" + (await this.tenet.newContractAddr()));
        await this.gov.execute('1');
        console.log("Now updateBlock is:" + (await this.tenet.updateBlock()));
        console.log("Now newContractAddr is:" + (await this.tenet.newContractAddr()));

        // await this.tenet.transferOwnership(owner, { from: this.timelock.address });

        for (let i = 0; i < 100; ++i) {
            await time.advanceBlock();
        }

        await this.tenet.updateContract({from:owner});

        console.log("Now newContractAddr is:" + (await this.tenet.newContractAddr()));

        await this.tenetToken.mint(dev,'10000',{from: this.new_tenet.address});
        console.log("dev ten bal:", (await this.tenetToken.balanceOf(dev)).valueOf());

        assert.equal(((await this.tenet.addpoolfee()).valueOf()), '5000');

    });



    it('test add pool fee', async () => {

        await this.tenetToken.mint(dev, "10000", {from: owner});
        console.log("dev ten bal：", (await this.tenetToken.balanceOf(dev)).valueOf());

        await this.tenetToken.delegate(dev, { from: dev });

        await this.tenetToken.transferOwnership(this.tenet.address, { from: owner });

        //  Transfer ownership to timelock contract
         await this.timelock.setPendingAdmin(this.gov.address, { from: owner });
         await this.gov.__acceptAdmin({ from: owner });
         await this.tenet.transferOwnership(this.timelock.address, { from: owner });

        await this.gov.propose(
            [this.tenet.address], ['0'], ['set_addPoolFee(uint256)'],
            [encodeParameters(['uint256'], ['5000'])],
            'Set add Pool Fee',
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
        console.log("Now PoolFee is:" + (await this.tenet.addpoolfee()));
        await this.gov.execute('1');
        console.log("Now addPoolFee is:" + (await this.tenet.addpoolfee()));
        assert.equal(((await this.tenet.addpoolfee()).valueOf()), '5000');

    });

    it('should work', async () => {

        await this.tenetToken.mint(dev, "10000", {from: owner});
        console.log("dev xww bal：", (await this.tenetToken.balanceOf(dev)).valueOf());

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

        for (let i = 0; i < 17280; ++i) {
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
