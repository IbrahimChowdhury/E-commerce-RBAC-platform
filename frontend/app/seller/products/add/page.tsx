'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ProductForm from '../../../../components/products/ProductForm'
import FileUpload from '../../../../components/products/FileUpload'
import { productApi, ProductFormData } from '../../../../lib/product-api'
import { authApi } from '../../../../lib/auth-api'

export default function AddProductPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<any>(null)
  const [step, setStep] = useState<'form' | 'files'>('form')

  // Check authentication and role
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authApi.getCurrentUser()
        if (!response.success || !response.data) {
          router.push('/auth/login')
          return
        }
        
        if (response.data.user.role !== 'seller') {
          router.push('/')
          return
        }
      } catch (error) {
        router.push('/auth/login')
      }
    }

    checkAuth()
  }, [router])

  const handleProductSubmit = async (formData: ProductFormData) => {
    try {
      setIsLoading(true)
      const response = await productApi.createProduct(formData)
      
      if (response.success && response.data) {
        setCurrentProduct(response.data)
        setStep('files')
      } else {
        alert(response.error || 'Failed to create product')
      }
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Failed to create product')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (files: File[]) => {
    if (!currentProduct) return

    try {
      const response = await productApi.uploadImages(currentProduct._id, files)
      if (response.success && response.data) {
        setCurrentProduct(response.data)
      } else {
        alert(response.error || 'Failed to upload images')
      }
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('Failed to upload images')
    }
  }

  const handleDocumentUpload = async (files: File[]) => {
    if (!currentProduct) return

    try {
      const response = await productApi.uploadDocuments(currentProduct._id, files)
      if (response.success && response.data) {
        setCurrentProduct(response.data)
      } else {
        alert(response.error || 'Failed to upload documents')
      }
    } catch (error) {
      console.error('Error uploading documents:', error)
      alert('Failed to upload documents')
    }
  }

  const handleCancel = () => {
    router.push('/seller/products')
  }

  const handleFinish = () => {
    router.push('/seller/products')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/seller/products" className="text-gray-700 hover:text-blue-600">
                  My Products
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="ml-1 text-gray-500 md:ml-2">Add Product</span>
                </div>
              </li>
            </ol>
          </nav>

          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="mt-2 text-gray-600">
            Create a new product listing for your store
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className={`flex items-center ${step === 'form' ? 'text-blue-600' : 'text-green-600'}`}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                step === 'form' 
                  ? 'border-blue-600 bg-blue-600 text-white' 
                  : 'border-green-600 bg-green-600 text-white'
              }`}>
                {step === 'form' ? '1' : '✓'}
              </div>
              <span className="ml-2 text-sm font-medium">Product Details</span>
            </div>
            
            <div className={`flex-1 h-0.5 mx-4 ${step === 'files' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            
            <div className={`flex items-center ${step === 'files' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                step === 'files' 
                  ? 'border-blue-600 bg-blue-600 text-white' 
                  : 'border-gray-300 bg-white text-gray-400'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Images & Documents</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {step === 'form' ? (
          <ProductForm
            onSubmit={handleProductSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Upload Files</h2>
              <p className="text-gray-600 mt-1">
                Add images and documents for your product "{currentProduct?.title}"
              </p>
            </div>

            <div className="space-y-8">
              {/* Image Upload */}
              <FileUpload
                type="images"
                existingFiles={currentProduct?.images || []}
                onUpload={handleImageUpload}
                maxFiles={10}
              />

              {/* Document Upload */}
              <FileUpload
                type="documents"
                existingFiles={currentProduct?.documents || []}
                onUpload={handleDocumentUpload}
                maxFiles={5}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t border-gray-200 mt-8">
              <button
                onClick={() => setStep('form')}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Details
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Finish & View Products
              </button>
            </div>

            {/* Skip Option */}
            <div className="text-center mt-4">
              <button
                onClick={handleFinish}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Skip file upload for now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}