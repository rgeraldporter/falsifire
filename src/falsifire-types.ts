export type AsyncTestDone = <T>(x?: T) => void;
export type AssertionFunction = <T>(x?: T) => void;

export interface TestCase {
    fn: Function;
    description: string;
    passing: any[];
    failing: any[];
    async: boolean;
    done: AsyncTestDone;
}

export interface Monad {
    map: Function;
    chain: Function;
    join: Function;
    inspect(): string;
    ap: Function;
}

export interface TestMonad extends Monad {
    describe(s: string): TestMonad;
    passing<T>(x: T[]): TestMonad;
    failing<T>(x: T[]): TestMonad;
    asserting(f: Function): void | Promise<void>;
    async(f: Function): TestMonad;
}