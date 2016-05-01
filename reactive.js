'use strict';

const {observe, observable} = require('./observable');
const SYM_LINK = Symbol('@@link');

function recorder(obj, accesses) {
    return new Proxy(obj, {
        get(target, key) {
            accesses.push(key);
            return target[key];
        }
    })
}

function link(obs, callback) {
    return {[SYM_LINK](target, key) {
        let _acs = [];
        target[key] = callback(recorder(obs, _acs));
        const acs = new Set(_acs);
        observe(obs, prop => {
            if (acs.has(prop)) target[key] = callback(obs);
        });
    }};
}

function pipe(obs, prop) {
    return link(obs, obs => obs[prop]);
}

function reactive(obj) {
    return Object.keys(obj).reduce((result, key) => {
        const value = obj[key];
        if (typeof value === 'object' && SYM_LINK in value) {
            value[SYM_LINK](result, key);
        } else {
            result[key] = value;
        }
        return result;
    }, observable({}));
}


module.exports = {reactive, link, pipe};