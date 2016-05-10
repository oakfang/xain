'use strict';

const {observable, observe} = require('./observable');
const {reactive, link, pipe} = require('./reactive');
const stream = require('./stream');

module.exports = {
    observable,
    observe,
    reactive,
    link,
    pipe,
    stream
};