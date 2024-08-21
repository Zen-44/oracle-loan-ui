const ctr = require("./contract.js");
const rpc = require("./rpc.js");
const utils = require("./utils.js");
const oracleLoanContract = utils.oracleLoanContract;

let feeRate = undefined;
getFeeRate().then((value) => feeRate = value);

window.onload = () => {
    document.getElementById('url-input').addEventListener('input', () => {
        let url = document.getElementById('url-input').value;
        localStorage.setItem('url', url);
    });

    document.getElementById('key-input').addEventListener('input', () => {
        let key = document.getElementById('key-input').value;
        localStorage.setItem('key', key);
    });

    document.getElementById('address-input').addEventListener('input', () => {
        let address = document.getElementById('address-input').value;
        localStorage.setItem('address', address);
    });

    let url = localStorage.getItem('url');
    let key = localStorage.getItem('key');
    let address = localStorage.getItem('address');
    if (url){
        document.getElementById('url-input').value = url;
    }
    else {
        localStorage.setItem('url', 'https://restricted.idena.io');
    }
    if (key){
        document.getElementById('key-input').value = key;
    }
    else {
        localStorage.setItem('key', 'idena-restricted-node-key');
    }
    if (address){
        document.getElementById('address-input').value = address;
    }

    // fill in the smart contract address and balance
    populatePlaceholders();
}

async function populatePlaceholders(){
    let welcomeMessage = document.getElementById('output-console').innerHTML;
    welcomeMessage = welcomeMessage.replace("[SMART_CONTRACT_ADDRESS]", oracleLoanContract);
    utils.clearConsole();
    utils.print(welcomeMessage, showDate = false);

    let detailsBar = document.getElementById('contract-details-bar').innerHTML;
    detailsBar = detailsBar.replace(/\[SMART_CONTRACT_ADDRESS\]/g, oracleLoanContract);
    detailsBar = detailsBar.replace("[SMART_CONTRACT_BALANCE]", await rpc.getSmartContractBalance());
    detailsBar = detailsBar.replace("[FEE_RATE]", (await getFeeRate()) * 100);

    document.getElementById('contract-details-bar').innerHTML = detailsBar;
}

async function getFeeRate(){
    let state = await rpc.getContractState();
    return state.feeRate / 100;
}

async function getBalanceButton(){
    let caller = document.getElementById('balance-input').value;
    if (!utils.validateAddress(caller)){
        utils.print("Action: Get Balance\nInvalid address");
        return;
    }
    let balance = await rpc.getBalance(caller);
    if (balance !== undefined){
        utils.print(`Get Balance\nAddress: ${caller}\nBalance: ${balance}`);
    }
}

async function depositButton(){
    let caller = document.getElementById('address-input').value;
    if (!utils.validateAddress(caller)){
        utils.print("Action: Deposit\nInvalid address");
        return;
    }
    let amount = document.getElementById('deposit-input').value;
    let tx = await ctr.generateCallContractTx(caller, oracleLoanContract, amount, "deposit", []);

    let dnaLink = utils.generateDnaLink(tx, "deposit");
    console.log(dnaLink);
    window.open(dnaLink, '_blank');
}

async function withdrawButton(){
    let caller = document.getElementById('address-input').value;
    if (!utils.validateAddress(caller)){
        utils.print("Action: Withdraw\nInvalid address");
        return;
    }
    let amount = document.getElementById('withdraw-input').value;

    if (parseFloat(await rpc.getBalance(caller)) < parseFloat(amount)){     // might not work for the smallest units of iDNA
        utils.print("Action: Withdraw\nYou don't have enough balance");
        return;
    }

    let withdrawArg = [{"index": 0, "format": "bigint", "value": BigInt(utils.floatStringToDna(amount))}];
    let tx = await ctr.generateCallContractTx(caller, oracleLoanContract, "0", "withdraw", withdrawArg);
    
    let dnaLink = utils.generateDnaLink(tx, "withdraw");
    console.log(dnaLink);
    window.open(dnaLink, '_blank');
}

async function proposeOracleButton(){
    let caller = document.getElementById('address-input').value;
    if (!utils.validateAddress(caller)){
        utils.print("Action: Propose Oracle\nInvalid address");
        return;
    }

    let oracle = document.getElementById('propose-oracle-input').value;
    if (!utils.validateAddress(oracle)){
        utils.print("Action: Propose Oracle\nInvalid oracle address");
        return;
    }

    let verifyOracleResponse = await rpc.verifyOracle(oracle);
    if (verifyOracleResponse){
        utils.print(`Action: Propose Oracle\n${verifyOracleResponse}\nIf you are having issues, check out this oracle creation guide: <a href="./guide.html" target="_blank">https://oracle-loan.idena.cloud/guide.html</a>`);
        return;
    }

    let tx = await ctr.generateCallContractTx(caller, oracleLoanContract, "0", "proposeOracle", [{"index": 0, "format": "hex", "value": oracle}]);

    let dnaLink = utils.generateDnaLink(tx, "proposeOracle");
    console.log(dnaLink);
    window.open(dnaLink, '_blank');
}

async function payOracleFeeButton(){
    let caller = document.getElementById('address-input').value;
    if (!utils.validateAddress(caller)){
        utils.print("Action: Pay Oracle Fee\nInvalid address");
        return;
    }

    let oracle = document.getElementById('pay-oracle-fee-input').value;
    if (!utils.validateAddress(oracle)){
        utils.print("Action: Propose Oracle\nInvalid oracle address");
        return;
    }

    let oracleData = await rpc.getOracleData(oracle);
    console.log(oracleData)
    
    if (oracleData === undefined){
        utils.print("Action: Pay Oracle Fee\nOracle not found");
        return;
    }
    if (!oracleData.isApproved){
        utils.print("Action: Pay Oracle Fee\nOracle is not approved yet");
        return;
    }

    if (!feeRate){
        utils.print("Action: Pay Oracle Fee\nCould not retrieve the fee rate");
        return;
    }

    let fee = (oracleData.ownerDeposit / 1e18 * feeRate + 0.00001).toFixed(5);
    
    let tx = await ctr.generateCallContractTx(caller, oracleLoanContract, fee, "payOracleFee", [{"index": 0, "format": "hex", "value": oracle}]);

    let dnaLink = utils.generateDnaLink(tx, "payOracleFee");
    console.log(dnaLink);
    window.open(dnaLink, '_blank');
}

async function getOracleDataButton(){
    let oracle = document.getElementById('get-oracle-data-input').value;
    if (!utils.validateAddress(oracle)){
        utils.print("Action: Get Oracle Data\nInvalid oracle address");
        return;
    }

    let oracleData = await rpc.getOracleData(oracle);
    if (oracleData === undefined){
        utils.print("Action: Get Oracle Data\nOracle not found");
        return;
    }

    if (!feeRate){
        utils.print("Action: Get Oracle Data\nCould not retrieve the fee rate");
        return;
    }

    let consoleMessage = `== Oracle Data ==\n` +
                         `Oracle: ${oracle}\n` +
                         `Is oracle approved?: ${oracleData.isApproved ? "Yes" : "No"}\n` +
                         `Is oracle funded and has fee paid?: ${oracleData.feePaid && oracleData.isFunded ? "Yes" : "No"}\n` +
                         `Fee required: ${(oracleData.ownerDeposit / 1e18 * feeRate).toFixed(5)} iDNA`;

    utils.print(consoleMessage);
}

async function getReviewCommitteeButton(){
    let reviewCommittee = await rpc.getReviewCommittee();
    utils.print(`== Review Committee Members ==\n${reviewCommittee.map((member, index) => `${index + 1}. ${member}`).join('\n')}`);
}

async function approveOracleButton(){
    let caller = document.getElementById('address-input').value;
    if (!utils.validateAddress(caller)){
        utils.print("Action: Approve Oracle\nInvalid address");
        return;
    }
    
    let reviewCommittee = await rpc.getReviewCommittee();
    if (!reviewCommittee.includes(caller.toLowerCase())){
        utils.print("Action: Approve Oracle\nYou are not a member of the review committee");
        return;
    }

    let oracle = document.getElementById('approve-oracle-input').value;
    if (!utils.validateAddress(oracle)){
        utils.print("Action: Approve Oracle\nInvalid oracle address");
        return;
    }

    let tx = await ctr.generateCallContractTx(caller, oracleLoanContract, "0", "approveOracle", [{"index": 0, "format": "hex", "value": oracle}]);

    let dnaLink = utils.generateDnaLink(tx, "approveOracle");
    console.log(dnaLink);
    window.open(dnaLink, '_blank');
}

module.exports = {
    getBalanceButton,
    depositButton,
    withdrawButton,
    proposeOracleButton,
    payOracleFeeButton,
    getOracleDataButton,
    getReviewCommitteeButton,
    approveOracleButton,
    clearConsole: utils.clearConsole
}

// browserify ./resources/js/index.js -o ./resources/js/bundle.js --s module