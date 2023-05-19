import * as indexUtil from "./indexUtils.js";
export function getNFTsbyContract(req, res) {
  console.log("[CacheController::getNFTsByContract] invoked");
  const { contract } = req.params;
  let nfts = indexUtil.getNFTsByContract(contract);
  let count = nfts.length;

  return res.json({
    count,
    nfts,
  });
}

export function getNFTsByContractAndOwner(req, res) {
  const { contract, owner } = req.params;
  let nfts = indexUtil.getNFTsByContractAndOwner(contract, owner);
  let count = nfts.length;
  return res.json({
    count,
    nfts,
  });
}

export function getNFTsByOwner(req, res) {
  const { owner } = req.params;
  let nfts = indexUtil.getNFTsByOwner(owner);
  let count = nfts.length;
  return res.json({
    count,
    nfts,
  });
}

export async function subscribe(req, res) {
  console.log(`[CacheController::subscribe] invoked`);
  // req.body = JSON.parse(req.body);
  const { contract } = req.body;
  console.log(req.body);
  console.log(`[CacheController::subscribe] body{ contract: ${contract} }`);
  await indexUtil.subScribe(contract);
  return res.json({ msg: "success" });
}
