type UploadSuccess = {
  success: true;
  fileKey: string;
};

type UploadError = {
  success: false;
  error: string;
};

type UploadResponse = UploadSuccess | UploadError;

export async function uploadImage(
  image: File,
  altText?: string
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', image);

  if (altText) {
    formData.append('metadata', JSON.stringify({ altText }));
  }

  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/upload`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (response.status === 500) {
    console.error('Unknown error uploading image', response);
    return {
      success: false,
      error: 'Failed to upload image',
    };
  }

  const data = (await response.json()) as UploadResponse;
  return data;
}

export function constructImageMarkdownLink(fileKey: string, altText?: string) {
  return `![${altText || 'Image'}](${import.meta.env.VITE_BACKEND_URL}/files/${fileKey})`;
}
