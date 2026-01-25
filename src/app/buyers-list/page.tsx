'use client';

import React, { useState, useMemo } from 'react';
import { Buyer, Event, StatusFilter } from '@/types/models';
import { STATUS_OPTIONS } from '@/constants';
import { MOCK_BUYERS, MOCK_EVENTS } from '@/mocks/data';
import CustomDropdown from '@/components/CustomDropdown';
import styles from './BuyersList.module.css';

export default function BuyersList() {
  // State
  const [buyers, setBuyers] = useState<Buyer[]>(MOCK_BUYERS);
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [selectedBuyers, setSelectedBuyers] = useState<string[]>([]);
  
  // Computed values
  const activeEvents = useMemo(
    () => events.filter(event => event.status === 'active'),
    [events]
  );

  // Filtered buyers - solo compradores de eventos activos
  const filteredBuyers = useMemo(() => {
    return buyers.filter(buyer => {
      // Solo mostrar compradores que tienen al menos un evento activo asignado
      const hasActiveEvent = buyer.assignedEvents.some(eventId => {
        const event = events.find(e => e.id === eventId);
        return event?.status === 'active';
      });

      if (!hasActiveEvent) return false;

      const matchesSearch = 
        buyer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buyer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buyer.phone.includes(searchTerm) ||
        buyer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // Buscar por nombre de evento asignado
        (buyer.assignedEvents.length > 0 && events.find(e => 
          e.id === buyer.assignedEvents[0] && 
          e.status === 'active' &&
          e.name.toLowerCase().includes(searchTerm.toLowerCase())
        ));
      const matchesStatus = statusFilter === 'all' || buyer.status === statusFilter;
      const matchesEvent =
        eventFilter === 'all'
          ? true
          : buyer.assignedEvents.some(eventId => {
              const event = events.find(e => e.id === eventId);
              return event?.status === 'active' && event.id === eventFilter;
            });
      
      return matchesSearch && matchesStatus && matchesEvent;
    });
  }, [buyers, searchTerm, statusFilter, events, eventFilter]);

  // Helper function: Check if buyer should show checkbox based on current filter
  const shouldShowCheckbox = (buyer: Buyer): boolean => {
    if (eventFilter !== 'all') {
      // Si hay filtro específico, verificar si ESE evento es una rifa
      const filteredEvent = events.find(e => e.id === eventFilter);
      return filteredEvent?.type === 'raffle' && filteredEvent?.status === 'active';
    } else {
      // Sin filtro, mostrar checkbox si tiene alguna rifa activa
      return buyer.assignedEvents.some(eventId => {
        const event = events.find(e => e.id === eventId);
        return event?.status === 'active' && event?.type === 'raffle';
      });
    }
  };

  const handleToggleBuyerStatus = (buyerId: string) => {
    setBuyers(prevBuyers => 
      prevBuyers.map(buyer => {
        if (buyer.id === buyerId) {
          const newStatus = buyer.status === 'active' ? 'inactive' : 'active';
          return { ...buyer, status: newStatus };
        }
        return buyer;
      })
    );
  };

  const handleSelectBuyer = (buyerId: string) => {
    setSelectedBuyers(prev => 
      prev.includes(buyerId) 
        ? prev.filter(id => id !== buyerId)
        : [...prev, buyerId]
    );
  };

  const handleSelectAll = () => {
    const raffleBuyers = filteredBuyers.filter(buyer => 
      buyer.status === 'active' && shouldShowCheckbox(buyer)
    );
    
    if (selectedBuyers.length === raffleBuyers.length && raffleBuyers.length > 0) {
      setSelectedBuyers([]);
    } else {
      setSelectedBuyers(raffleBuyers.map(buyer => buyer.id));
    }
  };

  const handlePrintReceipts = () => {
    // TODO: Implementar lógica de impresión
    console.log('Imprimir comprobantes para:', selectedBuyers);
    alert(`Imprimiendo ${selectedBuyers.length} comprobantes`);
  };

  return (
    <div className="pageContainer">
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className="pageTitle">Lista de Compradores</h1>
        </div>
      </div>

      {/* Action Bar */}
      <div className={styles.actionBar}>
        <div className={styles.leftSection}>
          <div className={styles.searchContainer}>
            <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono o evento"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Desktop: dos filtros en línea */}
          <div className={styles.filtersGroupDesktop}>
            <div className={styles.statusFilter}>
              <CustomDropdown
                options={STATUS_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as StatusFilter)}
                placeholder="Filtrar por estado"
              />
            </div>
            <div className={styles.eventFilter}>
              <CustomDropdown
                options={[
                  { value: 'all', label: 'Todos los eventos activos' },
                  ...activeEvents.map(event => ({ value: event.id, label: event.name }))
                ]}
                value={eventFilter}
                onChange={(value) => setEventFilter(value as string)}
                placeholder="Filtrar por evento"
              />
            </div>
          </div>
        </div>

        {/* Print Button - Solo visible cuando hay seleccionados */}
        {selectedBuyers.length > 0 && (
          <button
            onClick={handlePrintReceipts}
            className="btn btn-primary"
            title="Imprimir comprobantes"
            style={{ gap: '8px' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9V2H18V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 18H4C3.46957 18 2.96086 17.7893 2.58579 17.4142C2.21071 17.0391 2 16.5304 2 16V11C2 10.4696 2.21071 9.96086 2.58579 9.58579C2.96086 9.21071 3.46957 9 4 9H20C20.5304 9 21.0391 9.21071 21.4142 9.58579C21.7893 9.96086 22 10.4696 22 11V16C22 16.5304 21.7893 17.0391 21.4142 17.4142C21.0391 17.7893 20.5304 18 20 18H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="6" y="14" width="12" height="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Imprimir comprobantes</span>
          </button>
        )}
      </div>

      {/* Desktop Table View - Solo visible en desktop */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.checkboxColumn}>
                <div className={styles.checkboxWrapper}>
                  <input
                    type="checkbox"
                    checked={
                      filteredBuyers.filter(b => b.status === 'active' && shouldShowCheckbox(b)).length > 0 &&
                      selectedBuyers.length === filteredBuyers.filter(b => b.status === 'active' && shouldShowCheckbox(b)).length
                    }
                    onChange={handleSelectAll}
                    className={styles.checkbox}
                    disabled={filteredBuyers.filter(b => b.status === 'active' && shouldShowCheckbox(b)).length === 0}
                    title={filteredBuyers.filter(b => b.status === 'active' && shouldShowCheckbox(b)).length === 0 ? 'No hay compradores de rifas activos para seleccionar' : 'Seleccionar todos los compradores de rifas activos'}
                    aria-label="Seleccionar todos los compradores de rifas"
                  />
                </div>
              </th>
              <th>
                <div className={styles.headerWithCounter}>
                  <span>Comprador</span>
                  <span className={styles.headerCounter}>{filteredBuyers.length}</span>
                </div>
              </th>
              <th>Evento Asignado</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredBuyers.map((buyer) => {
              const showCheckbox = shouldShowCheckbox(buyer);
              return (
                <tr 
                  key={buyer.id} 
                  className={`${styles.tableRow} ${buyer.status === 'inactive' ? styles.tableRowInactive : ''}`}
                >
                  <td className={styles.checkboxColumn}>
                    {showCheckbox ? (
                      <div className={styles.checkboxWrapper}>
                        <input
                          type="checkbox"
                          checked={selectedBuyers.includes(buyer.id)}
                          onChange={() => handleSelectBuyer(buyer.id)}
                          className={styles.checkbox}
                          disabled={buyer.status === 'inactive'}
                          aria-label={`Seleccionar ${buyer.firstName} ${buyer.lastName}`}
                        />
                        {buyer.status === 'inactive' && (
                          <div className={styles.checkboxTooltip}>Comprador deshabilitado</div>
                        )}
                      </div>
                    ) : (
                      <div className={styles.checkboxPlaceholder}></div>
                    )}
                  </td>
                  <td>
                    <div className={styles.buyerInfo}>
                      <div className={styles.buyerName}>
                        {buyer.firstName} {buyer.lastName}
                      </div>
                      <div className={styles.buyerPhone}>{buyer.phone}</div>
                    </div>
                  </td>
                <td>
                  <div className={styles.eventInfo}>
                    {(() => {
                      // Si hay filtro de evento, mostrar ese evento; sino mostrar el primer evento activo
                      let displayEvent = null;
                      
                      if (eventFilter !== 'all') {
                        // Mostrar el evento filtrado si el comprador lo tiene
                        displayEvent = events.find(e => e.id === eventFilter && e.status === 'active');
                      } else {
                        // Mostrar el primer evento activo asignado
                        const activeEventId = buyer.assignedEvents.find(eventId => {
                          const event = events.find(e => e.id === eventId);
                          return event?.status === 'active';
                        });
                        displayEvent = activeEventId ? events.find(e => e.id === activeEventId) : null;
                      }
                      
                      return displayEvent ? (
                        <div className={styles.eventName}>{displayEvent.name}</div>
                      ) : (
                        <div className={styles.noEvent}>Sin evento activo</div>
                      );
                    })()}
                  </div>
                </td>
                  <td>
                    <div className={styles.switchWrapper}>
                      <label 
                        className={styles.switchContainer}
                        title={buyer.status === 'active' ? 'Deshabilitar comprador' : 'Habilitar comprador'}
                      >
                        <input
                          type="checkbox"
                          checked={buyer.status === 'active'}
                          onChange={() => handleToggleBuyerStatus(buyer.id)}
                          className={styles.switchInput}
                        />
                        <span className={styles.switchSlider}></span>
                      </label>
                      <span className={`${styles.switchLabel} ${buyer.status === 'active' ? styles.switchLabelActive : styles.switchLabelInactive}`}>
                        {buyer.status === 'active' ? 'HABILITADO' : 'DESHABILITADO'}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
        
      {filteredBuyers.length === 0 && (
        <div className={styles.emptyState}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="9" cy="7" r="4" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.6977C21.7033 16.0413 20.9999 15.5767 20.2 15.3778" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 3.37781C16.7999 3.57668 17.5033 4.04129 18.0094 4.6977C18.5155 5.35411 18.8 6.16449 18.8 7C18.8 7.83551 18.5155 8.64589 18.0094 9.3023C17.5033 9.95871 16.7999 10.4233 16 10.6222" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>No se encontraron compradores</h3>
          <p>Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}
    </div>
  );
}
