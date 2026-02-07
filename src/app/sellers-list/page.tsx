'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Seller, Event, StatusFilter } from '@/types/models';
import { STATUS_OPTIONS, SNACKBAR_DURATION } from '@/constants';
import { validateName, validatePhone } from '@/utils/validation';
import { useSnackbar } from '@/hooks/useSnackbar';
import { MOCK_SELLERS, MOCK_EVENTS } from '@/mocks/data';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import CustomDropdown from '@/components/CustomDropdown';
import styles from './SellersList.module.css';

export default function SellersList() {
  const router = useRouter();
  // State
  const [sellers, setSellers] = useState<Seller[]>(MOCK_SELLERS);
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);

  const [selectedSellers, setSelectedSellers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');
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

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState<string | null>(null);
  // Desktop context menu state
  const [desktopMenuOpen, setDesktopMenuOpen] = useState<string | null>(null);
  // Mobile-only: Filtros sheet, Assign sticky + sheet
  const [filtersSheetOpen, setFiltersSheetOpen] = useState(false);
  const [assignSheetOpen, setAssignSheetOpen] = useState(false);

  // Custom hooks
  const successSnackbar = useSnackbar();
  const errorSnackbar = useSnackbar(SNACKBAR_DURATION.ERROR);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  // Computed values
  const activeEvents = useMemo(
    () => events.filter(event => event.status === 'active'),
    [events]
  );

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuOpen && !(event.target as Element).closest(`.${styles.mobileMenuContainer}`)) {
        handleMobileMenuClose();
      }
      if (desktopMenuOpen && !(event.target as Element).closest(`.${styles.desktopMenuContainer}`)) {
        setDesktopMenuOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen, desktopMenuOpen]);

  // Filtered sellers with useMemo for performance
  const filteredSellers = useMemo(() => {
    return sellers.filter(seller => {
      const matchesSearch =
        (isDesktop && (
          seller.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          seller.lastName.toLowerCase().includes(searchTerm.toLowerCase())
        )) ||
        seller.phone.includes(searchTerm) ||
        seller.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // Buscar por nombre de evento asignado
        (seller.assignedEvents.length > 0 && events.find(e =>
          e.id === seller.assignedEvents[0] &&
          e.name.toLowerCase().includes(searchTerm.toLowerCase())
        ));
      const matchesStatus = statusFilter === 'all' || seller.status === statusFilter;
      const matchesEvent =
        eventFilter === 'all'
          ? true
          : seller.assignedEvents.some(eventId => {
            const event = events.find(e => e.id === eventId);
            return event?.status === 'active' && event.id === eventFilter;
          });
      return matchesSearch && matchesStatus && matchesEvent;
    });
  }, [sellers, searchTerm, statusFilter, events, eventFilter, isDesktop]);

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
      setSelectedSellers([]);
      setShowEventSelector(false);
      setAssignSheetOpen(false);
      successSnackbar.showSnackbar();
    }
  }, [selectedSellers, successSnackbar]);

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

  // Mobile menu handlers
  const handleMobileMenuToggle = (sellerId: string) => {
    setMobileMenuOpen(mobileMenuOpen === sellerId ? null : sellerId);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(null);
  };

  const openFiltersSheet = () => setFiltersSheetOpen(true);
  const closeFiltersSheet = () => setFiltersSheetOpen(false);
  const openAssignSheet = () => setAssignSheetOpen(true);
  const closeAssignSheet = () => setAssignSheetOpen(false);
  const handleMobileAssignCancel = () => {
    setSelectedSellers([]);
    setAssignSheetOpen(false);
    setShowEventSelector(false);
  };

  const handleMobileEdit = (seller: Seller) => {
    handleEditSeller(seller);
    handleMobileMenuClose();
  };

  const handleMobileToggleStatus = (sellerId: string) => {
    handleToggleSellerStatus(sellerId);
    handleMobileMenuClose();
  };

  // Desktop context menu handlers
  const handleDesktopMenuToggle = (sellerId: string) => {
    setDesktopMenuOpen(desktopMenuOpen === sellerId ? null : sellerId);
  };

  const handleDesktopEdit = (seller: Seller) => {
    handleEditSeller(seller);
    setDesktopMenuOpen(null);
  };

  const handleDesktopToggleStatus = (sellerId: string) => {
    handleToggleSellerStatus(sellerId);
    setDesktopMenuOpen(null);
  };

  const handleAddSeller = () => {
    router.push('/add-seller');
  };

  return (
    <div className="pageContainer">
      <div className={styles.stickyHeader}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1 className="pageTitle">Lista de Vendedores</h1>
          </div>
          <div className={styles.headerActions}>
            <button className="btn btn-primary" onClick={handleAddSeller}>
              Agregar vendedor
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className={styles.actionBar}>
          <div className={styles.leftSection}>
            <div className={styles.searchContainer}>
              <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input
                type="text"
                placeholder={isDesktop ? "Buscar por nombre, teléfono o evento" : "Buscar por teléfono o evento"}
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
                  alignRight={true}
                />
              </div>
            </div>

            {/* Mobile: botón Filtros abre sheet */}
            <button
              type="button"
              className={styles.filtersTriggerMobile}
              onClick={openFiltersSheet}
              aria-label="Abrir filtros"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Filtros</span>
            </button>
          </div>

          {/* Desktop: Asignar + selector inline */}
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
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {showEventSelector && activeEvents.length === 0 && (
                  <div className={styles.noEventsMessage}>No hay eventos en estado ACTIVO</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: sticky bottom bar Asignar (solo cuando hay selección) */}
      {selectedSellers.length > 0 && (
        <div className={styles.assignStickyBar}>
          <button type="button" className={styles.assignStickyCancel} onClick={handleMobileAssignCancel}>
            Cancelar
          </button>
          <button
            type="button"
            className={styles.assignStickyPrimary}
            onClick={openAssignSheet}
          >
            Asignar {selectedSellers.length} vendedor{selectedSellers.length > 1 ? 'es' : ''}
          </button>
        </div>
      )}

      {/* Mobile: bottom sheet Filtros */}
      {filtersSheetOpen && (
        <div className={styles.sheetOverlay} onClick={closeFiltersSheet} aria-hidden="true" />
      )}
      {filtersSheetOpen && (
        <div className={styles.sheetPanel} role="dialog" aria-label="Filtros" onClick={(e) => e.stopPropagation()}>
          <div className={styles.sheetHandle} aria-hidden="true" />
          <h2 className={styles.sheetTitle}>Filtros</h2>
          <div className={styles.sheetFilters}>
            <div className={styles.sheetFilterGroup}>
              <span className={styles.sheetFilterLabel}>Estado</span>
              <div className={styles.sheetFilterOptions}>
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={statusFilter === opt.value ? styles.sheetFilterOptionActive : styles.sheetFilterOption}
                    onClick={() => setStatusFilter(opt.value as StatusFilter)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.sheetFilterGroup}>
              <span className={styles.sheetFilterLabel}>Evento</span>
              <div className={styles.sheetFilterOptions}>
                <button
                  type="button"
                  className={eventFilter === 'all' ? styles.sheetFilterOptionActive : styles.sheetFilterOption}
                  onClick={() => setEventFilter('all')}
                >
                  Todos los eventos activos
                </button>
                {activeEvents.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    className={eventFilter === event.id ? styles.sheetFilterOptionActive : styles.sheetFilterOption}
                    onClick={() => setEventFilter(event.id)}
                  >
                    {event.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button type="button" className={styles.sheetApply} onClick={closeFiltersSheet}>
            Aplicar
          </button>
        </div>
      )}

      {/* Mobile: bottom sheet Asignar evento */}
      {assignSheetOpen && (
        <div className={styles.sheetOverlay} onClick={closeAssignSheet} aria-hidden="true" />
      )}
      {assignSheetOpen && (
        <div className={styles.sheetPanel} role="dialog" aria-label="Seleccionar evento" onClick={(e) => e.stopPropagation()}>
          <div className={styles.sheetHandle} aria-hidden="true" />
          <h2 className={styles.sheetTitle}>Asignar a evento</h2>
          {activeEvents.length > 0 ? (
            <div className={styles.sheetEventList}>
              {activeEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  className={styles.sheetEventButton}
                  onClick={() => handleAssignToEvent(event.id)}
                >
                  <div className={styles.sheetEventStatus}>
                    <span className={styles.sheetEventStatusDot}></span>
                    <span className={styles.sheetEventStatusText}>ACTIVO</span>
                  </div>
                  <div className={styles.sheetEventName}>{event.name}</div>
                </button>
              ))}
            </div>
          ) : (
            <p className={styles.sheetNoEvents}>No hay eventos en estado ACTIVO</p>
          )}
        </div>
      )}

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
              <th>
                <div className={styles.headerWithCounter}>
                  <span>Vendedor</span>
                  <span className={styles.headerCounter}>{filteredSellers.length}</span>
                </div>
              </th>
              <th>Evento Asignado</th>
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
                  <div className={styles.checkboxWrapper}>
                    <input
                      type="checkbox"
                      checked={selectedSellers.includes(seller.id)}
                      onChange={() => handleSelectSeller(seller.id)}
                      disabled={seller.status === 'inactive'}
                      className={styles.checkbox}
                    />
                  </div>
                </td>
                <td>
                  <div className={styles.sellerInfo}>
                    <div className={styles.sellerName}>
                      {seller.firstName} {seller.lastName}
                    </div>
                    <div className={styles.sellerPhone}>{seller.phone}</div>
                  </div>
                </td>
                <td>
                  <div className={styles.eventInfo}>
                    {seller.assignedEvents.length > 0 ? (
                      <div className={styles.eventName}>
                        {(() => {
                          const firstEvent = events.find(e => e.id === seller.assignedEvents[0]);
                          return firstEvent ? firstEvent.name : 'Sin evento';
                        })()}
                      </div>
                    ) : (
                      <div className={styles.noEvent}>Sin evento asignado</div>
                    )}
                  </div>
                </td>
                <td className={styles.actionsColumn}>
                  <div className={styles.desktopMenuContainer}>
                    <button
                      className={styles.desktopMenuButton}
                      onClick={() => handleDesktopMenuToggle(seller.id)}
                      title="Más opciones"
                      aria-label="Menú de opciones"
                      aria-expanded={desktopMenuOpen === seller.id}
                      aria-haspopup="true"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <circle cx="12" cy="6" r="1.5" fill="currentColor" />
                        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                        <circle cx="12" cy="18" r="1.5" fill="currentColor" />
                      </svg>
                    </button>
                    {desktopMenuOpen === seller.id && (
                      <div
                        className={styles.desktopMenuDropdown}
                        role="menu"
                      >
                        <button
                          type="button"
                          role="menuitem"
                          className={styles.desktopMenuItem}
                          onClick={() => handleDesktopEdit(seller)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Editar datos
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          className={styles.desktopMenuItem}
                          onClick={() => handleDesktopToggleStatus(seller.id)}
                        >
                          {seller.status === 'active' ? (
                            <>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              Deshabilitar
                            </>
                          ) : (
                            <>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              Habilitar
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile List View — lista de filas, sin tabla; UX optimizada */}
      <div
        className={`${styles.mobileListContainer} ${selectedSellers.length > 0 ? styles.hasStickyBar : ''}`}
        role="list"
      >
        {filteredSellers.map((seller) => (
          <article
            key={seller.id}
            role="listitem"
            className={`${styles.mobileListRow} ${seller.status === 'inactive' ? styles.mobileRowInactive : ''} ${selectedSellers.includes(seller.id) ? styles.mobileRowSelected : ''}`}
          >
            <div className={styles.mobileRowCheckbox}>
              <input
                type="checkbox"
                id={`seller-${seller.id}`}
                checked={selectedSellers.includes(seller.id)}
                onChange={() => handleSelectSeller(seller.id)}
                disabled={seller.status === 'inactive'}
                className={styles.mobileCheckbox}
                aria-label={`Seleccionar ${seller.firstName} ${seller.lastName}`}
              />
            </div>
            <div className={styles.mobileRowMain}>
              <div className={styles.mobileRowTop}>
                <h3 className={styles.mobileRowName}>
                  {seller.firstName} {seller.lastName}
                </h3>
                <div className={styles.mobileMenuContainer}>
                  <button
                    type="button"
                    className={styles.mobileMenuButton}
                    onClick={() => handleMobileMenuToggle(seller.id)}
                    title="Más opciones"
                    aria-label="Menú de opciones"
                    aria-expanded={mobileMenuOpen === seller.id}
                    aria-haspopup="true"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <circle cx="12" cy="6" r="1.5" fill="currentColor" />
                      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                      <circle cx="12" cy="18" r="1.5" fill="currentColor" />
                    </svg>
                  </button>
                  {mobileMenuOpen === seller.id && (
                    <div className={styles.mobileMenuDropdown} role="menu">
                      <button
                        type="button"
                        role="menuitem"
                        className={styles.mobileMenuItem}
                        onClick={() => handleMobileEdit(seller)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Editar datos
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className={styles.mobileMenuItem}
                        onClick={() => handleMobileToggleStatus(seller.id)}
                      >
                        {seller.status === 'active' ? (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Deshabilitar
                          </>
                        ) : (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12 C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Habilitar
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className={styles.mobileRowPhone}>{seller.phone}</p>
              <p className={styles.mobileRowEventLine}>
                {seller.assignedEvents.length > 0
                  ? (() => {
                    const firstEvent = events.find(e => e.id === seller.assignedEvents[0]);
                    return firstEvent ? firstEvent.name : 'Sin evento';
                  })()
                  : 'Sin evento asignado'}
              </p>
            </div>
          </article>
        ))}
      </div>

      {filteredSellers.length === 0 && (
        <div className={styles.emptyState}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="7" r="4" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.6977C21.7033 16.0413 20.9999 15.5767 20.2 15.3778" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 3.37781C16.7999 3.57668 17.5033 4.04129 18.0094 4.6977C18.5155 5.35411 18.8 6.16449 18.8 7C18.8 7.83551 18.5155 8.64589 18.0094 9.3023C17.5033 9.95871 16.7999 10.4233 16 10.6222" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
            <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Operación exitosa</span>
        </div>
      )}

      {/* Error Snackbar */}
      {errorSnackbar.isVisible && (
        <div className={`${styles.snackbarError} ${errorSnackbar.isClosing ? styles.snackbarClosing : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="16" r="1" fill="currentColor" />
          </svg>
          <span>Error al procesar la solicitud</span>
        </div>
      )}

    </div>
  );
}
