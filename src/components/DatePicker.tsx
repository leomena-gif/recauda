'use client';

import React, { forwardRef } from 'react';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';
import { Calendar } from 'lucide-react';
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
        <Calendar className={styles.calendarIcon} size={20} strokeWidth={2} />
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export default DatePicker;

