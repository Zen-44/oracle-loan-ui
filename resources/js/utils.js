const oracleLoanContract = "0x7A891225f9BcA2BeC1B63b9b9B2765186ad501Fd";
const callback_url = "https://oracle-loan.idena.cloud";
const proposedOracleCallback = callback_url + "/success.html";

function hexToString(hex) {
    hex = hex.replace(/^0x/, '');

    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
}

function print(msg, showDate = true){
    let currentDate = new Date();
    let date = currentDate.toLocaleDateString();
    let time = currentDate.toLocaleTimeString();

    msg = msg.replace(/\n/g, "<br>");

    if (showDate)
        msg = `-----${date} ${time}-----<br>${msg}`;
    let outputConsole = document.getElementById('output-console');
    outputConsole.innerHTML = msg + "<br><br>" + outputConsole.innerHTML;
}

function clearConsole(){
    document.getElementById('output-console').innerHTML = "";
}

function validateAddress(address){
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    return addressRegex.test(address);
}

function generateDnaLink(tx, proposedOracle = false){
    return `https://app.idena.io/dna/raw?tx=${tx}&callback_format=html&callback_url=${proposedOracle ? proposedOracleCallback : callback_url}`;
}

module.exports = {
    hexToString,
    print,
    clearConsole,
    validateAddress,
    generateDnaLink,
    oracleLoanContract
}