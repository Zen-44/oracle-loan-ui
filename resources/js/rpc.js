const axios = require('axios');
const utils = require('./utils.js');
const idena = require('idena-sdk-js');

const oracleLoanContract = utils.oracleLoanContract;
const fallbackNodeUrl = "https://restricted.idena.io"
const fallbackNodeKey = "idena-restricted-node-key"

async function callRpc(data, url){
    try{
        let res = await axios.post(url, data).then((response) => {
            return response;
        });
        return res;
    }
    catch(error){
        //utils.print(`Error: ${error}\nFalling back to the restricted node`);
        console.log(`Error: ${error}\nFalling back to the restricted node`);
        data.key = fallbackNodeKey;
        let res = await axios.post(fallbackNodeUrl, data).then((response) => {
            return response;
        });
        return res;
    }
}

async function getNonce(address){
    let data = {
        method: "dna_getBalance",
        params: [
            address
            ],
        id: 1,
        key: localStorage.getItem('key')
    }
    let res = await callRpc(data, localStorage.getItem('url'));
    return res.data.result.nonce;
}

async function getEpoch(){
    let data = {
        method: "dna_epoch",
        params: [],
        id: 1,
        key: localStorage.getItem('key')
    }
    let res = await callRpc(data, localStorage.getItem('url'));
    return res.data.result.epoch;
}

async function getOracleData(oracle){
    let data = {
        "method": "contract_readMap",
        "params": [
          oracleLoanContract,
          "oracles",
          oracle,
          "hex"
        ],
        "id": 1,
        "key": localStorage.getItem('key')
    };

    return await callRpc(data, localStorage.getItem('url'))
        .then((response) => {
            let hexOracleData = response.data.result;
            if (!hexOracleData)
                return undefined;
            let oracleData = utils.hexToString(hexOracleData);
            return JSON.parse(oracleData);
        })
        .catch((error) => {
            utils.print(`Error: ${error}\n(check the api key)`);
            return undefined;
        });
}

async function getReviewCommittee(){
    let reviewCommitteeData = {
        "method": "contract_iterateMap",
        "params": [
            oracleLoanContract,
            "reviewCommittee",
            null,
            "hex",
            "hex",
            1000
        ],
        "id": 1,
        "key": localStorage.getItem('key')
    };

    return await callRpc(reviewCommitteeData, localStorage.getItem('url'))
        .then((response) => {
            let members = response.data.result.items;
            let activeMembers = members.map((member) => {
                if (member.value == "0x01")
                    return member.key;
            });
            return activeMembers.filter(member => member !== undefined);
        })
        .catch((error) => {
            utils.print(`Error: ${error}\n(check the api key)`);
            return undefined;
        });
}

async function getBalance(address){
    let data = {
        "method": "contract_readMap",
        "params": [
          oracleLoanContract,
          "deposits",
          address,
          "hex"
        ],
        "id": 1,
        "key": localStorage.getItem('key')
    };
    return await callRpc(data, localStorage.getItem('url'))
        .then((response) => {
            let balance = utils.dnaToFloatString(BigInt(response.data.result, 16).toString());
            return balance ? balance : "0";
        })
        .catch((error) => {
            utils.print(`Error: ${error}\n(check the api key)`);
            return undefined;
        });
}

async function verifyOracle(oracle){
    let readValue = async (value) => {
        return await callRpc({
            "method": "contract_readData",
            "params": [
                oracle,
                value,
                null
            ],
            "id": 1,
            "key": localStorage.getItem('key')
        }, localStorage.getItem('url')).then((response) => {
            return response.data.result;
        });
    }

    let parseLittleEndianHexToInt = (hex) => {
        return parseInt(hex.replace(/^0x/, '').match(/.{2}/g).reverse().join(''), 16);
    };

    let refundRecipient = await readValue("refundRecipient");
    let ownerFee = await readValue("ownerFee");
    let startTime = parseLittleEndianHexToInt(await readValue("startTime"));
    let votingDuration = parseLittleEndianHexToInt(await readValue("votingDuration"));
    let publicVotingDuration = parseLittleEndianHexToInt(await readValue("publicVotingDuration"));

    if (refundRecipient.toLowerCase() != oracleLoanContract.toLowerCase())
        return "Invalid refund recipient, the owner address needs to be " + oracleLoanContract;
    if (ownerFee != 0)
        return "Invalid owner fee, it should be set to 0.";
    if (parseInt(startTime, 16) > Date.now() + (60 * 60 * 24 * 14))
        return "Invalid start time. The oracle can't start more than 14 days in the future, you can come back later with this oracle.";
    if (parseInt(votingDuration) + parseInt(publicVotingDuration) > (60 * 24 * 7 * 4 * 3))
        return "Invalid duration";

    return "";
}

async function getSmartContractBalance(){
    return await callRpc({
        "method": "dna_getBalance",
        "params": [
            oracleLoanContract
        ],
        "id": 1,
        "key": localStorage.getItem('key')
    }, localStorage.getItem('url')).then((response) => {
        return response.data.result.balance;
    });
}

async function getContractState(){
    let data = {
        "method": "contract_readData",
        "params": [
            oracleLoanContract,
            "STATE",
            null
        ],
        "id": 1,
        "key": localStorage.getItem('key')
    };
    return await callRpc(data, localStorage.getItem('url'))
        .then((response) => {
            let hexState = response.data.result;
            let state = utils.hexToString(hexState);
            return JSON.parse(state);
        })
        .catch((error) => {
            utils.print(`Error: ${error}\n(check the api key)`);
            return undefined;
        });
}

module.exports = {
    callRpc,
    getNonce,
    getEpoch,
    getOracleData,
    getReviewCommittee,
    getBalance,
    verifyOracle,
    getSmartContractBalance,
    getContractState
}
