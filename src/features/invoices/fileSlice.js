import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  uploadedFiles: [],
  currentFile: null,
  processing: false,
  progress: 0,
  error: null,
};

const fileSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    setCurrentFile: (state, action) => {
      state.currentFile = action.payload;
    },
    
    setProcessing: (state, action) => {
      state.processing = action.payload;
    },
    
    setProgress: (state, action) => {
      state.progress = action.payload;
    },
    
    addUploadedFile: (state, action) => {
      state.uploadedFiles.push({
        ...action.payload,
        uploadedAt: new Date().toISOString(),
      });
    },
    
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    resetFileState: (state) => {
      state.currentFile = null;
      state.processing = false;
      state.progress = 0;
      state.error = null;
    },
  },
});

export const {
  setCurrentFile,
  setProcessing,
  setProgress,
  addUploadedFile,
  setError,
  clearError,
  resetFileState,
} = fileSlice.actions;

export default fileSlice.reducer;
