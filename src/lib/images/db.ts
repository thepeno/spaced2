import { Dexie, type EntityTable } from 'dexie';

export type UncachedImage = {
  url: string;
};

export type CachedImage = {
  url: string;
  altText: string;
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
  images: 'url, altText, cachedAt, thumbnail, size',
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

export function isCachedImage(
  image: CachedImage | UncachedImage
): image is CachedImage {
  return 'cachedAt' in image;
}

async function fetchImage(url: string): Promise<Blob> {
  const requestOptions = url.startsWith(import.meta.env.VITE_BACKEND_URL)
    ? ({ credentials: 'include' } as const)
    : undefined;

  const image = await fetch(url, requestOptions);
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

  // NOTE: the following is AI generated to crop the image
  // such that our thumbnails are always squares
  // Calculate source region to crop a centered square
  const minSize = Math.min(img.width, img.height);
  const sourceX = (img.width - minSize) / 2;
  const sourceY = (img.height - minSize) / 2;

  // Draw cropped and scaled image to canvas
  ctx.drawImage(
    img,
    sourceX, // Source X (start point)
    sourceY, // Source Y
    minSize, // Source width (square size)
    minSize, // Source height
    0, // Destination X
    0, // Destination Y
    canvas.width, // Destination width (200)
    canvas.height // Destination height (200)
  );

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

async function databaseAddImage(url: string, image: Blob, altText: string) {
  const thumbnail = await generateThumbnail(image);
  await Promise.all([
    imagePersistedDb.images.add({
      url,
      altText,
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

export async function downloadImageLocally(
  url: string,
  altText: string
): Promise<{
  newlyDownloaded: boolean;
}> {
  const exists = await imagePersistedDb.images.get(url);
  if (exists) {
    return { newlyDownloaded: false };
  }

  const image = await fetchImage(url);
  await databaseAddImage(url, image, altText);
  return { newlyDownloaded: true };
}

async function databaseUpdateImage(url: string, image: Blob, altText: string) {
  const thumbnail = await generateThumbnail(image);
  await Promise.all([
    imagePersistedDb.images.update(url, {
      thumbnail,
      size: image.size + thumbnail.size,
      altText,
    } as CachedImage),
    imagePersistedDb.imageBlobs.update(url, {
      content: image,
    } as ImageBlob),
  ]);
}

async function getCachedImagePromised(
  url: string,
  altText: string
): Promise<string> {
  const inMemoryImage = ImageMemoryDB.get(url);
  if (inMemoryImage) {
    inMemoryImage.referenceCount++;
    return inMemoryImage.objectURL;
  }

  const image = await imagePersistedDb.images.get(url);
  let blob: Blob;
  if (!image) {
    blob = await fetchImage(url);
    await databaseAddImage(url, blob, altText);
  } else if (isCachedImage(image)) {
    const imageBlob = await imagePersistedDb.imageBlobs.get(url);
    if (!imageBlob) throw new Error('Should not happen, image is cached');
    blob = imageBlob.content;
  } else {
    blob = await fetchImage(image.url);
    await databaseUpdateImage(url, blob, altText);
  }

  const objectURL = URL.createObjectURL(blob);
  ImageMemoryDB.set(url, {
    objectURL,
    referenceCount: 1,
  });
  return objectURL;
}

export async function getCachedImage(
  url: string,
  altText: string
): Promise<string> {
  if (currentlyFetchingImages.has(url)) {
    return currentlyFetchingImages.get(url)!;
  }

  const promise = getCachedImagePromised(url, altText);
  currentlyFetchingImages.set(url, promise);
  promise.finally(() => {
    currentlyFetchingImages.delete(url);
  });
  return promise;
}

export function revokeImage(url: string) {
  const inMemoryImage = ImageMemoryDB.get(url);
  if (!inMemoryImage) return;

  inMemoryImage.referenceCount--;
  if (inMemoryImage.referenceCount <= 0) {
    console.log('revoking image', url);
    URL.revokeObjectURL(inMemoryImage.objectURL);
    ImageMemoryDB.delete(url);
  }
}
