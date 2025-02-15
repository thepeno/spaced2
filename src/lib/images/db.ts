import { Dexie, type EntityTable } from 'dexie';

type UncachedImage = {
  url: string;
};

type CachedImage = {
  url: string;
  cachedAt: number;
  thumbnail: Blob;
  size: number;
};

type ImageBlob = {
  url: string;
  content: Blob;
};

// Image blobs are stored separately from the images so that we can select
// the images without bringing all the Blobs into memory.
export const imagePersistedDb = new Dexie('ImageCache') as Dexie & {
  images: EntityTable<CachedImage | UncachedImage, 'url'>;
  imageBlobs: EntityTable<ImageBlob, 'url'>;
};

imagePersistedDb.version(1).stores({
  images: 'url, cachedAt, thumbnail, size',
  imageBlobs: 'url, content',
});

export const ImageMemoryDB = new Map<
  string,
  {
    objectURL: string;
    referenceCount: number;
  }
>();

/** Used to dedupe the fetching requests for the same image. */
const currentlyFetchingImages = new Map<string, Promise<string>>();

function isCachedImage(
  image: CachedImage | UncachedImage
): image is CachedImage {
  return 'cachedAt' in image;
}

async function fetchImage(url: string): Promise<Blob> {
  const image = await fetch(url, {
    credentials: 'include',
  });
  return image.blob();
}

/**
 * Generates a thumbnail from an image blob.
 *
 * @param original - The original image blob.
 * @returns A promise that resolves to the thumbnail blob.
 */
async function generateThumbnail(original: Blob): Promise<Blob> {
  const randomNumber = Math.floor(Math.random() * 100);
  console.time(`generateThumbnail ${randomNumber}`);
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to create canvas context');

  // Create an image element from the blob
  const img = new Image();
  const blobUrl = URL.createObjectURL(original);
  // Wait for the image to load before drawing
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = blobUrl;
  });

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(blobUrl);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) throw new Error('Failed to create thumbnail blob');
        resolve(blob);
        console.timeEnd(`generateThumbnail ${randomNumber}`);
      },
      'image/jpeg',
      0.8
    );
  });
}

async function databaseAddImage(url: string, image: Blob) {
  const thumbnail = await generateThumbnail(image);
  await Promise.all([
    imagePersistedDb.images.add({
      url,
      cachedAt: Date.now(),
      thumbnail,
      size: image.size + thumbnail.size,
    } as CachedImage),
    imagePersistedDb.imageBlobs.add({
      url,
      content: image,
    } as ImageBlob),
  ]);
}

async function databaseUpdateImage(url: string, image: Blob) {
  const thumbnail = await generateThumbnail(image);
  await Promise.all([
    imagePersistedDb.images.update(url, {
      thumbnail,
      size: image.size + thumbnail.size,
    } as CachedImage),
    imagePersistedDb.imageBlobs.update(url, {
      content: image,
    } as ImageBlob),
  ]);
}

async function getCachedImagePromised(url: string): Promise<string> {
  const inMemoryImage = ImageMemoryDB.get(url);
  if (inMemoryImage) {
    inMemoryImage.referenceCount++;
    return inMemoryImage.objectURL;
  }

  const image = await imagePersistedDb.images.get(url);
  let blob: Blob;
  if (!image) {
    blob = await fetchImage(url);
    await databaseAddImage(url, blob);
  } else if (isCachedImage(image)) {
    const imageBlob = await imagePersistedDb.imageBlobs.get(url);
    if (!imageBlob) throw new Error('Should not happen, image is cached');
    blob = imageBlob.content;
  } else {
    blob = await fetchImage(image.url);
    await databaseUpdateImage(url, blob);
  }

  const objectURL = URL.createObjectURL(blob);
  ImageMemoryDB.set(url, {
    objectURL,
    referenceCount: 1,
  });
  return objectURL;
}

export async function getCachedImage(url: string): Promise<string> {
  if (currentlyFetchingImages.has(url)) {
    return currentlyFetchingImages.get(url)!;
  }

  const promise = getCachedImagePromised(url);
  currentlyFetchingImages.set(url, promise);
  promise.finally(() => {
    currentlyFetchingImages.delete(url);
  });
  return promise;
}

export function revokeImage(url: string) {
  const inMemoryImage = ImageMemoryDB.get(url);
  if (!inMemoryImage) return;

  console.log('decrementing reference count for image', url);

  inMemoryImage.referenceCount--;
  if (inMemoryImage.referenceCount <= 0) {
    console.log('revoking image', url);
    URL.revokeObjectURL(inMemoryImage.objectURL);
    ImageMemoryDB.delete(url);
  }
}
