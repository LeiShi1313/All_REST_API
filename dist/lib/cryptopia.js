"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const crypto = require("crypto");
const querystring = require("querystring");
class Cryptopia {
    constructor() {
        this.API_URL = 'https://www.cryptopia.co.nz';
        this.GET_BALANCE = '/Api/GetBalance';
    }
    sign(method, params, key, secret) {
        let paramsStr = querystring.stringify(params) || '{}';
        console.log(paramsStr);
        let nonce = Math.floor(new Date().getTime() / 1000);
        console.log("nonce: " + nonce);
        let base64 = crypto.createHash('md5').update(paramsStr).digest().toString('base64');
        console.log("base64: " + base64);
        let signature = key + "POST" + querystring.escape(this.API_URL + method).toLowerCase() + nonce + base64;
        console.log("signature: " + signature);
        return crypto.createHmac('sha256', new Buffer(secret, "base64")).update(signature).digest().toString('base64') + ':' + nonce;
    }
    ;
    getPrice(pair, callback) {
    }
    getBalance(key, secret, callback) {
        let params = {};
        let signature = this.sign("/Api/GetBalance", params, key, secret);
        let headers = {
            'Authorization': "amx " + key + ':' + signature,
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': Buffer.byteLength(JSON.stringify(params))
        };
        console.log("header: " + JSON.stringify(headers, null, 4));
        axios_1.default({
            method: 'POST',
            url: this.API_URL + this.GET_BALANCE,
            headers: headers,
            data: '{}'
        }).then((res) => {
            if (res.data['Success'] === true) {
                let data = [];
                for (let asset of res.data['Data']) {
                    if (asset['Available'] != 0.0) {
                        data.push({
                            symbol: asset['Symbol'],
                            amount: asset['Available'],
                            status: 'free'
                        });
                    }
                    if (asset['HeldForTrades'] != 0.0) {
                        data.push({
                            symbol: asset['Symbol'],
                            amount: asset['HeldForTrades'],
                            status: 'locked'
                        });
                    }
                }
                callback({
                    code: 1,
                    data: data
                });
            }
            else {
                callback({
                    code: res.data['code'],
                    message: res.data['msg'],
                    data: []
                });
            }
        })
            .catch((reason) => {
            console.log(reason);
            callback({
                code: -1,
                data: []
            });
        });
    }
}
exports.Cryptopia = Cryptopia;
