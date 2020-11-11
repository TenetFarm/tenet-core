const TenetMine = artifacts.require('TenetMine');

contract('TenetMine', () => {

    beforeEach(async () => {
        // _startBlock _tenPerBlock _bonusEndBlock _bonus_multiplier _subBlockNumerPeriod _subSharePerBlock
        this.mine = await TenetMine.new('100', '100', '100', '10', '100', [100,90,80,70,60,50,40,30,20,10,0]);
        console.log('address: ' + this.mine.address);
    });

    it('calc mine ten reward ', async () => {
        end_block = (await this.mine.endBlock()).valueOf();
        console.log('end_block: ' + end_block.toString(10));
        console.log('block number: ' + web3.eth.getBlockNumber());
        reward = (await this.mine.calcMineTenReward('90', '100')).valueOf();
        console.log('reward: ' + reward.toString(10));
        assert.equal((await this.mine.calcMineTenReward('90', '100')).valueOf(), '0');
    });

    it('calc mine ten reward ', async () => {
        end_block = (await this.mine.endBlock()).valueOf();
        console.log('end_block: ' + end_block.toString(10));
        console.log('block number: ' + web3.eth.getBlockNumber());
        reward = (await this.mine.calcMineTenReward('95', '105')).valueOf();
        console.log('reward: ' + reward.toString(10));
        assert.equal((await this.mine.calcMineTenReward('95', '105')).valueOf(), '5000');
    });

    it('calc mine ten reward ', async () => {
        end_block = (await this.mine.endBlock()).valueOf();
        console.log('end_block: ' + end_block.toString(10));
        console.log('block number: ' + web3.eth.getBlockNumber());
        reward = (await this.mine.calcMineTenReward('100', '110')).valueOf();
        console.log('reward: ' + reward.toString(10));
        assert.equal((await this.mine.calcMineTenReward('100', '110')).valueOf(), '10000');
    });

    it('calc mine ten reward ', async () => {
        end_block = (await this.mine.endBlock()).valueOf();
        console.log('end_block: ' + end_block.toString(10));
        console.log('block number: ' + (await web3.eth.getBlockNumber()).valueOf());
        
        reward = (await this.mine.calcMineTenReward('195', '205')).valueOf();
        console.log('reward: ' + reward.toString(10));
        // 5 * 1000 + 5 * 100
        assert.equal((await this.mine.calcMineTenReward('195', '205')).valueOf(), '5500');
    });

    it('calc mine ten reward ', async () => {
        end_block = (await this.mine.endBlock()).valueOf();
        console.log('end_block: ' + end_block.toString(10));
        console.log('block number: ' + (await web3.eth.getBlockNumber()).valueOf());
        
        reward = (await this.mine.calcMineTenReward('200', '210')).valueOf();
        console.log('reward: ' + reward.toString(10));
        // 100 * 10  = 1000
        assert.equal((await this.mine.calcMineTenReward('200', '210')).valueOf(), '1000');
    });


    it('calc mine ten reward ', async () => {
        end_block = (await this.mine.endBlock()).valueOf();
        console.log('end_block: ' + end_block.toString(10));
        console.log('block number: ' + (await web3.eth.getBlockNumber()).valueOf());
        
        reward = (await this.mine.calcMineTenReward('100', '400')).valueOf();
        console.log('reward: ' + reward.toString(10));
        // 1000 * 100 + 100 * 100 + 90 * 100  = 100000 + 10000 + 9000 = 119000 
        assert.equal((await this.mine.calcMineTenReward('100', '400')).valueOf(), '119000');
    });

    it('calc mine ten reward ', async () => {
        end_block = (await this.mine.endBlock()).valueOf();
        console.log('end_block: ' + end_block.toString(10));
        console.log('block number: ' + (await web3.eth.getBlockNumber()).valueOf());
        
        reward = (await this.mine.calcMineTenReward('200', '500')).valueOf();
        console.log('reward: ' + reward.toString(10));
        // 100 * 100 + 90 * 100 + 80 * 100 = 10000 + 9000 + 8000 = 25000
        // 1000 * 100
        assert.equal((await this.mine.calcMineTenReward('100', '200')).valueOf(), '100000');
        // 100 * 100
        assert.equal((await this.mine.calcMineTenReward('200', '300')).valueOf(), '10000');
        // 90 * 100
        assert.equal((await this.mine.calcMineTenReward('300', '400')).valueOf(), '9000');
        // 80 * 100
        assert.equal((await this.mine.calcMineTenReward('400', '500')).valueOf(), '8000');
        // 70 * 100
        assert.equal((await this.mine.calcMineTenReward('500', '600')).valueOf(), '7000');

        // 10000 + 9000
        assert.equal((await this.mine.calcMineTenReward('200', '400')).valueOf(), '19000');

        // 9000 + 8000
        assert.equal((await this.mine.calcMineTenReward('300', '500')).valueOf(), '17000');
        // 100000 + 10000 + 9000
        assert.equal((await this.mine.calcMineTenReward('100', '400')).valueOf(), '119000');

        // 100000 + 10000 + 9000 + 8000
        reward = (await this.mine.calcMineTenReward('100', '500')).valueOf();
        console.log('reward1: ' + reward.toString(10));
        assert.equal((await this.mine.calcMineTenReward('100', '500')).valueOf(), '127000');

        // 10000 + 9000 + 8000 + 7000
        reward = (await this.mine.calcMineTenReward('200', '600')).valueOf();
        console.log('reward1: ' + reward.toString(10));
        assert.equal((await this.mine.calcMineTenReward('200', '600')).valueOf(), '34000');


        // 9000 + 8000 + 7000
        reward = (await this.mine.calcMineTenReward('300', '600')).valueOf();
        console.log('reward2: ' + reward.toString(10));
        assert.equal((await this.mine.calcMineTenReward('300', '600')).valueOf(), '24000');

        // 90 * 90 + 80 * 100 + 70 * 100 + 10 * 60 = 8100 + 8000 + 7000 + 600 = 23700 
        reward = (await this.mine.calcMineTenReward('310', '610')).valueOf();
        console.log('reward2: ' + reward.toString(10));
        assert.equal((await this.mine.calcMineTenReward('310', '610')).valueOf(), '23700');

        // 10000 + 9000 + 8000
        reward = (await this.mine.calcMineTenReward('200', '500')).valueOf();
        console.log('reward3: ' + reward.toString(10));
        assert.equal((await this.mine.calcMineTenReward('200', '500')).valueOf(), '27000');

        // 10 * 100
        reward = (await this.mine.calcMineTenReward('1000', '1100')).valueOf();
        console.log('reward3: ' + reward.toString(10));
        assert.equal((await this.mine.calcMineTenReward('1000', '1100')).valueOf(), '2000');

        reward = (await this.mine.calcMineTenReward('1100', '1200')).valueOf();
        console.log('reward3: ' + reward.toString(10));
        assert.equal((await this.mine.calcMineTenReward('1100', '1200')).valueOf(), '1000');

        reward = (await this.mine.calcMineTenReward('1100', '1300')).valueOf();
        console.log('reward3: ' + reward.toString(10));
        assert.equal((await this.mine.calcMineTenReward('1100', '1300')).valueOf(), '1000');

        reward = (await this.mine.calcMineTenReward('1200', '1300')).valueOf();
        console.log('reward3: ' + reward.toString(10));
        assert.equal((await this.mine.calcMineTenReward('1200', '1300')).valueOf(), '0');


    });

    // it('calc mine ten reward ', async () => {
    //     end_block = (await this.mine.endBlock()).valueOf();
    //     console.log('end_block: ' + end_block.toString(10));
    //     console.log('block number: ' + (await web3.eth.getBlockNumber()).valueOf());
        
    //     reward = (await this.mine.calcMineTenReward('950', '1150')).valueOf();
    //     console.log('reward: ' + reward.toString(10));
    //     // endBlock = 1100, 50 * 20 + 100 * 10 = 2000
    //     assert.equal((await this.mine.calcMineTenReward('950', '1150')).valueOf(), '2000');
    // });

    // it('calc mine ten reward ', async () => {
    //     end_block = (await this.mine.endBlock()).valueOf();
    //     console.log('end_block: ' + end_block.toString(10));
    //     console.log('block number: ' + (await web3.eth.getBlockNumber()).valueOf());
        
    //     reward = (await this.mine.calcMineTenReward('1050', '1150')).valueOf();
    //     console.log('reward: ' + reward.toString(10));
    //     // endBlock = 1100, 50 * 10 = 500
    //     assert.equal((await this.mine.calcMineTenReward('1050', '1150')).valueOf(), '500');
    // });

    // it('calc mine ten reward ', async () => {
    //     end_block = (await this.mine.endBlock()).valueOf();
    //     console.log('end_block: ' + end_block.toString(10));
    //     console.log('block number: ' + (await web3.eth.getBlockNumber()).valueOf());
        
    //     reward = (await this.mine.calcMineTenReward('1100', '1200')).valueOf();
    //     console.log('reward: ' + reward.toString(10));
    //     // endBlock = 1100, 100 * 0 = 0
    //     assert.equal((await this.mine.calcMineTenReward('1100', '1200')).valueOf(), '0');
    // });
    

});