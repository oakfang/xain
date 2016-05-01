# xain
Using ES2015 proxies to simplify observation and reaction


## Usage

### Simple observation

```js
'use strict';

const {observable, observe} = require('xian');

const o = observable({
    foo: 1
});
let count = 0;
const unobserve = observe(o, (prop, newValue, oldValue) => count += 1); // returns a funtion that, when called, stops the observation
// count == 0
o.foo = 1;
// count == 0
o.foo = 2;
o.foo = 2;
// count == 1
o.foo = 1;
// count == 2
unobserve(); // stop the observer
o.foo = 5;
o.foo = 6;
o.foo = 7;
// count == 2
```

### Batched observation

(Use when you make several changes and you want to get the diff, if it exists, between the first and last changes on this tick)

```js
const o = observable({
    foo: 1
}, true); // notice the `true` parameter indicating it is batched
let count = 0;
observe(o, () => count += 1);
// count == 0
o.foo = 0;
// count == 0
o.foo = 2;
o.foo = 2;
// count == 0
process.nextTick(() => {
    // count == 1, and oldValue will be 1 and newValue will be 2, skipping the 0 in between
});
```

### Reactive links

```js
const x = require('xian');

const o = x.observable({
    x: 3,
    y: 6
});
let counter = 0;
const r = x.reactive({ // note: every reactive object is also `observable`, and thus can be passed to the `observe` function.
    x: x.pipe(o, 'x'), // pipe changes through
    y: x.pipe(o, 'y'),
    z: x.link(o, ({x, y}) => { // link changes of dependencies into a new value
        counter += 1;
        return x + y;
    })
});
t.is(r.x, 3);
t.is(r.y, 6);
t.is(r.z, 9);
t.is(counter, 1);
o.x = 3;
t.is(r.x, 3);
t.is(r.y, 6);
t.is(r.z, 9);
t.is(counter, 1);
o.x = 5;
t.is(r.x, 5);
t.is(r.y, 6);
t.is(r.z, 11);
t.is(counter, 2);
```

**Note:** a `link` function must always `get` every single dependency every time it runs.
The easiest way is to destructure the observable (the actual argument passed to the link function)
into the properties the link depends upon.