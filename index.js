const { shell } = require('execa')
const path = require('path')
const argv = require('minimist')(process.argv.slice(2))

const base = argv.base || 'origin/master'
const runInBand = argv.runInBand ? '--runInBand' : ''

let changedFiles, relatedTests

shell(`git branch|grep "^*"|awk '{print $2}'`)
.then(({ stdout, stderr }) => {
  if (stderr) throw new Error(stderr)
  const branch = stdout
  return shell(`git diff --name-only ${base}...${branch} | grep .js$`)
})
.then(({ stdout, stderr }) => {
  if (stderr) throw new Error(stderr)
  changedFiles = stdout.split('\n')
})
.then(() => shell(`jest --listTests --findRelatedTests ${changedFiles.join(' ')}`))
.then(({ stdout, stderr }) => {
  if (stderr) throw new Error(stderr)
  relatedTests = stdout.split('\n')
})
.then(() => {
  if (relatedTests.length < 1) {
    console.log('Found no tests related to changed files.')
    return
  }

  const collectCoverageFrom = changedFiles
  .map(from => `--collectCoverageFrom "${from}"`)
  .join(' ')

  const testFiles = relatedTests
  .map(testFile => path.relative(process.cwd(), testFile))
  .join(' ')

  const coverageCommand = `jest ${runInBand} --silent --coverage ${collectCoverageFrom} ${testFiles}`

  return shell(coverageCommand, { stdio: 'inherit' })
  .catch(() => {
    process.exitCode = 1
  })
})
