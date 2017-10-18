const { shell } = require('execa')
const path = require('path')

shell(`git branch|grep "^*"|awk '{print $2}'`)
.then(({ stdout, stderr }) => {
  if (stderr) throw new Error(stderr)
  const branch = stdout
  console.log(branch)
  return shell(`git diff --name-only origin/master...${branch} | grep .js$`)
})
.then(({ stdout, stderr }) => {
  if (stderr) throw new Error(stderr)
  return stdout.replace(/\n/g, ' ')
})
.then(changedFiles =>
  shell(`jest --listTests --findRelatedTests ${changedFiles}`)
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
