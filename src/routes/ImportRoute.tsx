import { Button } from '@/components/ui/button';
import {
  applyOperations,
  Operation,
  operationSchema,
} from '@/lib/sync/operation';
import { AlertTriangle, FileJson, Loader2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

export default function ImportRoute() {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    try {
      const text = await file.text();
      const json = JSON.parse(text);

      // Validate the entire array of operations
      const parsedOperations = z.array(operationSchema).parse(json);

      setOperations(parsedOperations);
      toast.success(
        `Successfully parsed ${parsedOperations.length} operations`
      );
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Invalid file format.', {
        description: ' Please ensure the file contains valid data.',
      });
      setOperations([]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file || file.type !== 'application/json') {
      toast.error('Only JSON files are supported');
      return;
    }

    handleFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFile(file);
  };

  const handleImport = async () => {
    try {
      setIsImporting(true);
      await applyOperations(operations);
      setIsImporting(false);
      toast.success('Operations imported successfully');
      setOperations([]);
    } catch {
      toast.error('Failed to import operations');
    }
  };

  return (
    <div className='flex flex-col h-full col-start-1 col-end-13 xl:col-start-3 xl:col-end-11 md:px-24 pb-6 gap-2 animate-fade-in'>
      <div className='flex flex-col items-center justify-center gap-4 py-12'>
        <div className='flex flex-col gap-2 items-center mb-4'>
          <AlertTriangle className='size-12 text-destructive' />
          <h3 className='text-lg font-medium text-destructive'>
            Advanced Feature
          </h3>
          <p className='text-sm text-muted-foreground max-w-2xs text-center'>
            This is an advanced feature for importing operations. Only proceed
            if you know exactly what you're doing. Incorrect imports may affect
            your data.
          </p>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className='border-2 border-dashed rounded-xl p-12 w-full max-w-md cursor-pointer hover:border-primary transition-colors text-center'
        >
          <input
            ref={fileInputRef}
            type='file'
            accept='.json'
            onChange={handleFileInput}
            className='hidden'
          />
          <FileJson
            className={`size-24 mx-auto mb-4 transition-all ${
              isDragging ? 'text-primary' : 'text-muted-foreground'
            }`}
          />
          <p className='text-sm text-muted-foreground'>
            Drag and drop a JSON file here, or click to select
          </p>
        </div>

        {operations.length > 0 && (
          <div className='text-center mt-4'>
            <Button
              onClick={handleImport}
              className='flex items-center gap-2 active:scale-95 transition-all'
              variant='default'
              size='lg'
              disabled={isImporting}
            >
              {isImporting ? (
                <Loader2 className='size-4 animate-spin' />
              ) : (
                <Upload className='size-4' />
              )}
              <span>Import {operations.length} Operations</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
