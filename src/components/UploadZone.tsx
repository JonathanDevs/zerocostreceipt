/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, DragEvent, ChangeEvent, useEffect } from 'react';
import { Upload, FileImage, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Receipt } from '../types';

interface UploadZoneProps {
  onReceiptAdded: (receipt: Receipt) => void;
  customApiKey?: string;
}

interface UploadingFile {
  id: string;
  name: string;
  size: number;
  status: 'reading' | 'analyzing' | 'success' | 'error';
  progress: number;
  errorMsg?: string;
  thumbnail?: string;
}

export default function UploadZone({ onReceiptAdded, customApiKey }: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadQueueRef = useRef<UploadingFile[]>([]);

  useEffect(() => {
    uploadQueueRef.current = uploadQueue;
  }, [uploadQueue]);

  useEffect(() => {
    return () => {
      uploadQueueRef.current.forEach((file) => {
        if (file.thumbnail) {
          URL.revokeObjectURL(file.thumbnail);
        }
      });
    };
  }, []);

  // Helper helper to generate unique IDs
  const genId = () => Math.random().toString(36).substring(2, 11);

  // Handle drag events
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle dropped files
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  // Handle chosen files from explorer
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  // Convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Strip the data:image/...;base64, prefix
          const base64Data = reader.result.split(',')[1];
          resolve(base64Data);
        } else {
          reject(new Error('Formato de archivo inválido.'));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Process and upload files in parallel/queue
  const processFiles = (files: File[]) => {
    // Only accept image formats
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      alert('Por favor selecciona únicamente archivos de imagen (PNG, JPG, JPEG).');
      return;
    }

    imageFiles.forEach((file) => {
      const fileId = genId();
      const objectUrl = URL.createObjectURL(file);

      const newFileInQueue: UploadingFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        status: 'reading',
        progress: 10,
        thumbnail: objectUrl,
      };

      setUploadQueue(prev => [newFileInQueue, ...prev]);
      uploadIndividualFile(file, fileId);
    });
  };

  const uploadIndividualFile = async (file: File, fileId: string) => {
    try {
      // 1. Reading file bytes
      updateFileInQueue(fileId, { progress: 25, status: 'reading' });
      const base64Data = await fileToBase64(file);

      // 2. Querying Gemini
      updateFileInQueue(fileId, { progress: 50, status: 'analyzing' });

      // Build payload for server-side endpoint
      const payload = {
        image: {
          data: base64Data,
          mimeType: file.type,
        },
        customApiKey: customApiKey || undefined,
      };

      const response = await fetch('/api/process-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fallo procesando con Gemini.');
      }

      // Add a unique local ID and creation fields to the extracted receipt
      const processedReceipt: Receipt = {
        ...data,
        id: genId(), // generated locally
        imageUrl: undefined,
        createdAt: new Date().toISOString(),
      };

      onReceiptAdded(processedReceipt);
      
      updateFileInQueue(fileId, { progress: 100, status: 'success' });
    } catch (err: any) {
      console.error('Individual upload failed:', err);
      updateFileInQueue(fileId, {
        progress: 100,
        status: 'error',
        errorMsg: err?.message || 'Error en análisis por IA.',
      });
    }
  };

  const updateFileInQueue = (id: string, updates: Partial<UploadingFile>) => {
    setUploadQueue(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const clearQueue = () => {
    // Revoke object URLs to clear memory
    uploadQueue.forEach(f => {
      if (f.thumbnail) URL.revokeObjectURL(f.thumbnail);
    });
    setUploadQueue([]);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div id="upload-zone-wrapper" className="space-y-6">
      {/* Interactive Drag & Drop Box */}
      <div
        id="drag-drop-area"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 relative ${
          dragActive
            ? 'border-black bg-black/5 scale-[1.01]'
            : 'border-[#E5E7EB] dark:border-gray-700 hover:border-black hover:bg-neutral-50/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-[#F3F4F6] dark:bg-gray-700 rounded-full text-black border border-[#E5E7EB] dark:border-gray-700 shadow-xs">
            <Upload className="w-8 h-8 stroke-[1.8]" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-gray-100">
              Arrastra y suelta múltiples recibos de pago
            </p>
            <p className="text-xs text-[#6B7280] dark:text-gray-400 mt-1 font-semibold">
              Formatos soportados: PNG, JPG, JPEG (Subida masiva inteligente)
            </p>
          </div>
          <button
            type="button"
            className="px-6 py-2.5 bg-black hover:opacity-90 text-white rounded-full text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            Examinar Archivos
          </button>
        </div>
      </div>

      {/* Progress Queue Section */}
      {uploadQueue.length > 0 && (
        <div id="upload-queue-container" className="bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Cola de Procesamiento Masivo</h3>
              <p className="text-xs text-[#6B7280] dark:text-gray-400 mt-0.5 font-semibold">
                Procesando simultáneamente utilizando Gemini 1.5 Flash
              </p>
            </div>
            <button
              onClick={clearQueue}
              className="text-xs font-semibold text-neutral-700 dark:text-gray-300 hover:text-black bg-[#F3F4F6] dark:bg-gray-700 hover:bg-[#E5E7EB] dark:bg-gray-600 px-3.5 py-2 rounded-full transition-colors"
            >
              Limpiar Lista
            </button>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {uploadQueue.map((file) => {
              const labelStatus = {
                reading: 'Leyendo archivo...',
                analyzing: 'IA extrayendo datos...',
                success: 'Procesado con éxito',
                error: 'Error de extracción',
              };

              const colors = {
                reading: { text: 'text-amber-700 bg-amber-50', progressBg: 'bg-amber-400' },
                analyzing: { text: 'text-black bg-[#F3F4F6] dark:bg-gray-700', progressBg: 'bg-black' },
                success: { text: 'text-emerald-700 bg-emerald-50', progressBg: 'bg-emerald-500' },
                error: { text: 'text-red-700 bg-red-50', progressBg: 'bg-red-500' },
              };

              const currentTheme = colors[file.status];

              return (
                <div
                  key={file.id}
                  id={`queue-item-${file.id}`}
                  className="p-3.5 bg-[#F9FAFB] dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-600 dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 rounded-xl flex items-center gap-4 transition-all"
                >
                  {/* File Thumbnail Preview */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F3F4F6] dark:bg-gray-700 border border-[#E5E7EB] dark:border-gray-700 flex-shrink-0 relative">
                    {file.thumbnail ? (
                      <img
                        src={file.thumbnail}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <FileImage className="w-6 h-6 text-[#9CA3AF] dark:text-gray-500 absolute inset-0 m-auto" />
                    )}
                  </div>

                  {/* Processing Status & Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-gray-100 block truncate leading-tight">
                        {file.name}
                      </span>
                      <span className="text-[10px] text-[#6B7280] dark:text-gray-400 font-mono flex-shrink-0">
                        {formatSize(file.size)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#E5E7EB] dark:bg-gray-600 h-1.5 rounded-full overflow-hidden mb-1.5">
                      <div
                        className={`h-full transition-all duration-300 ${currentTheme.progressBg}`}
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>

                    {/* Badge and Messages */}
                    <div className="flex items-center justify-between leading-none">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 ${currentTheme.text}`}>
                        {file.status === 'analyzing' && <Loader2 className="w-2.5 h-2.5 animate-spin text-black" />}
                        {file.status === 'success' && <CheckCircle className="w-2.5 h-2.5" />}
                        {file.status === 'error' && <AlertCircle className="w-2.5 h-2.5" />}
                        {labelStatus[file.status]}
                      </span>
                      
                      {file.status === 'error' && file.errorMsg && (
                        <span className="text-[10px] text-red-500 font-semibold max-w-[200px] truncate block" title={file.errorMsg}>
                          {file.errorMsg}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
