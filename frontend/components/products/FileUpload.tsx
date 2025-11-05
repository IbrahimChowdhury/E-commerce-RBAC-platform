'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

interface FileUploadProps {
  type: 'images' | 'documents'
  existingFiles?: string[]
  onUpload: (files: File[]) => Promise<void>
  onRemove?: (fileUrl: string) => Promise<void>
  isLoading?: boolean
  maxFiles?: number
}

export default function FileUpload({
  type,
  existingFiles = [],
  onUpload,
  onRemove,
  isLoading = false,
  maxFiles = type === 'images' ? 10 : 5
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isImage = type === 'images'
  const acceptedTypes = isImage 
    ? 'image/jpeg,image/jpg,image/png,image/webp' 
    : 'application/pdf'
  const maxFileSize = isImage ? 5 * 1024 * 1024 : 10 * 1024 * 1024 // 5MB for images, 10MB for PDFs

  const validateFile = (file: File): string | null => {
    if (isImage) {
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        return 'Only JPEG, PNG, and WebP images are allowed'
      }
    } else {
      if (file.type !== 'application/pdf') {
        return 'Only PDF files are allowed'
      }
    }

    if (file.size > maxFileSize) {
      const maxSizeMB = maxFileSize / (1024 * 1024)
      return `File size must be less than ${maxSizeMB}MB`
    }

    return null
  }

  const handleFiles = (files: FileList) => {
    const fileArray = Array.from(files)
    const validFiles: File[] = []
    const errors: string[] = []

    // Check total file count
    if (existingFiles.length + selectedFiles.length + fileArray.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`)
      return
    }

    fileArray.forEach(file => {
      const error = validateFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
      } else {
        validFiles.push(file)
      }
    })

    if (errors.length > 0) {
      alert(errors.join('\n'))
      return
    }

    setSelectedFiles(prev => [...prev, ...validFiles])

    // Create preview URLs for images
    if (isImage) {
      validFiles.forEach(file => {
        const url = URL.createObjectURL(file)
        setPreviewUrls(prev => [...prev, url])
      })
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    if (isImage) {
      URL.revokeObjectURL(previewUrls[index])
      setPreviewUrls(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    try {
      await onUpload(selectedFiles)
      setSelectedFiles([])
      setPreviewUrls([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Upload error:', error)
    }
  }

  const handleRemoveExisting = async (fileUrl: string) => {
    if (onRemove) {
      try {
        await onRemove(fileUrl)
      } catch (error) {
        console.error('Remove error:', error)
        alert('Failed to remove file. Please try again.')
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          {isImage ? 'Product Images' : 'Product Documents'}
        </h3>
        <span className="text-sm text-gray-500">
          {existingFiles.length + selectedFiles.length}/{maxFiles} files
        </span>
      </div>

      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Current Files</h4>
          <div className={`grid gap-4 ${isImage ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1'}`}>
            {existingFiles.map((fileUrl, index) => (
              <div key={index} className="relative group">
                {isImage ? (
                  <div className="relative h-24 w-full">
                    <Image
                      src={fileUrl}
                      alt={`Product image ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                    {onRemove && (
                      <button
                        onClick={() => handleRemoveExisting(fileUrl)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <svg className="w-8 h-8 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Document {index + 1}</p>
                      <p className="text-xs text-gray-500">PDF File</p>
                    </div>
                    {onRemove && (
                      <button
                        onClick={() => handleRemoveExisting(fileUrl)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Upload Area */}
      {existingFiles.length + selectedFiles.length < maxFiles && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-4">
              <label htmlFor={`file-upload-${type}`} className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Drop {isImage ? 'images' : 'PDF files'} here or{' '}
                  <span className="text-blue-600 hover:text-blue-500">browse</span>
                </span>
                <input
                  ref={fileInputRef}
                  id={`file-upload-${type}`}
                  name={`file-upload-${type}`}
                  type="file"
                  className="sr-only"
                  multiple
                  accept={acceptedTypes}
                  onChange={handleFileInput}
                />
              </label>
              <p className="mt-1 text-xs text-gray-500">
                {isImage 
                  ? 'PNG, JPG, WebP up to 5MB each'
                  : 'PDF files up to 10MB each'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Selected Files</h4>
          <div className={`grid gap-4 ${isImage ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1'}`}>
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative group">
                {isImage ? (
                  <div className="relative h-24 w-full">
                    <Image
                      src={previewUrls[index]}
                      alt={file.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeSelectedFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <svg className="w-8 h-8 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      onClick={() => removeSelectedFile(index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={isLoading || selectedFiles.length === 0}
            className={`w-full px-4 py-2 rounded-md text-sm font-medium ${
              isLoading || selectedFiles.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : (
              `Upload ${selectedFiles.length} ${isImage ? 'Image' : 'Document'}${selectedFiles.length > 1 ? 's' : ''}`
            )}
          </button>
        </div>
      )}
    </div>
  )
}