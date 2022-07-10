// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "../node_modules/@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";
interface IERC20 {
    function transfer(address, uint) external returns (bool);

    function transferFrom(
        address,
        address,
        uint
    ) external returns (bool);
}

contract tokenizeRealestate is ReentrancyGuard{
     struct asset{
         IERC721 nft;
          
         bytes location; 
         uint id;
         bytes contact;
     }     
          
          
        
          

     
     struct buyerseller{
         address buyer;
         bytes location;
         bytes contact;
     }
     struct FractionAsset{
         IERC721 nft;
         uint tokenId;   
         uint assetPrice;
         bytes size;
         uint rentPrice;
     }
     struct subscription{
         address subscriber;
         uint start;
         uint end;
     }

     uint public assetid; 
     uint public constant duration = 30 days;
     IERC20 public immutable token;
     mapping(address => bool) public exist;
     mapping(address=> buyerseller) public BSdetails;
     mapping(uint=> asset)   public assetDetails;
     mapping(uint=> mapping(uint=> address)) public Fractionassetowner;
     mapping(uint=> mapping(uint=> FractionAsset)) public FractionAssetdetails;
     mapping(uint=> uint[]) public Tokenizeasset;
     mapping(uint=> mapping(uint=> bool)) sellonof;
     mapping(uint=>mapping(uint=> subscription)) public subscriptions;
     event addasset(uint indexed assetid, address indexed assetowner, uint tokenid,address nft);
     event addfasset(uint indexed assetid, address indexed assetowner, uint tokenid,address nft);
     event buyasset(uint indexed assetid, address indexed buyer,address seller,uint fassetid, uint tokenid,address nft);
     event Subscribe(uint indexed assetid, address indexed subscriber,uint fassetid,uint rent);

      

     constructor(address _token) {
        token = IERC20(_token);
    }


     function addbuyerseller(bytes memory _location,bytes memory _contact)  public nonReentrant {
         require(!exist[msg.sender],"addr already exist");
         buyerseller memory bs = buyerseller(msg.sender,_location,_contact);
         BSdetails[msg.sender] = bs;
         exist[msg.sender] = true;

         


     }
     function addAsset(IERC721 _nft,uint _tokenId,bytes memory _assetlocation,bytes memory _assetcontact,uint fassetprice,bytes memory fassetsize,uint fassetrentcost ) public nonReentrant {
         require(exist[msg.sender]== true,"addr not exists");
         assetid += 1;
         _nft.transferFrom(msg.sender, address(this), _tokenId); 
         Fractionassetowner[assetid][1]= msg.sender;
         Tokenizeasset[assetid].push(1);
         sellonof[assetid][1]= false;
         asset memory Asset  = asset(_nft,_assetlocation,assetid,_assetcontact);
         assetDetails[assetid] = Asset;
         FractionAsset memory Fasset = FractionAsset(_nft,_tokenId,fassetprice,fassetsize,fassetrentcost);
         FractionAssetdetails[assetid][1]= Fasset;
         subscription memory subs;
         subs.start = block.timestamp;
         subs.end = block.timestamp;
         subscriptions[assetid][1] = subs;

         emit addasset(assetid, msg.sender, _tokenId, address(_nft));


     }
     function addfractionasset(uint price,uint id,uint rentprice,bytes memory size,uint _tokenId) public{
         require(Fractionassetowner[id][1]== msg.sender,"sender is not owner");
        //  uint length = Tokenizeasset[id].length;
        //  length += 1;
        //  Tokenizeasset[id].push(length);
        //  Fractionassetowner[id][length]= msg.sender;
         asset memory Asset = assetDetails[id];
         IERC721 _nft = Asset.nft;
         require(_nft.ownerOf(_tokenId)!= address(this),"nft id already exists");
         _nft.transferFrom(msg.sender, address(this), _tokenId); 
         uint length = Tokenizeasset[id].length;
         length += 1;
         Tokenizeasset[id].push(length);
         Fractionassetowner[id][length]= msg.sender;
         
         FractionAsset memory Fasset = FractionAsset(_nft,_tokenId,price,size,rentprice);
         FractionAssetdetails[id][length] = Fasset;
         sellonof[id][length] = false;
         subscription memory subs;
         subs.subscriber = address(0);
         subs.start = block.timestamp;
         subs.end = block.timestamp;
         subscriptions[id][length] = subs;

         emit addfasset(assetid, msg.sender, _tokenId, address(_nft));

     }
     function sellon(uint Assetid, uint _fractionassetid) public{
         require(Fractionassetowner[Assetid][_fractionassetid]== msg.sender,"sender is not owner");
         require(sellonof[Assetid][_fractionassetid]== false,"sell already on");
         sellonof[Assetid][_fractionassetid]= true;


     }
     function selloff(uint Assetid,uint fractionassetid) public{
         require(Fractionassetowner[Assetid][fractionassetid]== msg.sender,"sender is not owner");
         require(sellonof[Assetid][fractionassetid]== true,"sell already off");
         sellonof[Assetid][fractionassetid]= false;

     }
     function BuyAsset(uint Assetid,uint fractionassetid) public nonReentrant{
         require(sellonof[assetid][fractionassetid]== true,"sell  off");
         address owner = Fractionassetowner[Assetid][fractionassetid];
        //   Fractionassetowner[Assetid][fractionassetid]== msg.sender;
        //  require(sellonof[assetid][fractionassetid]== true,"sell  off");
         FractionAsset memory Fasset = FractionAssetdetails[Assetid][fractionassetid];
         uint amount = Fasset.assetPrice;
         IERC721 _nft = Fasset.nft;
         uint _tokenId = Fasset.tokenId;
        //  require(sellonof[assetid][fractionassetid]== true,"sell  off");
         token.transferFrom(msg.sender, owner, amount);
         _nft.transferFrom(address(this),msg.sender, _tokenId);
         Fractionassetowner[Assetid][fractionassetid]= msg.sender;
         sellonof[Assetid][fractionassetid]= false;

         emit buyasset(assetid, msg.sender, owner, fractionassetid, _tokenId, address(_nft));
 





     }
     function addbuyfasset(uint Assetid,uint fractionassetid) public{
         require(Fractionassetowner[Assetid][fractionassetid]== msg.sender,"sender is not owner");
        //   require(_nft.ownerOf(_tokenId)!= address(this),"nft id already exists");
         FractionAsset memory Fasset= FractionAssetdetails[Assetid][fractionassetid];
         IERC721 _nft = Fasset.nft;
         uint _tokenId = Fasset.tokenId;
         require(_nft.ownerOf(_tokenId)!= address(this),"nft id already exists"); 
         _nft.transferFrom(msg.sender, address(this), _tokenId); 


     }

     function subscribe (uint Assetid,uint fractionassetid) public{
         subscription memory subs = subscriptions[Assetid][fractionassetid];
         uint _end = subs.end;
         require(_end<= block.timestamp,"rent is going on");
         FractionAsset memory Fasset = FractionAssetdetails[Assetid][fractionassetid];
         uint amount = Fasset.rentPrice;
         address owner = Fractionassetowner[Assetid][fractionassetid];
         token.transferFrom(msg.sender,owner,amount);
         subs.subscriber = msg.sender;
         subs.start = block.timestamp;
         subs.end = duration + block.timestamp;

         emit Subscribe(assetid, msg.sender, fractionassetid, amount);
     }
     function getSellonof(uint Assetid,uint fractionassetid) public view returns (bool){
        return sellonof[Assetid][fractionassetid];
    }
     function getfractionassetowner(uint Assetid,uint fractionassetid) public view returns (address){
        return Fractionassetowner[Assetid][fractionassetid];
    }
     function getfractionassetdetails(uint Assetid,uint fractionassetid) public view returns (FractionAsset memory){
        return FractionAssetdetails[Assetid][fractionassetid];
    }
     function getsubscription(uint Assetid,uint fractionassetid) public view returns (subscription memory){
        return subscriptions[Assetid][fractionassetid];
    }
    function gettokenizeasset(uint Assetid) public view returns (uint[] memory){
        return Tokenizeasset[Assetid];
    }






}