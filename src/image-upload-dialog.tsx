import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Loader2, Upload } from 'lucide-react';
import { useState } from 'react';

interface ImageUploadDialogProps {
  image: string | File | null;
  onSubmit: (altText?: string) => void;
  loading?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function ImageUploadDialog({
  image,
  onSubmit,
  loading = false,
  open,
  onOpenChange,
}: ImageUploadDialogProps) {
  const [altText, setAltText] = useState('');

  if (image === null) {
    return null;
  }

  const imageUrl =
    typeof image === 'string' ? image : URL.createObjectURL(image);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md px-0 py-3 gap-2'>
        <DialogHeader>
          <DialogTitle className='text-center text-base'>
            Image Upload
          </DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-2'>
          <div className='flex items-center justify-center border rounded-lg p-2'>
            <img
              src={imageUrl}
              alt={altText}
              className='max-h-[240px] object-contain'
            />
          </div>
          <div className='flex justify-between items-center pl-1 pr-5'>
            <Input
              className='border-none shadow-none focus-visible:ring-0 flex-1'
              id='alt-text'
              value={altText}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSubmit(altText);
                  return;
                }
              }}
              onChange={(e) => {
                setAltText(e.target.value);
              }}
              placeholder='Describe this image...'
            />
            {loading ? (
              <Loader2
                className='w-6 h-6 text-primary animate-spin'
                strokeWidth={2}
              />
            ) : (
              <Upload
                className='w-6 h-6 text-primary'
                strokeWidth={2}
                onClick={() => onSubmit(altText)}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
