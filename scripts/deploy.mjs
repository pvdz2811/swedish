// Builds the app for GitHub Pages and pushes dist/ to the gh-pages branch.
//
// GitHub Pages serves a project site from /<repo>/, so the base path has to be
// compiled in. That path is derived from the origin remote, which means there
// is nothing to configure by hand.
import { execFileSync } from 'node:child_process'
import { existsSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')

function run(cmd, args, options = {}) {
  return execFileSync(cmd, args, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: options.quiet ? 'pipe' : 'inherit',
    ...options,
  })
}

function capture(cmd, args, cwd = ROOT) {
  return execFileSync(cmd, args, { cwd, encoding: 'utf8', stdio: 'pipe' }).trim()
}

let remote
try {
  remote = capture('git', ['remote', 'get-url', 'origin'])
} catch {
  console.error(
    [
      'No "origin" remote found.',
      '',
      'Create an empty repository on GitHub, then run:',
      '  git remote add origin https://github.com/<you>/<repo>.git',
      '  git push -u origin main',
      '',
      'Then run npm run deploy again.',
    ].join('\n'),
  )
  process.exit(1)
}

// Handles both https://github.com/user/repo(.git) and git@github.com:user/repo(.git)
const match = remote.match(/[/:]([^/]+)\/([^/]+?)(?:\.git)?$/)
if (!match) {
  console.error(`Could not parse the origin remote: ${remote}`)
  process.exit(1)
}
const [, owner, repo] = match

// A repo named <owner>.github.io is a user site and is served from the root.
const isUserSite = repo.toLowerCase() === `${owner.toLowerCase()}.github.io`
const base = isUserSite ? '/' : `/${repo}/`

console.log(`Building for https://${owner}.github.io${base}`)

rmSync(DIST, { recursive: true, force: true })
run(process.execPath, [join(ROOT, 'scripts', 'make-icons.mjs')])
run(process.execPath, [join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js'), 'build'], {
  env: { ...process.env, APP_BASE: base },
})

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('Build produced no dist/index.html — aborting.')
  process.exit(1)
}

// Stops GitHub Pages running the output through Jekyll.
writeFileSync(join(DIST, '.nojekyll'), '')

// Publish dist/ as an orphan commit on gh-pages. A throwaway repo inside dist/
// keeps the deploy history out of the source repo entirely.
rmSync(join(DIST, '.git'), { recursive: true, force: true })
const git = (...args) => execFileSync('git', args, { cwd: DIST, stdio: 'inherit' })

git('init', '-q', '-b', 'gh-pages')
git('add', '-A')
git('-c', 'user.name=deploy', '-c', 'user.email=deploy@local', 'commit', '-q', '-m', 'Deploy')
git('push', '-q', '--force', remote, 'gh-pages:gh-pages')
rmSync(join(DIST, '.git'), { recursive: true, force: true })

console.log(
  [
    '',
    'Pushed to the gh-pages branch.',
    '',
    `One-time setup: on GitHub go to ${remote.replace(/\.git$/, '')}/settings/pages`,
    'and set Source = "Deploy from a branch", Branch = "gh-pages", folder = "/ (root)".',
    '',
    `Your app will be live at https://${owner}.github.io${base}`,
    '(the first deploy can take a couple of minutes to appear).',
  ].join('\n'),
)
