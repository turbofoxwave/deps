# deps
Load dependency sorted array of package objects. Built to assist with publishing a monorepo containing multiple publishable modules were those modules may depend on another module defined in the monorepo. This is critical when attempting to lock in cross-dependencies with lock files. Unfortuantly a solution such as lerna does not work well with accurantly genating package lock files.

## install
```
npm install monodeps
```

### usage

``` javascript
const monodeps = require('monodeps')

/*
where folder example contains 3 packages: a,b,c.
c depends on b and a, b depends on a, a has no cross dependency.
*/
try{
  let packages = await deps.loadPackagesAsync("/example")

  console.log( packages[0].package.name ) // -> 'a'
  console.log( packages[1].package.name ) // -> 'b'
  console.log( packages[2].package.name ) // -> 'c'

  console.log( packages[0].path ) // -> /example/a
  console.log( packages[1].path ) // -> /example/b
  console.log( packages[2].path ) // -> /example/c

} catch(err){
  console.error(err) // -> "Error: circular dependency
}

```