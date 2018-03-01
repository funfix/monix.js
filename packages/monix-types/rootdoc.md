# monix-types

Sub-project of **[Monix.js](https://github.com/funfix/monix.js)**, contains core types for building reactive streams components.

## Contents

Stream element consumption result:

|                   |                                                                                        |
|-------------------|--------------------------------------------------------------------------------------- |
| {@link Ack}    | Type to be returned by consumers from `onNext` method |
| {@link Continue}    | Continue consuming stream values |
| {@link Stop}    | Stop consuming stream values |

Observer interface:

|                   |                                                                                        |
|-------------------|--------------------------------------------------------------------------------------- |
| {@link Observer}    | Interface to be implemened by value observers |


## Usage

You can depend on the whole `monix` library, by adding it to
`package.json`:

```bash
npm install --save monix
```

In this case imports are like:

```typescript
import { Ack, Observer } from "monix"
```

Or for finer grained dependency management, the project can depend
only on `monix-types`:

```bash
npm install --save monix-types
```

In this case imports are like:

```typescript
import { Ack, Observer } from "monix-types"
```

Usage sample:

```typescript
import { Throwable } from "funfix" 
import { Ack, Observer, Continue } from "monix"

const myObserver: Observer<string> = {
  onNext: (value: string) => {
    // do something useful with value
    return Continue
  },
  onComplete: () => {
    // handle stream completion
  },
  onError: (e: Throwable) => {
    // handle error
  }
}

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
