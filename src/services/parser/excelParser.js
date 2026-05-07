import * as XLSX from 'xlsx';

export const parseExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const textContent = convertExcelToText(jsonData);
        
        resolve({
          rawData: jsonData,
          textContent,
          sheetNames: workbook.SheetNames,
        });
      } catch (error) {
        reject(new Error(`Excel parsing failed: ${error.message}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read Excel file'));
    reader.readAsArrayBuffer(file);
  });
};

const convertExcelToText = (data) => {
  if (!data || data.length === 0) return '';
  
  let text = 'EXCEL DATA:\n\n';
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    text += `Row ${i}:\n`;
    
    for (let j = 0; j < headers.length; j++) {
      if (row[j] !== undefined && row[j] !== null) {
        text += `  ${headers[j]}: ${row[j]}\n`;
      }
    }
    text += '\n';
  }
  
  return text;
};
