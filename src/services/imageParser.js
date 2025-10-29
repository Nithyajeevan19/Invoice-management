export const parseImageFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const base64Data = e.target.result.split(',')[1];
        
        resolve({
          base64Data,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          textContent: 'Image file - will be processed by Gemini Vision API',
        });
      } catch (error) {
        reject(new Error(`Image parsing failed: ${error.message}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
};

export const validateImageFile = (file) => {
  const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!supportedFormats.includes(file.type)) {
    throw new Error(
      `Unsupported image format: ${file.type}. Supported: ${supportedFormats.join(', ')}`
    );
  }
  
  const maxSize = 4 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('Image file too large. Maximum size: 4MB');
  }
  
  return true;
};
