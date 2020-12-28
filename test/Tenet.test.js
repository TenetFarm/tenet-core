const TenetToken = artifacts.require('TenetToken');
const Tenet = artifacts.require('Tenet');
const MockERC20 = artifacts.require('MockERC20');
const TenetMine = artifacts.require('TenetMine');
const TenetProxy = artifacts.require('TenetProxy');

contract('Tenet', ([owner, dev, projecter1, projecter2, lpTenUser1,lpTenUser2,lpTokenUser1,lpTokenUser2]) => {

    beforeEach(async () => {
        this.tenetToken = await TenetToken.new();
        this.lpten = await MockERC20.new('LPToken','TEN/ETH',1000000000000);
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

        await this.tenet.add(this.lpdrep.address, this.drep.address, '600', '0', '100', '5', '20', '2', '100', {from: projecter1});

        await this.tenet.depositLPToken('0', '100', { from: lpTokenUser1 });
        await this.tenet.depositLPToken('0', '100', { from: lpTokenUser2 });

        nowBlock = (await web3.eth.getBlockNumber()).valueOf();
        bonusEnd = 100 - (nowBlock - initBlock);
        console.log('bonusEnd blocks: ' + bonusEnd);

        for(i = 0; i < 99; i++){
            time.advanceBlock();
        }

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

});
