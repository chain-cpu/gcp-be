import { ethers } from "ethers";
import erc721ABI from "../ERC721ABI.js";
import axios from "axios";
import {
  get,
  set,
  arrayGetAll,
  arrayGetCnt,
  arraySetCnt,
  arraySetData,
  arrayPush,
} from "../DB/db.js";
import { arrayGetData } from "../DB/db.js";

const PREFIX = {
  TOTAL_INDEX: "unique",
  // ex. contractIndex_0x9dad9fz90zdfe32a_1
  CONTRACT_INDEX: "contractIndex",
  //ex. contractOnwerIndex_0x9dad9fz90zdfe32a_0x8639a9vidkaie3_2
  CONTRACT_OWNER_INDEX: "contractOnwerIndex",
  //ex. ownerIndex
  OWNER_INDEX: "ownerIndex",
};
function useContract(contractAddress) {
  const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URL);
  const contract = new ethers.Contract(contractAddress, erc721ABI, provider);
  return { contract, provider };
}
// index nft metadata
function indexNFT(nft) {
  let nftIndex = indexTotal(nft); // gets the id of nft among entire nft we store
  const { contract, owner } = nft;
  // index by contract, contract&owner, owner
  indexData(contractIndex(contract), nftIndex);
  indexData(contractAndOwnerIndex(contract, owner), nftIndex);
  indexData(ownerIndex(owner), nftIndex);
}

function indexTotal(nft) {
  return indexData(`${PREFIX.TOTAL_INDEX}`, nft);
}

function contractIndex(contractAddress) {
  return `${PREFIX.CONTRACT_INDEX}_${contractAddress}`;
}
function contractAndOwnerIndex(contractAddress, ownerAddress) {
  return `${PREFIX.CONTRACT_OWNER_INDEX}_${contractAddress}_${ownerAddress}`;
}
function ownerIndex(ownerAddress) {
  return `${PREFIX.OWNER_INDEX}_${ownerAddress}`;
}

function indexData(prefix, data) {
  return arrayPush(prefix, data);
}

export function getNFTByIndex(index) {
  return arrayGetData(`${PREFIX.TOTAL_INDEX}`, index);
}
export function getNFTsByContract(contractAddr) {
  return arrayGetAll(`${PREFIX.CONTRACT_INDEX}_${contractAddr}`).map((index) =>
    get(index)
  );
}

export function getNFTsByContractAndOwner(contractAddr, owner) {
  return arrayGetAll(
    `${PREFIX.CONTRACT_OWNER_INDEX}_${contractAddr}_${owner}`
  ).map((index) => get(index));
}

export function getNFTsByOwner(owner) {
  return arrayGetAll(`${PREFIX.OWNER_INDEX}_${owner}`).map((index) =>
    get(index)
  );
}

async function handleEvent(contract, contractAddress, to, tokenId, event) {
  console.log(
    `[indexUtil::handleEvent] invoked contract: ${contractAddress}, token: ${tokenId}`
  );
  if (tokenId) {
    let res;
    let promises = [contract.tokenURI(tokenId), contract.name()];
    let [tokenURI, name] = await Promise.all(promises);
    try {
      res = await axios.get(tokenURI);
      console.log("res", res);
    } catch (err) {
      console.log(`err while catching metadata ${tokenURI}`);
    } finally {
      const metadata = {
        contract: contractAddress,
        owner: to,
        tokenID: tokenId.toString() || 0,
        tokenURI: tokenURI || "",
        name: name || "",
        item: res?.data?.item || "",
        rarity: res?.data?.rarity || 0,
        description: res?.data?.description || "No Description",
        image: res?.data?.image || "No Image",
        edition: res?.data?.edition || "No Edition",
        attributes: res?.data?.attributes || [],
      };
      indexNFT(metadata);
    }
  }
}

export async function subScribe(contractAddress) {
  // This is to prevent duplicated subscription
  if (get(contractAddress) == true) {
    return false;
  }

  set(contractAddress, true);
  const { contract } = useContract(contractAddress);

  const filter = contract.filters.Transfer();
  // initial indexing of the smart contract
  const events = await contract.queryFilter(filter, 0, "latest");

  events.forEach(async (event) => {
    await handleEvent(
      contract,
      contractAddress,
      event.args.to,
      event.args.tokenId,
      event
    );
  });

  // subscribe transfer Events of the smart contract
  contract.on("Transfer", (from, to, tokenId, event) => {
    handleEvent(contract, contractAddress, to, tokenId, event);
  });
}
