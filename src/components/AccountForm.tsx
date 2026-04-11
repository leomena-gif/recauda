'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './AccountForm.module.css';
import Button from './Button';
import Input from '@/components/Input';

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
  const router = useRouter();

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

    // If no errors, navigate to home
    if (Object.keys(newErrors).length === 0) {
      // Simular creación exitosa de cuenta
      router.push('/');
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  return (
    <div className={styles.formContainer}>
      <h1 className={styles.formTitle}>Crear cuenta</h1>
      <p className={styles.formSubtitle}>
        Completa los siguientes datos para crear tu cuenta
      </p>

      <form className={styles.accountForm} onSubmit={handleSubmit}>
        <Input
          label="Nombre de la organización"
          type="text"
          id="organization"
          name="organization"
          placeholder="Ej: Club Deportivo San Martín"
          value={formData.organization}
          onChange={handleInputChange}
          required
          error={errors.organization ? "La organización es requerida" : undefined}
        />

        <Input
          label="Tu nombre"
          type="text"
          id="name"
          name="name"
          placeholder="Ej: María González"
          value={formData.name}
          onChange={handleInputChange}
          required
          error={errors.name ? "El nombre es requerido" : undefined}
        />

        <Input
          label="Tu teléfono"
          type="tel"
          id="phone"
          name="phone"
          placeholder="Ej: 3584129488"
          value={formData.phone}
          onChange={handleInputChange}
          required
          error={errors.phone ? "El teléfono es requerido" : undefined}
          hint="Escribe el número sin 0 y sin 15"
        />

        <Button type="submit" variant="primary" size="lg" fullWidth className={styles.submitButton}>
          Crear cuenta
        </Button>
      </form>

      <div className={styles.divider}>
        <span>¿Ya tienes cuenta?</span>
      </div>

      <Button
        type="button"
        variant="secondary"
        size="lg"
        fullWidth
        onClick={handleBackToLogin}
      >
        Iniciar sesión
      </Button>
    </div>
  );
};

export default AccountForm;

