const ctr = require("./contract.js");
const rpc = require("./rpc.js");
const utils = require("./utils.js");
const oracleLoanContract = utils.oracleLoanContract;

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

    const welcomeMessage = `=== Welcome to the Oracle Loan dApp ===\n` +
                           `This site allows you to interact with the Oracle Loan smart contract\n\n` +
                           `Smart contract address: ${oracleLoanContract}\n\n` +
                           `To obtain a loan, you first need to propose an oracle, get it approved by someone in the review committee, and pay the oracle fee (5% of the owner deposit)\n\n` +
                           `For your oracle to be proposed successfully, it needs to:\n` +
                           `- have the smart contract address (the one above) as the refund address\n` +
                           `- have no owner fee set\n` +
                           `- start within the next 2 weeks\n` +
                           `- have a maximum duration of approximately 4 weeks once started (120960 blocks)\n\n` +
                           `To get your oracle approved, you can ask a member of the review committee to approve it on the official Idena discord server (https://discord.gg/idena-community-634481767352369162)\n\n` +
                           `After you pay the fee, your oracle will receive the deposit necessary to start it (you still need to launch it manually)\n\n`;
    utils.print(welcomeMessage, showDate = false);
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
    console.log(caller, amount)
    let tx = await ctr.generateCallContractTx(caller, oracleLoanContract, amount, "deposit", []);

    console.log(utils.generateDnaLink(tx));
    window.open(utils.generateDnaLink(tx), '_blank');
}

async function withdrawButton(){
    let caller = document.getElementById('address-input').value;
    if (!utils.validateAddress(caller)){
        utils.print("Action: Withdraw\nInvalid address");
        return;
    }
    let amount = document.getElementById('withdraw-input').value;

    if (await rpc.getBalance(caller) < amount){
        utils.print("Action: Withdraw\nYou don't have enough balance");
        return;
    }

    let tx = await ctr.generateCallContractTx(caller, oracleLoanContract, "0", "withdraw", [{"index": 0, "format": "dna", "value": amount}]);
    
    console.log(utils.generateDnaLink(tx));
    window.open(utils.generateDnaLink(tx), '_blank');
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
        utils.print(`Action: Propose Oracle\n${verifyOracleResponse}`);
        return;
    }

    let tx = await ctr.generateCallContractTx(caller, oracleLoanContract, "0", "proposeOracle", [{"index": 0, "format": "hex", "value": oracle}]);

    console.log(utils.generateDnaLink(tx));
    window.open(utils.generateDnaLink(tx), '_blank');
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

    let fee = (oracleData.ownerDeposit / 1e18 * 0.05).toFixed(5);
    
    let tx = await ctr.generateCallContractTx(caller, oracleLoanContract, fee, "payOracleFee", [{"index": 0, "format": "hex", "value": oracle}]);

    console.log(utils.generateDnaLink(tx));
    window.open(utils.generateDnaLink(tx), '_blank');
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

    let consoleMessage = `== Oracle Data ==\n` +
                         `Oracle: ${oracle}\n` +
                         `Is oracle approved?: ${oracleData.isApproved ? "Yes" : "No"}\n` +
                         `Is oracle fee paid?: ${oracleData.feePaid ? "Yes" : "No"}\n` +
                         `Fee required: ${(oracleData.ownerDeposit / 1e18 * 0.05).toFixed(5)} iDNA`;

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
    if (!reviewCommittee.includes(caller)){
        utils.print("Action: Approve Oracle\nYou are not a member of the review committee");
        return;
    }

    let oracle = document.getElementById('approve-oracle-input').value;
    if (!utils.validateAddress(oracle)){
        utils.print("Action: Approve Oracle\nInvalid oracle address");
        return;
    }

    let tx = await ctr.generateCallContractTx(caller, oracleLoanContract, "0", "approveOracle", [{"index": 0, "format": "hex", "value": oracle}]);

    console.log(utils.generateDnaLink(tx));
    window.open(utils.generateDnaLink(tx), '_blank');
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