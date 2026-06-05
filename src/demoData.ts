import { Receipt } from './types';
import { getDefaultIsTaxable, getDefaultTaxRate } from './utils/tax';

const t = (cat: string) => ({ isTaxable: getDefaultIsTaxable(cat), taxRate: getDefaultTaxRate(cat) });

export const DEMO_RECEIPTS: Receipt[] = [
  {
    id: 'demo-1',
    fecha_emision: '2026-05-20',
    comercio: 'Supermercado Central Plaza',
    rif_o_identificacion_fiscal: 'J-31415926-5',
    subtotal: 55.40,
    impuestos: 6.65,
    total: 62.05,
    moneda: 'USD',
    categoria_sugerida: 'Alimentación',
    ...t('Alimentación'),
    createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    items: [
      { descripcion: 'Harina de Maíz Precocida 1kg', cantidad: 4, precio_unitario: 1.50 },
      { descripcion: 'Queso Blanco Duro 1kg', cantidad: 1.2, precio_unitario: 6.50 },
      { descripcion: 'Filete de Merluza Congelado', cantidad: 2, precio_unitario: 8.90 },
      { descripcion: 'Arroz Premium Tipo I 1kg', cantidad: 5, precio_unitario: 1.20 },
      { descripcion: 'Aceite de Girasol 1L', cantidad: 2, precio_unitario: 3.20 },
      { descripcion: 'Caja de Huevos 30 und', cantidad: 1, precio_unitario: 5.50 }
    ],
    notes: 'Compra de víveres semanales en Supermercado Central Plaza'
  },
  {
    id: 'demo-2',
    fecha_emision: '2026-05-22',
    comercio: 'Farmacia RedVital',
    rif_o_identificacion_fiscal: 'J-40123456-7',
    subtotal: 18.50,
    impuestos: 0.00,
    total: 18.50,
    moneda: 'USD',
    categoria_sugerida: 'Salud',
    ...t('Salud'),
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    items: [
      { descripcion: 'Termómetro Digital Infrarrojo', cantidad: 1, precio_unitario: 12.00 },
      { descripcion: 'Vitamina C Efervescente 10 tab', cantidad: 2, precio_unitario: 3.25 }
    ],
    notes: 'Insumos de primera necesidad médica'
  },
  {
    id: 'demo-3',
    fecha_emision: '2026-05-15',
    comercio: 'Cantv Servicios',
    rif_o_identificacion_fiscal: 'G-20002161-0',
    subtotal: 310.00,
    impuestos: 49.60,
    total: 359.60,
    moneda: 'VES',
    categoria_sugerida: 'Servicios',
    ...t('Servicios'),
    createdAt: new Date(Date.now() - 11 * 24 * 3600 * 1000).toISOString(),
    items: [
      { descripcion: 'Servicio Plan Internet Aba Ultra 50Mbps', cantidad: 1, precio_unitario: 310.00 }
    ],
    notes: 'Factura mensual de servicio de telecomunicaciones de banda ancha'
  },
  {
    id: 'demo-4',
    fecha_emision: '2026-05-24',
    comercio: 'Estación de Servicio Blandin',
    rif_o_identificacion_fiscal: 'J-00109283-1',
    subtotal: 15.00,
    impuestos: 2.40,
    total: 17.40,
    moneda: 'USD',
    categoria_sugerida: 'Transporte',
    ...t('Transporte'),
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    items: [
      { descripcion: 'Gasolina Premium Sin Plomo - Litros', cantidad: 34.8, precio_unitario: 0.50 }
    ],
    notes: 'Llenado de tanque vehículo familiar'
  },
  {
    id: 'demo-5',
    fecha_emision: '2026-05-25',
    comercio: 'Tienda Electrónica Max',
    rif_o_identificacion_fiscal: 'J-29837461-2',
    subtotal: 125.00,
    impuestos: 20.00,
    total: 145.00,
    moneda: 'USD',
    categoria_sugerida: 'Tecnología',
    ...t('Tecnología'),
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    items: [
      { descripcion: 'Memoria SSD M.2 NVMe 1TB PNY', cantidad: 1, precio_unitario: 89.00 },
      { descripcion: 'Adaptador HUB USB-C 6 en 1', cantidad: 1, precio_unitario: 36.00 }
    ],
    notes: 'Repuestos de almacenamiento y expansión'
  },
  {
    id: 'demo-6',
    fecha_emision: '2026-05-05',
    comercio: 'Panadería Flor de Patria',
    rif_o_identificacion_fiscal: 'J-28192837-4',
    subtotal: 120.00,
    impuestos: 19.20,
    total: 139.20,
    moneda: 'VES',
    categoria_sugerida: 'Alimentación',
    ...t('Alimentación'),
    createdAt: new Date(Date.now() - 21 * 24 * 3600 * 1000).toISOString(),
    items: [
      { descripcion: 'Bagette Francés Grande', cantidad: 5, precio_unitario: 12.00 },
      { descripcion: 'Queso Danbo Rebanado 500g', cantidad: 1, precio_unitario: 80.00 }
    ],
    notes: 'Desayuno familiar de fin de semana'
  },
  {
    id: 'demo-7',
    fecha_emision: '2026-05-10',
    comercio: 'Suscripción Netflix Entertainment',
    rif_o_identificacion_fiscal: null,
    subtotal: 10.99,
    impuestos: 0.00,
    total: 10.99,
    moneda: 'USD',
    categoria_sugerida: 'Entretenimiento',
    ...t('Entretenimiento'),
    createdAt: new Date(Date.now() - 16 * 24 * 3600 * 1000).toISOString(),
    items: [
      { descripcion: 'Netflix Standard Plan', cantidad: 1, precio_unitario: 10.99 }
    ],
    notes: 'Suscripción recurrente mensual'
  }
];
