'use client';

import React from 'react';
import styles from './ButtonShowcase.module.css';

/**
 * ButtonShowcase - Componente de demostración del sistema de botones
 * Muestra los 3 niveles de botones con sus diferentes variantes
 */
const ButtonShowcase: React.FC = () => {
  return (
    <div className={styles.showcase}>
      <h2 className={styles.title}>Sistema de Botones - 3 Niveles</h2>
      
      {/* Botones Principales */}
      <section className={styles.section}>
        <h3 className={styles.subtitle}>1. Botones Principales</h3>
        <p className={styles.description}>Color azul sólido - Para acciones principales</p>
        <div className={styles.buttonGroup}>
          <button className="btn btn-primary btn-sm">Pequeño</button>
          <button className="btn btn-primary btn-md">Mediano</button>
          <button className="btn btn-primary btn-lg">Grande</button>
          <button className="btn btn-primary btn-md" disabled>Deshabilitado</button>
        </div>
        <div className={styles.buttonGroup}>
          <button className="btn btn-primary btn-full">Ancho completo</button>
        </div>
      </section>

      {/* Botones Secundarios */}
      <section className={styles.section}>
        <h3 className={styles.subtitle}>2. Botones Secundarios (Quiet)</h3>
        <p className={styles.description}>Texto azul sin borde - Para acciones secundarias sutiles</p>
        <div className={styles.buttonGroup}>
          <button className="btn btn-secondary btn-sm">Pequeño</button>
          <button className="btn btn-secondary btn-md">Mediano</button>
          <button className="btn btn-secondary btn-lg">Grande</button>
          <button className="btn btn-secondary btn-md" disabled>Deshabilitado</button>
        </div>
        <div className={styles.buttonGroup}>
          <button className="btn btn-secondary btn-full">Ancho completo</button>
        </div>
      </section>

      {/* Botones Terciarios */}
      <section className={styles.section}>
        <h3 className={styles.subtitle}>3. Botones Terciarios (Outline)</h3>
        <p className={styles.description}>Outline azul - Para acciones alternativas</p>
        <div className={styles.buttonGroup}>
          <button className="btn btn-tertiary btn-sm">Pequeño</button>
          <button className="btn btn-tertiary btn-md">Mediano</button>
          <button className="btn btn-tertiary btn-lg">Grande</button>
          <button className="btn btn-tertiary btn-md" disabled>Deshabilitado</button>
        </div>
        <div className={styles.buttonGroup}>
          <button className="btn btn-tertiary btn-full">Ancho completo</button>
        </div>
      </section>

      {/* Ejemplo de uso en contexto */}
      <section className={styles.section}>
        <h3 className={styles.subtitle}>Ejemplo en Contexto</h3>
        <p className={styles.description}>Jerarquía visual en una interfaz real</p>
        <div className={styles.contextExample}>
          <div className={styles.card}>
            <h4 className={styles.cardTitle}>Crear Nuevo Evento</h4>
            <p className={styles.cardText}>
              Los botones deben reflejar la importancia de cada acción.
            </p>
            <div className={styles.cardActions}>
              <button className="btn btn-primary">Crear evento</button>
              <button className="btn btn-tertiary">Ver detalles</button>
              <button className="btn btn-secondary">Cancelar</button>
            </div>
          </div>
        </div>
      </section>

      {/* Guía de uso */}
      <section className={styles.section}>
        <h3 className={styles.subtitle}>Guía de Uso</h3>
        <div className={styles.guide}>
          <div className={styles.guideItem}>
            <span className={styles.guideBadge} style={{ backgroundColor: '#007AFF' }}>1</span>
            <div>
              <strong>Principal:</strong> Usa para la acción más importante en la pantalla
            </div>
          </div>
          <div className={styles.guideItem}>
            <span className={styles.guideBadge} style={{ backgroundColor: 'transparent', color: '#007AFF', border: '2px solid #007AFF' }}>2</span>
            <div>
              <strong>Secundario (Quiet):</strong> Usa para acciones de menor prioridad o cancelar
            </div>
          </div>
          <div className={styles.guideItem}>
            <span className={styles.guideBadge} style={{ backgroundColor: 'transparent', color: '#007AFF', border: '2px solid #007AFF' }}>3</span>
            <div>
              <strong>Terciario (Outline):</strong> Usa para acciones alternativas o navegación
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ButtonShowcase;

