/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 require("@nomiclabs/hardhat-ethers");
 require('dotenv').config();

// require("@nomiclabs/hardhat-waffle")

const {API_URL,PRIVATE_KEY}= process.env;


module.exports = {
  solidity: "0.8.13",
  defaultNetwork: "goerli",
  
    
 
  

  networks:{
    goerli:{
      url:API_URL,
      accounts:[`0x${PRIVATE_KEY}`]
      
      
    }
  }
};

// defaultNetwork: "goerli",


