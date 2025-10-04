import * as vscode from 'vscode';
import { JavaVarTypeDecorator } from './JavaVarTypeDecorator';
import { JavaTypeResolver } from './JavaTypeResolver';

let decorator: JavaVarTypeDecorator | undefined;
let typeResolver: JavaTypeResolver | undefined;

export function activate(context: vscode.ExtensionContext) {
    console.log('Java Var Type Hints extension activated');

    decorator = new JavaVarTypeDecorator();
    typeResolver = new JavaTypeResolver();

    const reloadCommand = vscode.commands.registerCommand(
        'java-var-type-hints.reload',
        () => {
            updateDecorations(vscode.window.activeTextEditor);
            vscode.window.showInformationMessage('Java Var Type Hints reloaded!');
        }
    );

    const changeActiveEditor = vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor && editor.document.languageId === 'java') {
            updateDecorations(editor);
        }
    });

    const changeDocument = vscode.workspace.onDidChangeTextDocument(event => {
        const editor = vscode.window.activeTextEditor;
        if (editor && event.document === editor.document && editor.document.languageId === 'java') {
            setTimeout(() => updateDecorations(editor), 300);
        }
    });

    const changeConfig = vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('javaVarTypeHints')) {
            decorator?.updateConfiguration();
            updateDecorations(vscode.window.activeTextEditor);
        }
    });

    context.subscriptions.push(
        reloadCommand,
        changeActiveEditor,
        changeDocument,
        changeConfig
    );

    if (vscode.window.activeTextEditor?.document.languageId === 'java') {
        updateDecorations(vscode.window.activeTextEditor);
    }
}

async function updateDecorations(editor: vscode.TextEditor | undefined) {
    if (!editor || !decorator || !typeResolver) {
        return;
    }

    const config = vscode.workspace.getConfiguration('javaVarTypeHints');
    if (!config.get<boolean>('enabled', true)) {
        decorator.clear(editor);
        return;
    }

    const document = editor.document;
    if (document.languageId !== 'java') {
        return;
    }

    try {
        const varLocations = await findVarDeclarations(document);
        const typeHints: Array<{ range: vscode.Range; type: string }> = [];
        
        for (const location of varLocations) {
            const type = await typeResolver.resolveType(document, location);
            if (type) {
                typeHints.push({ range: location, type });
            }
        }

        decorator.decorate(editor, typeHints);
    } catch (error) {
        console.error('Error updating decorations:', error);
    }
}

async function findVarDeclarations(document: vscode.TextDocument): Promise<vscode.Range[]> {
    const locations: vscode.Range[] = [];
    const text = document.getText();
    
    const varRegex = /\bvar\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g;
    let match;
    
    while ((match = varRegex.exec(text)) !== null) {
        const varName = match[1];
        const varNameStart = match.index + match[0].indexOf(varName);
        const startPos = document.positionAt(varNameStart);
        const endPos = document.positionAt(varNameStart + varName.length);
        
        if (!isInCommentOrString(document, startPos)) {
            locations.push(new vscode.Range(startPos, endPos));
        }
    }
    
    return locations;
}

function isInCommentOrString(document: vscode.TextDocument, position: vscode.Position): boolean {
    const line = document.lineAt(position.line).text;
    const beforePosition = line.substring(0, position.character);
    
    if (beforePosition.includes('//')) {
        return true;
    }
    
    const doubleQuotes = (beforePosition.match(/"/g) || []).length;
    const singleQuotes = (beforePosition.match(/'/g) || []).length;
    
    return doubleQuotes % 2 !== 0 || singleQuotes % 2 !== 0;
}

export function deactivate() {
    decorator?.dispose();
}