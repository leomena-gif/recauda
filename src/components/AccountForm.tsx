'use client';

import React, { useState } from 'react';
import styles from './AccountForm.module.css';

interface FormData {
  organization: string;
  name: string;
  phone: string;
}

interface FormErrors {
  organization?: boolean;
  name?: boolean;
  phone?: boolean;
}

const AccountForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    organization: '',
    name: '',
    phone: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Remove error state when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: false,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset all errors
    const newErrors: FormErrors = {};

    // Check each required field
    if (!formData.organization.trim()) {
      newErrors.organization = true;
    }

    if (!formData.name.trim()) {
      newErrors.name = true;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = true;
    }

    setErrors(newErrors);

    // If no errors, show success message
    if (Object.keys(newErrors).length === 0) {
      alert('Formulario enviado correctamente');
    }
  };

  return (
    <div className={styles.formContainer}>
      <h1 className={styles.formTitle}>Crear cuenta</h1>
      <p className={styles.formSubtitle}>
        Completa los siguientes datos para crear tu cuenta
      </p>

      <form className={styles.accountForm} onSubmit={handleSubmit}>
        <div className={`${styles.formGroup} ${errors.organization ? styles.error : ''}`}>
          <label htmlFor="organization" className={styles.formLabel}>
            Nombre de la organización
          </label>
          <input
            type="text"
            id="organization"
            name="organization"
            className={styles.formInput}
            placeholder="Ej: Club Deportivo San Martín"
            value={formData.organization}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={`${styles.formGroup} ${errors.name ? styles.error : ''}`}>
          <label htmlFor="name" className={styles.formLabel}>
            Tu nombre
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className={styles.formInput}
            placeholder="Ej: María González"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={`${styles.formGroup} ${errors.phone ? styles.error : ''}`}>
          <label htmlFor="phone" className={styles.formLabel}>
            Tu teléfono
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className={styles.formInput}
            placeholder="Ej: 3584129488"
            aria-describedby="phone-helper"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
          <p id="phone-helper" className={styles.phoneInstruction}>
            Escribe el número sin 0 y sin 15
          </p>
        </div>

        <button type="submit" className={styles.submitButton}>
          Ingresar
        </button>
      </form>
    </div>
  );
};

export default AccountForm;
