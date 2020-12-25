var HDWalletProvider = require("truffle-hdwallet-provider");  // 导入模块
//MetaMask的助记词。 
//var mnemonic = "";
//MetaMask的私钥
var privatekey = "F99DC4675D8E5C32234AD75850A7DBAB2216DFBE9A527D5309BDC3F8EA87CD06"; 
//0x1F6e46dB43838FC81aAf6A93a446D67eB430a385
//F99DC4675D8E5C32234AD75850A7DBAB2216DFBE9A527D5309BDC3F8EA87CD06
module.exports = {
  // Uncommenting the defaults below
  // provides for an easier quick-start with Ganache.
  // You can also follow this format for other networks;
  // see <http://truffleframework.com/docs/advanced/configuration>
  // for more details on how to specify configuration options!
  //
  networks: {
    development: {
      host: "127.0.0.1",
      port: 9545,
      network_id: "*"
    },
  //  test: {
  //    host: "127.0.0.1",
  //    port: 7545,
  //    network_id: "*"
  //  }
  	ropsten: {
		provider: function() {
			return new HDWalletProvider(privatekey, "https://ropsten.infura.io/v3/34c59a94d8ef460086c55841531e0b67",0);
			//return new HDWalletProvider(privatekey, "https://ropsten.infura.io/v3/432715bb87a94c668ae771fe9c139d25",0);
			//return new HDWalletProvider(privatekey, "https://ropsten.infura.io/v3/48cfd98a3aa94bf5835725483e7468dd",0);
		},
		network_id: "*",// match any network
		networkCheckTimeout: 200000, 
		//gas: 8000000000000000000000000008,
		gasPrice: 20000000000
	},
  	rinkeby: {
		provider: function() {
			return new HDWalletProvider(privatekey, "https://rinkeby.infura.io/v3/34c59a94d8ef460086c55841531e0b67",0);
		},
		network_id: "*",// match any network
		networkCheckTimeout: 200000, 
		//gas: 8000000000000000000000000008,
		//gasPrice: 20000000000
	},	
	mainnet: {
		provider: function() {
			return new HDWalletProvider(privatekey, "https://mainnet.infura.io/v3/34c59a94d8ef460086c55841531e0b67",0);
		},
		network_id: "1",// match any network
		networkCheckTimeout: 200000,		
	},
    bscmain: {
      provider: function() {
          return new HDWalletProvider(privatekey, "https://bsc-dataseed1.binance.org", 0);   // 1表示第二个账户(从0开始)
      },
      network_id: "56",  
    },
    bsctest: {
      provider: function() {
          return new HDWalletProvider(privatekey, "https://data-seed-prebsc-1-s1.binance.org:8545", 0);   // 1表示第二个账户(从0开始)
      },
      network_id: "97",  
    },	
  },
  //
  compilers: {
    solc: {
      version: "0.6.12"
    }
  }
};
