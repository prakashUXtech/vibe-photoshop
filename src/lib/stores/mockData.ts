import type { User, Image } from '$lib/types';

// Mock user data
export const mockUser: User = {
  id: '1',
  email: 'demo@example.com',
  name: 'Demo User',
  apiKey: 'mock-api-key',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

// Mock image data
export const mockImages: Image[] = [
  {
    id: '1',
    userId: '1',
    prompt: 'A serene mountain landscape at sunset with flying pigs',
    imageUrl: 'https://picsum.photos/800/600',
    thumbnail: 'https://picsum.photos/400/300',
    status: 'completed',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
    metadata: {
      width: 800,
      height: 600,
      format: 'jpeg',
      size: 1024000
    },
    versions: [
      {
        id: 'v1',
        imageId: '1',
        prompt: 'Original prompt',
        imageUrl: 'https://picsum.photos/800/600',
        createdAt: new Date('2024-03-01')
      }
    ]
  },
  {
    id: '2',
    userId: '1',
    prompt: 'A futuristic city with flying cars and neon lights',
    imageUrl: 'https://picsum.photos/800/600?random=2',
    thumbnail: 'https://picsum.photos/400/300?random=2',
    status: 'completed',
    createdAt: new Date('2024-03-02'),
    updatedAt: new Date('2024-03-02'),
    metadata: {
      width: 800,
      height: 600,
      format: 'jpeg',
      size: 1024000
    },
    versions: [
      {
        id: 'v2',
        imageId: '2',
        prompt: 'Original prompt',
        imageUrl: 'https://picsum.photos/800/600?random=2',
        createdAt: new Date('2024-03-02')
      }
    ]
  },
  {
    id: '3',
    userId: '1',
    prompt: 'An enchanted forest with glowing mushrooms',
    imageUrl: 'https://picsum.photos/800/600?random=3',
    thumbnail: 'https://picsum.photos/400/300?random=3',
    status: 'generating',
    createdAt: new Date('2024-03-03'),
    updatedAt: new Date('2024-03-03'),
    metadata: {
      width: 800,
      height: 600,
      format: 'jpeg',
      size: 1024000
    },
    versions: [
      {
        id: 'v3',
        imageId: '3',
        prompt: 'Original prompt',
        imageUrl: 'https://picsum.photos/800/600?random=3',
        createdAt: new Date('2024-03-03')
      }
    ]
  }
]; 