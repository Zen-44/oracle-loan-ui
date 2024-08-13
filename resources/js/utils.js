const oracleLoanContract = "0x4978a3a5e83e851e202ea84ad6f2739cc2f46405"; //"0x817b9233fA2E58775F70ABe69ffcf6bAa0D9ADdb"; - testing contracts

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

    if (showDate)
        msg = `-----${date} ${time}-----\n${msg}`;
    let outputConsole = document.getElementById('output-console');
    outputConsole.value = msg + "\n\n" + outputConsole.value;
}

function clearConsole(){
    document.getElementById('output-console').value = "";
}

function validateAddress(address){
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    return addressRegex.test(address);
}

function generateDnaLink(tx){
    return `https://app.idena.io/dna/raw?tx=${tx}&callback_format=html&callback_url=${'http://localhost:8000'}`;
}

module.exports = {
    hexToString,
    print,
    clearConsole,
    validateAddress,
    generateDnaLink,
    oracleLoanContract
}