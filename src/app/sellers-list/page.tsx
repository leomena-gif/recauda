'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Seller, Event, StatusFilter } from '@/types/models';
import { STATUS_OPTIONS, SNACKBAR_DURATION } from '@/constants';
import { useSnackbar } from '@/hooks/useSnackbar';
import { MOCK_SELLERS, MOCK_EVENTS } from '@/mocks/data';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import CustomDropdown from '@/components/CustomDropdown';
import MobileListRow from '@/components/MobileListRow';
import MobileFilterSheet from '@/components/MobileFilterSheet';
import BottomSheet from '@/components/BottomSheet';
import MobileStickyActionBar from '@/components/MobileStickyActionBar';
import EmptyState from '@/components/EmptyState';
import listStyles from '@/styles/list.module.css';
import styles from './SellersList.module.css';

export default function SellersList() {
  const router = useRouter();
  // State
  const [sellers, setSellers] = useState<Seller[]>(MOCK_SELLERS);
  const [events] = useState<Event[]>(MOCK_EVENTS);

  const [selectedSellers, setSelectedSellers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [assigningSellerId, setAssigningSellerId] = useState<string | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

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
      if (mobileMenuOpen && !(event.target as Element).closest(`.${listStyles.mobileMenuContainer}`)) {
        handleMobileMenuClose();
      }
      if (desktopMenuOpen && !(event.target as Element).closest(`.${listStyles.desktopMenuContainer}`)) {
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
        (seller.assignedEvents.length > 0 && events.find(e =>
          e.id === seller.assignedEvents[0] &&
          e.name.toLowerCase().includes(searchTerm.toLowerCase())
        ));
      const matchesStatus = statusFilter === 'all' || seller.status === statusFilter;
      const matchesEvent =
        eventFilter === 'all'
          ? true
          : eventFilter === 'no_event'
          ? seller.assignedEvents.length === 0
          : eventFilter === 'active_events'
          ? seller.assignedEvents.some(eventId => events.find(e => e.id === eventId)?.status === 'active')
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

  const handleDesktopAssignFromMenu = (seller: Seller) => {
    setAssigningSellerId(seller.id);
    setDesktopMenuOpen(null);
    setAssignModalOpen(true);
  };

  const handleMobileAssignFromMenu = (seller: Seller) => {
    setAssigningSellerId(seller.id);
    handleMobileMenuClose();
    setAssignSheetOpen(true);
  };

  const handleCloseAssignModal = () => {
    setAssignModalOpen(false);
    setAssigningSellerId(null);
  };

  const handleToggleSellerStatus = (sellerId: string) => {
    setSellers(prevSellers =>
      prevSellers.map(seller => {
        if (seller.id === sellerId) {
          const newStatus = seller.status === 'active' ? 'inactive' : 'active';
          if (newStatus === 'inactive' && selectedSellers.includes(sellerId)) {
            setSelectedSellers(prev => prev.filter(id => id !== sellerId));
          }
          return { ...seller, status: newStatus };
        }
        return seller;
      })
    );
  };

  const handleAssignToEvent = useCallback((eventId: string) => {
    const hasTargets = assigningSellerId || selectedSellers.length > 0;
    if (eventId && hasTargets) {
      setSelectedSellers([]);
      setAssigningSellerId(null);
      setAssignSheetOpen(false);
      setAssignModalOpen(false);
      successSnackbar.showSnackbar();
    }
  }, [assigningSellerId, selectedSellers, successSnackbar]);

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
  const closeAssignSheet = () => { setAssignSheetOpen(false); setAssigningSellerId(null); };
  const handleMobileAssignCancel = () => {
    setSelectedSellers([]);
    setAssigningSellerId(null);
    setAssignSheetOpen(false);
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

  // SVG icons reused in menus
  const IconAssign = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 8L21 10L25 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const IconEdit = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const IconDisable = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const IconEnable = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const IconDotsVertical = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="6" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="18" r="1.5" fill="currentColor" />
    </svg>
  );

  return (
    <div className="pageContainer">
      <div className={listStyles.stickyHeader}>
        <div className={listStyles.header}>
          <div className={listStyles.titleSection}>
            <h1 className="pageTitle">Lista de vendedores</h1>
          </div>
          <div className={listStyles.headerActions}>
            <button className="btn btn-primary" onClick={handleAddSeller}>
              Agregar vendedor
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className={listStyles.actionBar}>
          <div className={listStyles.leftSection}>
            <div className={listStyles.searchContainer}>
              <svg className={listStyles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input
                type="text"
                placeholder={isDesktop ? "Buscar por nombre, teléfono o evento" : "Buscar por teléfono o evento"}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={listStyles.searchInput}
              />
            </div>

            {/* Desktop: dos filtros en línea */}
            <div className={listStyles.filtersGroupDesktop}>
              <div className={listStyles.statusFilter}>
                <CustomDropdown
                  options={STATUS_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))}
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value as StatusFilter)}
                  placeholder="Filtrar por estado"
                />
              </div>
              <div className={listStyles.eventFilter}>
                <CustomDropdown
                  options={[
                    { value: 'all', label: 'Todos los eventos' },
                    ...activeEvents.map(event => ({ value: event.id, label: event.name })),
                    { value: 'no_event', label: 'Sin evento asignado' },
                  ]}
                  value={eventFilter}
                  onChange={(value) => setEventFilter(value as string)}
                  placeholder="Filtrar por evento"
                  alignRight={true}
                />
              </div>
            </div>

            {/* Mobile: botón Filtros abre sheet */}
            {!isDesktop && (
              <button
                type="button"
                className={listStyles.filtersTriggerMobile}
                onClick={openFiltersSheet}
                aria-label="Abrir filtros"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M4 6h16M4 12h16M4 18h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Filtros</span>
              </button>
            )}
          </div>

          {/* Botón Asignar a evento (Desktop, cuando hay selección) */}
          {isDesktop && selectedSellers.length > 0 && (
            <button
              className="btn btn-sm btn-primary"
              onClick={() => setAssignModalOpen(true)}
            >
              Asignar a evento ({selectedSellers.length})
            </button>
          )}
        </div>
      </div>

      {/* Mobile: sticky bottom bar Asignar (solo cuando hay selección) */}
      <MobileStickyActionBar
        visible={!isDesktop && selectedSellers.length > 0}
        onCancel={handleMobileAssignCancel}
      >
        <button
          type="button"
          className={listStyles.assignStickyPrimary}
          onClick={openAssignSheet}
        >
          Asignar a evento ({selectedSellers.length})
        </button>
      </MobileStickyActionBar>

      {/* Mobile: bottom sheet Filtros */}
      <MobileFilterSheet isOpen={!isDesktop && filtersSheetOpen} onClose={closeFiltersSheet}>
        <div className={listStyles.sheetFilterGroup}>
          <span className={listStyles.sheetFilterLabel}>Estado</span>
          <div className={listStyles.sheetFilterOptions}>
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={statusFilter === opt.value ? listStyles.sheetFilterOptionActive : listStyles.sheetFilterOption}
                onClick={() => setStatusFilter(opt.value as StatusFilter)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className={listStyles.sheetFilterGroup}>
          <span className={listStyles.sheetFilterLabel}>Evento</span>
          <div className={listStyles.sheetFilterOptions}>
            {[
              { value: 'all', label: 'Todos los eventos' },
              ...activeEvents.map(event => ({ value: event.id, label: event.name })),
              { value: 'no_event', label: 'Sin evento asignado' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={eventFilter === opt.value ? listStyles.sheetFilterOptionActive : listStyles.sheetFilterOption}
                onClick={() => setEventFilter(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </MobileFilterSheet>

      {/* Mobile: bottom sheet Asignar evento */}
      <BottomSheet
        isOpen={!isDesktop && assignSheetOpen}
        onClose={closeAssignSheet}
        label="Asignar a evento"
        title="Asignar a evento"
      >
        {activeEvents.length > 0 ? (
          <div className={styles.sheetEventList}>
            {activeEvents.map((event) => (
              <button key={event.id} type="button" className={styles.sheetEventButton} onClick={() => handleAssignToEvent(event.id)}>
                <div className={styles.sheetEventStatus}>
                  <span className={styles.sheetEventStatusDot}></span>
                  <span className={styles.sheetEventStatusText}>Activo</span>
                </div>
                <div className={styles.sheetEventName}>{event.name}</div>
              </button>
            ))}
          </div>
        ) : (
          <p className={styles.sheetNoEvents}>No hay eventos activos</p>
        )}
      </BottomSheet>

      {/* Desktop Table View */}
      <div className={listStyles.tableContainer}>
        <table className={listStyles.table}>
          <thead>
            <tr>
              <th className={listStyles.checkboxColumn}>
                <div className={listStyles.checkboxWrapper}>
                  <input
                    type="checkbox"
                    checked={
                      filteredSellers.filter(s => s.status === 'active').length > 0 &&
                      selectedSellers.length === filteredSellers.filter(s => s.status === 'active').length
                    }
                    onChange={handleSelectAll}
                    className={listStyles.checkbox}
                    disabled={filteredSellers.filter(s => s.status === 'active').length === 0}
                    title={filteredSellers.filter(s => s.status === 'active').length === 0 ? 'No hay vendedores activos para seleccionar' : 'Seleccionar todos los vendedores activos'}
                    aria-label={filteredSellers.filter(s => s.status === 'active').length === 0 ? 'No hay vendedores activos para seleccionar' : 'Seleccionar todos los vendedores activos'}
                  />
                </div>
              </th>
              <th>
                <div className={listStyles.headerWithCounter}>
                  <span>Vendedor</span>
                  <span className={listStyles.headerCounter}>{filteredSellers.length}</span>
                </div>
              </th>
              <th>Evento Asignado</th>
              <th className={listStyles.actionsColumn}></th>
            </tr>
          </thead>
          <tbody>
            {filteredSellers.map((seller) => (
              <tr
                key={seller.id}
                className={`${listStyles.tableRow} ${seller.status === 'inactive' ? listStyles.tableRowInactive : ''}`}
              >
                <td className={listStyles.checkboxColumn}>
                  <div className={listStyles.checkboxWrapper}>
                    <input
                      type="checkbox"
                      checked={selectedSellers.includes(seller.id)}
                      onChange={() => handleSelectSeller(seller.id)}
                      disabled={seller.status === 'inactive'}
                      className={listStyles.checkbox}
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
                  <div className={listStyles.eventInfo}>
                    {seller.assignedEvents.length > 0 ? (
                      <div className={listStyles.eventName}>
                        {(() => {
                          const firstEvent = events.find(e => e.id === seller.assignedEvents[0]);
                          return firstEvent ? firstEvent.name : 'Sin evento';
                        })()}
                      </div>
                    ) : (
                      <div className={listStyles.noEvent}>Sin evento asignado</div>
                    )}
                  </div>
                </td>
                <td className={listStyles.actionsColumn}>
                  <div className={listStyles.desktopMenuContainer}>
                    <button
                      className={listStyles.desktopMenuButton}
                      onClick={() => handleDesktopMenuToggle(seller.id)}
                      title="Más opciones"
                      aria-label="Menú de opciones"
                      aria-expanded={desktopMenuOpen === seller.id}
                      aria-haspopup="true"
                    >
                      <IconDotsVertical />
                    </button>
                    {desktopMenuOpen === seller.id && (
                      <div className={listStyles.desktopMenuDropdown} role="menu">
                        {seller.status === 'active' && (
                          <button
                            type="button"
                            role="menuitem"
                            className={listStyles.desktopMenuItem}
                            onClick={() => handleDesktopAssignFromMenu(seller)}
                          >
                            <IconAssign />
                            Asignar a evento
                          </button>
                        )}
                        <button
                          type="button"
                          role="menuitem"
                          className={listStyles.desktopMenuItem}
                          onClick={() => handleDesktopEdit(seller)}
                        >
                          <IconEdit />
                          Editar datos
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          className={listStyles.desktopMenuItem}
                          onClick={() => handleDesktopToggleStatus(seller.id)}
                        >
                          {seller.status === 'active' ? <><IconDisable /> Deshabilitar</> : <><IconEnable /> Habilitar</>}
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

      {/* Mobile List View */}
      {!isDesktop && (
        <div
          className={`${listStyles.mobileListContainer} ${selectedSellers.length > 0 ? listStyles.hasStickyBar : ''}`}
          role="list"
        >
          {filteredSellers.map((seller) => (
            <MobileListRow
              key={seller.id}
              id={seller.id}
              isInactive={seller.status === 'inactive'}
              isSelected={selectedSellers.includes(seller.id)}
              checkboxSlot={
                <input
                  type="checkbox"
                  id={`seller-${seller.id}`}
                  checked={selectedSellers.includes(seller.id)}
                  onChange={() => handleSelectSeller(seller.id)}
                  disabled={seller.status === 'inactive'}
                  className={listStyles.mobileCheckbox}
                  aria-label={`Seleccionar ${seller.firstName} ${seller.lastName}`}
                />
              }
              name={`${seller.firstName} ${seller.lastName}`}
              phone={seller.phone}
              eventLine={
                seller.assignedEvents.length > 0
                  ? (() => {
                    const firstEvent = events.find(e => e.id === seller.assignedEvents[0]);
                    return firstEvent ? firstEvent.name : 'Sin evento';
                  })()
                  : 'Sin evento asignado'
              }
              menuSlot={
                <div className={listStyles.mobileMenuContainer}>
                  <button
                    type="button"
                    className={listStyles.mobileMenuButton}
                    onClick={() => handleMobileMenuToggle(seller.id)}
                    title="Más opciones"
                    aria-label="Menú de opciones"
                    aria-expanded={mobileMenuOpen === seller.id}
                    aria-haspopup="true"
                  >
                    <IconDotsVertical />
                  </button>
                  {mobileMenuOpen === seller.id && (
                    <div className={listStyles.mobileMenuDropdown} role="menu">
                      {seller.status === 'active' && (
                        <button
                          type="button"
                          role="menuitem"
                          className={listStyles.mobileMenuItem}
                          onClick={() => handleMobileAssignFromMenu(seller)}
                        >
                          <IconAssign />
                          Asignar a evento
                        </button>
                      )}
                      <button
                        type="button"
                        role="menuitem"
                        className={listStyles.mobileMenuItem}
                        onClick={() => handleMobileEdit(seller)}
                      >
                        <IconEdit />
                        Editar datos
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className={listStyles.mobileMenuItem}
                        onClick={() => handleMobileToggleStatus(seller.id)}
                      >
                        {seller.status === 'active' ? <><IconDisable /> Deshabilitar</> : <><IconEnable /> Habilitar</>}
                      </button>
                    </div>
                  )}
                </div>
              }
            />
          ))}
        </div>
      )}

      {filteredSellers.length === 0 && (
        <EmptyState
          icon={
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="7" r="4" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.6977C21.7033 16.0413 20.9999 15.5767 20.2 15.3778" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 3.37781C16.7999 3.57668 17.5033 4.04129 18.0094 4.6977C18.5155 5.35411 18.8 6.16449 18.8 7C18.8 7.83551 18.5155 8.64589 18.0094 9.3023C17.5033 9.95871 16.7999 10.4233 16 10.6222" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          title="No se encontraron vendedores"
          description="Intenta ajustar los filtros de búsqueda"
        />
      )}

      {/* Assign to Event Modal */}
      {assignModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseAssignModal}>
          <div className={styles.assignModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Asignar a evento</h2>
              <button className={styles.closeButton} onClick={handleCloseAssignModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className={styles.assignModalContent}>
              {activeEvents.length > 0 ? (
                activeEvents.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    className={styles.assignEventCard}
                    onClick={() => handleAssignToEvent(event.id)}
                  >
                    <div className={styles.assignEventCardContent}>
                      <div className={styles.assignEventStatus}>
                        <span className={styles.assignStatusDot} />
                        <span>Activo</span>
                      </div>
                      <div className={styles.assignEventTitle}>{event.name}</div>
                    </div>
                  </button>
                ))
              ) : (
                <p className={styles.assignNoEvents}>No hay eventos activos</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Seller Modal */}
      {isEditModalOpen && editingSeller && (
        <div className={styles.modalOverlay} onClick={handleCancelEdit}>
          <div className={styles.editModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Editar vendedor</h2>
              <button className={styles.closeButton} onClick={handleCancelEdit}>
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
                <button className={styles.cancelButton} onClick={handleCancelEdit}>
                  Cancelar
                </button>
                <button className={styles.saveButton} onClick={handleSaveEdit}>
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile: Bottom Sheet Editar vendedor */}
      <BottomSheet
        isOpen={!isDesktop && isEditModalOpen && !!editingSeller}
        onClose={handleCancelEdit}
        label="Editar vendedor"
        title="Editar vendedor"
        footer={
          <div className={styles.editSheetActions}>
            <button className={styles.saveButton} onClick={handleSaveEdit}>Guardar Cambios</button>
            <button className={styles.cancelButton} onClick={handleCancelEdit}>Cancelar</button>
          </div>
        }
      >
        <div className={styles.editFormCard}>
          <div className={`${styles.editFieldGroup} ${editFormErrors.firstName ? styles.editError : ''}`}>
            <label className={styles.editLabel}>Nombre</label>
            <input type="text" className={styles.editInput} value={editFormData.firstName} onChange={handleEditInputChange('firstName')} placeholder="Ej: Leonardo" />
            {editFormErrors.firstName && <p className={styles.editErrorMessage}>{editFormErrors.firstName}</p>}
          </div>
          <div className={`${styles.editFieldGroup} ${editFormErrors.lastName ? styles.editError : ''}`}>
            <label className={styles.editLabel}>Apellido</label>
            <input type="text" className={styles.editInput} value={editFormData.lastName} onChange={handleEditInputChange('lastName')} placeholder="Ej: Mena" />
            {editFormErrors.lastName && <p className={styles.editErrorMessage}>{editFormErrors.lastName}</p>}
          </div>
          <div className={`${styles.editFieldGroup} ${editFormErrors.phone ? styles.editError : ''}`}>
            <label className={styles.editLabel}>Teléfono</label>
            <input type="tel" className={styles.editInput} value={editFormData.phone} onChange={handleEditInputChange('phone')} placeholder="Ej: 3584129488" />
            <p className={styles.editInstruction}>Escribe el número sin 0 y sin 15</p>
            {editFormErrors.phone && <p className={styles.editErrorMessage}>{editFormErrors.phone}</p>}
          </div>
        </div>
      </BottomSheet>

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
