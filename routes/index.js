import * as controller from "../controllers/cacheController.js";

import express from "express";

const router = express.Router();
export default router;
// GET
router.get("/getAll/:contract", controller.getNFTsbyContract);
router.get("/getAll/:contract/:owner", controller.getNFTsByContractAndOwner);
router.get("/getWalletNFTs/:owner", controller.getNFTsByOwner);

// POST
// body {contract}
router.post("/subscribe", controller.subscribe);
