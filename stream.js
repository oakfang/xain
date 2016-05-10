'use strict';

const {observable, observe, SYM_OBSERVE} = require('./observable');

const TRIGGER_SYM = Symbol('@@trigger');
const REWIRE_SYM = Symbol('@@rewire');


function stream(obs) {
    let listeners = new Set();
    let unobserve;

    const $stream = {
        filter(predicate) {
            const str = stream($stream)[REWIRE_SYM]();
            observe($stream, (...args) => {
                if (predicate(...args)) str[TRIGGER_SYM](...args);
            });
            return str;
        },
        map(mapper) {
            const str = stream($stream)[REWIRE_SYM]();
            observe($stream, (...args) => str[TRIGGER_SYM](mapper(...args)));
            return str;
        },
        reduce(reducer, start) {
            const str = stream($stream)[REWIRE_SYM]();
            observe($stream, (...args) => {
                start = reducer(start, ...args);
                str[TRIGGER_SYM](start);
            });
            return str;
        },
        merge(otherStream) {
            const str = stream($stream);
            observe(otherStream, (...args) => str[TRIGGER_SYM](...args));
            return str;
        },
        [SYM_OBSERVE](callback) {
            listeners.add(callback);
            return () => listeners.delete(callback);
        },
        [TRIGGER_SYM](...args) {            
            for (let listener of listeners) {
                listener(...args);
            }
        },
        [REWIRE_SYM]() {
            unobserve();
            return $stream;
        }
    };

    unobserve = observe(obs, (...args) => $stream[TRIGGER_SYM](...args));

    return $stream;
}


module.exports = stream;