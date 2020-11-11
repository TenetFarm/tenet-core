const TenetToken = artifacts.require('TenetToken');
const Tenet = artifacts.require('Tenet');
const MockERC20 = artifacts.require('MockERC20');
const TenetMine = artifacts.require('TenetMine');
const TenetProxy = artifacts.require('TenetProxy');


contract('Tenet', ([owner, dev, projecter1, projecter2, lpTenUser1,lpTenUser2,lpTokenUser1,lpTokenUser2]) => {

    beforeEach(async () => {
        this.tenetToken = await TenetToken.new();
        this.lpten = await MockERC20.new('LPToken','TEN/ETH',1000000000000);
        // start, perblock, bonusend, mutiplier, subperiod, subshare
        this.tenetmine = await TenetMine.new(0,100,10,100,100,[100,90,80,70,60,50,40,30,20,10,0]);

        this.tenet = await Tenet.new(this.tenetToken.address,this.tenetmine.address, this.lpten.address,dev,2000,8000,100,100,2000,0);
        
        // now block
        initBlock = (await web3.eth.getBlockNumber()).valueOf();
        console.log("init block: " + (await web3.eth.getBlockNumber()).valueOf());

        this.tenetProxy = await TenetProxy.new(this.tenet.address)


        await this.tenetToken.transferOwnership(this.tenet.address);
        await this.lpten.transfer(projecter1, '1000');
        await this.lpten.transfer(projecter2, '1000');
        await this.lpten.transfer(lpTenUser1, '1000');
        await this.lpten.transfer(lpTenUser2, '1000');

        await this.lpten.approve(this.tenet.address, '1000', { from: lpTenUser1 }); 
        await this.lpten.approve(this.tenet.address, '1000', { from: lpTenUser2 }); 

        await this.lpten.approve(this.tenet.address, '1000', { from: projecter1 }); 
        await this.lpten.approve(this.tenet.address, '1000', { from: projecter2 }); 


        console.log("this.tenetToken.address: ", this.tenetToken.address);
        console.log("this.lpten.address: ", this.lpten.address);
        console.log("this.tenetmine.address: ", this.tenetmine.address);
        console.log("this.tenet.address: ", this.tenet.address);

        end_block = (await this.tenetmine.endBlock()).valueOf();
        console.log('end_block: ' + end_block.toString(10));

    });

    it('one person mine official pool', async () => {
        console.log("--------- one person mine official pool -----------")
        await this.tenet.depositTenByUser('100', { from: lpTenUser1 });
        await this.tenet.mineLPTen({ from: lpTenUser1 });

        console.log('------------------------------------------------------');
        pendingTen = (await this.tenetProxy.getPendingTenByUser(lpTenUser1)).valueOf();
        console.log('pendingTen: ' + pendingTen[0]);
        console.log('freezeBlocks: ' + pendingTen[1]);
        console.log('freezeTen: ' + pendingTen[2]);
        console.log('------------------------------------------------------');
        depositBlock = (await web3.eth.getBlockNumber()).valueOf();
        console.log('depositBlock block: ' + depositBlock);

        time.advanceBlock();

        console.log('------------------------------------------------------');
        pendingTen = (await this.tenetProxy.getPendingTenByUser(lpTenUser1)).valueOf();
        console.log('pendingTen: ' + pendingTen[0]);
        console.log('freezeBlocks: ' + pendingTen[1]);
        console.log('freezeTen: ' + pendingTen[2]);
        console.log('------------------------------------------------------');

        await this.tenet.mineLPTen({ from: lpTenUser1 });
        time.advanceBlock();

        console.log('------------------------------------------------------');
        assert.equal((await this.tenetToken.balanceOf(lpTenUser1)).valueOf(), '0');
        console.log('pendingTen: ' + pendingTen[0]);
        console.log('freezeBlocks: ' + pendingTen[1]);
        console.log('freezeTen: ' + pendingTen[2]);
        console.log('------------------------------------------------------');

        bonusEnd = 100 - (depositBlock - initBlock);
        console.log('bonusEnd block remain: ' + bonusEnd);

        nowBlock = (await web3.eth.getBlockNumber()).valueOf();

        console.log('------------------------------------------------------');
        pendingTen = (await this.tenetProxy.getPendingTenByUser(lpTenUser1)).valueOf();
        console.log('pendingTen: ' + pendingTen[0]);
        console.log('freezeBlocks: ' + pendingTen[1]);
        console.log('freezeTen: ' + pendingTen[2]);
        console.log('------------------------------------------------------');

        await this.tenet.withdrawTenByUser('100', { from: lpTenUser1 });
        console.log("lpTenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTenUser1)).valueOf());

        for(i = 0 ; i < 100; i++) {
            time.advanceBlock();
        }

        await this.tenet.mineLPTen({ from: lpTenUser1 });
        console.log("lpTenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTenUser1)).valueOf());

        console.log('------------------------------------------------------');
        pendingTen = (await this.tenetProxy.getPendingTenByUser(lpTenUser1)).valueOf();
        console.log('pendingTen: ' + pendingTen[0]);
        console.log('freezeBlocks: ' + pendingTen[1]);
        console.log('freezeTen: ' + pendingTen[2]);
        console.log('------------------------------------------------------');

    })

    it('one person mine projector pool', async () => {
        console.log('----------- one person mine projector pool -------------');
        this.drep = await MockERC20.new('DREPToken', 'DREP', '10000', { from: projecter1 });

        this.lpdrep = await MockERC20.new('LPDREP', 'DREP/ETH', '10000000000');

        await this.lpdrep.transfer(lpTokenUser1, '1000');

        assert.equal((await this.lpdrep.balanceOf(lpTokenUser1)).valueOf(), '1000');

        await this.lpdrep.transfer(lpTokenUser2, '1000');
        assert.equal((await this.lpdrep.balanceOf(lpTokenUser2)).valueOf(), '1000');

        await this.lpten.approve(this.tenet.address, '100', { from: projecter1 });     
        await this.drep.approve(this.tenet.address, '600', { from: projecter1 });

        await this.lpdrep.approve(this.tenet.address, '100', { from: lpTokenUser1 });
        await this.lpdrep.approve(this.tenet.address, '100', { from: lpTokenUser2 }); 

        nowBlock = (await web3.eth.getBlockNumber()).valueOf();
        startProject = nowBlock + 10;

        await this.tenet.add(this.lpdrep.address, this.drep.address, '600', '0', '100', '5', '20', '2', '100', {from: projecter1});

        await this.tenet.depositLPToken('0', '100', { from: lpTokenUser1 });

        nowBlock = (await web3.eth.getBlockNumber()).valueOf();
        bonusEnd = 100 - (nowBlock - initBlock);
        console.log('bonusEnd blocks: ' + bonusEnd);

        for(i = 0; i < 100; i++){
            time.advanceBlock();
        }
        console.log('------------------------------------------------------');
        pendingToken = (await this.tenetProxy.getPendingToken(0, lpTokenUser1)).valueOf();
        console.log('pendingToken: ' + pendingToken);
        pendingTen = (await this.tenetProxy.getPendingTen(0, lpTokenUser1)).valueOf();
        console.log('pendingTen: ' + pendingTen[0]);
        console.log('freezeBlocks: ' + pendingTen[1]);
        console.log('freezeTen: ' + pendingTen[2]);
        console.log('------------------------------------------------------');


        // console.log("projecter1 drep bal: " + (await this.drep.balanceOf(projecter1)).valueOf());

        await this.tenet.mineLPToken('0', { from: lpTokenUser1 });
        console.log('------------------------------------------------------');
        pendingToken = (await this.tenetProxy.getPendingToken(0, lpTokenUser1)).valueOf();
        console.log('pendingToken: ' + pendingToken);
        pendingTen = (await this.tenetProxy.getPendingTen(0, lpTokenUser1)).valueOf();
        console.log('pendingTen: ' + pendingTen[0]);
        console.log('freezeBlocks: ' + pendingTen[1]);
        console.log('freezeTen: ' + pendingTen[2]);
        console.log('------------------------------------------------------');

        // (200 * 80 + 20 * 21)/101 = 162.5 ~ 163
        console.log("lpTokenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTokenUser1)).valueOf());
        console.log("lpTokenUser1 drep bal: " + (await this.drep.balanceOf(lpTokenUser1)).valueOf());
        // await this.tenet.depositLPToken('0', '100', { from: lpTokenUser2 });

        await this.tenet.mineLPToken('0', { from: lpTokenUser1 });

        console.log("lpTokenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTokenUser1)).valueOf());
        console.log("lpTokenUser1 drep bal: " + (await this.drep.balanceOf(lpTokenUser1)).valueOf());
        await this.tenet.mineLPToken('0', { from: lpTokenUser1 });
        console.log("lpTokenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTokenUser1)).valueOf());

        for(i = 0 ; i < 3000; i++) {
            time.advanceBlock();
        }

        await this.tenet.mineLPToken('0', { from: lpTokenUser1 });
        console.log("lpTokenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTokenUser1)).valueOf());


        await this.tenet.mineLPToken('0', { from: lpTokenUser1 });
        console.log("lpTokenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTokenUser1)).valueOf());

        await this.tenet.mineLPToken('0', { from: lpTokenUser1 });
        console.log("lpTokenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTokenUser1)).valueOf());

    });


    it('two person mine official pool', async () => {
        await this.tenet.depositTenByUser('100', { from: lpTenUser1 });
        await this.tenet.depositTenByUser('100', { from: lpTenUser2 });

        depositBlock = (await web3.eth.getBlockNumber()).valueOf();
        console.log('depositBlock block: ' + depositBlock);

        await this.tenet.mineLPTen({ from: lpTenUser1 });
        assert.equal((await this.tenetToken.balanceOf(lpTenUser1)).valueOf(), '0');

        await this.tenet.mineLPTen({ from: lpTenUser2 });
        assert.equal((await this.tenetToken.balanceOf(lpTenUser2)).valueOf(), '0');


        bonusEnd = 100 - (depositBlock - initBlock);
        console.log('bonusEnd block remain: ' + bonusEnd);

        nowBlock = (await web3.eth.getBlockNumber()).valueOf();
        for(i = 0 ; i < (99 - nowBlock + depositBlock); i++) {
            time.advanceBlock();
        }

        await this.tenet.mineLPTen({ from: lpTenUser1 });
        await this.tenet.mineLPTen({ from: lpTenUser2 });

        console.log("lpTenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTenUser1)).valueOf());
        console.log("lpTenUser2 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTenUser2)).valueOf());

        await this.tenet.mineLPTen({ from: lpTenUser1 });
        await this.tenet.mineLPTen({ from: lpTenUser2 });

        console.log("lpTenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTenUser1)).valueOf());
        console.log("lpTenUser2 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTenUser2)).valueOf());

    })


    it('two person mine projector pool', async () => {
        this.drep = await MockERC20.new('DREPToken', 'DREP', '10000', { from: projecter1 });

        this.lpdrep = await MockERC20.new('LPDREP', 'DREP/ETH', '10000000000');

        await this.lpdrep.transfer(lpTokenUser1, '1000');

        assert.equal((await this.lpdrep.balanceOf(lpTokenUser1)).valueOf(), '1000');

        await this.lpdrep.transfer(lpTokenUser2, '1000');
        assert.equal((await this.lpdrep.balanceOf(lpTokenUser2)).valueOf(), '1000');

        await this.lpten.approve(this.tenet.address, '100', { from: projecter1 });     
        await this.drep.approve(this.tenet.address, '600', { from: projecter1 });

        await this.lpdrep.approve(this.tenet.address, '100', { from: lpTokenUser1 });
        await this.lpdrep.approve(this.tenet.address, '100', { from: lpTokenUser2 }); 

        nowBlock = (await web3.eth.getBlockNumber()).valueOf();
        startProject = nowBlock + 10;

        await this.tenet.add(this.lpdrep.address, this.drep.address, '600', '0', '100', '5', '20', '2', '100', {from: projecter1});

        await this.tenet.depositLPToken('0', '100', { from: lpTokenUser1 });
        await this.tenet.depositLPToken('0', '100', { from: lpTokenUser2 });

        nowBlock = (await web3.eth.getBlockNumber()).valueOf();
        bonusEnd = 100 - (nowBlock - initBlock);
        console.log('bonusEnd blocks: ' + bonusEnd);

        for(i = 0; i < 99; i++){
            time.advanceBlock();
        }

        await this.tenet.mineLPToken('0', { from: lpTokenUser1 });
        await this.tenet.mineLPToken('0', { from: lpTokenUser2 });

        console.log("lpTokenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTokenUser1)).valueOf());
        console.log("lpTokenUser2 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTokenUser2)).valueOf());

        console.log("lpTokenUser1 drep bal: " + (await this.drep.balanceOf(lpTokenUser1)).valueOf());
        console.log("lpTokenUser2 drep bal: " + (await this.drep.balanceOf(lpTokenUser2)).valueOf());

        await this.tenet.mineLPToken('0', { from: lpTokenUser1 });
        await this.tenet.mineLPToken('0', { from: lpTokenUser2 });

        console.log("lpTokenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTokenUser1)).valueOf());
        console.log("lpTokenUser2 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTokenUser2)).valueOf());

        console.log("lpTokenUser1 drep bal: " + (await this.drep.balanceOf(lpTokenUser1)).valueOf());
        console.log("lpTokenUser2 drep bal: " + (await this.drep.balanceOf(lpTokenUser2)).valueOf());


        for(i = 0 ; i < 2500; i++) {
                time.advanceBlock();
        }

        await this.tenet.mineLPToken('0', { from: lpTokenUser1 });
        await this.tenet.mineLPToken('0', { from: lpTokenUser2 });

        console.log("lpTokenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTokenUser1)).valueOf());
        console.log("lpTokenUser2 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTokenUser2)).valueOf());

        console.log("lpTokenUser1 drep bal: " + (await this.drep.balanceOf(lpTokenUser1)).valueOf());
        console.log("lpTokenUser2 drep bal: " + (await this.drep.balanceOf(lpTokenUser2)).valueOf());

        await this.tenet.mineLPToken('0', { from: lpTokenUser1 });
        await this.tenet.mineLPToken('0', { from: lpTokenUser2 });

        console.log("lpTokenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTokenUser1)).valueOf());
        console.log("lpTokenUser2 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTokenUser2)).valueOf());

        console.log("lpTokenUser1 drep bal: " + (await this.drep.balanceOf(lpTokenUser1)).valueOf());
        console.log("lpTokenUser2 drep bal: " + (await this.drep.balanceOf(lpTokenUser2)).valueOf());

        await this.tenet.mineLPToken('0', { from: lpTokenUser1 });
        await this.tenet.mineLPToken('0', { from: lpTokenUser2 });

        console.log("lpTokenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTokenUser1)).valueOf());
        console.log("lpTokenUser2 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTokenUser2)).valueOf());

        console.log("lpTokenUser1 drep bal: " + (await this.drep.balanceOf(lpTokenUser1)).valueOf());
        console.log("lpTokenUser2 drep bal: " + (await this.drep.balanceOf(lpTokenUser2)).valueOf());

    })

    it('two person mine projector & official pool', async () => {
        this.drep = await MockERC20.new('DREPToken', 'DREP', '10000', { from: projecter1 });

        // LPToken
        this.lpdrep = await MockERC20.new('LPDREP', 'DREP/ETH', '10000000000');

        await this.lpdrep.transfer(lpTokenUser1, '1000');

        assert.equal((await this.lpdrep.balanceOf(lpTokenUser1)).valueOf(), '1000');

        await this.lpdrep.transfer(lpTokenUser2, '1000');
        assert.equal((await this.lpdrep.balanceOf(lpTokenUser2)).valueOf(), '1000');

        // projecter1
        await this.lpten.approve(this.tenet.address, '100', { from: projecter1 });     
        await this.drep.approve(this.tenet.address, '600', { from: projecter1 });

        // tokenuser1
        await this.lpdrep.approve(this.tenet.address, '100', { from: lpTokenUser1 });
        await this.lpdrep.approve(this.tenet.address, '100', { from: lpTokenUser2 }); 

        nowBlock = (await web3.eth.getBlockNumber()).valueOf();
        startProject = nowBlock + 10;

        await this.tenet.depositTenByUser('100', { from: lpTenUser1 });
        await this.tenet.depositTenByUser('100', { from: lpTenUser2 });



        depositBlock = (await web3.eth.getBlockNumber()).valueOf();
        console.log('depositBlock block: ' + depositBlock);

        // projecter1
        await this.tenet.add(this.lpdrep.address, this.drep.address, '600', '0', '100', '5', '20', '2', '100', {from: projecter1});

        // lpdrep
        await this.tenet.depositLPToken('0', '100', { from: lpTokenUser1 });
        await this.tenet.depositLPToken('0', '100', { from: lpTokenUser2 });

        nowBlock = (await web3.eth.getBlockNumber()).valueOf();
        bonusEnd = 100 - (nowBlock - initBlock);
        console.log('bonusEnd blocks: ' + bonusEnd);

        for(i = 0; i < 99; i++){
            time.advanceBlock();
        }

        
        console.log("lpTenUser1 lpten bal: " + (await this.lpten.balanceOf(lpTenUser1)).valueOf());
        console.log("lpTenUser2 lpten bal: " + (await this.lpten.balanceOf(lpTenUser2)).valueOf());
        this.tenet.withdrawTenByUser('100', { from: lpTenUser1 });
        this.tenet.withdrawTenByUser('100', { from: lpTenUser2 });
        console.log("lpTenUser1 lpten bal: " + (await this.lpten.balanceOf(lpTenUser1)).valueOf());
        console.log("lpTenUser2 lpten bal: " + (await this.lpten.balanceOf(lpTenUser2)).valueOf());


        // await this.tenet.mineLPTen({ from: lpTenUser1 });
        // await this.tenet.mineLPTen({ from: lpTenUser2 });

        console.log("lpTenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTenUser1)).valueOf());
        console.log("lpTenUser2 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTenUser2)).valueOf());

        await this.tenet.mineLPToken('0', { from: lpTokenUser1 });
        await this.tenet.mineLPToken('0', { from: lpTokenUser2 });

        console.log("lpTokenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTokenUser1)).valueOf());
        console.log("lpTokenUser2 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTokenUser2)).valueOf());

        console.log("lpTokenUser1 drep bal: " + (await this.drep.balanceOf(lpTokenUser1)).valueOf());
        console.log("lpTokenUser2 drep bal: " + (await this.drep.balanceOf(lpTokenUser2)).valueOf());


        await this.tenet.mineLPTen({ from: lpTenUser1 });
        await this.tenet.mineLPTen({ from: lpTenUser2 });

        console.log("lpTenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTenUser1)).valueOf());
        console.log("lpTenUser2 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTenUser2)).valueOf());

        await this.tenet.mineLPToken('0', { from: lpTokenUser1 });
        await this.tenet.mineLPToken('0', { from: lpTokenUser2 });

        console.log("lpTokenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTokenUser1)).valueOf());
        console.log("lpTokenUser2 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTokenUser2)).valueOf());

        console.log("lpTokenUser1 drep bal: " + (await this.drep.balanceOf(lpTokenUser1)).valueOf());
        console.log("lpTokenUser2 drep bal: " + (await this.drep.balanceOf(lpTokenUser2)).valueOf());

    })


    // it('depositLPTokenFrom ', async () => {

    //     // await this.tenet.depositTenByUser('100', { from: lpTenUser1 });
    //     // // // await this.tenet.depositTenByUser('100', { from: lpTenUser2 });

    //     // assert.equal((await this.lpten.balanceOf(lpTenUser1)).valueOf(), '900');
    //     // assert.equal((await this.tenetToken.balanceOf(lpTenUser1)).valueOf(), '0');

    //     // startBlock = (await web3.eth.getBlockNumber()).valueOf();
    //     // console.log('startBlock block number: ' + startBlock);

    //     // await this.tenet.mineLPTen({ from: lpTenUser1 });
    //     // console.log("lpTenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTenUser1)).valueOf())
    //     // assert.equal((await this.tenetToken.balanceOf(lpTenUser1)).valueOf(), '0');
        

    //     // // // assert.equal((await this.tenetToken.balanceOf(lpTenUser1)).valueOf(), '0');
        
    //     // nowBlock = (await web3.eth.getBlockNumber()).valueOf();
    //     // console.log('nowBlock block number1: ' + nowBlock);
    //     // nextPeriodBlock = 99 - (nowBlock - startBlock);
    //     // for(i = 0 ; i < nextPeriodBlock; i++) {
    //     //     time.advanceBlock();
    //     // }

    //     // // // 800 + 97 * 400  + 50 * 2
    //     // await this.tenet.mineLPTen({ from: lpTenUser1 });
    //     // nowBlock = (await web3.eth.getBlockNumber()).valueOf();
    //     // console.log('nowBlock block number2: ' + nowBlock);
    //     // console.log("lpTenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTenUser1)).valueOf());

    //     // await this.tenet.mineLPTen({ from: lpTenUser1 });
    //     // console.log("lpTenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTenUser1)).valueOf());
        
    //     // await this.tenet.mineLPTen({ from: lpTenUser1 });
    //     // console.log("lpTenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTenUser1)).valueOf());

    //     // await this.tenet.mineLPTen({ from: lpTenUser2 });
    //     // console.log("lpTenUser2 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTenUser2)).valueOf());
    //     // assert(0)


    //     // for(i = 0 ; i < 50; i++) {
    //     //     time.advanceBlock();
    //     // }
    //     // await this.tenet.mineLPTen({ from: lpTenUser1 });
    //     // console.log("lpTenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTenUser1)).valueOf());

    //     // for(i = 0 ; i < 200; i++) {
    //     //     time.advanceBlock();
    //     // }

    //     // await this.tenet.mineLPTen({ from: lpTenUser1 });
    //     // console.log("lpTenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTenUser1)).valueOf());

    //     // await this.tenet.mineLPTen({ from: lpTenUser1 });
    //     // console.log("lpTenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTenUser1)).valueOf());
    //     // assert(0);
    //     // await this.tenet.mineLPTen({ from: lpTenUser1 });
    //     // console.log("lpTenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTenUser1)).valueOf());






    //     // nextPeriodBlock = (await web3.eth.getBlockNumber()).valueOf();
    //     // console.log('nextPeriodBlock block number: ' + nextPeriodBlock);
    //     // console.log('getPendingTenByUser: ' + (await this.tenetProxy.getPendingTenByUser(lpTenUser1)).valueOf());

    //     // console.log("lpTenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTenUser1)).valueOf());
    //     // await this.tenet.mineLPTen({ from: lpTenUser1 });
    //     // console.log("lpTenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTenUser1)).valueOf());



    //     // this.drep = await MockERC20.new('DREPToken', 'DREP', '10000', { from: projecter1 });

    //     // this.lpdrep = await MockERC20.new('LPDREP', 'DREP/ETH', '10000000000');
    //     // await this.lpdrep.transfer(lpTokenUser1, '1000');
    //     // await this.lpdrep.transfer(lpTokenUser2, '1000');

    //     // await this.lpten.approve(this.tenet.address, '100', { from: projecter1 });     
    //     // await this.drep.approve(this.tenet.address, '600', { from: projecter1 });

    //     // await this.tenet.add(this.lpdrep.address, this.drep.address, '600', '0', '100', '5', '20', '2', '100', {from: projecter1});
    //     // assert.equal((await this.drep.balanceOf(projecter1)).valueOf(), '9400');
    //     // assert.equal((await this.lpten.balanceOf(projecter1)).valueOf(), '900');


    //     // assert.equal((await this.lpdrep.balanceOf(lpTokenUser1)).valueOf(), '1000');
    //     // assert.equal((await this.lpdrep.balanceOf(lpTokenUser2)).valueOf(), '1000');


    //     // await this.lpdrep.approve(this.tenet.address, '100', { from: lpTokenUser1 });
    //     // await this.tenet.depositLPTokenFrom(lpTokenUser2, '0', '100', { from: lpTokenUser1 });
    //     // assert.equal((await this.lpdrep.balanceOf(lpTokenUser1)).valueOf(), '900');
    //     // assert.equal((await this.lpdrep.balanceOf(lpTokenUser2)).valueOf(), '1000');

    //     // userinfo = (await this.tenet.userInfo('0', lpTokenUser2)).valueOf();
    //     // assert.equal(userinfo[0], '100');

    //     // await this.tenet.mineLPToken('0', { from: lpTokenUser1 });
    //     // assert.equal((await this.drep.balanceOf(lpTokenUser1)).valueOf(), '0');

    //     // await this.tenet.mineLPToken('0', { from: lpTokenUser2 });
    //     // assert.equal((await this.drep.balanceOf(lpTokenUser2)).valueOf(), '20');

    //     // await this.tenet.withdrawLPToken('0', '100', {from: lpTokenUser2});
    //     // assert.equal((await this.lpdrep.balanceOf(lpTokenUser2)).valueOf(), '1100');


    // })

    // it('simulation user mining projecter pool and update alloc', async () => {

    //     this.drep = await MockERC20.new('DREPToken', 'DREP', '10000', { from: projecter1 });

    //     this.lpdrep = await MockERC20.new('LPDREP', 'DREP/ETH', '10000000000');

    //     await this.lpdrep.transfer(lpTokenUser1, '1000');

    //     assert.equal((await this.lpdrep.balanceOf(lpTokenUser1)).valueOf(), '1000');

    //     await this.lpdrep.transfer(lpTokenUser2, '1000');
    //     assert.equal((await this.lpdrep.balanceOf(lpTokenUser2)).valueOf(), '1000');

    //     await this.lpten.approve(this.tenet.address, '100', { from: projecter1 });     
    //     await this.drep.approve(this.tenet.address, '600', { from: projecter1 });

    //     await this.lpdrep.approve(this.tenet.address, '100', { from: lpTokenUser1 });
    //     await this.lpdrep.approve(this.tenet.address, '100', { from: lpTokenUser2 }); 
        
    //     // await this.tenet.depositTenByUser('100', { from: lpTenUser1 });
    //     // assert.equal((await this.tenetToken.balanceOf(lpTenUser1)).valueOf(), '0');
    //     // await this.tenet.mineLPTen({ from: lpTenUser1 });
    //     // console.log("lpTenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTenUser1)).valueOf())
    //     // // 800 + 80 
    //     // assert.equal((await this.tenetToken.balanceOf(lpTenUser1)).valueOf(), '880');

    //     nowBlock = (await web3.eth.getBlockNumber()).valueOf();
    //     startProject = nowBlock + 10;

    //     await this.tenet.add(this.lpdrep.address, this.drep.address, '600', '0', '100', '5', '20', '2', '100', {from: projecter1});

    //     await this.tenet.depositLPToken('0', '100', { from: lpTokenUser1 });

    //     nowBlock = (await web3.eth.getBlockNumber()).valueOf();
    //     bonusEnd = 100 - (nowBlock - initBlock);
    //     console.log('bonusEnd blocks: ' + bonusEnd);

    //     // await this.tenet.depositLPToken('0', '100','0', { from: lpTokenUser2 });
    //     // assert.equal((await this.tenetToken.balanceOf(lpTokenUser1)).valueOf(), '0');
    //     // await this.tenet.mineLPToken('0', { from: lpTokenUser1 });
    //     // assert.equal((await this.drep.balanceOf(lpTokenUser1)).valueOf(), '10');
    //     // (200 + 20)/1.2 * (1 + 0.2 * 1/2) = 201.6666  
    //     for(i = 0; i < 100; i++){
    //         time.advanceBlock();
    //     }
    //     // console.log("projecter1 drep bal: " + (await this.drep.balanceOf(projecter1)).valueOf());

    //     await this.tenet.mineLPToken('0', { from: lpTokenUser1 });
    //     // (200 * 80 + 20 * 21)/101 = 162.5

    //     console.log("lpTokenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTokenUser1)).valueOf());
    //     console.log("lpTokenUser1 drep bal: " + (await this.drep.balanceOf(lpTokenUser1)).valueOf());
    //     // await this.tenet.depositLPToken('0', '100', { from: lpTokenUser2 });

    //     await this.tenet.mineLPToken('0', { from: lpTokenUser1 });

    //     console.log("lpTokenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTokenUser1)).valueOf());
    //     console.log("lpTokenUser1 drep bal: " + (await this.drep.balanceOf(lpTokenUser1)).valueOf());
    //     await this.tenet.mineLPToken('0', { from: lpTokenUser1 });
    //     console.log("lpTokenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTokenUser1)).valueOf());



    //     // console.log("projecter1 drep bal: " + (await this.drep.balanceOf(projecter1)).valueOf());


    //     // assert(0);

    //     // assert.equal((await this.tenetToken.balanceOf(lpTokenUser1)).valueOf(), '201');
    //     // await this.tenet.depositLPToken('0', '100', { from: lpTokenUser2 });
    //     // await this.tenet.mineLPToken('0', { from: lpTokenUser2 });
    //     // ((200 + 20)/1.2 * (1 + 0.2 * 2/2))/2 = 110 
    //     // console.log("lpTokenUser2 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTokenUser2)).valueOf())
    //     // assert.equal((await this.tenetToken.balanceOf(lpTokenUser2)).valueOf(), '110');

    //     // for(i = 0; i < 100; i++){
    //     //     time.advanceBlock()
    //     // }
    //     // fromBlock = (await web3.eth.getBlockNumber()).valueOf() - initBlock;
    //     // console.log("Block interva: " + fromBlock);

    //     // console.log("now block: " + (await web3.eth.getBlockNumber()).valueOf());
    //     // await this.tenet.mineLPToken('0', { from: lpTokenUser1 });
    //     // await this.tenet.mineLPToken('0', { from: lpTokenUser2 });
    //     // console.log("lpTokenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTokenUser1)).valueOf())
    //     // console.log("lpTokenUser2 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTokenUser2)).valueOf())
    //     // // 11599 - 201 = 11398
    //     // assert.equal((await this.tenetToken.balanceOf(lpTokenUser1)).valueOf(), '11599');
    //     // // 11400 - 110 = 11290   11398 - 11290 = 108
    //     // assert.equal((await this.tenetToken.balanceOf(lpTokenUser2)).valueOf(), '11400');
    //     // await this.tenet.mineLPToken('0', { from: lpTokenUser1 });
    //     // await this.tenet.mineLPToken('0', { from: lpTokenUser2 });
    //     // console.log("lpTokenUser1 tenetToken bal: " + (await this.tenetToken.balanceOf(lpTokenUser1)).valueOf())
    //     // assert.equal((await this.tenetToken.balanceOf(lpTokenUser1)).valueOf(), '12005');
    //     // console.log("lastModifyAllocPointBlock: " + (await this.tenet.lastModifyAllocPointBlock()).valueOf())
        
    // });


    // it('simulation two user and two projecter mining ten and project pool', async () => {
        
    //     this.drep = await MockERC20.new('DREPToken', 'DREP', '10000', { from: projecter1 });
    //     this.lmm = await MockERC20.new('LMMToken', 'LMM', '10000', { from: projecter2 });

    //     this.lpdrep = await MockERC20.new('LPDREP', 'DREP/ETH', '10000000000');
    //     await this.lpdrep.transfer(lpTokenUser1, '1000');
    //     assert.equal((await this.lpdrep.balanceOf(lpTokenUser1)).valueOf(), '1000');
    //     await this.lpdrep.transfer(lpTokenUser2, '1000');
    //     assert.equal((await this.lpdrep.balanceOf(lpTokenUser2)).valueOf(), '1000');

    //     this.lplmm = await MockERC20.new('LPLMM', 'LMM/ETH', '10000000000');
    //     await this.lplmm.transfer(lpTokenUser1, '1000');
    //     assert.equal((await this.lplmm.balanceOf(lpTokenUser1)).valueOf(), '1000');
    //     await this.lplmm.transfer(lpTokenUser2, '1000');
    //     assert.equal((await this.lplmm.balanceOf(lpTokenUser2)).valueOf(), '1000');

    //     await this.lpten.approve(this.tenet.address, '100', { from: projecter1 });     
    //     await this.drep.approve(this.tenet.address, '600', { from: projecter1 });

    //     await this.lpten.approve(this.tenet.address, '200', { from: projecter2 });     
    //     await this.lmm.approve(this.tenet.address, '660', { from: projecter2 });

    //     await this.lpdrep.approve(this.tenet.address, '100', { from: lpTokenUser1 });
    //     await this.lpdrep.approve(this.tenet.address, '100', { from: lpTokenUser2 }); 

    //     await this.lplmm.approve(this.tenet.address, '100', { from: lpTokenUser1 });
    //     await this.lplmm.approve(this.tenet.address, '100', { from: lpTokenUser2 }); 

    //     await this.lpten.approve(this.tenet.address, '100', { from: lpTenUser1 });
    //     await this.lpten.approve(this.tenet.address, '100', { from: lpTenUser2 });
    //     await this.tenet.depositTenByUser('100', {from: lpTenUser1});
    //     assert.equal((await this.tenet.getPendingTenByUser(lpTenUser1)).valueOf(), '0');
    //     await this.tenet.depositTenByUser('100', {from: lpTenUser2});

    //     await this.tenet.mineLPTen({from: lpTenUser1});
    //     // 880 + 440
    //     assert.equal((await this.tenetToken.balanceOf(lpTenUser1)).valueOf(), '1320');
    //     assert.equal((await this.tenet.getPendingTenByUser(lpTenUser2)).valueOf(), '440');
    //     await this.tenet.mineLPTen({from: lpTenUser2});
    //     assert.equal((await this.tenetToken.balanceOf(lpTenUser2)).valueOf(), '880');
    //     assert.equal((await this.tenet.getPendingTenByUser(lpTenUser2)).valueOf(), '0');
    //     await this.tenet.add(this.lpdrep.address, this.drep.address, '600', '0', '100', '5', '20', '2', '100', {from: projecter1});
    //     await this.tenet.add(this.lplmm.address, this.lmm.address, '660', '0', '100', '6', '10', '2', '100', {from: projecter2});
        
    //     await this.tenet.depositLPToken('0', '100','0', { from: lpTokenUser1 });

    //     await this.tenet.depositLPToken('0', '100','0', { from: lpTokenUser2 });
    //     await this.tenet.depositLPToken('1', '100','0', { from: lpTokenUser1 });
    //     await this.tenet.depositLPToken('1', '100','0', { from: lpTokenUser2 });

    //     await this.tenet.mineLPToken('0',{ from: lpTokenUser1 });
    //     assert.equal((await this.drep.balanceOf(lpTokenUser1)).valueOf(), '25');
    //     assert.equal((await this.tenetToken.balanceOf(lpTokenUser1)).valueOf(), '265');

    //     await this.tenet.mineLPToken('1',{ from: lpTokenUser1 });
    //     assert.equal((await this.lmm.balanceOf(lpTokenUser1)).valueOf(), '24');

    //     await this.tenet.mineLPToken('0', { from: lpTokenUser2 });
    //     assert.equal((await this.drep.balanceOf(lpTokenUser2)).valueOf(), '25');
    //     assert.equal((await this.tenetToken.balanceOf(lpTokenUser2)).valueOf(), '275');
    //     await this.tenet.mineLPToken('1', { from: lpTokenUser2 });
    //     assert.equal((await this.lmm.balanceOf(lpTokenUser2)).valueOf(), '24');
    //     assert.equal((await this.tenetToken.balanceOf(lpTokenUser2)).valueOf(), '495');

    //     await this.tenet.withdrawLPToken('0', '100', { from: lpTokenUser1 });
    //     assert.equal((await this.lpdrep.balanceOf(lpTokenUser1)).valueOf(), '1000');
    //     assert.equal((await this.drep.balanceOf(lpTokenUser1)).valueOf(), '45');

    //     await this.tenet.withdrawTenByProject('0', '100', { from: projecter1 });
    //     assert.equal((await this.lpten.balanceOf(projecter1)).valueOf(), '1000');
    //     await this.tenet.mineLPToken('0', { from: lpTokenUser2 });
    //     assert.equal((await this.drep.balanceOf(lpTokenUser2)).valueOf(), '55');
    //     assert.equal((await this.tenetToken.balanceOf(lpTokenUser2)).valueOf(), '705');

    // });

    // it('simulation user mining projecter pool after end bounus', async () => {

    //     this.drep = await MockERC20.new('DREPToken', 'DREP', '10000', { from: projecter1 });

    //     this.lpdrep = await MockERC20.new('LPDREP', 'DREP/ETH', '10000000000');
    //     await this.lpdrep.transfer(lpTokenUser1, '1000');
    //     await this.lpdrep.transfer(lpTokenUser2, '1000');

    //     await this.lpten.approve(this.tenet.address, '100', { from: projecter1 });     
    //     await this.drep.approve(this.tenet.address, '600', { from: projecter1 });

    //     await this.tenet.add(this.lpdrep.address, this.drep.address, '600', '0', '100', '5', '20', '2', '100', {from: projecter1});
    //     assert.equal((await this.drep.balanceOf(projecter1)).valueOf(), '9400');
    //     assert.equal((await this.lpten.balanceOf(projecter1)).valueOf(), '900');

    //     for(let i=0;i<20;i++){
    //         await time.advanceBlock();
    //     }
    //     await this.lpdrep.approve(this.tenet.address, '100', { from: lpTokenUser1 });
    //     await this.tenet.depositLPToken('0', '100', { from: lpTokenUser1 });
    //     await this.tenet.mineLPToken('0', { from: lpTokenUser1 });
    //     assert.equal((await this.drep.balanceOf(lpTokenUser1)).valueOf(), '5');

    //     for(let i=0;i<100;i++){
    //         await time.advanceBlock();
    //     }
    //     await this.tenet.depositTenByUser('100', { from: lpTenUser1 });
    //     await this.tenet.mineLPTen( { from: lpTenUser1 });
    //     await this.tenet.withdrawTenByUser('100', { from: lpTenUser1 });
    //     assert.equal((await this.lpten.balanceOf(lpTenUser1)).valueOf(), '1000');
    //     await this.tenet.withdrawLPToken('0', '100', { from: lpTokenUser1 });
    //     await this.tenet.withdrawTenByProject('0', '100', { from: projecter1 });
    //     assert.equal((await this.drep.balanceOf(lpTokenUser1)).valueOf(), '390');

    // });

});
