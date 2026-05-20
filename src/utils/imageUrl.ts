import { BASE_URL } from '../api/axios';

export const getImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:')) return url;

  let path = url.startsWith('/') ? url.slice(1) : url;
  if (path.startsWith('uploads/')) {
    path = path.replace('uploads/', '');
  }
  if (path.startsWith('api/v1/uploads/')) {
    path = path.replace('api/v1/uploads/', '');
  }

  return `${BASE_URL}/api/v1/uploads/${path}`;
};
