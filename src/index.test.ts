import { Test } from './index';
import { strict as assert } from 'assert';

// @todo: import known-good version of falsifire, to verify its own falsifications *galaxybrain.gif*
// @todo: Monad compliance tests

const add = (x: number, y: number): number => x + y;
const concat = (x: number[], y: number[]): number[] => x.concat(y);
const objMerge = (x: {}, y: {}): {} => Object.assign({}, x, y);

const addLater = (x: number, y: number): Promise<number> =>
    new Promise(resolve => {
        setTimeout(() => {
            resolve(x + y);
        }, 20);
    });

describe('A syncronous test', () => {
    it('should be able to check for falisification and pass when it works', () => {
        Test.of(add)
            .describe('a test')
            .passing([[3, 4], [4, 3], [2, 5], [1, 6], [7, 0]])
            .failing([[1, 4], [2, 2], [2, 3], [0, 0], [-2, 8]])
            .asserting((val: number) => assert.deepEqual(val, 7));

        Test.of(concat)
            .describe('an array test')
            .passing([[[1, 2], [2, 3]], [[1], [2, 2, 3]], [[1, 2, 2], [3]]])
            .failing([[[3, 2], [2, 1]], [[2], [1, 2, 3]], [[2, 2, 3], [1]]])
            .asserting((val: number[]) => assert.deepEqual(val, [1, 2, 2, 3]));

        Test.of(objMerge)
            .describe('an object merge test')
            .passing([
                [{ test: true }, { passing: true }],
                [{ passing: true }, { test: true }],
                [{}, { passing: true, test: true }]
            ])
            .failing([
                [{}, { testing: true }],
                [{ test: true }, {}],
                [{ passing: true }, { test: true, extra: true }]
            ])
            .asserting((val: {}) =>
                assert.deepEqual(val, { test: true, passing: true })
            );
    });

    it('should be able to check for falisification and fail when it finds non-falsifiable results', () => {
        assert.throws(
            () =>
                Test.of(add)
                    .describe('another test')
                    .passing([[3, 4], [4, 3], [2, 5], [1, 6], [7, 0]])
                    .failing([[1, 4], [2, 2], [2, 5], [0, 0], [-2, 8]])
                    .asserting((val: number) => assert.deepEqual(val, 7)),
            (err: Error | null) => (err instanceof Error ? false : true),
            `Falsifire should have thrown an error and did not`
        );

        assert.throws(
            () =>
                Test.of(concat)
                    .describe('an array test')
                    .passing([
                        [[1, 2], [2, 3]],
                        [[1], [2, 2, 3]],
                        [[1, 2, 2], [3]]
                    ])
                    .failing([
                        [[3, 2], [2, 1]],
                        [[1], [2, 2, 3]],
                        [[2, 2, 3], [1]]
                    ])
                    .asserting((val: number) =>
                        assert.deepEqual(val, [1, 2, 2, 3])
                    ),
            (err: Error | null) => (err instanceof Error ? false : true),
            `Falsifire should have thrown an error and did not`
        );

        assert.throws(
            () =>
                Test.of(objMerge)
                    .describe('an object merge test')
                    .passing([
                        [{ test: true }, { passing: true }],
                        [{ passing: true }, { test: true }],
                        [{}, { passing: true, test: true }]
                    ])
                    .failing([
                        [{}, { testing: true }],
                        [{ test: true }, {}],
                        [{ passing: true }, { test: true, extra: true }],
                        [{}, { passing: true, test: true }]
                    ])
                    .asserting((val: {}) =>
                        assert.deepEqual(val, { test: true, passing: true })
                    ),
            (err: Error | null) => (err instanceof Error ? false : true),
            `Falsifire should have thrown an error and did not`
        );
    });
});

describe('An asyncronous test', () => {
    it('should be able to check for falisification and pass when it works', async done =>
        await Test.of(addLater)
            .describe('an async test')
            .passing([[3, 4], [4, 3], [2, 5], [1, 6], [7, 0]])
            .failing([[1, 4], [2, 2], [3, 5], [0, 0], [-2, 8]])
            .async(done)
            .asserting(<T>(val: T) => assert.deepEqual(val, 7)));

    it('should be able to check for falisification and fail when it finds non-falsifiable results', async done =>
        await assert
            .rejects(
                async () =>
                    Test.of(addLater)
                        .describe('an async test')
                        .passing([[3, 4], [4, 3], [2, 5], [1, 6], [7, 0]])
                        .failing([[1, 4], [2, 2], [2, 5], [0, 0], [-2, 8]])
                        .async(() => { })
                        .asserting(<T>(val: T) => assert.deepEqual(val, 7)),
                (err: Error | null) => (err instanceof Error ? false : true),
                `Falsifire should have thrown an error and did not`
            )
            .then(done)
            .catch(done));
});

describe('A syncronous test in jest', () => {
    it('should be able to check for falisification and pass when it works', () => {
        Test.of(add)
            .describe('a test')
            .passing([[3, 4], [4, 3], [2, 5], [1, 6], [7, 0]])
            .failing([[1, 4], [2, 2], [2, 3], [0, 0], [-2, 8]])
            .expecting((val: number) => expect(val).toEqual(7));

        Test.of(concat)
            .describe('an array test')
            .passing([[[1, 2], [2, 3]], [[1], [2, 2, 3]], [[1, 2, 2], [3]]])
            .failing([[[3, 2], [2, 1]], [[2], [1, 2, 3]], [[2, 2, 3], [1]]])
            .expecting((val: number[]) => expect(val).toEqual([1, 2, 2, 3]));

        Test.of(objMerge)
            .describe('an object merge test')
            .passing([
                [{ test: true }, { passing: true }],
                [{ passing: true }, { test: true }],
                [{}, { passing: true, test: true }]
            ])
            .failing([
                [{}, { testing: true }],
                [{ test: true }, {}],
                [{ passing: true }, { test: true, extra: true }]
            ])
            .expecting((val: {}) =>
                expect(val).toEqual({ test: true, passing: true })
            );
    });

    it('should be able to check for falisification and fail when it finds non-falsifiable results', () => {
        const errMessage = `Falsifire should have thrown an error and did not`;
        try {
            Test.of(add)
                .describe('another test')
                .passing([[3, 4], [4, 3], [2, 5], [1, 6], [7, 0]])
                .failing([[1, 4], [2, 2], [2, 5], [0, 0], [-2, 8]])
                .expecting((val: number) => expect(val).toEqual(7));
            throw new Error(errMessage);
        } catch (err) {
            // we want to catch this!
            if (err.message === errMessage) throw new Error(err);
        }

        try {
            Test.of(concat)
                .describe('an array test')
                .passing([[[1, 2], [2, 3]], [[1], [2, 2, 3]], [[1, 2, 2], [3]]])
                .failing([[[3, 2], [2, 1]], [[1], [2, 2, 3]], [[2, 2, 3], [1]]])
                .expecting((val: number[]) =>
                    expect(val).toEqual([1, 2, 2, 3])
                );
            throw new Error(errMessage);
        } catch (err) {
            if (err.message === errMessage) throw new Error(err);
        }

        try {
            Test.of(objMerge)
                .describe('an object merge test')
                .passing([
                    [{ test: true }, { passing: true }],
                    [{ passing: true }, { test: true }],
                    [{}, { passing: true, test: true }]
                ])
                .failing([
                    [{}, { testing: true }],
                    [{ test: true }, {}],
                    [{ passing: true }, { test: true, extra: true }],
                    [{}, { passing: true, test: true }]
                ])
                .expecting((val: {}) =>
                    expect(val).toEqual({ test: true, passing: true })
                );
            throw new Error(errMessage);
        } catch (err) {
            if (err.message === errMessage) throw new Error(err);
        }
    });
});

describe('An asyncronous test in jest', () => {
    it('should be able to check for falisification and pass when it works', async done =>
        await Test.of(addLater)
            .describe('an async test')
            .passing([[3, 4], [4, 3], [2, 5], [1, 6], [7, 0]])
            .failing([[1, 4], [2, 2], [3, 5], [0, 0], [-2, 8]])
            .async(done)
            .expecting(<T>(val: T) => expect(val).toEqual(7)));

    it('should be able to check for falisification and fail when it finds non-falsifiable results', async done => {

        const expectedFailure = "Error: [🔥Falsifire🔥] Value [2,5] in failing set passed given assertion. Assertion not sufficiently falsifiable.";

        await new Promise((resolve, reject) => {
            Test.of(addLater)
                .describe('an async test')
                .passing([[3, 4], [4, 3], [2, 5], [1, 6], [7, 0]])
                .failing([[1, 4], [2, 2], [2, 5], [0, 0], [-2, 8]])
                .async(<T>(err: T | string) =>

                    // need fuzzy equals due to unicode?
                    err && err != expectedFailure
                        ? done.fail(
                            `Falsifire should have thrown only one specific error. Instead, found: ${err}`
                        )
                        : done()
                )
                .expecting(<T>(val: T) => expect(val).toEqual(7));
        });
    });
});
