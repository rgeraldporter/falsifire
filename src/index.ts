import {
    Monad,
    TestMonad,
    TestCase,
    AssertionFunction,
    AsyncTestDone
} from './falsifire-types';
import { Truth, Decision } from 'booltable';
import { strict as assert } from 'assert';

const FF_TAG = `[🔥Falsifire🔥] `;

const anyToString = <T>(x: T): string =>
    Decision.of([
        [typeof x === 'object', JSON.stringify(x)],
        [typeof x === 'string', `"${x}"`],
        [typeof x === 'symbol', `Symbol()`],
        [true, String(x)]
    ])
        .run()
        .join();

// @ts-ignore
const isTestError = (err: any) =>
    // Mocha error type
    err.name === 'AssertionError [ERR_ASSERTION]'
        ? false // need reverse for Mocha -- @todo look into why this works?
        : err instanceof Error;

const asserting = (af: AssertionFunction, t: TestCase): void => {
    const { failing, passing, fn, beforeEachFn, afterEachFn } = t;

    // run the Test Case function as a param to the AssertionFunction
    // verify it throws an error, if not, throw a new error to bubble up to a test failure
    failing.map(<T>(val: T[]) => {
        beforeEachFn();
        assert.throws(
            () => af(fn(...val)),
            // @ts-ignore
            <T>(err: Error | T) => (isTestError(err) ? false : true),
            `${FF_TAG}Value ${anyToString(
                val
            )} in failing set passed given assertion. Assertion not sufficiently falsifiable.`
        );
        afterEachFn();
    });

    // only need to simply run these tests -- error will bubble up as failure on its own
    passing.map(<T>(val: T[]) => {
        beforeEachFn();
        af(fn(...val));
        afterEachFn();
    });
};

const assertingAsync = async (
    af: AssertionFunction,
    t: TestCase
): Promise<void> => {
    const { failing, passing, fn, done, beforeEachFn, afterEachFn } = t;

    // run the TestCase function with each provided "failing" value
    // then for each returned value, pass as parameter to AssertionFunction
    // verify it throws an error, if not, throw a new error to bubble up to a test failure
    const failingMap = async <T>(val: T[]) =>
        await assert.rejects(
            async () => {
                beforeEachFn();
                return fn(...val).then(af);
            },
            <T>(err: Error | T) => {
                afterEachFn();
                return (isTestError(err) ? false : true);
            },
            `${FF_TAG}Value ${anyToString(
                val
            )} in failing set passed given assertion. Assertion not sufficiently falsifiable.`
        );

    // only need to simpl run these tests -- error will bubble up as failure on its own
    const passingMap = async <T>(val: T[]) => {
        beforeEachFn();
        await fn(...val).then(af);
        afterEachFn();
        return;
    };

    return Promise.all(failing.map(failingMap))
        .then(() => Promise.all(passing.map(passingMap)))
        .then(() => done());
};

const expectingAsync = async (
    af: AssertionFunction,
    t: TestCase
) => {
    const { failing, passing, fn, done, beforeEachFn, afterEachFn } = t;

    // run the TestCase function with each provided "failing" value
    // then for each returned value, pass as parameter to AssertionFunction
    // verify it throws an error, if not, throw a new error to bubble up to a test failure
    const failingMap = async <T>(val: T[]) => {
        try {
            beforeEachFn();
            return await fn(...val)
                .then(af)
                .then(() => {
                    // since it didn't throw an error, this is not falsifiable, we'll throw our own error
                    console.log('DEBUG: in Promise "then" (failed to assert)');
                    afterEachFn();
                    throw new Error(
                        `${FF_TAG}Value ${anyToString(
                            val
                        )} in failing set passed given assertion. Assertion not sufficiently falsifiable.`
                    );
                    // @ts-ignore
                }, () => {
                    afterEachFn();
                    console.log('DEBUG: in Promise "catch" (asserted)');
                    // do nothing since we expect errors and errors are good here!
                });
        } catch (err) {
            afterEachFn();
            // for Mocha
            if (err.message.startsWith(FF_TAG)) {
                console.log('DEBUG: in catch for Mocha (failed to assert)');
                throw new Error(err.message);
            }
            return await Promise.resolve();
        }
    };


    // only need to simply run these tests -- error will bubble up as failure on its own
    const passingMap = async <T>(val: T[]) => {
        beforeEachFn();
        await fn(...val).then(af);
        afterEachFn();
    };

    return Promise.all(failing.map(failingMap))
        .then(() => Promise.all(passing.map(passingMap)))
        .then(() =>
            typeof done === 'function'
                ? done()
                : Promise.resolve())
        .catch((err: Error) => {

            if (typeof done === 'function') {
                done(err);
            }

            throw new Error(err.message);
        });
};

const expecting = (af: AssertionFunction, t: TestCase): void => {
    const { failing, passing, fn, beforeEachFn, afterEachFn } = t;

    // run the Test Case function as a param to the AssertionFunction
    // verify it throws an error, if not, throw a new error to bubble up to a test failure
    failing.map(<T>(val: T[]) => {
        try {
            beforeEachFn();
            af(fn(...val));
            afterEachFn();
            throw new Error(
                `${FF_TAG}Value ${anyToString(
                    val
                )} in failing set passed given assertion. Assertion not sufficiently falsifiable.`
            );
        } catch (err) {
            afterEachFn();
            if (err.message.startsWith(FF_TAG)) throw new Error(err);
        }
    });

    // only need to simply run these tests -- error will bubble up as failure on its own
    passing.map(<T>(val: T[]) => {
        beforeEachFn();
        af(t.fn(...val));
        afterEachFn();
    });
};

const runNoop = (t: TestCase): void | Promise<void> =>
    t.async
        ? expectingAsync(() => { }, t)
        : expecting(() => { }, t);

const Test = <T>(x: TestCase): TestMonad => ({
    map: (f: Function): TestMonad => Test(f(x)),
    chain: (f: Function): T => f(x),
    join: (): TestCase => x,
    emit: (): TestCase => x,
    inspect: (): string => `Test(${x})`,
    ap: (y: Monad): Monad => y.map(x),
    async: (done?: AsyncTestDone): TestMonad =>
        Test({ ...x, async: true, done: done ? done : () => { } }),
    describe: (description: string): TestMonad => Test({ ...x, description }),
    passing: <T>(passing: T[]): TestMonad => Test({ ...x, passing }),
    failing: <T>(failing: T[]): TestMonad => Test({ ...x, failing }),
    beforeEach: (beforeEachFn: Function): TestMonad => Test({ ...x, beforeEachFn }),
    afterEach: (afterEachFn: Function): TestMonad => Test({ ...x, afterEachFn }),
    expecting: (f: AssertionFunction) =>
        x.async ? expectingAsync(f, x) : expecting(f, x),
    asserting: (f: AssertionFunction) =>
        x.async ? assertingAsync(f, x) : asserting(f, x),
    run: () => runNoop(x)
});

const identityFn = <T>(arg: T): Function =>
    typeof arg === 'function' ? arg : () => { };

const TestOf = (x: TestCase | Function): TestMonad =>
    Truth.of([
        'fn' in x,
        'description' in x,
        'passing' in x,
        'failing' in x,
        'async' in x,
        'done' in x,
        'beforeEachFn' in x,
        'afterEachFn' in x
    ]).forkAnd(
        () =>
            Test({
                fn: identityFn(x),
                description: '<No description>',
                passing: [],
                failing: [],
                async: false,
                done: () => { },
                beforeEachFn: () => {},
                afterEachFn: () => {}
            }),
        () => Test(x as TestCase)
    );

const exportTest = {
    of: TestOf
};

export { exportTest as Test };
