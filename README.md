# 🔥Falsifire🔥

### Falsifiable unit tests in Javascript

### NOTE: This is in early stages. Don't use this yet!

### Premise

Ever wanted to ensure your unit tests can actually fail?

This is an experiment in development to see if it's possible. The test methodology will involve specifying along both "passing" and "failing" values, and the test suite will then use both sets and expect that all the passing ones pass the test, and that all the failing ones fail. Without both occurring, the test overall fails.

This could improve upon traditional TDD methods of "fail first", as there is always the possibility later for the test framework or other critical component of the test to mutate and quietly become unfalsifiable. In traditional TDD, the test is only checked for falsifiability when it is first written, and may never see the conditions of a failing state again. Think of this as a regular fire drill for your tests.

## Development

Source is written in TypeScript. Run tests via `npm run test`.

## MIT License

Copyright 2019 Robert Gerald Porter <mailto:rob@weeverapps.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.