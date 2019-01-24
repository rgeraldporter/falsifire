import { Test } from './index';
import { strict as assert } from 'assert';

describe('A syncronous test', () => {
    it('should be able to check for falisification and pass when it works', () => {
        const add = (x: number, y: number): number => x + y;

        Test.of(add)
            .describe('a test')
            .passing([[3, 4], [4, 3], [2, 5], [1, 6], [7, 0]])
            .failing([[1, 4], [2, 2], [2, 3], [0, 0], [-2, 8]])
            .asserting((val: number) => assert.deepEqual(val, 7));

        const concat = (x: number[], y: number[]): number[] => x.concat(y);

        Test.of(concat)
            .describe('an array test')
            .passing([[[1, 2], [2, 3]], [[1], [2, 2, 3]], [[1, 2, 2], [3]]])
            .failing([[[3, 2], [2, 1]], [[2], [1, 2, 3]], [[2, 2, 3], [1]]])
            .asserting((val: number[]) => assert.deepEqual(val, [1, 2, 2, 3]));

        const objMerge = (x: {}, y: {}): {} => Object.assign({}, x, y);

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

        const objMerge = (x: {}, y: {}): {} => Object.assign({}, x, y);

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

xdescribe('An asyncronous test', () => {
    it('should be able to check for falisification and pass when it works', done => {
        function addLater(x: number, y: number): Promise<number> {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(x + y);
                }, 20);
            });
        }

        Test.of(addLater)
            .describe('an async test')
            .passing([[3, 4], [4, 3], [2, 5], [1, 6], [7, 0]])
            .failing([[1, 4], [2, 2], [2, 5], [0, 0], [-2, 8]])
            .within(500)
            .asserting((val: any) => assert.deepEqual(val, 7));

        setTimeout(() => {
            done();
        }, 500);
    });
});
