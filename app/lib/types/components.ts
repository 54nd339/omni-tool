/**
 * Shared component prop types
 */
import { type RefObject, InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';
import { CategoryTool } from '@/app/lib/constants';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  helperText?: string;
  error?: string;
}

export interface ColorPickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  helperText?: string;
  error?: string;
}

export interface ControlPanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export interface DashboardLayoutProps {
  icon: LucideIcon;
  title: string;
  description: string;
  tools: CategoryTool[];
  colorTheme: {
    iconBg: string;
    iconColor: string;
    hoverBorder: string;
    hoverText: string;
  };
}

export interface DoubleRangeSliderProps {
  label?: string;
  startValue: number;
  endValue: number;
  min: number;
  max: number;
  step?: number;
  startDisplayValue?: string | number;
  endDisplayValue?: string | number;
  onStartChange: (value: number) => void;
  onEndChange: (value: number) => void;
  className?: string;
  error?: string;
}

export interface DraggableListProps<T> {
  items: T[];
  onReorder: (items: T[]) => void;
  onRemove: (index: number) => void;
  title?: string;
  renderMetadata: (item: T) => ReactNode;
  getItemKey?: (item: T, index: number) => string | number;
  renderAction?: (item: T, index: number) => ReactNode;
}

export interface ErrorAlertProps {
  error: string;
  className?: string;
}

export interface FileUploadProps {
  label: string;
  accept?: string;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  className?: string;
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export interface MediaPreviewProps {
  file: File | Blob | null;
  url: string | null;
  type: 'video' | 'audio' | null;
  emptyMessage?: string;
}

export interface PdfPreviewProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoaded: boolean;
  hasSource?: boolean;
  label?: string;
}

export interface ProgressBarProps {
  progress: number;
  label?: string;
  className?: string;
}

interface RadioOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
}

export interface RadioGroupProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  className?: string;
  error?: string;
}

export interface RangeSliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  displayValue?: string | number;
  helperText?: string;
  error?: string;
}

export interface ResultDisplayProps {
  value: string;
  label?: string;
  className?: string;
  copyButtonLabel?: string;
  children?: ReactNode;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children?: ReactNode; // Supports both option and optgroup elements
}

export interface SuccessResultProps {
  title?: string;
  message: string;
  onDownload: () => void;
  downloadLabel?: string;
  className?: string;
}

export interface TextAreaInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  readOnly?: boolean;
  error?: string;
}

export interface ToolLayoutProps {
  icon?: any; // LucideIcon
  title?: string;
  description?: string;
  path?: string;
  children: React.ReactNode;
}

export interface TwoColumnLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
  reverseOnMobile?: boolean;
}

export interface AppHeaderProps {
  title: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
}

export interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

export interface CopyButtonProps {
  value: string;
  onCopy: () => void;
  copied: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
}

export interface FileInfoCardProps {
  fileName: string;
  fileSize: number;
  additionalInfo?: React.ReactNode;
  className?: string;
}

export interface ProcessingButtonProps {
  onClick: () => void;
  disabled?: boolean;
  processing?: boolean;
  icon: ReactNode;
  processingLabel?: string;
  label: string;
  className?: string;
}

export interface ProcessingResultPanelProps {
  error?: string;
  processing?: boolean;
  progress?: number;
  progressLabel?: string;
  result?: {
    title?: string;
    message?: string;
    onDownload?: () => void;
    downloadLabel?: string;
  } | null;
  children?: ReactNode;
  className?: string;
}
