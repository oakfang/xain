'use strict';

import {observe, observable} from './observable';
const SYM_LINK = Symbol('@@link');

function recorder(obj, accesses) {
    return new Proxy(obj, {
        get(target, key) {
            accesses.push(key);
            return target[key];
        }
    })
}

export function link(obs, callback) {
    return {[SYM_LINK](target, key) {
        let _acs = [];
        target[key] = callback(recorder(obs, _acs));
        const acs = new Set(_acs);
        observe(obs, prop => {
            if (acs.has(prop)) target[key] = callback(obs);
        });
    }};
}

export function pipe(obs, prop) {
    return link(obs, obs => obs[prop]);
}

export function reactive(obj, batched=false) {
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