import DownloadAllImages from '@/components/images/download-all-images';
import SelectedImageDialog from '@/components/images/selected-image-dialog';
import ReturnToTop from '@/components/return-to-top';
import SearchBar from '@/components/search-bar';
import { CachedImage, imagePersistedDb, isCachedImage } from '@/lib/images/db';
import EmptyImages from '@/lib/images/empty';
import { useLiveQuery } from 'dexie-react-hooks';
import { Database, ImageIcon } from 'lucide-react';
import { useState } from 'react';

export default function ImagesRoute() {
  const images = useLiveQuery(() => imagePersistedDb.images.toArray(), [], []);
  const totalImages = images.length;

  const cachedImages = images.filter(isCachedImage) as CachedImage[];
  const totalImageSize = cachedImages.reduce(
    (acc, image) => acc + image.size,
    0
  );
  const sizeInMB = (totalImageSize / 1024 / 1024).toFixed(2);

  const [search, setSearch] = useState('');
  const filteredImages = cachedImages.filter((image) =>
    image.altText.toLowerCase().includes(search.toLowerCase())
  );

  const [selectedImage, setSelectedImage] = useState<CachedImage | null>(null);

  return (
    <div className='flex flex-col items-center h-full col-start-1 col-end-13 xl:col-start-3 xl:col-end-11 md:px-24 pb-6'>
      <SelectedImageDialog
        image={selectedImage}
        onExit={() => setSelectedImage(null)}
      />

      <ReturnToTop />
      <SearchBar
        search={search}
        setSearch={setSearch}
        placeholder='Search images...'
      />

      <div className='w-full max-w-sm xl:max-w-xl animate-fade-in'>
        <DownloadAllImages />

        <div className='flex flex-col gap-2 mb-1 ml-1'>
          <div className='font-semibold flex gap-1 text-muted-foreground tracking-tight'>
            <div>Available offline</div>
            <div className='flex-1'></div>

            <div className='flex items-center gap-1'>
              <ImageIcon className='w-4 h-4' />
              <span className='text-sm'>{totalImages}</span>
            </div>
            <div className='flex items-center gap-1'>
              <Database className='w-4 h-4' />
              <span className='text-sm'>{sizeInMB} MB</span>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-3 gap-2 w-full rounded-xl'>
          {filteredImages.length === 0 && <EmptyImages />}
          {filteredImages.map((image) => {
            const url = URL.createObjectURL(image.thumbnail);
            return (
              <img
                key={image.url}
                src={url}
                alt='cached image'
                className='rounded-lg shadow-sm w-full sm:w-full sm:h-full hover:scale-105 transition-all duration-300 hover:shadow-lg cursor-pointer'
                onClick={(e) => {
                  const imageElement = e.currentTarget;
                  if (document.startViewTransition) {
                    imageElement.style.viewTransitionName = `image-expand`;

                    document.startViewTransition(async () => {
                      // Remove the original view transition name first
                      // See https://stackoverflow.com/questions/76248818/how-to-use-the-view-transition-api-web-for-transition-elements-that-are-not-th
                      imageElement.style.viewTransitionName = ``;

                      setSelectedImage(image);
                      // hacky way to yield control back
                      // for react to update the DOM before we end the transition
                      await new Promise((resolve) => setTimeout(resolve, 0));
                    });
                    return;
                  }

                  setSelectedImage(image);
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
