// Types for the Vide Edit application

export interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  apiKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Image {
  id: string;
  userId: string;
  prompt: string;
  imageUrl: string;
  thumbnail?: string;
  status: 'generating' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
  versions: ImageVersion[];
}

export interface ImageVersion {
  id: string;
  imageId: string;
  prompt: string;
  imageUrl: string;
  createdAt: Date;
  parentVersionId?: string;
}

export interface GenerationOptions {
  width?: number;
  height?: number;
  numberOfImages?: number;
  style?: string;
  enhancePrompt?: boolean;
} 