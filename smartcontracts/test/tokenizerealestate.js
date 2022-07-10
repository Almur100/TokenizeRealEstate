const {expect} = require("chai");
const {ethers} = require("hardhat");


describe("tokenizerealestate contract", ()=>{
    let Realestate;
    let realestate;
    let NFT;
    let nft;
    let Token;
    let token1
    
    let creator;
    let addr1;
    let addr2;
    let addrs;
    let URI = "sample URI"


    beforeEach(async ()=>{
        Token = await ethers.getContractFactory("MyToken");
        NFT = await ethers.getContractFactory("NFT");
        Realestate = await ethers.getContractFactory("tokenizeRealestate");

        [creator,addr1,addr2, ...addrs] = await ethers.getSigners();
        nft = await NFT.deploy();
        token1 = await Token.deploy("Almur","AH");
        realestate = await Realestate.deploy(token1.address);
        const p = ethers.utils.parseUnits("12", "18");
        await token1.transfer(addr2.address,p);
        const p1 = ethers.utils.parseUnits("7", "18");
        await token1.connect(addr2).approve(realestate.address,p1);
        // await token1.connect(crowdfund).approve(addr2.address,p1);
        

        
        console.log (await token1.balanceOf(addr2.address));
        console.log (await token1.balanceOf(creator.address));
        console.log (await token1.balanceOf(addr1.address));






    });

    describe("Deployment",()=>{
        it("it should set the right erc20 token and Should track name and symbol of the nft collection",async ()=>{
            // const token1 = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
            const nftName = "REstate NFT"
            const nftSymbol = "RE"

            expect(await realestate.token()).to.equal(token1.address);
            expect(await nft.name()).to.equal(nftName);
            expect(await nft.symbol()).to.equal(nftSymbol);

        });
    });

    describe("Minting NFTs", function () {

        it("Should track each minted NFT", async function () {
          // addr1 mints an nft
          await nft.connect(addr1).mint(URI)
          expect(await nft.tokenCount()).to.equal(1);
          expect(await nft.balanceOf(addr1.address)).to.equal(1);
          expect(await nft.tokenURI(1)).to.equal(URI);
          // addr2 mints an nft
          await nft.connect(addr2).mint(URI)
          expect(await nft.tokenCount()).to.equal(2);
          expect(await nft.balanceOf(addr2.address)).to.equal(1);
          expect(await nft.tokenURI(2)).to.equal(URI);
        });
      })
    

    describe("add buyer and seller",()=>{
        it("it will pass if buyer and sellers rules are correct",async()=>{
            const Location = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
            const Contact = "0x626c756500000000000000000000000000000000000000000000000000000000";
            await realestate.addbuyerseller(Location,Contact);
            const _exist = await realestate.exist(creator.address);
            expect(_exist).to.equal(true);
            const _bsdetails = await realestate.BSdetails(creator.address);
            expect(_bsdetails.buyer).to.equal(creator.address);
            expect(_bsdetails.location).to.equal(Location);
            expect(_bsdetails.contact).to.equal(Contact);


        })
        it("it will fail if address already exist ",async()=>{
            const Location = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
            const Contact = "0x626c756500000000000000000000000000000000000000000000000000000000";
            await realestate.addbuyerseller(Location,Contact);
            await expect(realestate.addbuyerseller(Location,Contact)).to.be.revertedWith("addr already exist");

        })

    })
    describe("add asset",()=>{
        it("it will pass add asset if rules are correct",async()=>{
            const Location = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
            const Contact = "0x626c756500000000000000000000000000000000000000000000000000000000";
            const assetLocation = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
            const assetContact = "0x626c756500000000000000000000000000000000000000000000000000000000";
            const Fassetsize = "0x626c756500000000000000000000000000000000000000000000000000000000";
            const fassetprice = ethers.utils.parseUnits("5", "18");
            const fassetrentprice = ethers.utils.parseUnits("1", "18");
            await realestate.connect(addr1).addbuyerseller(Location,Contact);
              // addr1 mints an nft
            await nft.connect(addr1).mint(URI)
              // addr1 approves marketplace to spend nft
            await nft.connect(addr1).setApprovalForAll(realestate.address, true)
            await realestate.connect(addr1).addAsset(nft.address,1,assetLocation,assetContact,fassetprice,Fassetsize,fassetrentprice)
            expect(await realestate.assetid()).to.equal(1);
            // const id = await realestate.assetid();       
            const Assets = await realestate.assetDetails(1);
            expect(Assets.nft).to.equal(nft.address);
            expect(Assets.location).to.equal(assetLocation);
            expect(Assets.id).to.equal(1);
            expect(Assets.contact).to.equal(assetContact);
            const fassetd = await realestate.getfractionassetdetails(1,1);
            expect(fassetd.nft).to.equal(nft.address);
            expect(fassetd.tokenId).to.equal(1);
            expect(fassetd.assetPrice).to.equal(fassetprice);
            expect(fassetd.size).to.equal(Fassetsize);
            expect(fassetd.rentPrice).to.equal(fassetrentprice);
            expect(await realestate.getfractionassetowner(1,1)).to.equal(addr1.address);
            expect(await realestate.getSellonof(1,1)).to.equal(false); 
            const subs = await realestate.getsubscription(1,1);
            const zeroaddr = "0x0000000000000000000000000000000000000000"
            expect(subs.subscriber).to.equal(zeroaddr); 
            const num = ethers.BigNumber.from("1");
            expect(await realestate.gettokenizeasset(1)).to.deep.equal([num]);

        }) 
        it("it will fail if msgsender does not exists",async()=>{
            const assetLocation = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
            const assetContact = "0x626c756500000000000000000000000000000000000000000000000000000000";
            const Fassetsize = "0x626c756500000000000000000000000000000000000000000000000000000000";
            const fassetprice = ethers.utils.parseUnits("5", "18");
            const fassetrentprice = ethers.utils.parseUnits("1", "18");


            
            
            await nft.connect(addr1).mint(URI)     
            // addr1 approves marketplace to spend nft
          await nft.connect(addr1).setApprovalForAll(realestate.address, true)
          await expect (realestate.connect(addr1).addAsset(nft.address,1,assetLocation,assetContact,fassetprice,Fassetsize,fassetrentprice)).to.be.revertedWith("addr not exists");

        })  


    })
    describe("addfractionalasset,sellon ,selloff",()=>{
        
            const Fassetsize = "0x626c756500000000000000000000000000000000000000000000000000000000";
            const fassetprice = ethers.utils.parseUnits("5", "18");
            const fassetrentprice = ethers.utils.parseUnits("1", "18");
            const Location = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
            const Contact = "0x626c756500000000000000000000000000000000000000000000000000000000";
            const assetLocation = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
            const assetContact = "0x626c756500000000000000000000000000000000000000000000000000000000";

            beforeEach(async()=>{
              await realestate.connect(addr1).addbuyerseller(Location,Contact);
              // addr1 mints an nft
            await nft.connect(addr1).mint(URI)
            await nft.connect(addr1).mint(URI)
              // addr1 approves marketplace to spend nft
            await nft.connect(addr1).setApprovalForAll(realestate.address, true)
            await realestate.connect(addr1).addAsset(nft.address,1,assetLocation,assetContact,fassetprice,Fassetsize,fassetrentprice)
            // expect(await realestate.assetid()).to.equal(1);

            })
            it("it will add fractional asset if all rules are correct",async()=>{
              await realestate.connect(addr1).addfractionasset(fassetprice,1,fassetrentprice,Fassetsize,2);
              expect(await nft.ownerOf(2)).to.equal(realestate.address);
              const num = ethers.BigNumber.from("1");
              const num2 = ethers.BigNumber.from("2");
              expect(await realestate.gettokenizeasset(1)).to.deep.equal([num,num2]);
              expect(await realestate.getfractionassetowner(1,2)).to.equal(addr1.address);
              expect(await realestate.getSellonof(1,2)).to.equal(false);
              
              const fassetd = await realestate.getfractionassetdetails(1,2); 
              expect(fassetd.nft).to.equal(nft.address);
              expect(fassetd.tokenId).to.equal(2);
              expect(fassetd.assetPrice).to.equal(fassetprice);
              expect(fassetd.size).to.equal(Fassetsize);
              expect(fassetd.rentPrice).to.equal(fassetrentprice);
              const subs = await realestate.getsubscription(1,2);
              const zeroaddr = "0x0000000000000000000000000000000000000000";
              expect(subs.subscriber).to.equal(zeroaddr); 
              // expect(subs.start).to.equal(block.timestamp); 




            })
            it("it will fail if sender is not owner",async()=>{
              await expect (realestate.connect(addr2).addfractionasset(fassetprice,1,fassetrentprice,Fassetsize,2)).to.be.revertedWith("sender is not owner");

            })
            it("it will fail if nft id already exists",async()=>{
              await expect(realestate.connect(addr1).addfractionasset(fassetprice,1,fassetrentprice,Fassetsize,1)).to.be.revertedWith("nft id already exists");
            })
            it("sellon will pass if sellon rules correct",async()=>{
              await realestate.connect(addr1).addfractionasset(fassetprice,1,fassetrentprice,Fassetsize,2);
              await realestate.connect(addr1).sellon(1,2);
              expect(await realestate.getSellonof(1,2)).to.equal(true); 


            })
            it("sellon will fail if sender is not owner",async()=>{
              await realestate.connect(addr1).addfractionasset(fassetprice,1,fassetrentprice,Fassetsize,2);
              await expect(realestate.connect(addr2).sellon(1,2)).to.be.revertedWith("sender is not owner");

            })
            it("sellon will fail if sell already on",async()=>{
              await realestate.connect(addr1).addfractionasset(fassetprice,1,fassetrentprice,Fassetsize,2);
              await realestate.connect(addr1).sellon(1,2);
              await expect(realestate.connect(addr1).sellon(1,2)).to.be.revertedWith("sell already on");

            })
            it("selloff will pass if selloff rules correct",async()=>{
              await realestate.connect(addr1).addfractionasset(fassetprice,1,fassetrentprice,Fassetsize,2);
              await realestate.connect(addr1).sellon(1,2);
              await realestate.connect(addr1).selloff(1,2);
              expect(await realestate.getSellonof(1,2)).to.equal(false); 
            })
            it("selloff will fail if sell already of",async()=>{
              await realestate.connect(addr1).addfractionasset(fassetprice,1,fassetrentprice,Fassetsize,2);
              // await realestate.connect(addr1).sellon(1,2);
              await expect(realestate.connect(addr1).selloff(1,2)).to.be.revertedWith("sell already off");
        
            })
            it("sellon will fail if sender is not owner",async()=>{
              await realestate.connect(addr1).addfractionasset(fassetprice,1,fassetrentprice,Fassetsize,2);
                await expect(realestate.connect(addr2).selloff(1,2)).to.be.revertedWith("sender is not owner");
            })

     })
     describe("buyasset,addbuyfasset",()=>{
      const Fassetsize = "0x626c756500000000000000000000000000000000000000000000000000000000";
      const fassetprice = ethers.utils.parseUnits("5", "18");
      const fassetrentprice = ethers.utils.parseUnits("1", "18");
      const Location = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
      const Contact = "0x626c756500000000000000000000000000000000000000000000000000000000";
      const assetLocation = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
      const assetContact = "0x626c756500000000000000000000000000000000000000000000000000000000";

      beforeEach(async()=>{
        await realestate.connect(addr1).addbuyerseller(Location,Contact);
        // addr1 mints an nft
      await nft.connect(addr1).mint(URI)
      await nft.connect(addr1).mint(URI)
        // addr1 approves marketplace to spend nft
      await nft.connect(addr1).setApprovalForAll(realestate.address, true)
      await nft.connect(addr2).setApprovalForAll(realestate.address, true)
      await realestate.connect(addr1).addAsset(nft.address,1,assetLocation,assetContact,fassetprice,Fassetsize,fassetrentprice)
      await realestate.connect(addr1).addfractionasset(fassetprice,1,fassetrentprice,Fassetsize,2);
      await realestate.connect(addr1).sellon(1,2);          
      // expect(await realestate.assetid()).to.equal(1);

      })
      it("it will pass buy asset if all rules ok",async()=>{
        await realestate.connect(addr2).BuyAsset(1,2);
        expect(await realestate.getfractionassetowner(1,2)).to.equal(addr2.address);
        expect(await realestate.getSellonof(1,2)).to.equal(false); 
        expect(await nft.ownerOf(2)).to.be.equal(addr2.address);

      })
      it("buy asset will fail if sell off",async()=>{
        await realestate.connect(addr1).selloff(1,2);
        await expect(realestate.connect(addr2).BuyAsset(1,2)).to.be.revertedWith("sell  off");

      })
      it("addbuyasset will pass if rules are ok",async()=>{
        await realestate.connect(addr2).BuyAsset(1,2);
        await realestate.connect(addr2).addbuyfasset(1,2);
        expect(await nft.ownerOf(2)).to.be.equal(realestate.address);



      })
      it("addbuyasset will fail if sender is not owner",async()=>{
        await realestate.connect(addr2).BuyAsset(1,2);
        await expect(realestate.connect(addr1).addbuyfasset(1,2)).to.be.revertedWith("sender is not owner");

      })
      it("addbuyasset will fail if nft id already exist ",async()=>{
        await realestate.connect(addr2).BuyAsset(1,2);
        await realestate.connect(addr2).addbuyfasset(1,2);
        await expect(  realestate.connect(addr2).addbuyfasset(1,2)).to.be.revertedWith("nft id already exists");
        // expect(await nft.ownerOf(2)).to.be.equal(realestate.address);



      })



     })  


})   