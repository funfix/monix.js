# Monix.js

[![Greenkeeper badge](https://badges.greenkeeper.io/funfix/monix.js.svg)](https://greenkeeper.io/)

Monix.js is a reactive streams library for JavaScript, [TypeScript](https://www.typescriptlang.org/) and [Flow](https://flow.org/).

Inspired by [Scala](http://www.scala-lang.org/) and [Monix](https://monix.io/).

## Usage

The code is organized in sub-projects, for à la carte dependencies,
but all types, classes and functions are exported by `monix`, so to
import everything:

```
npm install --save monix
```

Or you can depend on individual sub-projects, see below.

### Modules: UMD and ES 2015

The library has been compiled using
[UMD (Universal Module Definition)](https://github.com/umdjs/umd),
so it should work with [CommonJS](http://requirejs.org/docs/commonjs.html)
and [AMD](http://requirejs.org/docs/whyamd.html), for standalone usage
in browsers or Node.js.

But it also provides a `module` definition in `package.json`, thus
providing compatibility with
[ECMAScript 2015 modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import),
for usage when used with a modern JS engine, or when bundling with a
tool chain that understands ES2015 modules,
like [Rollup](https://rollupjs.org/)
or [Webpack](https://webpack.js.org/).

## Sub-projects

Monix.js has been split in multiple sub-projects for à la carte
dependency management.  As mentioned above, you can depend on
everything by depending on the `monix` project. 

## TypeScript or Flow?

Monix.js supports both [TypeScript](https://www.typescriptlang.org/)
and [Flow](https://flow.org/) type annotations out of the box.

It also makes the best use of the capabilities of each. For example
TypeScript has bivariant generics, but Flow supports variance
annotations and Monix.js makes use of them. Development happens in
TypeScript, due to better tooling, but both are first class citizens.

## Contributing

The Monix.js project welcomes contributions from anybody wishing to
participate.  All code or documentation that is provided must be
licensed with the same license that Monix.js is licensed with (Apache
2.0).

Feel free to open an issue if you notice a bug, have an idea for a
feature, or have a question about the code. Pull requests are also
gladly accepted. For more information, check out the
[contributor guide](CONTRIBUTING.md).

## License

All code in this repository is licensed under the Apache License,
Version 2.0.  See [LICENCE](./LICENSE).

