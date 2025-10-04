import * as vscode from 'vscode';

export class JavaVarTypeDecorator {
    private decorationType: vscode.TextEditorDecorationType;

    constructor() {
        this.decorationType = this.createDecorationType();
    }

    private createDecorationType(): vscode.TextEditorDecorationType {
        const config = vscode.workspace.getConfiguration('javaVarTypeHints');
        const color = config.get<string>('color', '#888888');
        const fontSize = config.get<string>('fontSize', 'inherit');

        return vscode.window.createTextEditorDecorationType({
            after: {
                color: color,
                fontStyle: 'italic',
                fontWeight: 'normal',
                margin: '0 0 0 0.5em',
                textDecoration: `none; font-size: ${fontSize};`
            },
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
        });
    }

    public updateConfiguration(): void {
        this.decorationType.dispose();
        this.decorationType = this.createDecorationType();
    }

    public decorate(
        editor: vscode.TextEditor,
        typeHints: Array<{ range: vscode.Range; type: string }>
    ): void {
        const config = vscode.workspace.getConfiguration('javaVarTypeHints');
        const prefix = config.get<string>('prefix', ': ');
        const showOnHover = config.get<boolean>('showOnHover', true);

        const decorations: vscode.DecorationOptions[] = typeHints.map(hint => {
            const position = hint.range.end;
            const range = new vscode.Range(position, position);
            
            const decoration: vscode.DecorationOptions = {
                range: range,
                renderOptions: {
                    after: {
                        contentText: `${prefix}${hint.type}`,
                        fontStyle: 'italic'
                    }
                }
            };

            if (showOnHover) {
                decoration.hoverMessage = new vscode.MarkdownString(
                    `**Inferred Type:** \`${hint.type}\`\n\n` +
                    `Type automatically inferred by the Java compiler.\n\n` +
                    `---\n\n` +
                    `💡 *Tip: You can customize the appearance in settings*`
                );
            }

            return decoration;
        });

        editor.setDecorations(this.decorationType, decorations);
    }

    public clear(editor: vscode.TextEditor): void {
        editor.setDecorations(this.decorationType, []);
    }

    public dispose(): void {
        this.decorationType.dispose();
    }
}