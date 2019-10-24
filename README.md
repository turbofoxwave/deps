# deps
Load dependency sorted array of package objects. Built to assist with publishing a monorepo containing multiple publishable modules were those modules may depend on another module defined in the monorepo. This is critical when attempting to lock in cross-dependencies with lock files. Unfortuantly a solution such as lerna does not work well with accurantly genating package lock files.

Todo: generate published module

Todo: update readme with usage info.
