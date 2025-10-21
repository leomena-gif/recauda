'use client';

import { useRouter } from 'next/navigation';

export default function TestClick() {
  const router = useRouter();

  const handleClick = () => {
    alert('¡El botón funciona!');
    router.push('/');
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Prueba de Click</h1>
      <button 
        onClick={handleClick}
        style={{
          padding: '16px 32px',
          fontSize: '18px',
          backgroundColor: '#007AFF',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Click aquí para probar
      </button>
      <p style={{ marginTop: '20px' }}>
        Si este botón funciona, el problema está en otro lugar
      </p>
    </div>
  );
}

