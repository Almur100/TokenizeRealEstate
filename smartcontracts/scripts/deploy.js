async function main() {
    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with the account: ' + deployer.address);


    //   const NFT = await ethers.getContractFactory('NFT');
    //   const nft = await NFT.deploy();
  
    
    //   const ERC20 = await ethers.getContractFactory('MyToken');
    //   const erc20 = await ERC20.deploy("Almur","AH");
    const addr = "0xcaF99B4Cf553Be9E2993A5EA4B04C7814c9f4F1C";
  
    
      const Trealestate = await ethers.getContractFactory('tokenizeRealestate');
      const trealestate = await Trealestate.deploy(addr);
  
    //  console.log( "nftaddr: " + nft.address );
     console.log( "erc20addr: " + erc20.address ); 
     console.log( "realestateaddr: " + trealestate.address ); 
  
  }
  
  main()
      .then(() => process.exit())
      .catch(error => {
          console.error(error);
          process.exit(1);
  })


//   nftaddr: 0x652F5f72f7FACeF14BDEA3257fc7c4A90E7c8651
// erc20addr: 0xcaF99B4Cf553Be9E2993A5EA4B04C7814c9f4F1C
// realestateaddr: 0x27af769172979f8e2fcfb35dd57f9b5593b0d815

