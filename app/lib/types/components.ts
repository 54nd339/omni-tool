/**
 * Shared component prop types
 */

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export interface ControlPanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export interface FileUploadProps {
  label: string;
  accept?: string;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
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
  icon?: any; // LucideIcon - optional if path is provided
  title?: string; // optional if path is provided
  description?: string; // optional if path is provided
  path?: string; // path to look up in PAGE_CONFIGS
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
  isOnline: boolean;
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
