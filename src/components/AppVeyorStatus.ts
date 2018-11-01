import to from 'await-to-js'
import { sync as commandExistsSync } from 'command-exists'
import * as moment from 'moment'
import { StatusBarAlignment, StatusBarItem, window, workspace } from 'vscode'

import shortenMomentOutput from '../helpers/shortenMomentOutput'
import getCwdGitPath from '../lib/getCwdGitPath'
import getAppVeyorBuildInfo from '../lib/getAppVeyorBuildInfo'

import { Status, StatusContent } from './AppVeyorStatus.d'

// Icons: https://octicons.github.com
const STATUS: Status = {
  ERROR: {
    name: 'Error',
    icon: 'alert',
    message: 'AppVeyor went wrong.',
    tooltip: `Sorry but something went wrong while fetching AppVeyor API.`,
  },
  FAILED: {
    name: 'Failed',
    icon: 'alert',
    message: 'AppVeyor',
    tooltip: `The last AppVeyor build failed.`,
  },
  NONE: {
    name: 'None',
    icon: 'circle-slash',
    message: 'AppVeyor',
    tooltip: `No AppVeyor build for this project yet.`,
  },
  PENDING: {
    name: 'Pending',
    icon: 'clock',
    message: 'AppVeyor',
    tooltip: `AppVeyor build in progress...`,
  },
  SUCCESSFUL: {
    name: 'Successful',
    icon: 'check',
    message: 'AppVeyor',
    tooltip: `The last AppVeyor build succeeded.`,
  },
  SYNCING: {
    name: 'Syncing',
    icon: 'sync',
    message: 'AppVeyor',
    tooltip: `Fetching the current AppVeyor build status...`,
  },
}

const LOOP_DELAY: number = 2_500

export default class AppVeyorStatus {
  private cwd: string = workspace.workspaceFolders[0].uri.fsPath
  private gitPath: string
  private lastMessage: string
  private lastStatus: string
  private statusBarItem: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left)

  constructor() {
    this.start()
  }

  private async start(): Promise<void> {
    const [err, gitPath] = await to<string>(getCwdGitPath())
    if (err !== null) {
      setTimeout(this.start.bind(this), LOOP_DELAY)

      return
    }

    this.gitPath = gitPath

    this.setStatusTo(STATUS.SYNCING)
    this.statusBarItem.show()
    await this.checkAppVeyorBuild()
  }

  private setStatusTo(status: StatusContent, id: number = 0, date: string = ''): void {
    let message: string = `$(${status.icon}) ${status.message}`
    if (id !== 0) message += ` #${id}`
    if (date !== '') message += ` (${shortenMomentOutput(moment(date).fromNow())})`

    if (message === this.lastMessage && status.name === this.lastStatus) return

    this.lastMessage = message
    this.lastStatus = status.name
    this.statusBarItem.text = message
    this.statusBarItem.tooltip = status.tooltip
  }

  private async checkAppVeyorBuild() {
    const [err, buildInfo] = await to(getAppVeyorBuildInfo(this.gitPath))
    if (err !== null) {
      this.setStatusTo(STATUS.ERROR)
      setTimeout(this.checkAppVeyorBuild.bind(this), LOOP_DELAY)

      return
    }

    // if (buildInfo.status === 'none') {
    //   this.setStatusTo(STATUS.NONE)
    //   setTimeout(this.checkAppVeyorBuild.bind(this), LOOP_DELAY)

    //   return
    // }

    if (['queued', 'running'].includes(buildInfo.status)) {
      this.setStatusTo(STATUS.PENDING, buildInfo.id, buildInfo.updatedAt)
      setTimeout(this.checkAppVeyorBuild.bind(this), LOOP_DELAY)

      return
    }

    if (buildInfo.status === 'success') {
      this.setStatusTo(STATUS.SUCCESSFUL, buildInfo.id, buildInfo.updatedAt)
      setTimeout(this.checkAppVeyorBuild.bind(this), LOOP_DELAY)

      return
    }

    this.setStatusTo(STATUS.FAILED, buildInfo.id, buildInfo.updatedAt)
    setTimeout(this.checkAppVeyorBuild.bind(this), LOOP_DELAY)
  }
}
