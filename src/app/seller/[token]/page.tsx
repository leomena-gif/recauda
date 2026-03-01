'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import styles from './SellerPortal.module.css';

interface SellerInfo {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
}

interface CampaignInfo {
  id: string;
  name: string;
  type: 'raffle' | 'food_sale';
  number_value: number | null;
  campaign_food_items?: { id: string; name: string; price: number }[];
}

interface ItemInfo {
  id: string;
  number_label: string | null;
  food_item_id: string | null;
  status: 'available' | 'sold' | 'collected';
}

interface PortalData {
  seller: SellerInfo;
  campaign: CampaignInfo;
  items: ItemInfo[];
  token_id: string;
}

interface SaleForm {
  buyer_first_name: string;
  buyer_last_name: string;
  buyer_phone: string;
  selectedItemIds: string[];
}

type PortalState = 'loading' | 'loaded' | 'expired' | 'error';

export default function SellerPortalPage() {
  const params = useParams();
  const token = params.token as string;

  const [portalState, setPortalState] = useState<PortalState>('loading');
  const [data, setData] = useState<PortalData | null>(null);
  const [saleFormOpen, setSaleFormOpen] = useState(false);
  const [saleForm, setSaleForm] = useState<SaleForm>({
    buyer_first_name: '',
    buyer_last_name: '',
    buyer_phone: '',
    selectedItemIds: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saleSuccess, setSaleSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  const loadData = useCallback(async () => {
    try {
      const res = await fetch(`/api/seller/validate?token=${encodeURIComponent(token)}`);
      if (res.status === 404) {
        setPortalState('expired');
        return;
      }
      if (!res.ok) {
        setPortalState('error');
        return;
      }
      const json = await res.json() as PortalData;
      setData(json);
      setPortalState('loaded');
    } catch {
      setPortalState('error');
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const availableItems = data?.items.filter(i => i.status === 'available') ?? [];
  const soldItems = data?.items.filter(i => i.status !== 'available') ?? [];

  const handleSelectItem = (itemId: string) => {
    setSaleForm(prev => ({
      ...prev,
      selectedItemIds: prev.selectedItemIds.includes(itemId)
        ? prev.selectedItemIds.filter(id => id !== itemId)
        : [...prev.selectedItemIds, itemId],
    }));
  };

  const handleSubmitSale = async () => {
    if (!data) return;
    if (!saleForm.buyer_first_name.trim() || !saleForm.buyer_last_name.trim() || !saleForm.buyer_phone.trim()) {
      setFormError('Completá todos los campos del comprador');
      return;
    }
    if (saleForm.selectedItemIds.length === 0) {
      setFormError('Seleccioná al menos un número o ítem');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const res = await fetch('/api/seller/sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          campaign_id: data.campaign.id,
          seller_id: data.seller.id,
          buyer_first_name: saleForm.buyer_first_name,
          buyer_last_name: saleForm.buyer_last_name,
          buyer_phone: saleForm.buyer_phone,
          item_ids: saleForm.selectedItemIds,
          unit_price: data.campaign.number_value ?? 0,
        }),
      });

      if (!res.ok) {
        const err = await res.json() as { error: string };
        setFormError(err.error ?? 'Error al registrar la venta');
        setIsSubmitting(false);
        return;
      }

      setSaleSuccess(true);
      setSaleFormOpen(false);
      setSaleForm({ buyer_first_name: '', buyer_last_name: '', buyer_phone: '', selectedItemIds: [] });
      await loadData(); // Refresh items
    } catch {
      setFormError('Error de conexión. Intentá de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (portalState === 'loading') {
    return (
      <div className={styles.centered}>
        <p className={styles.loadingText}>Cargando...</p>
      </div>
    );
  }

  if (portalState === 'expired') {
    return (
      <div className={styles.centered}>
        <h1 className={styles.expiredTitle}>Link expirado</h1>
        <p className={styles.expiredText}>
          Tu link de acceso expiró o ya no es válido. Contactá a tu organizador para obtener uno nuevo.
        </p>
      </div>
    );
  }

  if (portalState === 'error' || !data) {
    return (
      <div className={styles.centered}>
        <h1 className={styles.expiredTitle}>Error de conexión</h1>
        <p className={styles.expiredText}>No pudimos cargar tu panel. Revisá tu conexión e intentá de nuevo.</p>
        <button className={styles.retryButton} onClick={loadData}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <p className={styles.campaignLabel}>{data.campaign.name}</p>
          <h1 className={styles.sellerName}>
            Hola, {data.seller.first_name} {data.seller.last_name}
          </h1>
        </div>
        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{availableItems.length}</span>
            <span className={styles.statLabel}>Disponibles</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{soldItems.length}</span>
            <span className={styles.statLabel}>Vendidos</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{data.items.length}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
        </div>
      </header>

      {saleSuccess && (
        <div className={styles.successBanner}>
          ¡Venta registrada correctamente!
          <button className={styles.dismissBtn} onClick={() => setSaleSuccess(false)}>✕</button>
        </div>
      )}

      {/* Items grid */}
      <main className={styles.main}>
        <h2 className={styles.sectionTitle}>Tus números</h2>
        <div className={styles.itemsGrid}>
          {data.items.map(item => (
            <div
              key={item.id}
              className={`${styles.itemChip} ${styles[item.status]}`}
            >
              {item.number_label ?? '—'}
            </div>
          ))}
        </div>
      </main>

      {/* Sale CTA */}
      {availableItems.length > 0 && (
        <div className={styles.ctaBar}>
          <button
            className={styles.saleButton}
            onClick={() => setSaleFormOpen(true)}
          >
            Marcar venta
          </button>
        </div>
      )}

      {/* Sale bottom sheet */}
      {saleFormOpen && (
        <div className={styles.overlay} onClick={() => setSaleFormOpen(false)}>
          <div className={styles.sheet} onClick={e => e.stopPropagation()}>
            <div className={styles.sheetHandle} />
            <h2 className={styles.sheetTitle}>Registrar venta</h2>

            <div className={styles.itemsSelector}>
              <p className={styles.fieldLabel}>Seleccioná los números vendidos</p>
              <div className={styles.itemsGrid}>
                {availableItems.map(item => (
                  <button
                    key={item.id}
                    className={`${styles.itemChip} ${styles.available} ${
                      saleForm.selectedItemIds.includes(item.id) ? styles.selected : ''
                    }`}
                    onClick={() => handleSelectItem(item.id)}
                  >
                    {item.number_label ?? '—'}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.buyerForm}>
              <p className={styles.fieldLabel}>Datos del comprador</p>
              <input
                className={styles.input}
                type="text"
                placeholder="Nombre"
                value={saleForm.buyer_first_name}
                onChange={e => setSaleForm(prev => ({ ...prev, buyer_first_name: e.target.value }))}
              />
              <input
                className={styles.input}
                type="text"
                placeholder="Apellido"
                value={saleForm.buyer_last_name}
                onChange={e => setSaleForm(prev => ({ ...prev, buyer_last_name: e.target.value }))}
              />
              <input
                className={styles.input}
                type="tel"
                placeholder="WhatsApp (Ej: 3584123456)"
                value={saleForm.buyer_phone}
                onChange={e => setSaleForm(prev => ({ ...prev, buyer_phone: e.target.value }))}
              />
            </div>

            {formError && <p className={styles.formError}>{formError}</p>}

            <button
              className={styles.confirmSaleButton}
              onClick={handleSubmitSale}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registrando...' : 'Confirmar venta'}
            </button>

            <button
              className={styles.cancelButton}
              onClick={() => {
                setSaleFormOpen(false);
                setFormError('');
                setSaleForm(prev => ({ ...prev, selectedItemIds: [] }));
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
