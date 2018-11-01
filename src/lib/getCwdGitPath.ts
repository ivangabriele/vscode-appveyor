import to from 'await-to-js'
import { sync as commandExistsSync } from 'command-exists'

import exec from '../helpers/exec'

const SUPPORTED_REMOTES = "git@github\\.com:|https:\\/\\/github\\.com\\/"
const SUPPORTED_REMOTES_REGEX = new RegExp(SUPPORTED_REMOTES)
const GIT_PATH_REGEX = new RegExp(`(${SUPPORTED_REMOTES})([a-zA-Z0-9\\-]+\\/[a-zA-Z0-9\\-]+)`)

export default async function(): Promise<string> {
  if (!commandExistsSync('git')) throw new Error(`lib/getCwdGitPath(): The command "git" is not available.`)

  const [err, out] = await to<string>(exec('git', ['remote', '-v']))
  if (err !== null) throw new Error(`lib/getCwdGitPath(): The command "git remote -v" failed.`)
  if (out === '') throw new Error(`lib/getCwdGitPath(): There is no Git remote repo available.`)

  const remotes = out.trim().split(/\n/)
  if (remotes.length === 0) throw new Error(`lib/getCwdGitPath(): There is no Git remote repo available.`)

  const supportedRemotes = remotes.filter(line => SUPPORTED_REMOTES_REGEX.test(line))

  if (supportedRemotes.length === 0) throw new Error(`lib/getCwdGitPath(): No supported Git remote repo available.`)

  const found = supportedRemotes[0].match(GIT_PATH_REGEX)
  if (found.length !== 3) throw new Error(`lib/getCwdGitPath(): Something went wrong while extracting the Git path.`)

  return found[2]
}
