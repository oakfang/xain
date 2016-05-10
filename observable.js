'use strict';

const SYM_OBSERVE = Symbol('@@observe');

function mergeChanges(changes) {
    const reduced = changes.reduce((map, {key, oldValue, newValue}) => {
        if (map.has(key)) {
            let lastChange = map.get(key);
            lastChange.newValue = newValue;
        } else {
            map.set(key, {oldValue, newValue});
        }
        return map;
    }, new Map());
    let result = [];
    for (let [key, {oldValue, newValue}] of reduced.entries()) result.push({key, oldValue, newValue});
    return result;
}

function observable(object, batch=false) {
    let listeners = new Set();
    let batched = [];

    return new Proxy(object, {
        get(target, key) {
            if (key === SYM_OBSERVE) {
                return callback => {
                    listeners.add(callback);
                    return () => batch ? process.nextTick(() => listeners.delete(callback)) : listeners.delete(callback);
                };
            }
            return target[key];
        },
        set(target, key, newValue) {
            const oldValue = target[key];
            target[key] = newValue;
            if (oldValue !== newValue) {
                if (batch) {
                    batched.push({key, oldValue, newValue});
                    if (batched.length === 1) {
                        process.nextTick(() => {
                            for (let {key, newValue, oldValue} of mergeChanges(batched)) {
                                for (let listener of listeners) {
                                    listener(key, newValue, oldValue);
                                }
                            }
                            batched = [];
                        });
                    }
                } else {
                    for (let listener of listeners) {
                        listener(key, newValue, oldValue);
                    }
                }
            }
            return true;
        }
    });
}

function observe(obs, callback) {
    return obs[SYM_OBSERVE](callback);
}

module.exports = {observable, observe, SYM_OBSERVE};