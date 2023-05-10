
const database = require('./DB/db');
const { ethers } = require('ethers');
const erc721ABI = require('./ERC721ABI.json').ABI;
const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URL);
const axios = require('axios');

let contractOwnerBasedData = database.contractOwnerBasedData
let contractBasedData = database.contractBasedData
let ownerBasedData = database.ownerBasedData

const handleTX = async (contract, contractAddress, to , tokenId, event) => {
    let tokenURI, tokenDetails;
    if(tokenId){
        const tokenIdString = tokenId.toString()
        tokenURI = await contract.tokenURI(tokenId);
        try{
            tokenDetails = await axios.get(tokenURI);
            console.log(tokenDetails);
        } catch{
            tokenDetails = {data: {name:"", image: "",edition: "", item: "",rarity: "",  description: "" }};
        } finally{
            // FIXME: `${}-${}`
            if (!contractOwnerBasedData[contractAddress + "-" + to]) {
                contractOwnerBasedData[contractAddress + "-" + to] = []
            }
            contractOwnerBasedData[contractAddress + "-" + to].push({"Owner": to, "TokenID": tokenIdString, "TokenURI" : tokenURI, "Name" : tokenDetails.data.name,"Item" : tokenDetails.data.item,"Rarity" : tokenDetails.data.rarity ,"Description" : tokenDetails.data.description, "Image" : tokenDetails.data.image, "Edition": tokenDetails.data.edition });
            if(!contractBasedData[contractAddress]){
                contractBasedData[contractAddress] = []
            }
            // FIXME: lowercase (eg: Owner -> owner)
            contractBasedData[contractAddress].push({"Owner" : to, "TokenID" : tokenIdString , "TokenURI" : tokenURI, "Name" : tokenDetails.data.name,"Item" : tokenDetails.data.item,"Rarity" : tokenDetails.data.rarity ,"Description" : tokenDetails.data.description, "Image" : tokenDetails.data.image, "Edition": tokenDetails.data.edition});
            if(!ownerBasedData[to]){
                ownerBasedData[to] = []
            }
            ownerBasedData[to].push({"Owner" : to, "TokenID" : tokenIdString , "TokenURI" : tokenURI, "Name" : tokenDetails.data.name,"Item" : tokenDetails.data.item,"Rarity" : tokenDetails.data.rarity ,"Description" : tokenDetails.data.description, "Image" : tokenDetails.data.image, "Edition": tokenDetails.data.edition});
        }    
    }
    
}

exports.subScribe = async (contractAddress) => {
    const contract = new ethers.Contract(contractAddress, erc721ABI, provider);
    const filter = contract.filters['Transfer']();
    
    // initial indexing of the smart contract
    const events = await contract.queryFilter(filter, 0, 'latest');
    events.forEach(async event => {
        handleTX(contract, contractAddress, event.args.to, event.args.tokenId, event);
    });

    // subscribe transfer Events of the smart contract
    contract.on('Transfer', (from, to, tokenId, event) => {
        handleTX(contract, contractAddress, to, tokenId, event);
    });
}

