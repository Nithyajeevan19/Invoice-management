export const parseImageFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const dataUrl = e.target.result;
        const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
        
        console.log('🖼️ Image processed:', {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          base64Length: base64Data.length,
          sizeInMB: (file.size / (1024 * 1024)).toFixed(2),
        });
        
        resolve({
          base64Data,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          textContent: '', // Images need Vision API
        });
      } catch (error) {
        console.error('❌ Image parsing failed:', error);
        reject(new Error(`Image parsing failed: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      console.error('❌ Failed to read image file');
      reject(new Error('Failed to read image file'));
    };
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
