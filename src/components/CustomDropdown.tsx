'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import styles from './CustomDropdown.module.css';

interface Option {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  alignRight?: boolean; // Align dropdown menu to the right
}

export default function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  alignRight = false
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      <button
        type="button"
        className={`${styles.dropdownButton} ${isOpen ? styles.dropdownButtonActive : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={styles.dropdownValue}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`${styles.dropdownArrow} ${isOpen ? styles.dropdownArrowOpen : ''}`}
          size={16}
          strokeWidth={2}
        />
      </button>

      {isOpen && (
        <ul
          className={`${styles.dropdownMenu} ${alignRight ? styles.dropdownMenuRight : ''}`}
          role="listbox"
        >
          {options.map((option) => (
            <li
              key={option.value}
              className={`${styles.dropdownOption} ${option.value === value ? styles.dropdownOptionSelected : ''
                }`}
              onClick={() => handleOptionClick(option.value)}
              role="option"
              aria-selected={option.value === value}
            >
              {option.label}
              {option.value === value && (
                <Check
                  className={styles.checkIcon}
                  size={16}
                  strokeWidth={2}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

