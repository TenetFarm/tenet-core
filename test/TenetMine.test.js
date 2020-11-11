const TenetMine = artifacts.require('TenetMine');

contract('TenetMine', ([owner, dev, projecter1, projecter2, lpTenUser1,lpTenUser2,lpTokenUser1,lpTokenUser2]) => {

    it('init params', async () => {
        this.lpten = await MockERC20.at("0xE813c3BCeb1C53c60fB7e5464843D40D23e48F3d");
        this.tenet = await Tenet.at("0x940A10E996FF10d1400600A218c3B1138eC617A2");
        this.tenetToken = await TenetToken.at("0x1E64c944611C493Ae5F7dDc9991C48112f75302D");
        await this.tenetToken.transferOwnership(this.tenet.address);
        await this.lpten.transfer(projecter1, '1000');
        await this.lpten.transfer(projecter2, '1000');
        await this.lpten.transfer(lpTenUser1, '1000');
        await this.lpten.transfer(lpTenUser2, '1000');
    });

    it('simulation user mining projecter pool', async () => {

        // 项目方发币
        this.token0 = await MockERC20.new('TestToken', 'Token0', '10000', { from: projecter1 });

        // 项目方的LPToken
        this.lptoken0 = await MockERC20.new('LPToken0', 'Token0/ETH', '10000000000');

        await this.lptoken0.transfer(lpTokenUser1, '1000');

        assert.equal((await this.lptoken0.balanceOf(lpTokenUser1)).valueOf(), '1000');

        await this.lptoken0.transfer(lpTokenUser2, '1000');
        assert.equal((await this.lptoken0.balanceOf(lpTokenUser2)).valueOf(), '1000');

        // projecter1授权
        await this.lpten.approve(this.tenet.address, '100', { from: projecter1 });     
        await this.token0.approve(this.tenet.address, '600', { from: projecter1 });

        // tokenuser 授权
        await this.lptoken0.approve(this.tenet.address, '100', { from: lpTokenUser1 });
        await this.lptoken0.approve(this.tenet.address, '100', { from: lpTokenUser2 }); 

        // projecter1添加矿池
        await this.tenet.add(this.lptoken0.address, this.token0.address, '600', '0', '100', '5', '20', '2', '100', {from: projecter1});

        await this.tenet.depositLPToken('0', '100', { from: lpTokenUser1 });
        
        await this.tenet.depositLPToken('0', '100', { from: lpTokenUser2 });

        await this.tenet.mineLPToken('0', { from: lpTokenUser1 });

        assert.equal((await this.token0.balanceOf(lpTokenUser1)).valueOf(), '15');
        assert.equal((await this.tenetToken.balanceOf(lpTokenUser1)).valueOf(), '3000');

        await this.tenet.mineLPToken('0', { from: lpTokenUser2 });
        assert.equal((await this.token0.balanceOf(lpTokenUser2)).valueOf(), '10');
        assert.equal((await this.tenetToken.balanceOf(lpTokenUser2)).valueOf(), '2000');

        await this.tenet.mineLPToken('0', { from: lpTokenUser1 });

        assert.equal((await this.token0.balanceOf(lpTokenUser1)).valueOf(), '25');
        assert.equal((await this.tenetToken.balanceOf(lpTokenUser1)).valueOf(), '5000');
        time.advanceBlock();

        assert.equal((await this.tenet.getPendingToken('0', lpTokenUser1)).valueOf(), '5');
        assert.equal((await this.tenet.getPendingTen('0', lpTokenUser1)).valueOf(), '1000');

        assert.equal((await this.tenet.getPendingTenByProject('0')).valueOf(), '2000');

        await this.lpten.approve(this.tenet.address, '100', { from: lpTenUser1 });
        await this.tenet.depositTenByUser('100', {from: lpTenUser1});
        time.advanceBlock();
        assert.equal((await this.tenet.getPendingTenByUser(lpTenUser1)).valueOf(), '8000');
        // 距离上次查询间隔2个块
        assert.equal((await this.tenet.getPendingTenByProject('0')).valueOf(), '8000');

        await this.tenet.withdrawTenByUser('100', {from: lpTenUser1});
        assert.equal((await this.tenetToken.balanceOf(lpTenUser1)).valueOf(), '16000');
        assert.equal((await this.lpten.balanceOf(lpTenUser1)).valueOf(), '1000');
        assert.equal((await this.tenet.getPendingTenByUser(lpTenUser1)).valueOf(), '0');
        // 退出ten挖矿，方便下步测试
        await this.tenet.withdrawTenByProject('0','100', {from: projecter1});
        assert.equal((await this.lpten.balanceOf(projecter1)).valueOf(), '1000');
        
    });

    it('simulation two user and two projecter mining ten and project pool', async () => {
        
        // 项目方发币
        this.token0 = await MockERC20.new('TestToken0', 'token0', '10000', { from: projecter1 });
        this.lmm = await MockERC20.new('LMMToken', 'LMM', '10000', { from: projecter2 });

        // projecter1发LPToken并转账
        this.lptoken0 = await MockERC20.new('LPToken0', 'TOKEN0/ETH', '10000000000');
        await this.lptoken0.transfer(lpTokenUser1, '1000');
        assert.equal((await this.lptoken0.balanceOf(lpTokenUser1)).valueOf(), '1000');
        await this.lptoken0.transfer(lpTokenUser2, '1000');
        assert.equal((await this.lptoken0.balanceOf(lpTokenUser2)).valueOf(), '1000');

        // projecter2发LPToken并转账
        this.lplmm = await MockERC20.new('LPLMM', 'LMM/ETH', '10000000000');
        await this.lplmm.transfer(lpTokenUser1, '1000');
        assert.equal((await this.lplmm.balanceOf(lpTokenUser1)).valueOf(), '1000');
        await this.lplmm.transfer(lpTokenUser2, '1000');
        assert.equal((await this.lplmm.balanceOf(lpTokenUser2)).valueOf(), '1000');

        // projecter1授权
        await this.lpten.approve(this.tenet.address, '100', { from: projecter1 });     
        await this.token0.approve(this.tenet.address, '600', { from: projecter1 });

        //projecter2授权
        await this.lpten.approve(this.tenet.address, '200', { from: projecter2 });     
        await this.lmm.approve(this.tenet.address, '660', { from: projecter2 });

        // tokenuser 授权 lptoken1 给 chef
        await this.lptoken0.approve(this.tenet.address, '100', { from: lpTokenUser1 });
        await this.lptoken0.approve(this.tenet.address, '100', { from: lpTokenUser2 }); 

        // tokenuser 授权 lptoken2 给 chef
        await this.lplmm.approve(this.tenet.address, '100', { from: lpTokenUser1 });
        await this.lplmm.approve(this.tenet.address, '100', { from: lpTokenUser2 }); 

        // lpTenUser1 授权lpten 准备挖官方池
        await this.lpten.approve(this.tenet.address, '100', { from: lpTenUser1 });
        // lpTenUser2 授权lpten 准备挖官方池
        await this.lpten.approve(this.tenet.address, '100', { from: lpTenUser2 });
        // lpTenUser1 充lpten 挖矿
        await this.tenet.depositTenByUser('100', {from: lpTenUser1});
        assert.equal((await this.tenet.getPendingTenByUser(lpTenUser1)).valueOf(), '0');
        // lpTenUser2 充lpten 挖矿
        await this.tenet.depositTenByUser('100', {from: lpTenUser2});

        // lpTenUser1 提取ten
        await this.tenet.mineLPTen({from: lpTenUser1});
        // 16000 + 12000
        assert.equal((await this.tenetToken.balanceOf(lpTenUser1)).valueOf(), '28000');
        // lpTenUser1 提取ten
        await this.tenet.mineLPTen({from: lpTenUser1});
        assert.equal((await this.tenetToken.balanceOf(lpTenUser1)).valueOf(), '32000');
        assert.equal((await this.tenet.getPendingTenByUser(lpTenUser1)).valueOf(), '0');
        assert.equal((await this.tenet.getPendingTenByUser(lpTenUser2)).valueOf(), '8000');
        assert.equal((await this.tenetToken.balanceOf(lpTenUser2)).valueOf(), '0');
        // lpTenUser2 提取ten
        await this.tenet.mineLPTen({from: lpTenUser2});
        assert.equal((await this.tenetToken.balanceOf(lpTenUser2)).valueOf(), '12000');
        assert.equal((await this.tenet.getPendingTenByUser(lpTenUser2)).valueOf(), '0');
        // projecter1添加矿池并抵押lptoken0 和 lpten
        await this.tenet.add(this.lptoken0.address, this.token0.address, '600', '0', '100', '5', '20', '2', '100', {from: projecter1});
        // projecter2添加矿池并抵押lplmm 和 lpten
        await this.tenet.add(this.lplmm.address, this.lmm.address, '660', '0', '100', '6', '10', '2', '100', {from: projecter2});
        
        // lpTenUser1 提取ten
        assert.equal((await this.tenet.getPendingTenByUser(lpTenUser1)).valueOf(), '12000');
        await this.tenet.depositLPToken('1', '100', { from: lpTokenUser1 });
        assert.equal((await this.tenet.getPendingToken('1', lpTokenUser1)).valueOf(), '0');
        assert.equal((await this.tenet.getPendingTen('1', lpTokenUser1)).valueOf(), '0');

        await this.tenet.depositLPToken('1', '100', { from: lpTokenUser2 });
        assert.equal((await this.tenet.getPendingToken('1', lpTokenUser1)).valueOf(), '10');
        assert.equal((await this.tenet.getPendingTen('1', lpTokenUser1)).valueOf(), '1000');

        await this.tenet.depositLPToken('2', '100', { from: lpTokenUser1 });
        await this.tenet.depositLPToken('2', '100', { from: lpTokenUser2 });
        assert.equal((await this.tenet.getPendingToken('2', lpTokenUser1)).valueOf(), '12');
        assert.equal((await this.tenet.getPendingTen('2', lpTokenUser1)).valueOf(), '1000');

        await this.tenet.mineLPToken('1',{ from: lpTokenUser1 });
        assert.equal((await this.token0.balanceOf(lpTokenUser1)).valueOf(), '25');
        await this.tenet.mineLPToken('2',{ from: lpTokenUser1 });
        assert.equal((await this.lmm.balanceOf(lpTokenUser1)).valueOf(), '24');

        await this.tenet.mineLPToken('1', { from: lpTokenUser2 });
        assert.equal((await this.token0.balanceOf(lpTokenUser2)).valueOf(), '25');
        // 第一步测试时余额为2000
        assert.equal((await this.tenetToken.balanceOf(lpTokenUser2)).valueOf(), '4500');
        await this.tenet.mineLPToken('2', { from: lpTokenUser2 });
        assert.equal((await this.lmm.balanceOf(lpTokenUser2)).valueOf(), '24');
        assert.equal((await this.tenetToken.balanceOf(lpTokenUser2)).valueOf(), '6500');

        await this.tenet.withdrawLPToken('1', '100', { from: lpTokenUser1 });
        assert.equal((await this.lptoken0.balanceOf(lpTokenUser1)).valueOf(), '1000');
        assert.equal((await this.token0.balanceOf(lpTokenUser1)).valueOf(), '45');

        await this.tenet.withdrawTenByProject('1', '100', { from: projecter1 });
        assert.equal((await this.lpten.balanceOf(projecter1)).valueOf(), '1000');
        await this.tenet.mineLPToken('1', { from: lpTokenUser2 });
        assert.equal((await this.token0.balanceOf(lpTokenUser2)).valueOf(), '55');
        assert.equal((await this.tenetToken.balanceOf(lpTokenUser2)).valueOf(), '8500');

        //退出ten挖矿
        await this.tenet.withdrawTenByProject('2','100', {from: projecter2});
        assert.equal((await this.lpten.balanceOf(projecter1)).valueOf(), '1000');

    });

    it('simulation user mining projecter pool after end bounus', async () => {

        // 项目方发币
        this.token0 = await MockERC20.new('TestToken0', 'TOKEN0', '10000', { from: projecter1 });

        // 项目方的LPToken
        this.lptoken0 = await MockERC20.new('LPToken0', 'TOKEN0/ETH', '10000000000');
        await this.lptoken0.transfer(lpTokenUser1, '1000');
        await this.lptoken0.transfer(lpTokenUser2, '1000');

        // projecter1添加矿池
        await this.lpten.approve(this.tenet.address, '100', { from: projecter1 });     
        await this.token0.approve(this.tenet.address, '600', { from: projecter1 });

        await this.tenet.add(this.lptoken0.address, this.token0.address, '600', '0', '100', '5', '20', '2', '100', {from: projecter1});
        assert.equal((await this.token0.balanceOf(projecter1)).valueOf(), '9400');
        assert.equal((await this.lpten.balanceOf(projecter1)).valueOf(), '900');

        for(let i=0;i<20;i++){
            await time.advanceBlock();
        }
        await this.lptoken0.approve(this.tenet.address, '100', { from: lpTokenUser1 });
        await this.tenet.depositLPToken('3', '100', { from: lpTokenUser1 });
        await this.tenet.mineLPToken('3', { from: lpTokenUser1 });
        assert.equal((await this.token0.balanceOf(lpTokenUser1)).valueOf(), '5');
    });

});
