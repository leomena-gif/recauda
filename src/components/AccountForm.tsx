'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './AccountForm.module.css';

interface FormData {
  organization: string;
  name: string;
  phone: string;
  email: string;
}

interface FormErrors {
  organization?: boolean;
  name?: boolean;
  phone?: boolean;
  email?: boolean;
}

type FormState = 'idle' | 'loading' | 'sent' | 'error';

const AccountForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    organization: '',
    name: '',
    phone: '',
    email: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: FormErrors = {};
    if (!formData.organization.trim()) newErrors.organization = true;
    if (!formData.name.trim()) newErrors.name = true;
    if (!formData.phone.trim()) newErrors.phone = true;
    if (!formData.email.trim()) newErrors.email = true;

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setFormState('loading');
    setErrorMessage('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: formData.email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          org_name: formData.organization.trim(),
          full_name: formData.name.trim(),
          phone: formData.phone.trim(),
        },
      },
    });

    if (error) {
      setFormState('error');
      setErrorMessage('No pudimos crear tu cuenta. Revisá los datos e intentá de nuevo.');
      return;
    }

    setFormState('sent');
  };

  if (formState === 'sent') {
    return (
      <div className={styles.formContainer}>
        <h1 className={styles.formTitle}>¡Casi listo!</h1>
        <p className={styles.formSubtitle}>
          Te enviamos un link a <strong>{formData.email}</strong>. Hacé clic en el link para activar tu cuenta.
        </p>
        <button
          type="button"
          className={styles.submitButton}
          onClick={() => setFormState('idle')}
        >
          Reenviar link
        </button>
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      <h1 className={styles.formTitle}>Crear cuenta</h1>
      <p className={styles.formSubtitle}>
        Completá los siguientes datos para crear tu cuenta
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
            disabled={formState === 'loading'}
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
            disabled={formState === 'loading'}
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
            disabled={formState === 'loading'}
            required
          />
          <p id="phone-helper" className={styles.phoneInstruction}>
            Escribe el número sin 0 y sin 15
          </p>
        </div>

        <div className={`${styles.formGroup} ${errors.email ? styles.error : ''}`}>
          <label htmlFor="email" className={styles.formLabel}>
            Tu email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className={styles.formInput}
            placeholder="Ej: maria@clubsanmartin.com"
            value={formData.email}
            onChange={handleInputChange}
            disabled={formState === 'loading'}
            required
          />
        </div>

        {formState === 'error' && (
          <p className={styles.errorMessage}>{errorMessage}</p>
        )}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={formState === 'loading'}
        >
          {formState === 'loading' ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <div className={styles.divider}>
        <span>¿Ya tienes cuenta?</span>
      </div>

      <button
        type="button"
        className={styles.backToLoginButton}
        onClick={() => router.push('/login')}
        disabled={formState === 'loading'}
      >
        Iniciar sesión
      </button>
    </div>
  );
};

export default AccountForm;
