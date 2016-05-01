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

// function element (view, render) {
//     return props => {
//         let _props = reactive({
//             template: link(reactive(props), view)
//         });

//         observe(_props, (prop, val) => {if (prop === 'template') render(val)});
//         render(_props.template);
//         return () => _props.template;
//     }
// }

// const state = observable({
//     firstName: 'Foo',
//     lastName: 'Bar',
//     age: 5
// });

// const cardProps = {
//     name: link(state, ({firstName, lastName}) => firstName + ' ' + lastName),
//     age: pipe(state, 'age'),
//     title() {
//         return `<h1>${this.name}</h1>`;
//     }
// };

// const Card = element((props) => `<div>${props.title()} ${props.age}</div>`, console.log);

// const card = Card(cardProps);

// state.age = 6;
// state.firstName = 'Rawr';
// state.firstName = 'Rawr';
// state.firstName = 'Rawr';
// state.age = 6;