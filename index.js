'use strict';

const {observable, observe} = require('./observable');
const {reactive, link, pipe} = require('./reactive');

module.exports = {
    observable,
    observe,
    reactive,
    link,
    pipe
};