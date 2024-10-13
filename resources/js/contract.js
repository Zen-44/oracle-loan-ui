const idena = require("idena-sdk-js")
const rpc = require("./rpc.js")

const maxFee = idena.floatStringToDna("5.0");

async function generateCallContractTx(caller, to, amount, method, args) {
    let tx = new idena.Transaction();
    let payload = new idena.CallContractAttachment();

    tx.type = idena.TransactionType.CallContractTx;
    tx.to = idena.hexToUint8Array(to);
    tx.amount = idena.floatStringToDna(amount);
    tx.nonce = await rpc.getNonce(caller) + 1;
    tx.epoch = await rpc.getEpoch();
    tx.maxFee = maxFee;

    payload.method = method;
    if (args.length)
        payload.setArgs(args);

    tx.payload = payload.toBytes();

    return tx.toHex();
}

module.exports = {
    generateCallContractTx
}