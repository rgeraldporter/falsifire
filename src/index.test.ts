import { Test } from './index';
import { strict as assert } from 'assert';

// @todo: import known-good version of falsifire, to verify its own falsifications *galaxybrain.gif*

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
        const add = (x: number, y: number): number => x + y;

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

        const concat = (x: number[], y: number[]): number[] => x.concat(y);

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
                        .async(() => {})
                        .asserting(<T>(val: T) => assert.deepEqual(val, 7)),
                (err: Error | null) => (err instanceof Error ? false : true),
                `Falsifire should have thrown an error and did not`
            )
            .then(done)
            .catch(done));
});

// @todo Test.of(blah).(....).expecting(jest-based test!)
