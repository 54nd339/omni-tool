'use client';

import { useAspectRatioContext } from './AspectRatioContext';
import { ControlPanel, Select, Input, RangeSlider, Checkbox, ColorPicker } from '@/app/components/shared';
import { calculateDataUrlSize } from '@/app/lib/utils';
import type { BackgroundMode } from '@/app/lib/types';
import {
  ASPECT_RATIO_PRESETS,
  BACKGROUND_FILL_OPTIONS,
  OUTPUT_FORMAT_OPTIONS,
  CANVAS_CONSTRAINTS,
} from '@/app/lib/constants';

export function AspectRatioControls() {
  const {
    state,
    setRatioId,
    setCustomRatio,
    setLongEdge,
    setBackgroundMode,
    setCustomColor,
    setCustomOpacity,
    setAllowUpscale,
    setOutputFormat,
  } = useAspectRatioContext();

  return (
    <ControlPanel title="Aspect & Canvas">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Aspect Ratio"
            value={state.ratioId}
            onChange={(e) => setRatioId(e.target.value)}
            className="text-sm"
          >
            {ASPECT_RATIO_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label} {preset.hint ? `(${preset.hint})` : ''}
              </option>
            ))}
          </Select>

          <Select
            label="Padding fill"
            value={state.backgroundMode}
            onChange={(e) => setBackgroundMode(e.target.value as BackgroundMode)}
            className="text-sm"
          >
            {BACKGROUND_FILL_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        {state.ratioId === 'custom' && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Input
              type="number"
              min="1"
              label="Width part"
              value={state.customRatio.width}
              onChange={(e) =>
                setCustomRatio({
                  ...state.customRatio,
                  width: Number(e.target.value),
                })
              }
              className="text-sm"
            />
            <Input
              type="number"
              min="1"
              label="Height part"
              value={state.customRatio.height}
              onChange={(e) =>
                setCustomRatio({
                  ...state.customRatio,
                  height: Number(e.target.value),
                })
              }
              className="text-sm"
            />
          </div>
        )}

        <RangeSlider
          label="Canvas long edge"
          value={state.longEdge}
          min={CANVAS_CONSTRAINTS.minLongEdge}
          max={CANVAS_CONSTRAINTS.maxLongEdge}
          step={CANVAS_CONSTRAINTS.step}
          displayValue={`${state.longEdge}px`}
          onChange={(e) => setLongEdge(Number(e.target.value))}
          helperText="Other edge is derived from the ratio."
        />

        <div className="space-y-2">
          {state.backgroundMode === 'custom' && (
            <div className="grid grid-cols-2 gap-2 items-center">
              <ColorPicker
                label="Color"
                value={state.customColor}
                onChange={(e) => setCustomColor(e.target.value)}
              />
              <RangeSlider
                label="Opacity"
                value={state.customOpacity}
                min={0}
                max={1}
                step={0.05}
                displayValue={`${Math.round(state.customOpacity * 100)}%`}
                onChange={(e) => setCustomOpacity(Number(e.target.value))}
                className="text-xs"
              />
            </div>
          )}
          {state.backgroundMode === 'transparent' && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Transparency keeps the original pixels intact. JPEG is disabled when
              transparency is on.
            </p>
          )}
        </div>

        <Checkbox
          label="Allow upscaling if the canvas is larger than the original"
          checked={state.allowUpscale}
          onChange={(e) => setAllowUpscale(e.target.checked)}
        />

        <Select
          label="Output format"
          value={state.outputFormat}
          onChange={(e) => setOutputFormat(e.target.value as any)}
        >
          {OUTPUT_FORMAT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>

        <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1 border-t pt-3">
          <p>
            Original:{' '}
            {state.originalDims
              ? `${state.originalDims.width}x${state.originalDims.height}px`
              : '--'}
          </p>
          <p>
            Output:{' '}
            {state.resultDims
              ? `${state.resultDims.width}x${state.resultDims.height}px`
              : '--'}
          </p>
          <p>
            Size:{' '}
            {state.processed
              ? `${(calculateDataUrlSize(state.processed.outputUrl) / 1024).toFixed(1)} KB`
              : '--'}
          </p>
        </div>
      </div>
    </ControlPanel>
  );
}
