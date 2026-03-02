export interface SendTarget {
  toolId: string;
  label: string;
  path: string;
  /** URL param name to pass the value to */
  param: string;
}

export interface SendChain {
  /** Output type from the source tool */
  outputType: 'text' | 'json' | 'url' | 'code' | 'hash';
  targets: SendTarget[];
}

export const SEND_CHAINS: SendChain[] = [
  {
    outputType: 'text',
    targets: [
      { toolId: 'diff-checker', label: 'Diff Checker', path: '/dev-utils/diff-checker', param: 'left' },
      { toolId: 'json-yaml-xml', label: 'JSON / YAML / XML', path: '/dev-utils/json-yaml-xml', param: 'paste' },
      { toolId: 'text-encoders', label: 'Text Encoders', path: '/dev-utils/encoders', param: 'paste' },
      { toolId: 'code-formatter', label: 'Code Formatter', path: '/dev-utils/code-formatter', param: 'paste' },
    ],
  },
  {
    outputType: 'json',
    targets: [
      { toolId: 'diff-checker', label: 'Diff Checker', path: '/dev-utils/diff-checker', param: 'left' },
      { toolId: 'json-yaml-xml', label: 'JSON / YAML / XML', path: '/dev-utils/json-yaml-xml', param: 'paste' },
    ],
  },
  {
    outputType: 'url',
    targets: [
      { toolId: 'api-tester', label: 'API Tester', path: '/dev-utils/api-tester', param: 'paste' },
    ],
  },
  {
    outputType: 'code',
    targets: [
      { toolId: 'diff-checker', label: 'Diff Checker', path: '/dev-utils/diff-checker', param: 'left' },
      { toolId: 'code-formatter', label: 'Code Formatter', path: '/dev-utils/code-formatter', param: 'paste' },
    ],
  },
  {
    outputType: 'hash',
    targets: [
      { toolId: 'diff-checker', label: 'Compare in Diff Checker', path: '/dev-utils/diff-checker', param: 'left' },
      { toolId: 'text-encoders', label: 'Text Encoders', path: '/dev-utils/encoders', param: 'paste' },
    ],
  },
];

export function getTargetsForType(outputType: SendChain['outputType']): SendTarget[] {
  return SEND_CHAINS.find((c) => c.outputType === outputType)?.targets ?? [];
}
