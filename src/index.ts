import { Monad, TestMonad, TestCase, MapFunction } from './falsifire-types';
import { Truth, Decision } from 'booltable';
import { strict as assert } from 'assert';

const FF_TAG = `[🔥Falsifire🔥] `;

const PromiseEach = (arr: string[] | any, fn: Function): Promise<any> => {
    const results: any[] = [];
    const newArr: any[] = Array.isArray(arr) ? arr : [arr];
    return newArr
        .reduce(
            (prev, curr, i): Promise<any> =>
                prev.then(() =>
                    fn(curr, i, arr.length).then((result: any[]) => {
                        results[i] = result;
                    })
                ),
            Promise.resolve()
        )
        .then(() => results);
};

const anyToString = (x: any) =>
    Decision.of([
        [typeof x === 'object', JSON.stringify(x)],
        [typeof x === 'string', `"${x}"`],
        [typeof x === 'symbol', `Symbol()`],
        [true, String(x)]
    ])
        .run()
        .join();

type AssertionFunction = Function;

const asserting = (af: AssertionFunction, t: TestCase): void => {
    const { failing, passing, fn } = t;

    failing.map(val => {
        assert.throws(
            () => af(fn(...val)),
            (err: any) => (err instanceof Error ? false : true),
            `${FF_TAG}Value ${anyToString(
                val
            )} in failing set passed given assertion. Assertion not sufficiently falsifiable.`
        );
    });

    passing.map((val: any) => {
        af(t.fn(...val));
    });
};

const assertingAsync = (af: AssertionFunction, t: TestCase): Promise<any> => {
    const { failing, passing, fn } = t;

    const failingMap = (val: any) => {
        assert.rejects(
            () =>
                fn(...val)
                    .then((val: any) => {
                        console.log('val', val);
                        return val;
                    })
                    .then((vals: any) => af(vals))
                    .catch((err: any) => console.error('err', err)),
            (err: any) => (err instanceof Error ? false : false),
            `${FF_TAG}Value ${anyToString(
                val
            )} in failing set passed given assertion. Assertion not sufficiently falsifiable.`
        );
    };

    const failingPromised = PromiseEach(failing, failingMap);
    const passingPromised = PromiseEach(passing, (val: any) => {
        fn(...val).then(af);
    });

    return Promise.all([failingPromised, passingPromised]);

    /*
    const passingPassed = Truth.of(passed).and();
    const failingFailed = Truth.of(failed).nor();
    return Truth.of([passingPassed, failingFailed]).and();
*/
};

const Test = (x: TestCase): TestMonad => ({
    map: (f: Function): TestMonad => Test(f(x)),
    chain: (f: Function): any => f(x),
    join: (): any => x,
    inspect: (): string => `Test(${x})`,
    ap: (y: Monad): Monad => y.map(x),
    within: (n: number): TestMonad => Test({ ...x, async: n }),
    describe: (description: string): TestMonad => Test({ ...x, description }),
    passing: (passing: any): TestMonad => Test({ ...x, passing }),
    failing: (failing: any): TestMonad => Test({ ...x, failing }),
    asserting: (f: AssertionFunction): void | Promise<any> =>
        x.async ? assertingAsync(f, x) : asserting(f, x) // todo: iterate passing, iterate failing, aggregate XOR of passing/failing
});

const TestOf = (x: any): TestMonad =>
    Truth.of([
        'fn' in x,
        'description' in x,
        'passing' in x,
        'failing' in x,
        'async' in x
    ]).forkAnd(
        () =>
            Test({
                fn: x,
                description: '<No description>',
                passing: [],
                failing: [],
                async: false
            }),
        () => Test(x)
    );

const exportTest = {
    of: TestOf
};

export { exportTest as Test };
