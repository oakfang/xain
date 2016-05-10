'use strict';

const {observable, observe, SYM_OBSERVE} = require('./observable');

const TRIGGER_SYM = Symbol('@@trigger');

function stream(obs) {
    let listeners = new Set();
    let unobserve;

    const $stream = {
        filter(predicate) {
            unobserve();
            unobserve = observe(obs, (...args) => {
                if (predicate(...args)) $stream[TRIGGER_SYM](...args);
            });
            return stream($stream);
        },
        map(mapper) {
            unobserve();
            unobserve = observe(obs, (...args) => {
                $stream[TRIGGER_SYM](mapper(...args));
            });
            return stream($stream);
        },
        reduce(reducer, start) {
            unobserve();
            unobserve = observe(obs, (...args) => {
                start = reducer(start, ...args);
                $stream[TRIGGER_SYM](start);
            });
            return stream($stream);
        },
        [SYM_OBSERVE](callback) {
            listeners.add(callback);
            return () => listeners.delete(callback);
        },
        [TRIGGER_SYM](...args) {            
            for (let listener of listeners) {
                listener(...args);
            }
        }
    };

    unobserve = observe(obs, (...args) => $stream[TRIGGER_SYM](...args));

    return $stream;
}


module.exports = stream;