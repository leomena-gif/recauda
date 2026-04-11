import React, { forwardRef } from 'react';
import styles from './Input.module.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | boolean;
  hint?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      prefixIcon,
      suffixIcon,
      containerClassName = '',
      labelClassName = '',
      inputClassName = '',
      fullWidth = true,
      className, // Fallback for standard users
      id,
      ...props
    },
    ref
  ) => {
    // Generate an ID if not provided, for a11y linking label + input
    const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
    const hasError = !!error;

    return (
      <div className={`${styles.container} ${fullWidth ? styles.fullWidth : ''} ${hasError ? styles.hasError : ''} ${containerClassName}`}>
        {label && (
          <label htmlFor={inputId} className={`${styles.label} ${labelClassName}`}>
            {label}
          </label>
        )}
        
        <div className={styles.inputWrapper}>
          {prefixIcon && <div className={styles.prefix}>{prefixIcon}</div>}
          
          <input
            ref={ref}
            id={inputId}
            className={`${styles.input} ${prefixIcon ? styles.withPrefix : ''} ${suffixIcon ? styles.withSuffix : ''} ${className || ''} ${inputClassName}`}
            aria-invalid={hasError}
            aria-describedby={
              hasError && typeof error === 'string'
                ? `${inputId}-error`
                : hint
                ? `${inputId}-hint`
                : undefined
            }
            {...props}
          />

          {suffixIcon && <div className={styles.suffix}>{suffixIcon}</div>}
        </div>

        {hasError && typeof error === 'string' && (
          <p id={`${inputId}-error`} className={styles.errorText} role="alert">
            {error}
          </p>
        )}

        {!hasError && hint && (
          <p id={`${inputId}-hint`} className={styles.hintText}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
