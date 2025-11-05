'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import ProductForm from '../../../../../components/products/ProductForm'
import FileUpload from '../../../../../components/products/FileUpload'
import { productApi, Product, ProductFormData } from '../../../../../lib/product-api'
import { authApi } from '../../../../../lib/auth-api'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'details' | 'images' | 'documents'>('details')

  // Check authentication and fetch product
  useEffect(() => {
    const checkAuthAndFetchProduct = async () => {
      try {
        // Check authentication
        const authResponse = await authApi.getCurrentUser()
        if (!authResponse.success || !authResponse.data) {
          router.push('/auth/login')
          return
        }
        
        if (authResponse.data.user.role !== 'seller') {
          router.push('/')
          return
        }

        // Fetch product
        const productResponse = await productApi.getProduct(productId)
        if (productResponse.success && productResponse.data) {
          const productData = productResponse.data as Product
          
          // Check if user owns this product
          if (productData.sellerId !== authResponse.data.user._id) {
            router.push('/seller/products')
            return
          }
          
          setProduct(productData)
        } else {
          setError(productResponse.error || 'Product not found')
        }
      } catch (error) {
        console.error('Error:', error)
        setError('Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      checkAuthAndFetchProduct()
    }
  }, [productId, router])

  const handleProductUpdate = async (formData: ProductFormData) => {
    if (!product) return

    try {
      setIsLoading(true)
      const response = await productApi.updateProduct(product._id, formData)
      
      if (response.success && response.data) {
        setProduct(response.data as Product)
        alert('Product updated successfully!')
      } else {
        alert(response.error || 'Failed to update product')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Failed to update product')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (files: File[]) => {
    if (!product) return

    try {
      const response = await productApi.uploadImages(product._id, files)
      if (response.success && response.data) {
        setProduct(response.data as Product)
      } else {
        alert(response.error || 'Failed to upload images')
      }
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('Failed to upload images')
    }
  }

  const handleDocumentUpload = async (files: File[]) => {
    if (!product) return

    try {
      const response = await productApi.uploadDocuments(product._id, files)
      if (response.success && response.data) {
        setProduct(response.data as Product)
      } else {
        alert(response.error || 'Failed to upload documents')
      }
    } catch (error) {
      console.error('Error uploading documents:', error)
      alert('Failed to upload documents')
    }
  }

  const handleImageRemove = async (imageUrl: string) => {
    if (!product) return

    try {
      const response = await productApi.removeImage(product._id, imageUrl)
      if (response.success && response.data) {
        setProduct(response.data as Product)
      } else {
        alert(response.error || 'Failed to remove image')
      }
    } catch (error) {
      console.error('Error removing image:', error)
      alert('Failed to remove image')
    }
  }

  const handleDocumentRemove = async (documentUrl: string) => {
    if (!product) return

    try {
      const response = await productApi.removeDocument(product._id, documentUrl)
      if (response.success && response.data) {
        setProduct(response.data as Product)
      } else {
        alert(response.error || 'Failed to remove document')
      }
    } catch (error) {
      console.error('Error removing document:', error)
      alert('Failed to remove document')
    }
  }

  const handleCancel = () => {
    router.push('/seller/products')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
          <p className="mt-1 text-sm text-gray-500">{error || 'Product not found'}</p>
          <div className="mt-6">
            <Link
              href="/seller/products"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    )
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
                  <span className="ml-1 text-gray-500 md:ml-2">Edit Product</span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
              <p className="mt-2 text-gray-600">
                Update "{product.title}" information and files
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                href={`/products/${product._id}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview Product
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'details'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Product Details
              </button>
              <button
                onClick={() => setActiveTab('images')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'images'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Images ({product.images?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'documents'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Documents ({product.documents?.length || 0})
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <ProductForm
            product={product}
            onSubmit={handleProductUpdate}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'images' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <FileUpload
              type="images"
              existingFiles={product.images || []}
              onUpload={handleImageUpload}
              onRemove={handleImageRemove}
              maxFiles={10}
            />
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <FileUpload
              type="documents"
              existingFiles={product.documents || []}
              onUpload={handleDocumentUpload}
              onRemove={handleDocumentRemove}
              maxFiles={5}
            />
          </div>
        )}

        {/* Product Status */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Product Status</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Status: <span className={`font-medium ${product.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Created: {new Date(product.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/products/${product._id}`}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Public Page
              </Link>
              <Link
                href="/seller/products"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}