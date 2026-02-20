import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

export type UploadBucket = 'artists' | 'presskits' | 'bookings' | 'avatars';

function buildPublicFileUrl(fileId: string) {
  const baseApiUrl = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/+$/, '');
  return `${baseApiUrl}/public/files/${fileId}`;
}

export async function uploadToVps(
  file: File,
  bucket: UploadBucket,
  entityType?: string,
  entityId?: string,
): Promise<{ id: string; url: string; originalName: string; mimeType: string }> {
  const token = useAuthStore.getState().accessToken;
  if (!token) {
    throw new Error('Authentication required for upload.');
  }

  const formData = new FormData();
  formData.append('file', file);

  const params = new URLSearchParams();
  params.set('bucket', bucket);
  if (entityType) params.set('entityType', entityType);
  if (entityId) params.set('entityId', entityId);

  const res = await api.post(`/files/upload?${params.toString()}`, formData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const fileEntity = res.data.data || res.data;

  return {
    id: fileEntity.id,
    url: buildPublicFileUrl(fileEntity.id),
    originalName: fileEntity.originalName,
    mimeType: fileEntity.mimeType,
  };
}
