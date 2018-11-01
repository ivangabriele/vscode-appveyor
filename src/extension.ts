import * as vscode from 'vscode'

import AppVeyorStatus from './components/AppVeyorStatus'

export function activate(context: vscode.ExtensionContext) {
  new AppVeyorStatus()
}

export function deactivate() {}
