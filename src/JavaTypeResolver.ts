import * as vscode from 'vscode';

export class JavaTypeResolver {

    public async resolveType(
        document: vscode.TextDocument,
        varRange: vscode.Range
    ): Promise<string | null> {
        try {
            const position = varRange.end;

            const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
                'vscode.executeHoverProvider',
                document.uri,
                position
            );

            if (hovers && hovers.length > 0) {
                const type = this.extractTypeFromHover(hovers[0]);
                if (type) {
                    return type;
                }
            }

            return this.inferTypeFromInitialization(document, varRange);

        } catch (error) {
            console.error('Error resolving type:', error);
            return this.inferTypeFromInitialization(document, varRange);
        }
    }

    private extractTypeFromHover(hover: vscode.Hover): string | null {
        for (const content of hover.contents) {
            let text: string;

            if (typeof content === 'string') {
                text = content;
            } else if (content instanceof vscode.MarkdownString) {
                text = content.value;
            } else {
                continue;
            }

            const patterns = [
                /\(variable\)\s+([^\s]+(\s*<[^>]+>)?)\s+\w+/,
                /```java\s*([^\s]+(\s*<[^>]+>)?)\s+\w+/,
                /:\s*([^\s\n\[]+(\s*<[^>]+>)?)/
            ];


            for (const pattern of patterns) {
                const match = text.match(pattern);
                if (match) {
                    return this.cleanTypeName(match[1]);
                }
            }
        }

        return null;
    }

    private inferTypeFromInitialization(
        document: vscode.TextDocument,
        varRange: vscode.Range
    ): string | null {
        const lineText = document.lineAt(varRange.start.line).text;

        const equalsIndex = lineText.indexOf('=', varRange.end.character);
        if (equalsIndex === -1) {
            return null;
        }

        const initialization = lineText.substring(equalsIndex + 1).trim();

        if (initialization.startsWith('"')) {
            return 'String';
        }

        if (/^\d+L\b/.test(initialization)) {
            return 'long';
        }
        if (/^\d+\b/.test(initialization)) {
            return 'int';
        }
        if (/^\d+\.\d+[fF]\b/.test(initialization)) {
            return 'float';
        }
        if (/^\d+\.\d+[dD]?\b/.test(initialization)) {
            return 'double';
        }

        if (initialization.startsWith('true') || initialization.startsWith('false')) {
            return 'boolean';
        }

        if (/^'.'/.test(initialization)) {
            return 'char';
        }

        const newMatch = initialization.match(/new\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
        if (newMatch) {
            return this.cleanTypeName(newMatch[1]);
        }

        if (initialization.includes('[]') || initialization.startsWith('{')) {
            return 'array';
        }

        const staticCallMatch = initialization.match(/([A-Z][a-zA-Z0-9_]*)\.\w+\(/);
        if (staticCallMatch) {
            return staticCallMatch[1];
        }

        return null;
    }

    private cleanTypeName(typeName: string): string {
        const simpleName = typeName.split('.').pop() || typeName;
        return simpleName.replace(/[`*_]/g, '').trim();

    }
}