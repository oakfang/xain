import test from 'ava';
import * as x from '.';

test('Base observable', t => {
    const o = x.observable({
        foo: 1
    });
    let count = 0;
    const unobserve = x.observe(o, () => count += 1);
    t.is(count, 0);
    o.foo = 1;
    t.is(count, 0);
    o.foo = 2;
    o.foo = 2;
    t.is(count, 1);
    o.foo = 1;
    t.is(count, 2);
    unobserve();
    o.foo = 5;
    o.foo = 6;
    o.foo = 7;
    t.is(count, 2);
});

test('Batched observable', async t => {
    const o = x.observable({
        foo: 1
    }, true);
    let count = 0;
    x.observe(o, () => count += 1);
    t.is(count, 0);
    o.foo = 1;
    t.is(count, 0);
    o.foo = 2;
    o.foo = 2;
    t.is(count, 0);
    process.nextTick(() => {
        t.is(count, 1);
    });
});

test('Reactive linking', t => {
    const o = x.observable({
        x: 3,
        y: 6
    });
    let counter = 0;
    const r = x.reactive({
        x: x.pipe(o, 'x'),
        y: x.pipe(o, 'y'),
        z: x.link(o, ({x, y}) => {
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
});

test('Stream filter', t => {
    const o = x.observable({
        x: 3,
        y: 6
    });
    const str = x.stream(o)
                 .filter(key => key === 'x');
    let actual = [];
    x.observe(str, k => actual.push(k));
    o.x = 1;
    o.y = 9;
    o.y = 4;
    o.x = -2;
    o.x = 5;
    o.y = 2;
    t.is(actual.length, 3);
    t.is(actual.every(k => k === 'x'), true);
});

test('Stream map', t => {
    const o = x.observable({
        x: 3,
        y: 6
    });
    const str = x.stream(o)
                 .map((key, val) => val);
    let actual = [];
    x.observe(str, v => actual.push(v));
    o.x = 1;
    o.y = 9;
    o.y = 4;
    o.x = -2;
    o.x = 5;
    o.y = 2;
    t.is(actual.reduce((acc, v) => acc + v, 0), 19);
});

test('Stream reduce', t => {
    const o = x.observable({
        x: 3,
        y: 6
    });
    const mostChanged = x.stream(o)
                         .reduce((acc, key) => {
                            acc[key]++;
                            return acc;
                         }, {x: 0, y: 0});
    let actual = [];
    x.observe(mostChanged, ({y}) => actual.push(y));
    o.x = 1;
    o.y = 9;
    o.y = 4;
    o.x = -2;
    o.x = 5;
    o.y = 2;
    t.is(actual.length, 6);
    t.is(actual[0], 0);
    t.is(actual[1], 1);
    t.is(actual[2], 2);
    t.is(actual[3], 2);
    t.is(actual[4], 2);
    t.is(actual[5], 3);
});

test('Combine streams', t => {
    const o = x.observable({
        x: 3,
        y: 6
    });
    const str = x.stream(o)
                 .filter(key => key === 'x')
                 .map((key, val) => val);
    let actual = [];
    x.observe(str, v => actual.push(v));
    o.x = 1;
    o.y = 9;
    o.y = 4;
    o.x = -2;
    o.x = 5;
    o.y = 2;
    t.is(actual.reduce((acc, v) => acc + v, 0), 4);
});

test('Stream observations', t => {
    const o = x.observable({
        x: 3,
        y: 6
    });
    const str = x.stream(o)
                 .filter(key => key === 'x')
                 .map((key, nval, oval) => oval)
                 .reduce((acc, val) => acc + val, 0);
    const expected = [3, 4, 2];
    let actual = [];
    x.observe(str, v => actual.push(v));
    o.x = 1;
    o.x = -2;
    o.x = 5;
    t.is(expected[0], actual[0]);
    t.is(expected[1], actual[1]);
    t.is(expected[2], actual[2]);
});