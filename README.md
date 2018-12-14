NEW: this is not needed anymore in new versions of Jest; just use [`--changedSince`](https://jestjs.io/docs/en/cli#changedsince)

----

Run Jest with coverage reports on only the files that were changed in the
current branch.

Basically the script from [this blog post][1] (thanks, Stian Didriksen!) with minor changes.

### Suggested usage

Clone it into a folder near your project folders, e.g.:

```
~/Code
❯ tree -L 1
.
├── HyloReactNative
├── hylo-evo
└── jest-diff-coverage
```

Install dependencies with  `npm install`.

Run it from within a project folder:

```
cd HyloReactNative
node ../jest-diff-coverage
open coverage/lcov-report/index.html
```

#### Options

- `--runInBand`: Passes through to Jest.
- `--base`: Specify base to compare against; defaults to `origin/master`.

[1]: https://medium.com/@stipsan/best-kept-jest-secret-testing-only-changed-files-with-coverage-reports-3affc8b4d30f
