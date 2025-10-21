'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Seller, Event, StatusFilter } from '@/types/models';
import { STATUS_OPTIONS } from '@/constants';
import { validateName, validatePhone, formatPhone } from '@/utils/validation';
import { useSnackbar } from '@/hooks/useSnackbar';
import { MOCK_SELLERS, MOCK_EVENTS } from '@/mocks/data';
import styles from './SellersList.module.css';

export default function SellersList() {
  const router = useRouter();
  
  // State
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedSellers, setSelectedSellers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showEventSelector, setShowEventSelector] = useState(false);
  
  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [editFormErrors, setEditFormErrors] = useState<{
    firstName?: string;
    lastName?: string;
    phone?: string;
  }>({});
  
  // Custom hooks
  const successSnackbar = useSnackbar();
  const errorSnackbar = useSnackbar(5000);
  
  // Computed values
  const activeEvents = useMemo(
    () => events.filter(event => event.status === 'active'),
    [events]
  );

  // Load mock data (TODO: Replace with API calls)
  useEffect(() => {
    setSellers(MOCK_SELLERS);
    setEvents(MOCK_EVENTS);
  }, []);

  // Filtered sellers with useMemo for performance
  const filteredSellers = useMemo(() => {
    return sellers.filter(seller => {
      const matchesSearch = 
        seller.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.phone.includes(searchTerm) ||
        seller.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || seller.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [sellers, searchTerm, statusFilter]);

  const handleSelectSeller = (sellerId: string) => {
    setSelectedSellers(prev => 
      prev.includes(sellerId) 
        ? prev.filter(id => id !== sellerId)
        : [...prev, sellerId]
    );
  };

  const handleSelectAll = () => {
    const activeSellers = filteredSellers.filter(seller => seller.status === 'active');
    if (selectedSellers.length === activeSellers.length && activeSellers.length > 0) {
      setSelectedSellers([]);
    } else {
      setSelectedSellers(activeSellers.map(seller => seller.id));
    }
  };

  const toggleEventSelector = () => {
    setShowEventSelector(!showEventSelector);
  };

  const handleToggleSellerStatus = (sellerId: string) => {
    setSellers(prevSellers => 
      prevSellers.map(seller => {
        if (seller.id === sellerId) {
          const newStatus = seller.status === 'active' ? 'inactive' : 'active';
          // Si se desactiva, removerlo de la selección
          if (newStatus === 'inactive' && selectedSellers.includes(sellerId)) {
            setSelectedSellers(prev => prev.filter(id => id !== sellerId));
          }
          return { ...seller, status: newStatus };
        }
        return seller;
      })
    );
  };

  const handleTooltipMouseEnter = (e: React.MouseEvent<HTMLDivElement>, sellerId: string) => {
    const seller = sellers.find(s => s.id === sellerId);
    if (!seller || seller.status === 'active') return;
    
    const tooltip = e.currentTarget.querySelector('.checkboxTooltip') as HTMLElement;
    if (tooltip) {
      const rect = e.currentTarget.getBoundingClientRect();
      const tooltipWidth = 280;
      const tooltipHeight = 60;
      
      // Calcular posición horizontal centrada en el checkbox
      let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
      
      // Ajustar límites considerando el sidebar (280px de ancho)
      const sidebarWidth = 280;
      const margin = 30;
      
      // Asegurar que no se corte detrás del sidebar
      if (left < sidebarWidth + margin) {
        left = sidebarWidth + margin;
      }
      
      // Ajustar si se sale por la derecha
      if (left + tooltipWidth > window.innerWidth - margin) {
        left = window.innerWidth - tooltipWidth - margin;
      }
      
      // Posición vertical - arriba del checkbox con más espacio
      const top = rect.top - tooltipHeight - 15;
      
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
      tooltip.style.display = 'block';
      tooltip.style.opacity = '1';
      tooltip.style.visibility = 'visible';
    }
  };

  const handleTooltipMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const tooltip = e.currentTarget.querySelector('.checkboxTooltip') as HTMLElement;
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  };

  const handleAssignToEvent = useCallback((eventId: string) => {
    if (eventId && selectedSellers.length > 0) {
      const event = events.find(e => e.id === eventId);
      console.log('Asignar vendedores al evento:', {
        eventId,
        sellers: selectedSellers,
        eventName: event?.name
      });
      
      setSelectedSellers([]);
      setShowEventSelector(false);
      successSnackbar.showSnackbar();
    }
  }, [selectedSellers, events, successSnackbar]);

  const handleEditSeller = (seller: Seller) => {
    setEditingSeller(seller);
    setEditFormData({
      firstName: seller.firstName,
      lastName: seller.lastName,
      phone: seller.phone,
    });
    setEditFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleEditInputChange = (field: 'firstName' | 'lastName' | 'phone') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setEditFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (editFormErrors[field]) {
      setEditFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSaveEdit = () => {
    const newErrors: typeof editFormErrors = {};

    if (!editFormData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }
    if (!editFormData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }
    if (!editFormData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    setEditFormErrors(newErrors);

    if (Object.keys(newErrors).length === 0 && editingSeller) {
      try {
        // En una aplicación real, aquí iría la llamada a la API
        // Simular un posible error del sistema (descomenta para probar)
        // throw new Error('Error del sistema');
        
        // Update seller data
        setSellers(prevSellers =>
          prevSellers.map(seller =>
            seller.id === editingSeller.id
              ? {
                  ...seller,
                  firstName: editFormData.firstName,
                  lastName: editFormData.lastName,
                  phone: editFormData.phone,
                }
              : seller
          )
        );
        setIsEditModalOpen(false);
        setEditingSeller(null);
        successSnackbar.showSnackbar();
      } catch (error) {
        setIsEditModalOpen(false);
        setEditingSeller(null);
        errorSnackbar.showSnackbar();
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setEditingSeller(null);
    setEditFormErrors({});
  };

  const handleAddSeller = () => {
    router.push('/add-seller');
  };

  return (
    <div className="pageContainer">
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className="pageTitle">Lista de Vendedores</h1>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.addSellerButton}
            onClick={handleAddSeller}
          >
            <span>Agregar vendedor</span>
          </button>
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
              placeholder="Buscar por nombre, teléfono o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.statusFilter}>
            <select
              className={styles.statusSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.rightSection}>
          {selectedSellers.length > 0 && (
            <div className={styles.assignmentContainer}>
              <button 
                className={styles.assignButton}
                onClick={toggleEventSelector}
              >
                {showEventSelector ? 'Cancelar' : `Asignar ${selectedSellers.length} vendedor${selectedSellers.length > 1 ? 'es' : ''}`}
              </button>
              
              {showEventSelector && activeEvents.length > 0 && (
                <div className={styles.inlineEventSelector}>
                  <span className={styles.selectorLabel}>Selecciona un evento:</span>
                  <div className={styles.eventButtons}>
                    {activeEvents.map((event) => (
                      <button
                        key={event.id}
                        className={styles.eventButton}
                        onClick={() => handleAssignToEvent(event.id)}
                      >
                        <span className={styles.eventButtonName}>{event.name}</span>
                        <span className={styles.eventButtonInfo}>
                          {event.soldNumbers}/{event.totalNumbers} vendidos
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {showEventSelector && activeEvents.length === 0 && (
                <div className={styles.noEventsMessage}>
                  No hay eventos activos disponibles
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.checkboxColumn}>
                <input
                  type="checkbox"
                  checked={
                    filteredSellers.filter(s => s.status === 'active').length > 0 &&
                    selectedSellers.length === filteredSellers.filter(s => s.status === 'active').length
                  }
                  onChange={handleSelectAll}
                  className={styles.checkbox}
                  disabled={filteredSellers.filter(s => s.status === 'active').length === 0}
                  title={filteredSellers.filter(s => s.status === 'active').length === 0 ? 'No hay vendedores activos para seleccionar' : 'Seleccionar todos los vendedores activos'}
                />
              </th>
              <th>Vendedor</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Última Actividad</th>
              <th className={styles.actionsColumn}></th>
            </tr>
          </thead>
          <tbody>
            {filteredSellers.map((seller) => (
              <tr 
                key={seller.id} 
                className={`${styles.tableRow} ${seller.status === 'inactive' ? styles.tableRowInactive : ''}`}
              >
                <td className={styles.checkboxColumn}>
                  <div 
                    className={styles.checkboxWrapper}
                    onMouseEnter={(e) => handleTooltipMouseEnter(e, seller.id)}
                    onMouseLeave={handleTooltipMouseLeave}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSellers.includes(seller.id)}
                      onChange={() => handleSelectSeller(seller.id)}
                      disabled={seller.status === 'inactive'}
                      className={styles.checkbox}
                    />
                    {seller.status === 'inactive' && (
                      <div className={`${styles.checkboxTooltip} checkboxTooltip`}>
                        Activa este vendedor para asignarlo a eventos
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className={styles.sellerInfo}>
                    <div className={styles.sellerName}>
                      {seller.firstName} {seller.lastName}
                    </div>
                  </div>
                </td>
                <td>
                  <div className={styles.phone}>{seller.phone}</div>
                </td>
                <td>
                  <div className={styles.switchWrapper}>
                    <label 
                      className={styles.switchContainer}
                      title={seller.status === 'active' ? 'Deshabilitar vendedor' : 'Habilitar vendedor'}
                    >
                      <input
                        type="checkbox"
                        checked={seller.status === 'active'}
                        onChange={() => handleToggleSellerStatus(seller.id)}
                        className={styles.switchInput}
                      />
                      <span className={styles.switchSlider}></span>
                    </label>
                    <span className={`${styles.switchLabel} ${seller.status === 'active' ? styles.switchLabelActive : styles.switchLabelInactive}`}>
                      {seller.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </td>
                <td>
                  <div className={styles.lastActivity}>
                    {new Date(seller.lastActivity).toLocaleDateString('es-ES')}
                  </div>
                </td>
                <td className={styles.actionsColumn}>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEditSeller(seller)}
                    title="Editar vendedor"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Editar</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className={styles.mobileCardsContainer}>
        {filteredSellers.map((seller) => (
          <div 
            key={seller.id} 
            className={`${styles.mobileCard} ${seller.status === 'inactive' ? styles.mobileCardInactive : ''}`}
          >
            <div className={styles.mobileCardHeader}>
              <div 
                className={styles.mobileCheckboxWrapper}
                onMouseEnter={(e) => handleTooltipMouseEnter(e, seller.id)}
                onMouseLeave={handleTooltipMouseLeave}
              >
                <input
                  type="checkbox"
                  checked={selectedSellers.includes(seller.id)}
                  onChange={() => handleSelectSeller(seller.id)}
                  disabled={seller.status === 'inactive'}
                  className={styles.mobileCheckbox}
                />
                {seller.status === 'inactive' && (
                  <div className={`${styles.checkboxTooltip} checkboxTooltip`}>
                    Activa este vendedor para asignarlo a eventos
                  </div>
                )}
              </div>
              <div className={styles.mobileSellerInfo}>
                <div className={styles.mobileSellerName}>
                  {seller.firstName} {seller.lastName}
                </div>
                <div className={styles.mobilePhone}>{seller.phone}</div>
              </div>
            </div>
            
            <div className={styles.mobileCardFooter}>
              <div className={styles.mobileLastActivity}>
                Última actividad: {new Date(seller.lastActivity).toLocaleDateString('es-ES')}
              </div>
              <div className={styles.mobileSwitchWrapper}>
                <label 
                  className={styles.switchContainer}
                  title={seller.status === 'active' ? 'Deshabilitar vendedor' : 'Habilitar vendedor'}
                >
                  <input
                    type="checkbox"
                    checked={seller.status === 'active'}
                    onChange={() => handleToggleSellerStatus(seller.id)}
                    className={styles.switchInput}
                  />
                  <span className={styles.switchSlider}></span>
                </label>
                <span className={`${styles.switchLabel} ${seller.status === 'active' ? styles.switchLabelActive : styles.switchLabelInactive}`}>
                  {seller.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
            
            <button
              className={styles.mobileEditButton}
              onClick={() => handleEditSeller(seller)}
              title="Editar vendedor"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Editar</span>
            </button>
          </div>
        ))}
      </div>
        
        {filteredSellers.length === 0 && (
          <div className={styles.emptyState}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.6977C21.7033 16.0413 20.9999 15.5767 20.2 15.3778" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3.37781C16.7999 3.57668 17.5033 4.04129 18.0094 4.6977C18.5155 5.35411 18.8 6.16449 18.8 7C18.8 7.83551 18.5155 8.64589 18.0094 9.3023C17.5033 9.95871 16.7999 10.4233 16 10.6222" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3>No se encontraron vendedores</h3>
            <p>Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}


      {/* Edit Seller Modal */}
      {isEditModalOpen && editingSeller && (
        <div className={styles.modalOverlay} onClick={handleCancelEdit}>
          <div className={styles.editModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Editar Vendedor</h2>
              <button 
                className={styles.closeButton}
                onClick={handleCancelEdit}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div className={styles.editModalContent}>
              <div className={styles.editFormCard}>
                <div className={`${styles.editFieldGroup} ${editFormErrors.firstName ? styles.editError : ''}`}>
                  <label className={styles.editLabel}>Nombre</label>
                  <input
                    type="text"
                    className={styles.editInput}
                    value={editFormData.firstName}
                    onChange={handleEditInputChange('firstName')}
                    placeholder="Ej: Leonardo"
                  />
                  {editFormErrors.firstName && (
                    <p className={styles.editErrorMessage}>{editFormErrors.firstName}</p>
                  )}
                </div>

                <div className={`${styles.editFieldGroup} ${editFormErrors.lastName ? styles.editError : ''}`}>
                  <label className={styles.editLabel}>Apellido</label>
                  <input
                    type="text"
                    className={styles.editInput}
                    value={editFormData.lastName}
                    onChange={handleEditInputChange('lastName')}
                    placeholder="Ej: Mena"
                  />
                  {editFormErrors.lastName && (
                    <p className={styles.editErrorMessage}>{editFormErrors.lastName}</p>
                  )}
                </div>

                <div className={`${styles.editFieldGroup} ${editFormErrors.phone ? styles.editError : ''}`}>
                  <label className={styles.editLabel}>Teléfono</label>
                  <input
                    type="tel"
                    className={styles.editInput}
                    value={editFormData.phone}
                    onChange={handleEditInputChange('phone')}
                    placeholder="Ej: 3584129488"
                  />
                  <p className={styles.editInstruction}>
                    Escribe el número sin 0 y sin 15
                  </p>
                  {editFormErrors.phone && (
                    <p className={styles.editErrorMessage}>{editFormErrors.phone}</p>
                  )}
                </div>
              </div>

              <div className={styles.editModalActions}>
                <button
                  className={styles.cancelButton}
                  onClick={handleCancelEdit}
                >
                  Cancelar
                </button>
                <button
                  className={styles.saveButton}
                  onClick={handleSaveEdit}
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Snackbar */}
      {successSnackbar.isVisible && (
        <div className={`${styles.snackbar} ${successSnackbar.isClosing ? styles.snackbarClosing : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Operación exitosa</span>
        </div>
      )}

      {/* Error Snackbar */}
      {errorSnackbar.isVisible && (
        <div className={`${styles.snackbarError} ${errorSnackbar.isClosing ? styles.snackbarClosing : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1" fill="currentColor"/>
          </svg>
          <span>Error al procesar la solicitud</span>
        </div>
      )}

    </div>
  );
}
