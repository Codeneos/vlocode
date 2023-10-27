import { VlocodeCommand } from '../../constants';
import * as vscode from 'vscode';
import MetadataCommand from './metadataCommand';
import { vscodeCommand } from '../../lib/commandRouter';

@vscodeCommand(VlocodeCommand.openMetaXml)
@vscodeCommand(VlocodeCommand.openSourceFile)
export default class ToggleMetaXmlCommand extends MetadataCommand {
    public execute() {
        if (!this.currentOpenDocument) {
            return;
        }

        if (this.currentOpenDocument.path.endsWith('-meta.xml')) {
            this.openSourceFile(this.currentOpenDocument);
        } else {
            this.openMetaXml(this.currentOpenDocument);
        }
    }

    private openMetaXml(documentUri: vscode.Uri) {
        const metaFile = documentUri.with({
            path: documentUri.path + '-meta.xml'
        });
        vscode.window.showTextDocument(metaFile);
    }

    private openSourceFile(documentUri: vscode.Uri) {
        const sourceFile = documentUri.with({
            path: documentUri.path.slice(0, -'-meta.xml'.length)
        });
        vscode.window.showTextDocument(sourceFile);
    }
}