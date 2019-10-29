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

const asserting = (af: AssertionFunction, t: TestCase): void => {
    const { failing, passing, fn } = t;

    // run the Test Case function as a param to the AssertionFunction
    // verify it throws an error, if not, throw a new error to bubble up to a test failure
    failing.map(<T>(val: T[]) => {
        assert.throws(
            () => af(fn(...val)),
            <T>(err: Error | T) => (err instanceof Error ? false : true),
            `${FF_TAG}Value ${anyToString(
                val
            )} in failing set passed given assertion. Assertion not sufficiently falsifiable.`
        );
    });

    // only need to simpl run these tests -- error will bubble up as failure on its own
    passing.map(<T>(val: T[]) => {
        af(t.fn(...val));
    });
};

const assertingAsync = async (
    af: AssertionFunction,
    t: TestCase
): Promise<void> => {
    const { failing, passing, fn, done } = t;

    // run the TestCase function with each provided "failing" value
    // then for each returned value, pass as parameter to AssertionFunction
    // verify it throws an error, if not, throw a new error to bubble up to a test failure
    const failingMap = async <T>(val: T[]) =>
        await assert.rejects(
            async () => fn(...val).then(af),
            <T>(err: Error | T) => (err instanceof Error ? false : true),
            `${FF_TAG}Value ${anyToString(
                val
            )} in failing set passed given assertion. Assertion not sufficiently falsifiable.`
        );

    // only need to simpl run these tests -- error will bubble up as failure on its own
    const passingMap = async <T>(val: T[]) => fn(...val).then(af);

    return Promise.all(failing.map(failingMap))
        .then(() => Promise.all(passing.map(passingMap)))
        .then(() => done());
};

const expectingAsync = async (
    af: AssertionFunction,
    t: TestCase
): Promise<void> => {
    const { failing, passing, fn, done } = t;

    // run the TestCase function with each provided "failing" value
    // then for each returned value, pass as parameter to AssertionFunction
    // verify it throws an error, if not, throw a new error to bubble up to a test failure
    const failingMap = async <T>(val: T[]) =>
        await fn(...val)
            .then(af)
            .then(() => {
                // since it didn't throw an error, this is not falsifiable, we'll throw our own error
                throw new Error(
                    `${FF_TAG}Value ${anyToString(
                        val
                    )} in failing set passed given assertion. Assertion not sufficiently falsifiable.`
                );
            }, () => {
                // do nothing since we expect errors and errors are good!
            });

    // only need to simply run these tests -- error will bubble up as failure on its own
    const passingMap = async <T>(val: T[]) => fn(...val).then(af);

    return Promise.all(failing.map(failingMap))
        .then(() => Promise.all(passing.map(passingMap)))
        .then(() => done())
        .catch(<T>(err: T) => done(err));
};

const expecting = (af: AssertionFunction, t: TestCase): void => {
    const { failing, passing, fn } = t;

    // run the Test Case function as a param to the AssertionFunction
    // verify it throws an error, if not, throw a new error to bubble up to a test failure
    failing.map(<T>(val: T[]) => {
        try {
            af(fn(...val));
            throw new Error(
                `${FF_TAG}Value ${anyToString(
                    val
                )} in failing set passed given assertion. Assertion not sufficiently falsifiable.`
            );
        } catch (err) {
            if (err.message.startsWith(FF_TAG)) throw new Error(err);
        }
    });

    // only need to simply run these tests -- error will bubble up as failure on its own
    passing.map(<T>(val: T[]) => {
        af(t.fn(...val));
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
    async: (done: AsyncTestDone): TestMonad =>
        Test({ ...x, async: true, done }),
    describe: (description: string): TestMonad => Test({ ...x, description }),
    passing: <T>(passing: T[]): TestMonad => Test({ ...x, passing }),
    failing: <T>(failing: T[]): TestMonad => Test({ ...x, failing }),
    expecting: (f: AssertionFunction): void | Promise<void> =>
        x.async ? expectingAsync(f, x) : expecting(f, x),
    asserting: (f: AssertionFunction): void | Promise<void> =>
        x.async ? assertingAsync(f, x) : asserting(f, x),
    run: (): void | Promise<void> => runNoop(x)
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
        'done' in x
    ]).forkAnd(
        () =>
            Test({
                fn: identityFn(x),
                description: '<No description>',
                passing: [],
                failing: [],
                async: false,
                done: () => { }
            }),
        () => Test(x as TestCase)
    );

const exportTest = {
    of: TestOf
};

export { exportTest as Test };
