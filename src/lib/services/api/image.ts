/**
 * Image Processing Service
 * 
 * This service provides functions for image processing.
 */

/**
 * Get image dimensions from a URL
 * 
 * @param url Image URL
 * @returns Promise that resolves to image dimensions
 */
export function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

/**
 * Create a thumbnail from an image URL
 * 
 * @param imageUrl Image URL
 * @param maxWidth Maximum width of the thumbnail
 * @param maxHeight Maximum height of the thumbnail
 * @returns Promise that resolves to thumbnail URL
 */
export function createThumbnail(
  imageUrl: string,
  maxWidth: number = 400,
  maxHeight: number = 300
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Calculate dimensions
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      // Draw image
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Get data URL
      const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
      resolve(thumbnailUrl);
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = imageUrl;
  });
}

/**
 * Apply a simple filter to an image
 * 
 * @param imageUrl Image URL
 * @param filter Filter to apply ('grayscale', 'sepia', 'invert', 'blur')
 * @param intensity Filter intensity (0-1)
 * @returns Promise that resolves to filtered image URL
 */
export function applyFilter(
  imageUrl: string,
  filter: 'grayscale' | 'sepia' | 'invert' | 'blur',
  intensity: number = 1
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      
      // Apply filter
      switch (filter) {
        case 'grayscale':
          applyGrayscale(ctx, img.width, img.height, intensity);
          break;
        case 'sepia':
          applySepia(ctx, img.width, img.height, intensity);
          break;
        case 'invert':
          applyInvert(ctx, img.width, img.height, intensity);
          break;
        case 'blur':
          applyBlur(ctx, img.width, img.height, intensity * 10);
          break;
      }
      
      // Get data URL
      const filteredUrl = canvas.toDataURL('image/jpeg', 0.9);
      resolve(filteredUrl);
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = imageUrl;
  });
}

/**
 * Apply grayscale filter to canvas
 */
function applyGrayscale(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number
): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Calculate grayscale value
    const gray = 0.3 * r + 0.59 * g + 0.11 * b;
    
    // Apply intensity
    data[i] = r * (1 - intensity) + gray * intensity;
    data[i + 1] = g * (1 - intensity) + gray * intensity;
    data[i + 2] = b * (1 - intensity) + gray * intensity;
  }
  
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Apply sepia filter to canvas
 */
function applySepia(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number
): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Calculate sepia values
    const sr = 0.393 * r + 0.769 * g + 0.189 * b;
    const sg = 0.349 * r + 0.686 * g + 0.168 * b;
    const sb = 0.272 * r + 0.534 * g + 0.131 * b;
    
    // Apply intensity
    data[i] = r * (1 - intensity) + sr * intensity;
    data[i + 1] = g * (1 - intensity) + sg * intensity;
    data[i + 2] = b * (1 - intensity) + sb * intensity;
  }
  
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Apply invert filter to canvas
 */
function applyInvert(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number
): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    // Apply intensity
    data[i] = data[i] * (1 - intensity) + (255 - data[i]) * intensity;
    data[i + 1] = data[i + 1] * (1 - intensity) + (255 - data[i + 1]) * intensity;
    data[i + 2] = data[i + 2] * (1 - intensity) + (255 - data[i + 2]) * intensity;
  }
  
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Apply blur filter to canvas
 */
function applyBlur(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  radius: number
): void {
  // Simple box blur
  ctx.filter = `blur(${radius}px)`;
  const imageData = ctx.getImageData(0, 0, width, height);
  ctx.clearRect(0, 0, width, height);
  ctx.putImageData(imageData, 0, 0);
} 