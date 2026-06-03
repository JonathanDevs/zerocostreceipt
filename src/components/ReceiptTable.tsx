/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { Search, Edit, Trash2, Eye, Calendar, DollarSign, Archive, Tag, MapPin, X, Check, Plus, AlertCircle } from 'lucide-react';
import { Receipt, ReceiptItem } from '../types';

interface ReceiptTableProps {
  receipts: Receipt[];
  onReceiptUpdated: (receipt: Receipt) => void;
  onReceiptDeleted: (id: string) => void;
}

const CATEGORIES = [
  'Alimentación',
  'Servicios',
  'Transporte',
  'Tecnología',
  'Salud',
  'Entretenimiento',
  'Hogar',
  'Educación',
  'Otros'
];

export default function ReceiptTable({ receipts, onReceiptUpdated, onReceiptDeleted }: ReceiptTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCurrency, setSelectedCurrency] = useState('All');

  // Modal and editing states
  const [viewingReceipt, setViewingReceipt] = useState<Receipt | null>(null);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);

  // Form error states for editing validation
  const [editErrors, setEditErrors] = useState<string | null>(null);

  // Extract unique currencies available in current receipts list
  const uniqueCurrencies = Array.from(new Set(receipts.map(r => r.moneda.toUpperCase()))).filter(Boolean);

  // Filter receipts according to filters and search string
  const filteredReceipts = receipts.filter((receipt) => {
    const matchesSearch =
      receipt.comercio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (receipt.rif_o_identificacion_fiscal || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.categoria_sugerida.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || receipt.categoria_sugerida === selectedCategory;
    const matchesCurrency = selectedCurrency === 'All' || receipt.moneda.toUpperCase() === selectedCurrency;

    return matchesSearch && matchesCategory && matchesCurrency;
  });

  // Handle saving the modified receipt edits
  const handleSaveEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingReceipt) return;

    if (!editingReceipt.comercio.trim()) {
      setEditErrors('El nombre del comercio es obligatorio.');
      return;
    }
    if (!editingReceipt.fecha_emision) {
      setEditErrors('La fecha de emisión es obligatoria.');
      return;
    }
    if (isNaN(Number(editingReceipt.total)) || Number(editingReceipt.total) < 0) {
      setEditErrors('El monto total debe ser un número positivo.');
      return;
    }

    setEditErrors(null);
    onReceiptUpdated(editingReceipt);
    setEditingReceipt(null);
  };

  // Add a new empty item in the edit modal
  const handleAddEditItem = () => {
    if (!editingReceipt) return;
    const newItems = [...editingReceipt.items, { descripcion: '', cantidad: 1, precio_unitario: 0 }];
    setEditingReceipt({ ...editingReceipt, items: newItems });
  };

  // Remove an item indexed in the edit modal
  const handleRemoveEditItem = (index: number) => {
    if (!editingReceipt) return;
    const newItems = editingReceipt.items.filter((_, idx) => idx !== index);
    
    // Automatically recalculate subtotal and total after removing items
    const subtotal = newItems.reduce((acc, curr) => acc + (curr.cantidad * curr.precio_unitario), 0);
    const taxes = editingReceipt.impuestos;
    const total = subtotal + taxes;

    setEditingReceipt({
      ...editingReceipt,
      items: newItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    });
  };

  // Edit item details and automatically recalculate financial numbers
  const handleEditItemChange = (index: number, field: keyof ReceiptItem, value: string | number) => {
    if (!editingReceipt) return;
    const newItems = editingReceipt.items.map((item, idx) => {
      if (idx === index) {
        return { ...item, [field]: value };
      }
      return item;
    });

    // Recalculate subtotal/total on items changes
    const subtotal = newItems.reduce((acc, curr) => acc + (curr.cantidad * curr.precio_unitario), 0);

    const taxes = editingReceipt.impuestos;
    const total = subtotal + taxes;

    setEditingReceipt({
      ...editingReceipt,
      items: newItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    });
  };

  return (
    <div id="receipt-table-wrapper" className="space-y-4">
      {/* Search and Filters Strip */}
      <div id="filters-strip" className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 border border-[#E5E7EB] rounded-2xl shadow-xs">
        {/* Search Searchbar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Buscar por comercio, RIF..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm pl-10 pr-4 py-2 bg-[#F3F4F6] border-transparent rounded-lg focus:bg-white focus:ring-1 focus:ring-black focus:border-black transition-all text-[#111827]"
          />
        </div>

        {/* Selected Filters Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
          {/* Categoria Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-[#F3F4F6] hover:bg-[#E5E7EB] border-transparent rounded-lg px-3 py-2 text-[#4B5563] font-medium focus:bg-white focus:ring-1 focus:ring-black focus:border-[#111827]"
          >
            <option value="All">Todas las Categorías</option>
            {CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Moneda Filter */}
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="text-xs bg-[#F3F4F6] hover:bg-[#E5E7EB] border-transparent rounded-lg px-3 py-2 text-[#4B5563] font-medium focus:bg-white focus:ring-1 focus:ring-black focus:border-[#111827]"
          >
            <option value="All">Todas las Monedas</option>
            {uniqueCurrencies.map(currency => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Data Table */}
      <div id="table-scroll-container" className="bg-white border border-[#E5E7EB] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="receipts-main-table">
            <thead>
              <tr className="bg-white border-b border-[#F3F4F6] text-[#9CA3AF] text-[10px] uppercase tracking-widest font-bold">
                <th className="py-3.5 px-5">Fecha</th>
                <th className="py-3.5 px-5">Comercio / RIF</th>
                <th className="py-3.5 px-5">Categoría</th>
                <th className="py-3.5 px-5 text-right">Impuestos</th>
                <th className="py-3.5 px-5 text-right">Total</th>
                <th className="py-3.5 px-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#6B7280] text-sm font-medium">
                    No se encontraron recibos que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((receipt) => (
                  <tr key={receipt.id} id={`receipt-row-${receipt.id}`} className="hover:bg-[#F9FAFB] transition-all duration-150 group">
                    {/* Column 1: Date */}
                    <td className="py-4 px-5 text-sm font-normal text-[#111827] self-center">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#6B7280] flex-shrink-0" />
                        <span>{receipt.fecha_emision}</span>
                      </div>
                    </td>

                    {/* Column 2: Trade details */}
                    <td className="py-4 px-5">
                      <div className="max-w-[220px]">
                        <span className="text-sm font-bold text-[#111827] block truncate" title={receipt.comercio}>
                          {receipt.comercio}
                        </span>
                        <span className="text-[10px] text-[#6B7280] font-mono block mt-0.5">
                          {receipt.rif_o_identificacion_fiscal || 'Sin identificación fiscal'}
                        </span>
                      </div>
                    </td>

                    {/* Column 3: Category */}
                    <td className="py-4 px-5">
                      {receipt.categoria_sugerida === 'Alimentación' || receipt.categoria_sugerida?.toLowerCase() === 'food' || receipt.categoria_sugerida?.toLowerCase() === 'alimentacion' ? (
                        <span className="inline-flex px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded uppercase">
                          {receipt.categoria_sugerida}
                        </span>
                      ) : receipt.categoria_sugerida === 'Servicios' || receipt.categoria_sugerida?.toLowerCase() === 'services' ? (
                        <span className="inline-flex px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase">
                          {receipt.categoria_sugerida}
                        </span>
                      ) : receipt.categoria_sugerida === 'Tecnología' || receipt.categoria_sugerida?.toLowerCase() === 'electronics' || receipt.categoria_sugerida?.toLowerCase() === 'tecnologia' ? (
                        <span className="inline-flex px-2 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold rounded uppercase">
                          {receipt.categoria_sugerida}
                        </span>
                      ) : receipt.categoria_sugerida === 'Transporte' || receipt.categoria_sugerida?.toLowerCase() === 'transport' ? (
                        <span className="inline-flex px-2 py-1 bg-orange-50 text-orange-700 text-[10px] font-bold rounded uppercase">
                          {receipt.categoria_sugerida}
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 bg-[#F3F4F6] text-[#6B7280] text-[10px] font-bold rounded uppercase">
                          {receipt.categoria_sugerida}
                        </span>
                      )}
                    </td>

                    {/* Column 4: Impuestos */}
                    <td className="py-4 px-5 text-right font-mono text-xs text-[#6B7280]">
                      {receipt.moneda} {receipt.impuestos.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Column 5: Total */}
                    <td className="py-4 px-5 text-right">
                      <span className="font-bold text-[#111827] font-mono text-sm tracking-tighter">
                        {receipt.moneda} {receipt.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* Column 6: Actions */}
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center gap-1.5 opacity-80 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* View Action */}
                        <button
                          onClick={() => setViewingReceipt(receipt)}
                          id={`action-view-${receipt.id}`}
                          title="Ver Detalle"
                          className="p-1.5 hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {/* Edit Action */}
                        <button
                          onClick={() => setEditingReceipt(receipt)}
                          id={`action-edit-${receipt.id}`}
                          title="Editar Recibo"
                          className="p-1.5 hover:bg-[#F3F4F6] text-[#6B7280] hover:text-black rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {/* Delete Action */}
                        <button
                          onClick={() => onReceiptDeleted(receipt.id)}
                          id={`action-delete-${receipt.id}`}
                          title="Eliminar Recibo"
                          className="p-1.5 hover:bg-[#F3F4F6] text-[#6B7280] hover:text-[#EF4444] rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW RECEIPT DETAILS DIALOG MODAL */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-xl border border-[#E5E7EB] flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between bg-white rounded-t-3xl">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-[#6B7280] bg-[#F3F4F6] border border-[#E5E7EB] px-2.5 py-1 rounded-md">
                  Factura de Venta
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2 truncate max-w-md">
                  {viewingReceipt.comercio}
                </h3>
              </div>
              <button
                onClick={() => setViewingReceipt(null)}
                className="p-1.5 text-[#9CA3AF] hover:text-black hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Details */}
            <div className="p-6 space-y-6 flex-1">
              
              {/* Meta Parameters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F9FAFB] p-5 rounded-2xl border border-[#E5E7EB]">
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono text-[#6B7280] uppercase">Emisión</div>
                  <div className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#6B7280]" />
                    {viewingReceipt.fecha_emision}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono text-[#6B7280] uppercase">Identificación Fiscal / RIF</div>
                  <div className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                    <Archive className="w-3.5 h-3.5 text-[#6B7280]" />
                    {viewingReceipt.rif_o_identificacion_fiscal || 'No detectado'}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono text-[#6B7280] uppercase">Categoría Sugerida</div>
                  <div className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#6B7280]" />
                    {viewingReceipt.categoria_sugerida}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono text-[#6B7280] uppercase">Moneda Facturada</div>
                  <div className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-[#6B7280]" />
                    {viewingReceipt.moneda}
                  </div>
                </div>
              </div>

              {/* Items Table List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold font-mono uppercase text-[#6B7280] tracking-wider">
                  Detalle de Artículos ({viewingReceipt.items.length})
                </h4>
                <div className="border border-[#E5E7EB] rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#6B7280] font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Descripción</th>
                        <th className="py-2.5 px-3 text-center">Cant.</th>
                        <th className="py-2.5 px-3 text-right">Precio Un.</th>
                        <th className="py-3 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6] text-[#4B5563]">
                      {viewingReceipt.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#F9FAFB]/50 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-neutral-850">{item.descripcion}</td>
                          <td className="py-2.5 px-3 text-center font-mono">{item.cantidad}</td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            {viewingReceipt.moneda} {item.precio_unitario.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-800">
                            {viewingReceipt.moneda} {(item.cantidad * item.precio_unitario).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Recap Row */}
              <div className="border-t border-[#E5E7EB] pt-4 flex flex-col items-end space-y-1 text-sm font-mono text-[#6B7280]">
                <div className="flex gap-10">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-neutral-800 text-right min-w-[100px]">
                    {viewingReceipt.moneda} {viewingReceipt.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex gap-10">
                  <span>Impuestos (IVA):</span>
                  <span className="font-semibold text-neutral-800 text-right min-w-[100px]">
                    {viewingReceipt.moneda} {viewingReceipt.impuestos.toFixed(2)}
                  </span>
                </div>
                <div className="flex gap-10 text-base font-bold text-slate-800 border-t border-[#E5E7EB] pt-2.5 mt-2 flex-row">
                  <span>Total Facturado:</span>
                  <span className="text-right min-w-[100px] text-black font-light tracking-tighter text-lg font-sans">
                    {viewingReceipt.moneda} {viewingReceipt.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Additional Notes or Image Preview */}
              {viewingReceipt.notes && (
                <div className="p-4 bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl text-xs text-[#4B5563]">
                  <span className="font-bold uppercase tracking-wider text-[9px] block mb-1">Notas locales:</span>
                  {viewingReceipt.notes}
                </div>
              )}

              {/* Local document preview if available */}
              {viewingReceipt.imageUrl && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold font-mono uppercase text-[#6B7280]">Captura del Recibo:</span>
                  <div className="border border-[#E5E7EB] rounded-xl max-h-[220px] overflow-hidden bg-[#F9FAFB] flex items-center justify-center p-1.5 shadow-xs">
                    <img
                      src={viewingReceipt.imageUrl}
                      alt="Recibo"
                      className="max-h-[200px] rounded-lg object-contain border border-[#E5E7EB]"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="p-4 border-t border-[#E5E7EB] bg-[#F9FAFB] rounded-b-3xl flex justify-end gap-2">
              <button
                onClick={() => setViewingReceipt(null)}
                className="px-6 py-2.5 bg-black hover:opacity-90 text-white rounded-full font-medium transition-all text-xs cursor-pointer shadow-xs"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT RECEIPT DIALOG MODAL */}
      {editingReceipt && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-xl border border-[#E5E7EB] flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between bg-white rounded-t-3xl">
              <h3 className="text-base font-bold text-slate-900">
                Editar Datos de Factura/Recibo
              </h3>
              <button
                onClick={() => setEditingReceipt(null)}
                className="p-1.5 text-[#9CA3AF] hover:text-black hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Details */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-6 flex-1">
              
              {editErrors && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {editErrors}
                </div>
              )}

              {/* Main Fields Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Comercio */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#6B7280]">Comercio / Establecimiento</label>
                  <input
                    type="text"
                    value={editingReceipt.comercio}
                    onChange={(e) => setEditingReceipt({ ...editingReceipt, comercio: e.target.value })}
                    className="w-full text-xs px-3.5 py-2 border border-[#E5E7EB] rounded-lg focus:ring-1 focus:ring-black focus:outline-none focus:border-black bg-[#F9FAFB] focus:bg-white text-neutral-850 font-medium"
                  />
                </div>

                {/* Identificacion fiscal */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#6B7280]">RIF o ID Fiscal</label>
                  <input
                    type="text"
                    value={editingReceipt.rif_o_identificacion_fiscal || ''}
                    onChange={(e) => setEditingReceipt({ ...editingReceipt, rif_o_identificacion_fiscal: e.target.value || null })}
                    className="w-full text-xs px-3.5 py-2 border border-[#E5E7EB] rounded-lg focus:ring-1 focus:ring-black focus:outline-none focus:border-black bg-[#F9FAFB] focus:bg-white text-neutral-850 font-mono"
                    placeholder="Ej. J-31415926-5"
                  />
                </div>

                {/* Fecha */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#6B7280]">Fecha de Emisión</label>
                  <input
                    type="date"
                    value={editingReceipt.fecha_emision}
                    onChange={(e) => setEditingReceipt({ ...editingReceipt, fecha_emision: e.target.value })}
                    className="w-full text-xs px-3.5 py-2 border border-[#E5E7EB] rounded-lg focus:ring-1 focus:ring-black focus:outline-none focus:border-black bg-[#F9FAFB] focus:bg-white text-neutral-850 font-medium"
                  />
                </div>

                {/* Categoria */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#6B7280]">Categoría</label>
                  <select
                    value={editingReceipt.categoria_sugerida}
                    onChange={(e) => setEditingReceipt({ ...editingReceipt, categoria_sugerida: e.target.value })}
                    className="w-full text-xs px-3.5 py-2 border border-[#E5E7EB] rounded-lg focus:ring-1 focus:ring-black focus:outline-none focus:border-black bg-[#F9FAFB] focus:bg-white text-neutral-850 font-medium cursor-pointer"
                  >
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Moneda */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#6B7280]">Moneda</label>
                  <input
                    type="text"
                    value={editingReceipt.moneda}
                    onChange={(e) => setEditingReceipt({ ...editingReceipt, moneda: e.target.value.toUpperCase() })}
                    className="w-full text-xs px-3.5 py-2 border border-[#E5E7EB] rounded-lg focus:ring-1 focus:ring-black focus:outline-none focus:border-black bg-[#F9FAFB] focus:bg-white text-neutral-850 font-mono text-center uppercase"
                    placeholder="Ej. USD o VES"
                  />
                </div>

                {/* Impuestos */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#6B7280]">Impuestos / IVA ({editingReceipt.moneda})</label>
                  <input
                    type="number"
                    step="any"
                    value={editingReceipt.impuestos}
                    onChange={(e) => {
                      const newTaxes = parseFloat(parseFloat(e.target.value).toFixed(2)) || 0;
                      const subtotal = editingReceipt.subtotal;
                      const total = subtotal + newTaxes;
                      setEditingReceipt({
                        ...editingReceipt,
                        impuestos: newTaxes,
                        total: parseFloat(total.toFixed(2))
                      });
                    }}
                    className="w-full text-xs px-3.5 py-2 border border-[#E5E7EB] rounded-lg focus:ring-1 focus:ring-black focus:outline-none focus:border-black bg-[#F9FAFB] focus:bg-white text-neutral-850 font-mono"
                  />
                </div>
              </div>

              {/* Items List Fields */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#6B7280]">Editar Desglose de Artículos</span>
                  <button
                    type="button"
                    onClick={handleAddEditItem}
                    className="text-[10px] font-bold text-black border border-black px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-[#F3F4F6] transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar Ítem
                  </button>
                </div>

                <div className="border border-[#E5E7EB] rounded-xl max-h-[160px] overflow-y-auto space-y-2 p-2 bg-[#F9FAFB]/60 shadow-xs">
                  {editingReceipt.items.length === 0 ? (
                    <div className="text-center py-6 text-[#6B7280] text-xs">Sin artículos. Agrega uno.</div>
                  ) : (
                    editingReceipt.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-[#E5E7EB]">
                        {/* Desc */}
                        <div className="flex-1">
                          <input
                            type="text"
                            value={item.descripcion}
                            onChange={(e) => handleEditItemChange(idx, 'descripcion', e.target.value)}
                            placeholder="Nombre del artículo"
                            className="w-full text-[11px] px-2 py-1 border border-[#E5E7EB] rounded-md focus:outline-none focus:border-black font-semibold"
                          />
                        </div>

                        {/* Cantidad */}
                        <div className="w-16">
                          <input
                            type="number"
                            value={item.cantidad}
                            onChange={(e) => handleEditItemChange(idx, 'cantidad', parseFloat(e.target.value) || 0)}
                            placeholder="Cant"
                            className="w-full text-[11px] px-2 py-1 border border-[#E5E7EB] rounded-md focus:outline-none text-center font-mono"
                          />
                        </div>

                        {/* Precio */}
                        <div className="w-24">
                          <input
                            type="number"
                            step="any"
                            value={item.precio_unitario}
                            onChange={(e) => handleEditItemChange(idx, 'precio_unitario', parseFloat(e.target.value) || 0)}
                            placeholder="Pre. Un."
                            className="w-full text-[11px] px-2 py-1 border border-[#E5E7EB] rounded-md focus:outline-none focus:border-black text-right font-mono"
                          />
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => handleRemoveEditItem(idx)}
                          className="p-1 hover:bg-rose-50 text-[#9CA3AF] hover:text-[#EF4444] rounded-md transition-all cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Total Calculation Display */}
              <div className="border-t border-[#E5E7EB] pt-4 flex flex-col items-end gap-1.5 text-xs font-mono font-bold text-[#6B7280]">
                <div>Subtotal: {editingReceipt.moneda} {editingReceipt.subtotal.toFixed(2)}</div>
                <div>Impuestos: {editingReceipt.moneda} {editingReceipt.impuestos.toFixed(2)}</div>
                <div className="text-sm text-black mt-1.5 border-t border-[#E5E7EB] pt-1.5 font-sans font-light text-base tracking-tighter">
                  Monto Total: <span className="font-bold font-sans">{editingReceipt.moneda} {editingReceipt.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-5 border-t border-[#E5E7EB] rounded-b-3xl bg-[#F9FAFB] flex justify-end gap-2 -mx-6 -mb-6">
                <button
                  type="button"
                  onClick={() => setEditingReceipt(null)}
                  className="px-5 py-2.5 bg-white border border-[#E5E7EB] text-neutral-700 rounded-full font-medium text-xs hover:bg-[#F3F4F6] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-black hover:opacity-90 text-white rounded-full font-medium text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" /> Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
