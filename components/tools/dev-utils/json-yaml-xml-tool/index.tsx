'use client';

import { useSearchParams } from 'next/navigation';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useJsonYamlXml } from '@/hooks/use-json-yaml-xml';
import { useToolParams } from '@/hooks/use-tool-params';

import { FormatTab } from './format-tab';
import { SchemaTab } from './schema-tab';
import { TypesTab } from './types-tab';

type JsonYamlXmlTab = 'format' | 'schema' | 'types';

export function JsonYamlXmlTool() {
  const [params, setParams] = useToolParams({ tab: 'format' });
  const searchParams = useSearchParams();
  const initialInput = (() => {
    const paste = searchParams.get('paste');
    return paste ? decodeURIComponent(paste) : '';
  })();

  const {
    csvDelimiter,
    csvHeaders,
    error,
    format,
    handleConvert,
    handleFormat,
    handleGenerateSchema,
    handleGenerateTypes,
    handleValidateSchema,
    input,
    isCsvMode,
    isJsonFormat,
    jsonPath,
    output,
    parsedJson,
    pathResults,
    schema,
    setCsvDelimiter,
    setCsvHeaders,
    setInput,
    setJsonPath,
    setSchema,
    setTargetFormat,
    setTopTab,
    setTsKind,
    setTsOptional,
    setViewMode,
    targetFormat,
    tsError,
    tsKind,
    tsOptional,
    tsOutput,
    validating,
    validationResult,
    viewMode,
  } = useJsonYamlXml(initialInput);

  const activeTab = params.tab as JsonYamlXmlTab;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <ToggleGroup
          type="single"
          value={activeTab}
          onValueChange={(value) => {
            if (!value) return;
            setTopTab(value as JsonYamlXmlTab);
            setParams({ tab: value });
          }}
        >
          <ToggleGroupItem value="format">Format &amp; Convert</ToggleGroupItem>
          <ToggleGroupItem value="schema">Schema</ToggleGroupItem>
          <ToggleGroupItem value="types">Types</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {activeTab === 'format' && (
        <FormatTab
          state={{
            csvDelimiter,
            csvHeaders,
            error,
            format,
            input,
            isCsvMode,
            isJsonFormat,
            jsonPath,
            output,
            parsedJson,
            pathResults,
            targetFormat,
            viewMode,
          }}
          actions={{
            onConvert: handleConvert,
            onCsvDelimiterChange: setCsvDelimiter,
            onCsvHeadersChange: setCsvHeaders,
            onFormat: handleFormat,
            onInputChange: setInput,
            onJsonPathChange: setJsonPath,
            onTargetFormatChange: setTargetFormat,
            onViewModeChange: setViewMode,
          }}
        />
      )}

      {activeTab === 'schema' && (
        <SchemaTab
          input={input}
          schema={schema}
          validating={validating}
          validationResult={validationResult}
          onGenerateSchema={handleGenerateSchema}
          onInputChange={setInput}
          onSchemaChange={setSchema}
          onValidateSchema={handleValidateSchema}
        />
      )}

      {activeTab === 'types' && (
        <TypesTab
          input={input}
          tsError={tsError}
          tsKind={tsKind}
          tsOptional={tsOptional}
          tsOutput={tsOutput}
          onGenerateTypes={handleGenerateTypes}
          onInputChange={setInput}
          onTsKindChange={setTsKind}
          onTsOptionalChange={setTsOptional}
        />
      )}
    </div>
  );
}
