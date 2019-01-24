export interface TestCase {
    fn: Function;
    description: string;
    passing: any[];
    failing: any[];
    async: boolean | number;
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
    passing(x: any): TestMonad;
    failing(x: any): TestMonad;
    asserting(f: Function): void | Promise<any>;
    within(n: number): TestMonad;
}

export type MapFunction = (value: any, index: number, array: any[]) => any;
