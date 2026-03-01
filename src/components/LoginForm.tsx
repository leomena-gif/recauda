'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './LoginForm.module.css';

type FormState = 'idle' | 'loading' | 'sent' | 'error';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) setEmailError(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      setEmailError(true);
      return;
    }

    setFormState('loading');
    setErrorMessage('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setFormState('error');
      setErrorMessage('No pudimos enviarte el link. Revisá el email e intentá de nuevo.');
      return;
    }

    setFormState('sent');
  };

  const handleCreateAccount = () => {
    router.push('/create-account');
  };

  if (formState === 'sent') {
    return (
      <div className={styles.formContainer}>
        <h1 className={styles.formTitle}>Revisá tu email</h1>
        <p className={styles.formSubtitle}>
          Te enviamos un link a <strong>{email}</strong>. Hacé clic en el link para ingresar.
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
      <h1 className={styles.formTitle}>Iniciar sesión</h1>
      <p className={styles.formSubtitle}>
        Ingresá tu email y te enviamos un link para acceder
      </p>

      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <div className={`${styles.formGroup} ${emailError ? styles.error : ''}`}>
          <label htmlFor="email" className={styles.formLabel}>
            Tu email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className={styles.formInput}
            placeholder="Ej: maria@clubsanmartin.com"
            value={email}
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
          {formState === 'loading' ? 'Enviando...' : 'Enviar link de acceso'}
        </button>
      </form>

      <div className={styles.divider}>
        <span>¿No tienes cuenta?</span>
      </div>

      <button
        type="button"
        className={styles.createAccountButton}
        onClick={handleCreateAccount}
        disabled={formState === 'loading'}
      >
        Crear cuenta
      </button>
    </div>
  );
};

export default LoginForm;
