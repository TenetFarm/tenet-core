const MockERC20 = artifacts.require('MockERC20');
const TenetSwap = artifacts.require('TenetSwap');

contract('start test tenet swap', () => {
    it('test transferETHsToLPToken', async () => {
        this.TenetSwap = await TenetSwap.new("0x8261440CFf40639ef158cB2558Bb12BBDDE3C072", "0xc778417e063141139fce010982780140aa0cd5ab");
        console.log("this.TenetSwap.address: " + this.TenetSwap.address);

        this.usdt = await MockERC20.at('0x112c78ee0d6a7f866b563f043042176dfce17472');
        this.wk = await MockERC20.at('0x1d518cf870299256c6c486454f9282122e396f6f');
        this.ten = await MockERC20.at('0x3ae9f288852c85a6bd5df83aff43e6475842d299');

        await this.usdt.approve(this.TenetSwap.address, '100000000000000000000000000');
        await this.wk.approve(this.TenetSwap.address, '100000000000000000000000000');
        await this.ten.approve(this.TenetSwap.address, '100000000000000000000000000');

        await this.TenetSwap.transferETHsToLPToken('1', '1', '0x1e5ca1f85525896d4a16014621aa176342ef3bf0', '42861600000000000000', '900', '1903936607', {value: '1000000000000000'})
    });

    it('test transferTokensToLPToken', async () => {
        this.TenetSwap = await TenetSwap.at('0xa934921fed508D420a9e3b0475ABa8C81fa80591');
        // this.TenetSwap = await TenetSwap.new("0x8261440CFf40639ef158cB2558Bb12BBDDE3C072", "0xc778417e063141139fce010982780140aa0cd5ab");
        console.log("this.TenetSwap.address: " + this.TenetSwap.address);

        this.usdt = await MockERC20.at('0x112c78ee0d6a7f866b563f043042176dfce17472');
        this.wk = await MockERC20.at('0x1d518cf870299256c6c486454f9282122e396f6f');
        this.ten = await MockERC20.at('0x3ae9f288852c85a6bd5df83aff43e6475842d299');
        console.log("usdt bal: " + (await this.usdt.balanceOf(OwnerAddr)).valueOf());
        console.log("wk bal: " + (await this.wk.balanceOf(OwnerAddr)).valueOf());
        console.log("ten bal: " + (await this.ten.balanceOf(OwnerAddr)).valueOf());

        await this.TenetSwap.transferTokensToLPToken('1', '0', '0xb55afd56be90e2c280bc48dc56924cfc5ab23c80', '1000000000000000', '99185300000000000', '900', '1903936607')
        
    });

    it('test transferTokenToLPToken', async () => {
        this.TenetSwap = await TenetSwap.at('0xa934921fed508D420a9e3b0475ABa8C81fa80591');
        // this.TenetSwap = await TenetSwap.new("0x8261440CFf40639ef158cB2558Bb12BBDDE3C072", "0xc778417e063141139fce010982780140aa0cd5ab");
        console.log("this.TenetSwap.address: " + this.TenetSwap.address);

        this.usdt = await MockERC20.at('0x112c78ee0d6a7f866b563f043042176dfce17472');
        this.wk = await MockERC20.at('0x1d518cf870299256c6c486454f9282122e396f6f');
        this.ten = await MockERC20.at('0x3ae9f288852c85a6bd5df83aff43e6475842d299');
        console.log("usdt bal: " + (await this.usdt.balanceOf(OwnerAddr)).valueOf());
        console.log("wk bal: " + (await this.wk.balanceOf(OwnerAddr)).valueOf());
        console.log("ten bal: " + (await this.ten.balanceOf(OwnerAddr)).valueOf());

        await this.TenetSwap.transferTokenToLPToken('1', '0', '0xb55afd56be90e2c280bc48dc56924cfc5ab23c80', '0x112c78ee0d6a7f866b563f043042176dfce17472', '10000000000000000', '900', '1903936607')
        
    });

    it('test changeLPToken', async () => {
        this.TenetSwap = await TenetSwap.at('0xa934921fed508D420a9e3b0475ABa8C81fa80591');
        // this.TenetSwap = await TenetSwap.new("0x8261440CFf40639ef158cB2558Bb12BBDDE3C072", "0xc778417e063141139fce010982780140aa0cd5ab");
        console.log("this.TenetSwap.address: " + this.TenetSwap.address);

        this.usdt = await MockERC20.at('0x112c78ee0d6a7f866b563f043042176dfce17472');
        this.wk = await MockERC20.at('0x1d518cf870299256c6c486454f9282122e396f6f');
        this.ten = await MockERC20.at('0x3ae9f288852c85a6bd5df83aff43e6475842d299');
        console.log("usdt bal: " + (await this.usdt.balanceOf(OwnerAddr)).valueOf());
        console.log("wk bal: " + (await this.wk.balanceOf(OwnerAddr)).valueOf());
        console.log("ten bal: " + (await this.ten.balanceOf(OwnerAddr)).valueOf());
        await this.TenetSwap.changeLPToken('0x0a61a7a5f0c33425cf6c079da3d5dcc3881fdb27', ['100000', '100000'], '900', '1903936607')
    });

    it('test changeWethLPToken', async () => {
        this.TenetSwap = await TenetSwap.at('0xa934921fed508D420a9e3b0475ABa8C81fa80591');
        // this.TenetSwap = await TenetSwap.new("0x8261440CFf40639ef158cB2558Bb12BBDDE3C072", "0xc778417e063141139fce010982780140aa0cd5ab");
        console.log("this.TenetSwap.address: " + this.TenetSwap.address);

        this.usdt = await MockERC20.at('0x112c78ee0d6a7f866b563f043042176dfce17472');
        this.wk = await MockERC20.at('0x1d518cf870299256c6c486454f9282122e396f6f');
        this.ten = await MockERC20.at('0x3ae9f288852c85a6bd5df83aff43e6475842d299');
        console.log("usdt bal: " + (await this.usdt.balanceOf(OwnerAddr)).valueOf());
        console.log("wk bal: " + (await this.wk.balanceOf(OwnerAddr)).valueOf());
        console.log("ten bal: " + (await this.ten.balanceOf(OwnerAddr)).valueOf());

        await this.TenetSwap.changeWethLPToken('0x1e5ca1f85525896d4a16014621aa176342ef3bf0', '4300600000000000000', '900', '1903936607', {value: '100000000000000'})
    });
})