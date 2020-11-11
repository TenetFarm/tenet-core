const TenetMine = artifacts.require('TenetMine');
const TenetToken = artifacts.require('TenetToken');
const Tenet = artifacts.require('Tenet');
const MockERC20 = artifacts.require('MockERC20');
const Timelock = artifacts.require('Timelock');
const TenetProxy = artifacts.require('TenetProxy');


contract('TenetProxy', ([projecter1,lpTokenUser1]) => {

    beforeEach(async () => {
        weth = "0xc778417e063141139fce010982780140aa0cd5ab"
        wusdt = "0x112C78EE0D6a7f866B563F043042176Dfce17472"
        factory = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"
        // this.tenetToken = await TenetToken.new();
        // this.lpten = await MockERC20.new('LPToken','TEN/ETH',10000000000);

        this.tenetMine = await TenetMine.at('0x1D5a81fEC6f56645De801017Fcf8705c126d6B4c');
        // this.tenetMine = await TenetMine.new(0,100,10,100,100,[100,90,80,70,60,50,40,30,20,10,0]);
        // this.tenet = await Tenet.new(this.tenetToken.address,this.tenetMine.address, this.lpten.address,dev,2000,8000,100,100,2000,2);
        this.tenet = await Tenet.at('0x6ad1bebe7C54d427ed8182d230c863979852AB4d');
        this.tenetProxy = await TenetProxy.new(this.tenet.address);
        // await this.tenetToken.transferOwnership(this.tenet.address);

        // await this.lpten.transfer(projecter1, '1000');
        // await this.lpten.approve(this.tenet.address, '100', { from: lpTenUser1 }); 

    });
    it('calcLiquidity2 ', async () => {
        calcLiquidity2 = await this.tenetProxy.calcLiquidity2("0x0a61a7a5f0c33425cf6c079da3d5dcc3881fdb27", '10000000000', '10000000000')
        console.log('calcLiquidity2: ' + calcLiquidity2);

        calcLiquidity = await this.tenetProxy.calcLiquidity("0x0a61a7a5f0c33425cf6c079da3d5dcc3881fdb27", '0x112c78ee0d6a7f866b563f043042176dfce17472', '1000000000000000000')
        console.log('calcLiquidity: ' + calcLiquidity);
    });


    it('calc mine ten reward ', async () => {
        this.drep = await MockERC20.new('DREPToken', 'DREP', '10000', { from: projecter1 });

        this.lpdrep = await MockERC20.new('LPDREP', 'DREP/ETH', '10000000000');
        await this.lpdrep.transfer(lpTokenUser1, '1000');
        await this.lpdrep.approve(this.tenet.address, '100', { from: lpTokenUser1 });

        // getTenUserPool = (await this.tenetProxy.getTenUserPool());
        // console.log('getTenUserPool: ' + getTenUserPool[0]);

        await this.lpten.approve(this.tenet.address, '100', { from: projecter1 });     
        await this.drep.approve(this.tenet.address, '600', { from: projecter1 });

        await this.tenet.add(this.lpdrep.address, this.drep.address, '600', '0', '100', '5', '20', '2', '100', {from: projecter1});


        await this.tenet.depositLPToken('0', '100', { from: lpTokenUser1 });

        assert.equal((await this.tenetToken.balanceOf(lpTokenUser1)).valueOf(), '0');

        await this.tenetProxy.getTenUserPool();
        console.log('projectPool: ' + projectPool);
    });

    it('calc mine ten reward ', async () => {
        end_block = (await this.mine.endBlock()).valueOf();
        console.log('end_block: ' + end_block.toString(10));
        console.log('block number: ' + (await web3.eth.getBlockNumber()).valueOf());
        
        reward = (await this.mine.calcMineTenReward('195', '205')).valueOf();
        console.log('reward: ' + reward.toString(10));
        assert.equal((await this.mine.calcMineTenReward('195', '205')).valueOf(), '5950');
    });

    it('calc mine ten reward ', async () => {
        end_block = (await this.mine.endBlock()).valueOf();
        console.log('end_block: ' + end_block.toString(10));
        console.log('block number: ' + (await web3.eth.getBlockNumber()).valueOf());
        
        reward = (await this.mine.calcMineTenReward('200', '210')).valueOf();
        console.log('reward: ' + reward.toString(10));
        // 90 * 10  = 900
        assert.equal((await this.mine.calcMineTenReward('200', '210')).valueOf(), '900');
    });

    it('calc mine ten reward ', async () => {
        end_block = (await this.mine.endBlock()).valueOf();
        console.log('end_block: ' + end_block.toString(10));
        console.log('block number: ' + (await web3.eth.getBlockNumber()).valueOf());
        
        reward = (await this.mine.calcMineTenReward('100', '300')).valueOf();
        console.log('reward: ' + reward.toString(10));
        assert.equal((await this.mine.calcMineTenReward('100', '300')).valueOf(), '119000');
    });

    it('calc mine ten reward ', async () => {
        end_block = (await this.mine.endBlock()).valueOf();
        console.log('end_block: ' + end_block.toString(10));
        console.log('block number: ' + (await web3.eth.getBlockNumber()).valueOf());
        
        reward = (await this.mine.calcMineTenReward('300', '500')).valueOf();
        console.log('reward: ' + reward.toString(10));
        // 80 * 100 + 70 * 100 = 15000
        assert.equal((await this.mine.calcMineTenReward('300', '500')).valueOf(), '15000');
    });

    it('calc mine ten reward ', async () => {
        end_block = (await this.mine.endBlock()).valueOf();
        console.log('end_block: ' + end_block.toString(10));
        console.log('block number: ' + (await web3.eth.getBlockNumber()).valueOf());
        
        reward = (await this.mine.calcMineTenReward('950', '1150')).valueOf();
        console.log('reward: ' + reward.toString(10));
        // endBlock = 1100, 50 * 20 + 100 * 10 = 2000
        assert.equal((await this.mine.calcMineTenReward('950', '1150')).valueOf(), '2000');
    });

    it('calc mine ten reward ', async () => {
        end_block = (await this.mine.endBlock()).valueOf();
        console.log('end_block: ' + end_block.toString(10));
        console.log('block number: ' + (await web3.eth.getBlockNumber()).valueOf());
        
        reward = (await this.mine.calcMineTenReward('1050', '1150')).valueOf();
        console.log('reward: ' + reward.toString(10));
        // endBlock = 1100, 50 * 10 = 500
        assert.equal((await this.mine.calcMineTenReward('1050', '1150')).valueOf(), '500');
    });

    it('calc mine ten reward ', async () => {
        end_block = (await this.mine.endBlock()).valueOf();
        console.log('end_block: ' + end_block.toString(10));
        console.log('block number: ' + (await web3.eth.getBlockNumber()).valueOf());
        
        reward = (await this.mine.calcMineTenReward('1100', '1200')).valueOf();
        console.log('reward: ' + reward.toString(10));
        // endBlock = 1100, 100 * 0 = 0
        assert.equal((await this.mine.calcMineTenReward('1100', '1200')).valueOf(), '0');
    });
    

});