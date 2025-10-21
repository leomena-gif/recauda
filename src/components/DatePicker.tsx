'use client';

import React, { forwardRef } from 'react';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import './DatePickerGlobal.css';
import styles from './DatePicker.module.css';

// Registrar el locale en español
registerLocale('es', es);

interface DatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ selected, onChange, placeholder = 'DD/MM/AA', error, disabled }, ref) => {
    return (
      <div className={styles.datePickerWrapper}>
        <ReactDatePicker
          selected={selected}
          onChange={onChange}
          dateFormat="dd/MM/yy"
          placeholderText={placeholder}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          disabled={disabled}
          showPopperArrow={false}
          wrapperClassName={styles.wrapper}
          locale="es"
        />
        <svg className={styles.calendarIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
          <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
          <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
          <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export default DatePicker;

