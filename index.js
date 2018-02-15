const { shell } = require('execa')
const path = require('path')
const process = require('process')

module.exports.run = () => {
const compareTo = process.argv[2];
shell(`git diff --name-only ${compareTo || 'origin/master'} | grep .js$`)
.then(({ stdout, stderr }) => {
  if (stderr) throw new Error(stderr)
  return stdout.replace(/\n/g, ' ')
})
.then(changedFiles =>
  shell(`jest --listTests --json --findRelatedTests ${changedFiles}`)
  .then(({ stdout, stderr }) => {
    if (stderr) throw new Error(stderr)
    return {
      changedFiles: changedFiles.split(' '),
      relatedTests: JSON.parse(stdout)
    }
  })
)
.then(ctx => {
  if (ctx.relatedTests.length < 1) {
    // wow, nothing to test!
    return
  }

  const collectCoverageFrom = ctx.changedFiles
  .map(from => `--collectCoverageFrom "${from}"`)
  .join(' ')

  const testFiles = ctx.relatedTests
  .map(testFile => path.relative(process.cwd(), testFile))
  .join(' ')

  const coverageCommand = `jest --coverage ${collectCoverageFrom} ${testFiles}`

  return shell(coverageCommand, { stdio: 'inherit' })
  .catch(() => {
    process.exitCode = 1
  })
})
};
