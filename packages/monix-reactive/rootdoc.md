# monix-reactive

Sub-project of **[Monix.js](https://github.com/funfix/monix.js)**, contains {@link Observable} and
 operators implementation

## Contents

Create observables:

|                   |                                                                                        |
|-------------------|--------------------------------------------------------------------------------------- |
| {@link empty} | Creates an observable that doesn't emit anything, but immediately calls onComplete instead. |
| {@link pure}  | Returns an Observable that on execution emits the given strict value. |


## Usage

You can depend on the whole `monix` library, by adding it to
`package.json`:

```bash
npm install --save monix
```

In this case imports are like:

```typescript
import { Observable } from "monix"
```

Or for finer grained dependency management, the project can depend
only on `monix-reactive`:

```bash
npm install --save monix-reactive
```

In this case imports are like:

```typescript
import { Observable } from "monix-reactive"
```

Or wildcard import:

```typescript
import * as Mx from "monix"
```

Usage sample:

```typescript
import * as Mx from "monix"

const stream = Mx.empty()
```

### Modules: UMD and ES 2015

The library has been compiled using
[UMD (Universal Module Definition)](https://github.com/umdjs/umd),
so it should work with [CommonJS](http://requirejs.org/docs/commonjs.html)
and [AMD](http://requirejs.org/docs/whyamd.html).

But it also provides a `module` definition in `package.json`, thus
providing compatibility with
[ECMAScript 2015 modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import), for usage when used with a modern JS engine,
or when bundling with a tool chain that understands ES2015 modules,
like [Rollup](https://rollupjs.org/) or [Webpack](https://webpack.js.org/).
