"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const crypto = require("crypto");
const querystring = require("querystring");
class ZB {
    constructor() {
        this.API_URL = 'https://trade.zb.com/';
        this.ACCOUNT_INFO = 'api/getAccountInfo';
        this.MARKET_URL = 'http://api.zb.com/';
        this.TICKER_URL = 'data/v1/ticker';
    }
    sorted(o) {
        let p = Object.create(null);
        for (const k of Object.keys(o).sort())
            p[k] = o[k];
        return p;
    }
    sign(params, secret) {
        let sortedParams = querystring.stringify(this.sorted(params));
        console.log(sortedParams);
        let sha1SecretKey = crypto.createHash('sha1').update(secret).digest('hex');
        return crypto.createHmac('md5', sha1SecretKey).update(sortedParams).digest('hex');
    }
    getPrice(pair, callback) {
        let prams = {
            'market': pair
        };
        axios_1.default({
            method: 'GET',
            url: this.MARKET_URL + this.TICKER_URL,
            params: prams
        }).then((res) => {
            if (!res.data['error']) {
                callback({
                    code: 1,
                    data: res.data['ticker']['last']
                });
            }
            else {
                callback({
                    code: -1,
                    message: res.data['error'],
                    data: ''
                });
            }
        }).catch((reason) => {
            callback({
                code: -1,
                data: ''
            });
        });
    }
    getBalance(key, secret, callback) {
        let params = {
            'accesskey': key,
            'method': 'getAccountInfo'
        };
        let headers = {};
        params['sign'] = this.sign(params, secret);
        params['reqTime'] = new Date().getTime();
        console.log(params);
        axios_1.default({
            method: 'GET',
            url: this.API_URL + this.ACCOUNT_INFO,
            headers: headers,
            params: params
        }).then((res) => {
            if (res.status === 200) {
                let coins = res.data['result']['coins'];
                let data = [];
                for (let coin of coins) {
                    if (coin['available'] != 0.0) {
                        data.push({
                            symbol: coin['enName'],
                            amount: coin['available'],
                            status: 'free'
                        });
                    }
                    if (coin['freez'] != 0.0) {
                        data.push({
                            symbol: coin['enName'],
                            amount: coin['freez'],
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
                    message: res.data['message'],
                    data: []
                });
            }
        }).catch((reason) => {
            console.log(reason);
            callback({
                code: -1,
                message: "",
                data: []
            });
        });
    }
}
exports.ZB = ZB;
