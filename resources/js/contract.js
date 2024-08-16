const idena = require("idena-sdk-js")
const rpc = require("./rpc.js")

function getMethodGas(method){
    switch (method){
        case "deposit": {
            return 30_000;
        }
        case "withdraw": {
            return 30_000;
        }
        case "proposeOracle": {
            return 150_000;
        }
        case "payOracleFee": {
            return 50_000;
        }
        case "approveOracle": {
            return 30_000;
        }
        default: {
            return 200_000;
        }  
    }
}

async function generateCallContractTx(caller, to, amount, method, args) {
    let tx = new idena.Transaction();
    let payload = new idena.CallContractAttachment();

    tx.type = idena.TransactionType.CallContractTx;
    tx.to = idena.hexToUint8Array(to);
    tx.amount = idena.floatStringToDna(amount);
    tx.nonce = await rpc.getNonce(caller) + 1;
    tx.epoch = await rpc.getEpoch();

    const feePerGas = await rpc.getFeePerGas();
    const methodGas = getMethodGas(method);
    tx.maxFee = idena.calculateGasCost(feePerGas, tx.gas + methodGas * 2);

    payload.method = method;
    if (args.length)
        payload.setArgs(args);

    tx.payload = payload.toBytes();

    return tx.toHex();
}

module.exports = {
    generateCallContractTx
}