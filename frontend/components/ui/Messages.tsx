'use client'

import React from 'react'

interface ErrorMessageProps {
  error?: string | string[]
  className?: string
}

export function ErrorMessage({ error, className = '' }: ErrorMessageProps) {
  if (!error) return null

  const errors = Array.isArray(error) ? error : [error]

  return (
    <div className={`mt-1 ${className}`}>
      {errors.map((err, index) => (
        <p key={index} className="text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {err}
        </p>
      ))}
    </div>
  )
}

interface SuccessMessageProps {
  message?: string
  className?: string
}

export function SuccessMessage({ message, className = '' }: SuccessMessageProps) {
  if (!message) return null

  return (
    <div className={`mt-1 ${className}`}>
      <p className="text-sm text-green-600 flex items-center">
        <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        {message}
      </p>
    </div>
  )
}

interface InfoMessageProps {
  message?: string
  className?: string
}

export function InfoMessage({ message, className = '' }: InfoMessageProps) {
  if (!message) return null

  return (
    <div className={`mt-1 ${className}`}>
      <p className="text-sm text-blue-600 flex items-center">
        <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        {message}
      </p>
    </div>
  )
}

interface WarningMessageProps {
  message?: string
  className?: string
}

export function WarningMessage({ message, className = '' }: WarningMessageProps) {
  if (!message) return null

  return (
    <div className={`mt-1 ${className}`}>
      <p className="text-sm text-yellow-600 flex items-center">
        <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {message}
      </p>
    </div>
  )
}