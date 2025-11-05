'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { CartIcon } from '@/components'

interface User {
  _id: string
  name: string
  email: string
  role: 'admin' | 'seller' | 'buyer'
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in by checking localStorage or making API call
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/')
  }

  const renderNavLinks = () => {
    if (!user) {
      return (
        <div className="flex items-center space-x-2">
          <Link 
            href="/products" 
            className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Browse Products
          </Link>
          <Link 
            href="/auth/login" 
            className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium transition-colors border border-gray-300"
          >
            Login
          </Link>
          <Link 
            href="/auth/register" 
            className="bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm"
          >
            Sign Up
          </Link>
        </div>
      )
    }

    // Role-based navigation
    const commonLinks = (
      <>
        <Link 
          href="/products" 
          className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Products
        </Link>
      </>
    )

    const roleSpecificLinks = () => {
      switch (user.role) {
        case 'admin':
          return (
            <>
              {commonLinks}
              <Link 
                href="/admin/dashboard" 
                className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </Link>
              <Link 
                href="/admin/users" 
                className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Users
              </Link>
            </>
          )
        case 'seller':
          return (
            <>
              {commonLinks}
              <Link 
                href="/seller/products" 
                className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                My Products
              </Link>
              <Link 
                href="/seller/orders" 
                className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Orders
              </Link>
            </>
          )
        case 'buyer':
          return (
            <>
              {commonLinks}
              <CartIcon />
              <Link 
                href="/orders" 
                className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                My Orders
              </Link>
            </>
          )
        default:
          return commonLinks
      }
    }

    return (
      <div className="flex items-center space-x-4">
        {roleSpecificLinks()}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-200"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-gray-500 capitalize">{user.role}</div>
            </div>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="font-medium text-gray-900">{user.name}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
                <div className="mt-1 inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded capitalize">
                  {user.role}
                </div>
              </div>
              <Link 
                href="/profile" 
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl shadow-sm">
                E
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  E-Commerce
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Shop & Sell</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {renderNavLinks()}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              {user ? (
                <>
                  <div className="px-3 py-2 text-sm text-gray-500">
                    Welcome, {user.name}
                  </div>
                  {user.role === 'admin' && (
                    <>
                      <Link href="/admin/dashboard" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                        Admin Dashboard
                      </Link>
                      <Link href="/admin/users" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                        Manage Users
                      </Link>
                    </>
                  )}
                  {user.role === 'seller' && (
                    <>
                      <Link href="/seller/products" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                        My Products
                      </Link>
                      <Link href="/seller/orders" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                        Orders
                      </Link>
                    </>
                  )}
                  {user.role === 'buyer' && (
                    <>
                      <Link href="/cart" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                        Cart
                      </Link>
                      <Link href="/orders" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                        My Orders
                      </Link>
                    </>
                  )}
                  <Link href="/products" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                    Products
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                    Login
                  </Link>
                  <Link href="/auth/register" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}