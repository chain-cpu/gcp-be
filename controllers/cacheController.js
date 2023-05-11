// const set = require('../DB/db').set;
const get = require('../DB/db').get;
const getData = require('../utils').getData;
const subScribe = require('../utils').subScribe;

exports.getNFTsbyContract = (req, res) => {
    console.log(get(`c_${req.params.address}`));
    res.send(getData(`c_${req.params.address}`));
};

exports.getNFTsByContractAndUser = (req, res) => {
    res.send(getData(`co_${req.params.address}_${req.params.userWallet}`));
};

exports.getNFTsByUser = (req, res) => {
    res.send(getData(`o_${req.params.userWallet}`));
};

exports.addContract = async (req, res) => {
    contractAddress = req.body.address;
    await subScribe(contractAddress);
    res.send("success");

}