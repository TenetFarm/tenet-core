var HDWalletProvider = require("truffle-hdwallet-provider"); 
//var mnemonic = "";
var privatekey = "F99DC4675D8E5C32234AD75850A7DBAB2216DFBE9A527D5309BDC3F8EA87CD06"; 
module.exports = {
  // Uncommenting the defaults below
  // provides for an easier quick-start with Ganache.
  // You can also follow this format for other networks;
  // see <http://truffleframework.com/docs/advanced/configuration>
  // for more details on how to specify configuration options!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 9545,
      network_id: "*"
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(privatekey, "https://ropsten.infura.io/v3/34c59a94d8ef460086c55841531e0b67",0);
      },
      network_id: "*",// match any network
      networkCheckTimeout: 200000, 
      gas: 8000000,
      gasPrice: 20000000000
    },
  },
  compilers: {
    solc: {
      version: "0.6.12"
    }
  }
};
