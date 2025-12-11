import { useState, type ReactNode } from 'react';
import { Trash2, GripVertical } from 'lucide-react';
import { ControlPanel } from './ControlPanel';
import { Button } from './Button';

interface DraggableListProps<T> {
  items: T[];
  onReorder: (items: T[]) => void;
  onRemove: (index: number) => void;
  title?: string;
  renderMetadata: (item: T) => ReactNode;
  getItemKey?: (item: T, index: number) => string | number;
}

export const DraggableList = <T,>({
  items,
  onReorder,
  onRemove,
  title,
  renderMetadata,
  getItemKey = (_, i) => i,
}: DraggableListProps<T>) => {
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (index: number) => {
    setDragOverItem(index);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (dropIndex: number) => {
    if (draggedItem === null || draggedItem === dropIndex) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const newItems = [...items];
    const draggedItem_ = newItems[draggedItem];
    
    newItems.splice(draggedItem, 1);
    newItems.splice(dropIndex, 0, draggedItem_);
    
    onReorder(newItems);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const defaultTitle = title || `Selected Items (${items.length})`;

  return (
    <ControlPanel title={defaultTitle}>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {items.map((item, i) => (
          <div
            key={getItemKey(item, i)}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={() => handleDragOver(i)}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop(i)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-3 rounded border-2 transition-all cursor-move ${
              draggedItem === i
                ? 'opacity-50 border-blue-400 dark:border-blue-600'
                : dragOverItem === i
                  ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            <GripVertical className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              {renderMetadata(item)}
            </div>
            <Button
              onClick={() => onRemove(i)}
              variant="ghost"
              className="text-red-500 hover:text-red-600 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
              title="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Drag items to reorder them</p>
    </ControlPanel>
  );
};

