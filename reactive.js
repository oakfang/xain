'use strict';

const {observe, observable} = require('./observable');
const SYM_LINK = Symbol('@@link');

function recorder(obj, accesses) {
    return new Proxy(obj, {
        get(target, key) {
            accesses.add(key);
            return target[key];
        }
    })
}

function link(obs, callback) {
    return {[SYM_LINK](target, key) {
        const acs = new Set();
        target[key] = callback(recorder(obs, acs));
        observe(obs, prop => {
            if (acs.has(prop)) target[key] = callback(obs);
        });
    }};
}

function pipe(obs, prop) {
    return link(obs, obs => obs[prop]);
}

function reactive(obj, batched=false) {
    return Object.keys(obj).reduce((result, key) => {
        const value = obj[key];
        if (typeof value === 'object' && SYM_LINK in value) {
            value[SYM_LINK](result, key);
        } else {
            result[key] = value;
        }
        return result;
    }, observable({}, batched));
}

function viewOf(obs, spec, batched=false) {
    return reactive(Object.keys(spec).reduce((result, key) => {
        const value = spec[key];
        if (typeof value === 'string') {
            result[key] = pipe(obs, value);
        } else {
            result[key] = link(obs, value);
        }
        return result;
    }, {}), batched);
}


module.exports = {viewOf, reactive, link, pipe};