const { ethers } = require("ethers");
const erc721ABI = require("./ERC721ABI.json").ABI;
const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URL);
const axios = require("axios");
const set = require("./DB/db").set;
const get = require("./DB/db").get;

// this is util functin that pushes array data to the key/value storage
const pushData = (address, data) => {
  let cnt = get(`${address}_cnt`);
  if (cnt == undefined) cnt = 0;
  set(`${address}_cnt`, cnt + 1);
  set(`${address}_${cnt}`, data);
};

exports.getData = (address) => {
  const currentDataCnt = get(`${address}_cnt`);
  let returnData = [];
  if (currentDataCnt != undefined) {
    for (let i = 0; i < currentDataCnt; i++) {
      returnData.push(get(`${address}_${i}`));
    }
  }
  return returnData;
};

const handleTX = async (contract, contractAddress, to, tokenId, event) => {
  let tokenURI, tokenDetails;
  if (tokenId) {
    const tokenIdString = tokenId.toString();
    tokenURI = await contract.tokenURI(tokenId);
    try {
      tokenDetails = await axios.get(tokenURI);
    } catch {
      tokenDetails = {
        data: {
          name: "",
          image: "",
          edition: "",
          item: "",
          rarity: "",
          description: "",
        },
      };
    } finally {
      data = {
        owner: to,
        tokenID: tokenIdString,
        tokenURI: tokenURI,
        name: tokenDetails.data.name,
        item: tokenDetails.data.item,
        rarity: tokenDetails.data.rarity,
        description: tokenDetails.data.description,
        image: tokenDetails.data.animation_url,
        edition: tokenDetails.data.edition,
      };
      pushData(`co_${contractAddress}_${to}`, data);
      pushData(`o_${to}`, data);
      pushData(`c_${contractAddress}`, data);
    }
  }
};

exports.subScribe = async (contractAddress) => {
  // This is to prevent duplicated subscription
  if (get(contractAddress) == true) {
    return false;
  }
  set(contractAddress, true);
  const contract = new ethers.Contract(contractAddress, erc721ABI, provider);
  const filter = contract.filters["Transfer"]();

  // initial indexing of the smart contract
  const events = await contract.queryFilter(filter, 0, "latest");
  events.forEach(async (event) => {
    handleTX(
      contract,
      contractAddress,
      event.args.to,
      event.args.tokenId,
      event
    );
  });

  // subscribe transfer Events of the smart contract
  contract.on("Transfer", (from, to, tokenId, event) => {
    handleTX(contract, contractAddress, to, tokenId, event);
  });
};
