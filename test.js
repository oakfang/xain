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