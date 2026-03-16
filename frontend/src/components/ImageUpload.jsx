import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ImageUpload = ({ 
  value, 
  onChange, 
  label = 'Upload Image',
  error,
  isScanning = false 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange({
        file,
        preview: e.target.result,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <AnimatePresence mode="wait">
        {!value ? (
          <motion.div
            key="upload-area"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-2xl p-8 
              cursor-pointer transition-all duration-300
              ${isDragging 
                ? 'border-primary-500 bg-primary-50' 
                : error 
                  ? 'border-red-300 hover:border-red-400' 
                  : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="flex flex-col items-center text-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className={`
                  w-16 h-16 rounded-2xl flex items-center justify-center mb-4
                  ${isDragging ? 'bg-primary-500' : 'bg-gray-100'}
                `}
              >
                <svg 
                  className={`w-8 h-8 ${isDragging ? 'text-white' : 'text-gray-400'}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                  />
                </svg>
              </motion.div>
              
              <p className="text-gray-700 font-medium mb-1">
                {isDragging ? 'Drop your image here' : 'Drag and drop your image here'}
              </p>
              <p className="text-gray-400 text-sm">
                or click to browse
              </p>
              <p className="text-gray-300 text-xs mt-2">
                JPG, PNG, WebP up to 10MB
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`
              relative rounded-2xl overflow-hidden
              ${isScanning ? 'match-glow' : ''}
            `}
          >
            {/* Image Preview */}
            <img
              src={value.preview}
              alt="Preview"
              className="w-full h-64 object-cover"
            />
            
            {/* Scanning Overlay */}
            {isScanning && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary-400 to-transparent ai-scan-line" />
                </div>
                <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-xl flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full"
                  />
                  <span className="text-gray-800 font-medium">AI Scanning...</span>
                </div>
              </div>
            )}
            
            {/* Remove Button */}
            {!isScanning && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleRemove}
                className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            )}
            
            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
              <p className="text-white text-sm font-medium truncate">{value.name}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
};

export default ImageUpload;
