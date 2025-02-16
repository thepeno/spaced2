import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CachedImage, imagePersistedDb } from '@/lib/images/db';
import { cn } from '@/lib/utils';
import { useLiveQuery } from 'dexie-react-hooks';

type SelectedImageDialogProps = {
  image: CachedImage | null;
  onExit: () => void;
};

export default function SelectedImageDialog({
  image,
  onExit,
}: SelectedImageDialogProps) {
  const imageBlob = useLiveQuery(
    () => (image?.url ? imagePersistedDb.imageBlobs.get(image.url) : undefined),
    [image?.url]
  );
  const url = imageBlob?.content && URL.createObjectURL(imageBlob.content);

  return (
    <Dialog
      open={!!image}
      onOpenChange={(open) => {
        if (!open) {
          onExit();
        }
      }}
    >
      <DialogContent
        className={cn('p-0 rounded-none w-full')}
        hideClose
        style={{
          viewTransitionName: 'image-expand',
        }}
      >
        <img
          src={url}
          id='image-dialog'
          alt={image?.altText ?? 'cached image'}
          className={cn('shadow-sm w-full')}
        />

        <div
          id='hello'
          className='text-white text-center absolute -bottom-8 left-1/2 -translate-x-1/2'
        >
          {image?.altText}
        </div>
      </DialogContent>
    </Dialog>
  );
}
