export type AsyncTestDone = <T>(x?: T) => void;
export type AssertionFunction = <T>(x?: T) => void;

export interface TestCase {
    fn: Function;
    description: string;
    passing: any[];
    failing: any[];
    async: boolean;
    done: AsyncTestDone;
    beforeEachFn: Function;
    afterEachFn: Function;
}

export interface Monad {
    map: Function;
    chain: Function;
    join: Function;
    emit: Function;
    inspect(): string;
    ap: Function;
}

export interface TestMonad extends Monad {
    describe(s: string): TestMonad;
    passing<T>(x: T[]): TestMonad;
    failing<T>(x: T[]): TestMonad;
    asserting(f: Function): any;
    expecting(f: Function): any;
    async(f?: Function): TestMonad;
    run(): any;
    beforeEach(f: Function): any;
    afterEach(f: Function): any;
}