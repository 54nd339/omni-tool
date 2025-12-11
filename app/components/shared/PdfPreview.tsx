import { type RefObject, type FC } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ControlPanel, Button } from '@/app/components/shared';

interface PdfPreviewProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoaded: boolean;
  hasSource?: boolean;
  label?: string;
}

export const PdfPreview: FC<PdfPreviewProps> = ({
  canvasRef,
  totalPages,
  currentPage,
  onPageChange,
  isLoaded,
  hasSource = false,
  label = 'Preview',
}) => {
  return (
    <ControlPanel title={label}>
      {(!hasSource) ? (
        <div className="bg-slate-100 dark:bg-slate-800 rounded p-12 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">PDF preview will appear here</p>
        </div>
      ) : isLoaded ? (
        <div className="space-y-3">
          <div className="bg-slate-100 dark:bg-slate-800 rounded p-4 overflow-auto max-h-96">
            <canvas ref={canvasRef} className="w-full h-auto" />
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-2 text-sm">
              <Button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="relative w-full h-64 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden">
          <div className="absolute inset-0 animate-pulse">
            <div className="h-full w-full bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
            Loading preview...
          </div>
        </div>
      )}
    </ControlPanel>
  );
};
