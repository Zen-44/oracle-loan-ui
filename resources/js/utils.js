const oracleLoanContract = "0x7A891225f9BcA2BeC1B63b9b9B2765186ad501Fd";
const callback_url = "https://oracle-loan.idena.cloud/success.html";
const proposedOracleCallback = callback_url + "/success.html?var=test";

function hexToString(hex) {
    hex = hex.replace(/^0x/, '');

    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
}

function dnaToFloatString(string, decimals = 18){
    // for some reason dnaToFloatString from idena-sdk-js loses some precision (maybe I didn't use it properly?)
    if (string == "0")
        return "0";
    
    let result;
    if (string.length-decimals <= 0){
        result = "0." + "0".repeat(decimals - string.length) + string;
        result = result.replace(/0+$/, ''); // remove trailing zeros
        return result;
    }

    result = string.slice(0,string.length - decimals) + "." + string.slice(string.length - decimals);
    result = result.replace(/0+$/, ''); // remove trailing zeros

    return result;
}

function floatStringToDna(string){
    let parts = string.split(".");
    let integerPart = parts[0];
    let decimalPart = parts[1] || "";

    if (decimalPart.length < 18) {
        decimalPart += "0".repeat(18 - decimalPart.length);
    } else if (decimalPart.length > 18) {
        decimalPart = decimalPart.slice(0, 18);
    }

    return integerPart + decimalPart;
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

function generateDnaLink(tx, actionType){
    return `https://app.idena.io/dna/raw?tx=${tx}&callback_format=html&callback_url=${callback_url}?action=${actionType}`;
}

module.exports = {
    hexToString,
    dnaToFloatString,
    floatStringToDna,
    print,
    clearConsole,
    validateAddress,
    generateDnaLink,
    oracleLoanContract
}