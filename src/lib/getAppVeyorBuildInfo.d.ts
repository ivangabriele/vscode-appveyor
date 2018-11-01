export interface AppVeyorApiProject {
  project: {
    projectId: number
    accountId: number
    accountName: string
    builds: string[]
    name: string
    slug: string
    repositoryType: string
    repositoryScm: string
    repositoryName: string
    repositoryBranch: string
    isPrivate: boolean
    skipBranchesWithoutAppveyorYml: boolean
    nuGetFeed: {
      id: string
      name: string
      publishingEnabled: boolean
      created: string
    }
    securityDescriptor: {}
    created: string
    updated: string
  }
  build: {
    buildId: number
    jobs: AppVeyorApiProjectJob[]
    buildNumber: number
    version: string
    message: string
    branch: string
    commitId: string
    authorName: string
    authorUsername: string
    committerName: string
    committerUsername: string
    committed: string
    messages: string[]
    status: 'failed' | 'queued' | 'running' | 'success'
    started: string
    finished: string
    created: string
    updated: string
  }
}

interface AppVeyorApiProjectJob {
  jobId: string
  name: string
  allowFailure: boolean
  messagesCount: number
  compilationMessagesCount: number
  compilationErrorsCount: number
  compilationWarningsCount: number
  testsCount: number
  passedTestsCount: number
  failedTestsCount: number
  artifactsCount: number
  status: string
  started: string
  finished: string
  created: string
  updated: string
}
