export const parsePDFFile = async (file) => {
  return new Promise((resolve, reject) => {
    if (!file || file.type !== 'application/pdf') {
      reject(new Error('Invalid PDF file'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
          throw new Error('PDF file is empty');
        }

        const base64 = arrayBufferToBase64(arrayBuffer);
        if (!base64) {
          throw new Error('Failed to convert PDF to base64');
        }

        console.log('📄 PDF processed:', {
          fileName: file.name,
          fileSize: file.size,
          base64Length: base64.length,
        });
        
        resolve({
          base64Data: base64,
          fileName: file.name,
          fileSize: file.size,
          textContent: '', // Empty string since we'll use Vision API
        });
      } catch (error) {
        console.error('PDF parsing error:', error);
        reject(new Error(`PDF parsing failed: ${error.message}`));
      }
    };
    
    reader.onerror = (error) => {
      console.error('Failed to read PDF:', error);
      reject(new Error('Failed to read PDF file'));
    };
    reader.readAsArrayBuffer(file);
  });
};

const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};
