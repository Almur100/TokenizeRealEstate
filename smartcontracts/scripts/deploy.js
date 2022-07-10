async function main() {
    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with the account: ' + deployer.address);


      const NFT = await ethers.getContractFactory('NFT');
      const nft = await NFT.deploy();
  
    
      const ERC20 = await ethers.getContractFactory('MyToken');
      const erc20 = await ERC20.deploy("Almur","AH");
  
    
      const Trealestate = await ethers.getContractFactory('tokenizeRealestate');
      const trealestate = await Trealestate.deploy(erc20.address);
  
     console.log( "nftaddr: " + nft.address );
     console.log( "erc20addr: " + erc20.address ); 
     console.log( "realestateaddr: " + trealestate.address ); 
  
  }
  
  main()
      .then(() => process.exit())
      .catch(error => {
          console.error(error);
          process.exit(1);
  })

//   nftaddr: 0x13b3673DfE0d5bAF43508b812a444083b41E87eF
// erc20addr: 0x56F8479eFD7B1574D207EFf90F8090e1c152c654
// realestateaddr: 0x6Ef8c7F41F2adaD277FE204703c0a77c1cb58cE8
// 0x6ef8c7f41f2adad277fe204703c0a77c1cb58ce8