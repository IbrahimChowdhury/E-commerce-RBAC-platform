'use client'

import React from 'react'

interface FormFieldProps {
  label: string
  id: string
  type?: string
  register?: any
  error?: string
  placeholder?: string
  required?: boolean
  children?: React.ReactNode
  className?: string
}

export function FormField({
  label,
  id,
  type = 'text',
  register,
  error,
  placeholder,
  required,
  children,
  className = ''
}: FormFieldProps) {
  const baseInputClasses = `
    appearance-none relative block w-full px-3 py-3 sm:py-2 border 
    placeholder-gray-500 text-black bg-gray-100 rounded-md 
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
    focus:z-10 text-sm sm:text-base focus:bg-white transition-colors
  `
  
  const errorInputClasses = error ? 'border-red-300 ring-red-300' : 'border-gray-300'

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {children || (
        <input
          id={id}
          type={type}
          {...(register ? register : {})}
          className={`${baseInputClasses} ${errorInputClasses}`}
          placeholder={placeholder}
          style={{ color: '#000000', backgroundColor: '#F5F5F5' }}
        />
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center animate-fadeIn">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

interface FormSelectProps {
  label: string
  id: string
  register?: any
  error?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export function FormSelect({
  label,
  id,
  register,
  error,
  required,
  children,
  className = ''
}: FormSelectProps) {
  const baseSelectClasses = `
    block w-full px-3 py-3 sm:py-2 border rounded-md 
    shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
    focus:border-blue-500 text-sm sm:text-base transition-colors
  `
  
  const errorSelectClasses = error ? 'border-red-300 ring-red-300' : 'border-gray-300'

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <select
        id={id}
        {...(register ? register : {})}
        className={`${baseSelectClasses} ${errorSelectClasses}`}
        style={{ color: '#000000', backgroundColor: '#F5F5F5' }}
      >
        {children}
      </select>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center animate-fadeIn">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

interface FormGroupProps {
  children: React.ReactNode
  className?: string
}

export function FormGroup({ children, className = '' }: FormGroupProps) {
  return (
    <div className={`space-y-3 sm:space-y-4 ${className}`}>
      {children}
    </div>
  )
}

interface FormContainerProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  className?: string
  onSubmit?: (e: React.FormEvent) => void
}

export function FormContainer({
  children,
  title,
  subtitle,
  className = '',
  onSubmit
}: FormContainerProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div>
          <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
            {title}
          </h2>
          {subtitle && (
            <div className="mt-2 text-center text-sm text-gray-600">
              {subtitle}
            </div>
          )}
        </div>

        <form className={`mt-6 sm:mt-8 space-y-4 sm:space-y-6 ${className}`} onSubmit={onSubmit}>
          {children}
        </form>
      </div>
    </div>
  )
}

interface PasswordStrengthIndicatorProps {
  password: string
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const getStrength = (password: string) => {
    let score = 0
    if (password.length >= 8) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return score
  }

  const strength = getStrength(password)
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']

  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex space-x-1 mb-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded ${
              level <= strength ? strengthColors[strength - 1] : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-600">
        Password strength: {strengthLabels[strength - 1] || 'Enter password'}
      </p>
    </div>
  )
}