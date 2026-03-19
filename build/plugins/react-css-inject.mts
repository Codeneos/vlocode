import type { Plugin } from 'rolldown';

const INLINE_STYLE_RE = /(\/\/#region [^\n]+\.(?:css|less|sass|scss|styl|stylus)\?inline\nvar\s+([A-Za-z_$][\w$]*)\s*=\s*[\s\S]*?;\n)(\n\/\/#endregion)/g;

function injectAfterImports(code: string, helper: string): string {
    const lines = code.split('\n');
    let insertionIndex = 0;

    while (insertionIndex < lines.length && lines[insertionIndex].trimStart().startsWith('import ')) {
        insertionIndex += 1;
    }

    lines.splice(insertionIndex, 0, helper);
    return lines.join('\n');
}

export default function reactCssInjectPlugin(): Plugin {
    return {
        name: 'vlocode:webview-css-inject',
        renderChunk(code) {
            const styleVariables: string[] = [];
            const rewritten = code.replace(INLINE_STYLE_RE, (_match, block: string, variableName: string, suffix: string) => {
                styleVariables.push(variableName);
                return `${block}\n__vlocodeInjectStyle(${variableName});${suffix}`;
            });

            if (styleVariables.length === 0) {
                return null;
            }

            const helperBlock = [
                'const __vlocodeInjectedStyles = new Set();',
                'function __vlocodeInjectStyle(css) {',
                '    if (typeof document === "undefined" || !css || __vlocodeInjectedStyles.has(css)) {',
                '        return;',
                '    }',
                '    const style = document.createElement("style");',
                '    style.textContent = css;',
                '    style.setAttribute("data-vlocode-webview-style", "");',
                '    document.head.appendChild(style);',
                '    __vlocodeInjectedStyles.add(css);',
                '}',
                ''
            ].join('\n');

            return injectAfterImports(rewritten, helperBlock);
        }
    };
}