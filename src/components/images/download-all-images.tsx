import BouncyButton from '@/components/bouncy-button';
import { Progress } from '@/components/ui/progress';
import { downloadImageLocally } from '@/lib/images/db';
import { searchForLinks } from '@/lib/images/download-all';
import { CheckCircle, CircleX, DownloadIcon, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';

const BATCH_SIZE = 5;

export default function DownloadAllImages() {
  const [downloadState, setDownloadState] = useState<
    'idle' | 'searching-links' | 'downloading' | 'finished' | 'cancelled'
  >('idle');

  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [totalImages, setTotalImages] = useState<number>(0);
  const [totalDownloaded, setTotalDownloaded] = useState<number>(0);

  const cancelledRef = useRef(false);

  const handleDownload = async () => {
    setDownloadState('searching-links');
    const links = searchForLinks();

    setDownloadState('downloading');
    const linkCount = links.size;
    setTotalImages(linkCount);

    const entries = Array.from(links.entries());
    for (let i = 0; i < linkCount; i += BATCH_SIZE) {
      if (cancelledRef.current) {
        setDownloadState('cancelled');
        return;
      }

      const batch = entries.slice(i, i + BATCH_SIZE);
      await Promise.allSettled(
        batch.map(async ([url, altText]) => {
          const { newlyDownloaded } = await downloadImageLocally(url, altText);
          if (newlyDownloaded) {
            setTotalDownloaded((total) => total + 1);
          }
          setDownloadProgress((progress) => progress + 1);
        })
      );
    }

    setDownloadState('finished');
  };

  return (
    <div className='bg-background rounded-xl px-2 py-2 sm:w-full mb-6 flex justify-between items-center mt-4 h-14'>
      {downloadState === 'idle' && (
        <>
          <div className='text-sm ml-2'>Make all images available offline</div>
          <BouncyButton
            asButton
            className='flex justify-center items-center gap-2 bg-primary p-2 rounded-md text-background font-semibold px-4'
            onClick={handleDownload}
          >
            <DownloadIcon className='w-4 h-4' strokeWidth={2.5} />
            <span className='text-sm'>Start</span>
          </BouncyButton>
        </>
      )}

      {downloadState === 'searching-links' && (
        <>
          <div className='text-sm ml-2 animate-fade-in'>
            Searching for links...
          </div>
          <Loader2 className='w-5 h-5 text-primary animate-spin mr-4' />
        </>
      )}

      {downloadState === 'downloading' && (
        <>
          <div className='text-sm ml-2 w-full mr-6 animate-fade-in'>
            Downloading ({downloadProgress} / {totalImages})...
            <Progress
              key={'progress'}
              className='mt-1'
              value={(downloadProgress / totalImages) * 100}
            />
          </div>
          <CircleX
            className='w-5 h-5 text-muted-foreground mr-2'
            onClick={() => {
              cancelledRef.current = true;
              setDownloadState('cancelled');
            }}
          />
        </>
      )}

      {downloadState === 'finished' && (
        <>
          <div className='text-sm ml-2 animate-fade-in'>
            Downloaded {totalDownloaded} new images
          </div>
          <CheckCircle className='w-5 h-5 text-primary mr-4 cursor-pointer' />
        </>
      )}

      {downloadState === 'cancelled' && (
        <>
          <div className='text-sm ml-2 w-full mr-12'>
            Download cancelled ({downloadProgress} / {totalImages})
            <Progress
              key={'progress'}
              className='mt-1'
              progressColour='bg-muted-foreground/50'
              value={(downloadProgress / totalImages) * 100}
            />
          </div>
        </>
      )}
    </div>
  );
}
