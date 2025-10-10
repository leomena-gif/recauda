'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './SellersList.module.css';

interface Seller {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  eventsAssigned: number;
  totalSold: number;
  lastActivity: string;
}

export default function SellersList() {
  const router = useRouter();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSellers, setSelectedSellers] = useState<string[]>([]);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
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
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [snackbarClosing, setSnackbarClosing] = useState(false);
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
  const [errorSnackbarClosing, setErrorSnackbarClosing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Mock data - En una aplicación real esto vendría de una API
  useEffect(() => {
    const mockSellers: Seller[] = [
      {
        id: '1',
        firstName: 'María',
        lastName: 'González',
        phone: '3584123456',
        email: 'maria.gonzalez@email.com',
        status: 'active',
        eventsAssigned: 3,
        totalSold: 45,
        lastActivity: '2024-01-15'
      },
      {
        id: '2',
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        phone: '3584987654',
        email: 'carlos.rodriguez@email.com',
        status: 'active',
        eventsAssigned: 2,
        totalSold: 32,
        lastActivity: '2024-01-14'
      },
      {
        id: '3',
        firstName: 'Ana',
        lastName: 'Martínez',
        phone: '3584555666',
        email: 'ana.martinez@email.com',
        status: 'inactive',
        eventsAssigned: 1,
        totalSold: 18,
        lastActivity: '2024-01-10'
      },
      {
        id: '4',
        firstName: 'Luis',
        lastName: 'Fernández',
        phone: '3584777888',
        email: 'luis.fernandez@email.com',
        status: 'active',
        eventsAssigned: 4,
        totalSold: 67,
        lastActivity: '2024-01-16'
      },
      {
        id: '5',
        firstName: 'Sofía',
        lastName: 'López',
        phone: '3584999000',
        email: 'sofia.lopez@email.com',
        status: 'active',
        eventsAssigned: 2,
        totalSold: 29,
        lastActivity: '2024-01-13'
      }
    ];
    setSellers(mockSellers);
  }, []);

  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = seller.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         seller.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         seller.phone.includes(searchTerm) ||
                         seller.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || seller.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const handleAssignToEvent = () => {
    if (selectedSellers.length > 0) {
      setIsAssignmentModalOpen(true);
    }
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

  const handleAssignToNewEvent = () => {
    // Lógica para asignar a nuevo evento
    console.log('Asignar a nuevo evento:', selectedSellers);
    setIsAssignmentModalOpen(false);
    setSelectedSellers([]);
  };

  const handleAssignToExistingEvent = () => {
    // Lógica para asignar a evento existente
    console.log('Asignar a evento existente:', selectedSellers);
    setIsAssignmentModalOpen(false);
    setSelectedSellers([]);
  };

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
        
        // Show success snackbar
        setShowSuccessSnackbar(true);
        setSnackbarClosing(false);
        
        // Start closing animation after 2.7 seconds
        setTimeout(() => {
          setSnackbarClosing(true);
        }, 2700);
        
        // Hide completely after animation finishes
        setTimeout(() => {
          setShowSuccessSnackbar(false);
          setSnackbarClosing(false);
        }, 3000);
      } catch (error) {
        // Handle error - close modal and show error snackbar
        setIsEditModalOpen(false);
        setEditingSeller(null);
        
        // Show error snackbar
        setShowErrorSnackbar(true);
        setErrorSnackbarClosing(false);
        
        // Start closing animation after 4.7 seconds (more time for error messages)
        setTimeout(() => {
          setErrorSnackbarClosing(true);
        }, 4700);
        
        // Hide completely after animation finishes
        setTimeout(() => {
          setShowErrorSnackbar(false);
          setErrorSnackbarClosing(false);
        }, 5000);
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
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className={styles.filterSelect}
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>

        <div className={styles.rightSection}>
          {selectedSellers.length > 0 && (
            <button 
              className={styles.assignButton}
              onClick={handleAssignToEvent}
            >
              Asignar a evento ({selectedSellers.length})
            </button>
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

      {/* Assignment Modal */}
      {isAssignmentModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsAssignmentModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Asignar Vendedores</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setIsAssignmentModalOpen(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <p>Selecciona cómo quieres asignar los {selectedSellers.length} vendedores seleccionados:</p>
              
              <div className={styles.assignmentOptions}>
                <button 
                  className={styles.optionButton}
                  onClick={handleAssignToNewEvent}
                >
                  <div className={styles.optionIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className={styles.optionContent}>
                    <h3>Nuevo Evento</h3>
                    <p>Crear un nuevo evento y asignar los vendedores</p>
                  </div>
                </button>
                
                <button 
                  className={styles.optionButton}
                  onClick={handleAssignToExistingEvent}
                >
                  <div className={styles.optionIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className={styles.optionContent}>
                    <h3>Evento Existente</h3>
                    <p>Agregar vendedores a un evento ya creado</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
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
      {showSuccessSnackbar && (
        <div className={`${styles.snackbar} ${snackbarClosing ? styles.snackbarClosing : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Vendedor editado con éxito</span>
        </div>
      )}

      {/* Error Snackbar */}
      {showErrorSnackbar && (
        <div className={`${styles.snackbarError} ${errorSnackbarClosing ? styles.snackbarClosing : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1" fill="currentColor"/>
          </svg>
          <span>No se pudieron realizar los cambios. Intente nuevamente en unos minutos</span>
        </div>
      )}

    </div>
  );
}
