'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './LoginForm.module.css';
import Button from './Button';
import Input from '@/components/Input';

interface LoginData {
  phone: string;
}

interface LoginErrors {
  phone?: boolean;
}

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginData>({
    phone: '',
  });

  const [errors, setErrors] = useState<LoginErrors>({});
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Remove error state when user starts typing
    if (errors[name as keyof LoginErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: false,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset all errors
    const newErrors: LoginErrors = {};

    // Check required field
    if (!formData.phone.trim()) {
      newErrors.phone = true;
    }

    setErrors(newErrors);

    // If no errors, navigate to home
    if (Object.keys(newErrors).length === 0) {
      // Simular login exitoso
      router.push('/');
    }
  };

  const handleCreateAccount = () => {
    router.push('/create-account');
  };

  return (
    <div className={styles.formContainer}>
      <h1 className={styles.formTitle}>Iniciar sesión</h1>
      <p className={styles.formSubtitle}>
        Ingresa tu número de teléfono para continuar
      </p>

      <form className={styles.loginForm} onSubmit={handleSubmit}>
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
          Ingresar
        </Button>
      </form>

      <div className={styles.divider}>
        <span>¿No tienes cuenta?</span>
      </div>

      <Button
        type="button"
        variant="secondary"
        size="lg"
        fullWidth
        onClick={handleCreateAccount}
      >
        Crear cuenta
      </Button>
    </div>
  );
};

export default LoginForm;
