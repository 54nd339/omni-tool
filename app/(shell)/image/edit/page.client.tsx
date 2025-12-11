'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Maximize2, Download, Copy, Check, RefreshCcw } from 'lucide-react';
import { ToolLayout } from '@/app/components/shared/ToolLayout';
import { ControlPanel } from '@/app/components/shared/ControlPanel';
import { FileUpload } from '@/app/components/shared/FileUpload';
import { Button } from '@/app/components/shared/Button';
import { formatFileSize, processImageCanvas } from '@/app/lib/tools/image';

type TargetFormat = 'image/png' | 'image/jpeg' | 'image/webp' | 'image/avif';

export default function EditPage() {
	const [image, setImage] = useState<{ file: File; url: string } | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [copied, setCopied] = useState(false);

	// Resize state
	const [scale, setScale] = useState(100);
	const [width, setWidth] = useState<number | ''>('');
	const [height, setHeight] = useState<number | ''>('');
	const [keepAspect, setKeepAspect] = useState(true);
	const [quality, setQuality] = useState(0.8);
	const [grayscale, setGrayscale] = useState(false);
	const [originalDims, setOriginalDims] = useState<{ width: number; height: number } | null>(null);
	const [newDims, setNewDims] = useState<{ width: number; height: number } | null>(null);

	// Convert state
	const [format, setFormat] = useState<TargetFormat>('image/png');

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const hasImage = useMemo(() => Boolean(image), [image]);

	const resetState = () => {
		setImage(null);
		setPreview(null);
		setScale(100);
		setWidth('');
		setHeight('');
		setKeepAspect(true);
		setQuality(0.8);
		setGrayscale(false);
		setLoading(false);
		setCopied(false);
		setOriginalDims(null);
		setNewDims(null);
		setFormat('image/png');
	};

	const readDimensions = (src: string) =>
		new Promise<{ width: number; height: number }>((resolve, reject) => {
			const img = document.createElement('img');
			img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
			img.onerror = reject;
			img.src = src;
		});

	const readDimensionsSync = (src: string): { width: number; height: number } | null => {
		try {
			const img = document.createElement('img');
			img.src = src;
			return { width: img.width, height: img.height };
		} catch {
			return null;
		}
	};

	const handleFilesSelected = async (files: File[]) => {
		const file = files[0];
		if (!file?.type.startsWith('image/')) {
			alert('Please select an image file');
			return;
		}
		const url = URL.createObjectURL(file);
		setImage({ file, url });
		setPreview(null);
		setNewDims(null);
		
		// Synchronously read dimensions for immediate display
		const img = document.createElement('img');
		img.onload = () => {
			const dims = { width: img.naturalWidth, height: img.naturalHeight };
			setOriginalDims(dims);
		};
		img.src = url;
	};

	const applyTransform = async () => {
		if (!image || !canvasRef.current) return;
		setLoading(true);
		try {
			const targetWidth = typeof width === 'number' && width > 0 ? width : undefined;
			const targetHeight = typeof height === 'number' && height > 0 ? height : undefined;
			
			const { dataUrl } = await processImageCanvas(
				image.url,
				{
					scale,
					quality,
					grayscale,
					keepAspect,
					width: targetWidth,
					height: targetHeight,
				},
				canvasRef.current,
				format,
			);
			setPreview(dataUrl);
			try {
				const dims = await readDimensions(dataUrl);
				setNewDims(dims);
			} catch (_) {
				setNewDims(null);
			}
		} finally {
			setLoading(false);
		}
	};

	// Auto-apply on any control change
	useEffect(() => {
		if (!image) return;
		applyTransform();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [scale, quality, grayscale, keepAspect, width, height, image, format]);

	const handleDownload = () => {
		if (!preview || !image) return;
		const link = document.createElement('a');
		link.href = preview;

		const ext = format.split('/')[1].replace('jpeg', 'jpg');
		link.download = `${image.file.name.replace(/\.[^.]+$/, '')}.${ext}`;
		link.click();
	};

	const handleCopy = async () => {
		if (!preview) return;
		const res = await fetch(preview);
		const blob = await res.blob();
		const mimeType = blob.type || format;
		await navigator.clipboard.write([new ClipboardItem({ [mimeType]: blob })]);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const newSize = useMemo(() => {
		if (!preview) return 0;
		const base64Header = /^data:[^;]+;base64,/;
		const base64 = preview.replace(base64Header, '');
		return Math.round((base64.length * 3) / 4);
	}, [preview]);

	return (
		<ToolLayout icon={Maximize2} title="Image Editor" description="Resize, compress, and convert images">
			{!hasImage ? (
				<div className="max-w-xl mx-auto">
					<FileUpload label="Upload Image" accept="image/*" onFilesSelected={handleFilesSelected} />
				</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="space-y-4">
						<Button variant="outline" onClick={resetState} className="w-full flex items-center justify-center gap-2">
							<RefreshCcw className="w-4 h-4" />
							Clear Image
						</Button>

						<ControlPanel title="Image Controls">
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium mb-2">Resize ({scale}%)</label>
									<input
										type="range"
										min="10"
										max="200"
										step="1"
										value={scale}
										onChange={(e) => setScale(parseInt(e.target.value))}
										className="w-full"
									/>
								</div>

					<div className="grid grid-cols-2 gap-2">
						<div>
							<label className="block text-sm font-medium mb-1">Width (px, optional)</label>
							<input
								type="number"
								value={width === '' ? '' : width}
								onChange={(e) => {
									const newWidth = e.target.value === '' ? '' : parseInt(e.target.value);
									setWidth(newWidth);
									if (keepAspect && originalDims && typeof newWidth === 'number') {
										const aspectRatio = originalDims.height / originalDims.width;
										setHeight(Math.round(newWidth * aspectRatio));
									}
								}}
								className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Height (px, optional)</label>
							<input
								type="number"
								value={height === '' ? '' : height}
								onChange={(e) => {
									const newHeight = e.target.value === '' ? '' : parseInt(e.target.value);
									setHeight(newHeight);
									if (keepAspect && originalDims && typeof newHeight === 'number') {
										const aspectRatio = originalDims.width / originalDims.height;
										setWidth(Math.round(newHeight * aspectRatio));
									}
								}}
								className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600"
							/>
						</div>
					</div>								<div className="flex items-center gap-2">
									<input
										id="aspect"
										type="checkbox"
										checked={keepAspect}
										onChange={(e) => setKeepAspect(e.target.checked)}
										className="w-4 h-4"
									/>
									<label htmlFor="aspect" className="text-sm font-medium cursor-pointer">
										Keep aspect ratio
									</label>
								</div>

					<div>
						<label className="block text-sm font-medium mb-2">Quality ({Math.round(quality * 100)}%)</label>
						<input
							type="range"
							min="0.1"
							max="1"
							step="0.05"
							value={quality}
							onChange={(e) => setQuality(parseFloat(e.target.value))}
							className="w-full"
							disabled={format === 'image/png'}
						/>
						{format === 'image/png' && (
							<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">PNG is lossless - quality control disabled</p>
						)}
					</div>								<div className="flex items-center gap-3">
									<input
										id="grayscale"
										type="checkbox"
										checked={grayscale}
										onChange={(e) => setGrayscale(e.target.checked)}
										className="w-4 h-4"
									/>
									<label htmlFor="grayscale" className="text-sm font-medium">
										Grayscale Mode
									</label>
								</div>

								<div>
									<label className="block text-sm font-medium mb-2">Target Format</label>
									<select
										value={format}
										onChange={(e) => setFormat(e.target.value as TargetFormat)}
										className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
									>
										<option value="image/png">PNG (lossless)</option>
										<option value="image/jpeg">JPG</option>
										<option value="image/webp">WebP</option>
										<option value="image/avif">AVIF</option>
									</select>
								</div>

								<div className="text-sm text-slate-600 dark:text-slate-400 space-y-1 border-t pt-3">
									<p>
										Original: {image ? formatFileSize(image.file.size) : '--'}
										{originalDims ? ` • ${originalDims.width}×${originalDims.height}px` : ''}
									</p>
									<p>
										New: {preview ? formatFileSize(newSize) : '--'}
										{newDims ? ` • ${newDims.width}×${newDims.height}px` : ''}
									</p>
								</div>
							</div>
						</ControlPanel>
					</div>

					<div className="space-y-4 hidden lg:block">
						<ControlPanel title="Original">
							<div className="relative w-full h-72 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center">
								<Image src={image!.url} alt="Original" width={originalDims?.width || 500} height={originalDims?.height || 500} className="max-w-full max-h-72 object-contain" />
							</div>
						</ControlPanel>
					</div>

					<div className="space-y-4">
						{preview ? (
							<ControlPanel title="Preview">
								<div className="relative w-full h-72 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center">
									<Image src={preview} alt="Preview" width={newDims?.width || 500} height={newDims?.height || 500} className="max-w-full max-h-72 object-contain" />
								</div>
								<div className="mt-3 grid grid-cols-2 gap-2">
									<Button variant="outline" onClick={handleDownload} className="w-full flex items-center justify-center gap-2">
										<Download className="w-4 h-4" />
										Download
									</Button>
									<Button variant="outline" onClick={handleCopy} className="w-full flex items-center justify-center gap-2">
										{copied ? (
											<>
												<Check className="w-4 h-4" />
												Copied
											</>
										) : (
											<>
												<Copy className="w-4 h-4" />
												Copy
											</>
										)}
									</Button>
								</div>
							</ControlPanel>
						) : (
							<ControlPanel title="Preview">
								<div className="relative w-full h-72 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
									Your processed image will appear here.
								</div>
							</ControlPanel>
						)}
					</div>
				</div>
			)}
			<canvas ref={canvasRef} className="hidden" />
		</ToolLayout>
	);
}
