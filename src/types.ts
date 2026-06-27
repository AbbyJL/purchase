import type { ComponentType } from "react";

export type Locale = "zh-CN" | "en-US";

export type ContractStatus = "Draft" | "Review" | "Active" | "Expired";
export type OrderStatus = "Pending" | "Paid" | "Packed" | "Shipped" | "Completed";
export type InventoryStatus = "In stock" | "Low stock" | "Out of stock";
export type BrandStatus = "Active" | "Inactive";
export type PartyStatus = "Active" | "Inactive";
export type QuoteStatus = "Draft" | "Sent" | "Approved" | "Rejected";
export type DevelopmentStatus = "Draft" | "In progress" | "Confirmed" | "Closed";
export type PIStatus = "Draft" | "Generated" | "Sent" | "Closed";
export type POType = "purchase" | "craft";

/** Print method options for craft process sheet */
export type PrintMethod = "single_side" | "double_side" | "work_and_turn" | "work_and_tumble";

/** Proof type options for craft process sheet */
export type ProofType = "sample" | "ps_plate" | "ctp_plate";

/** Post process options for craft process sheet */
export type PostProcess = "printing" | "laminating" | "mounting" | "die_cutting" | "uv_coating";

export interface Contract {
  id: string;
  title: string;
  client: string;
  status: ContractStatus;
  amount: number;
  deadline: string;
}

export interface Brand {
  id: string;
  name: string;
  code: string;
  customer: string;
  supplier: string;
  country: string;
  status: BrandStatus;
  owner: string;
  notes: string;
}

export interface Customer {
  id: string;
  name: string;
  code: string;
  country: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  status: PartyStatus;
  notes: string;
  imageUrl?: string;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  country: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  status: PartyStatus;
  notes: string;
}

export interface QuoteCostItem {
  id?: string;
  label: string;
  amount: number;
}

export interface QuoteTier {
  id?: string;
  quantity: string;
  unitPrice: number;
}

export interface QuoteLine {
  id?: string;
  checked: boolean;
  imageUrl: string;
  productCode: string;
  productName: string;
  suppliers?: string[];
  price: number;
  sample: number;
  description: string;
  typeValue?: string;
  sizeValue?: string;
  colorValue?: string;
  finishedValue?: string;
  remarksValue?: string;
  specLocked?: boolean;
  pricingNotes: string;
  cost: string;
  costItems: QuoteCostItem[];
}

export interface Quote {
  id: string;
  quoteNo: string;
  piNo?: string;
  date: string;
  modificationDate: string;
  register: string;
  itemType: string;
  brand: string;
  linkman: string;
  salesperson: string;
  customer: string;
  item: string;
  productCode: string;
  productName: string;
  status: QuoteStatus;
  costItems: QuoteCostItem[];
  tiers: QuoteTier[];
  lines: QuoteLine[];
  imageUrl: string;
  notes: string;
}

export interface DevelopmentLine {
  id?: string;
  checked: boolean;
  imageUrl: string;
  productCode: string;
  productName: string;
  description: string;
  typeValue?: string;
  sizeValue?: string;
  colorValue?: string;
  finishedValue?: string;
  remarksValue?: string;
  specLocked?: boolean;
}

export interface DevelopmentRecord {
  id: string;
  developmentNo: string;
  date: string;
  modificationDate: string;
  register: string;
  itemType: string;
  brand: string;
  linkman: string;
  salesperson: string;
  customer: string;
  item: string;
  productCode: string;
  productName: string;
  status: DevelopmentStatus;
  sourceQuoteId: string;
  sourceQuoteNo: string;
  lines: DevelopmentLine[];
  imageUrl: string;
  notes: string;
}

export interface PILineItem {
  id?: string;
  productCode: string;
  productName: string;
  supplier?: string;
  quantity: number;
  unitPrice: number;
  orderQty?: number;
  deductedQty?: number;
  outstandingQty?: number;
  inStockQty?: number;
  stockOutQty?: number;
}

export interface PISizeDetail {
  id?: string;
  size: string;
  quantity: number;
}

export interface PIRecord {
  id: string;
  piNo: string;
  plNo?: string;
  customer: string;
  brand: string;
  vendor: string;
  ourRefNo: string;
  deliveryDate: string;
  deliverTo: string;
  status: PIStatus;
  generatedAt: string;
  generatedBy: string;
  purchaseGeneratedAt: string;
  financeApprovedAt: string;
  packingInfoGeneratedAt: string;
  commercialInvoiceGeneratedAt: string;
  paymentConfirmedAt: string;
  pdfUrl: string;
  orderQty?: number;
  deductedQty?: number;
  outstandingQty?: number;
  inStockQty?: number;
  stockOutQty?: number;
  itemCode: string;
  description: string;
  productType: string;
  size: string;
  colors: string;
  finished: string;
  remarks: string;
  imageUrl: string;
  sizeDetails: PISizeDetail[];
  lines: PILineItem[];
  notes: string;
}

export interface POLineItem {
  id?: string;
  itemCode: string;
  itemDescription: string;
  quantity: number;
  unitPrice: number;
  productCode?: string;
  productName?: string;
}

export interface POPackingRow {
  id?: string;
  lot: string;
  size: string;
  quantity: number;
}

export interface PORecord {
  id: string;
  /** po_type: 'purchase' = standard PO, 'craft' = production/craft sheet */
  poType: POType;
  poNo: string;
  plNo?: string;
  sourcePiId: string;
  date: string;
  vendor: string;
  vendorAddress: string;
  vendorContact: string;
  vendorEmail: string;
  vendorTel: string;
  vendorFax: string;
  customer: string;
  ourRefNo: string;
  deliveryDate: string;
  deliverTo: string;
  status: "Draft" | "Confirmed" | "Sent" | "Closed";
  itemCode: string;
  description: string;
  productType: string;
  size: string;
  colors: string;
  finished: string;
  remarks: string;
  lines: POLineItem[];
  packingRows: POPackingRow[];
  notes: string;
  imageUrl: string;
  // --- Craft-specific fields (used when poType === 'craft') ---
  /** Order number (订单编号) */
  orderNo: string;
  /** Maker/creator (制单人) */
  maker: string;
  /** Creation date (制单日期) */
  makeDate: string;
  /** Style number (款号) */
  styleNo: string;
  /** Customer order number (客户单号) */
  customerOrderNo: string;
  /** Product name for craft (品名) */
  craftProductName: string;
  /** Related order number (关联订单号) */
  relatedOrderNo: string;
  /** Sheet size / 开张 (e.g. "230 * 325") */
  sheetSize: string;
  /** Material in / 来料 */
  materialIn: string;
  /** Up count / 开数 */
  upCount: string;
  /** Quantity / 数量 */
  quantity: number;
  /** Remainder / 余量 */
  remainder: number;
  /** Finished quantity / 成品数 */
  finishedQty: number;
  /** Pack count / 拼数 */
  packCount: string;
  /** Print method JSON array (印刷方式) */
  printMethod: PrintMethod[];
  /** Proof type JSON array (看样类型) */
  proofType: ProofType[];
  /** Post process JSON array (后道要求) */
  postProcess: PostProcess[];
  /** Craft notes (工艺备注) */
  craftNotes: string;
}

export interface Product {
  id: string;
  name: string;
  suppliers: string[];
  categoryKey: "clothing" | "office" | "home" | "accessory";
  price: number;
  stock: number;
  status: InventoryStatus;
  imageUrl: string;
  codePrefix?: string;
  quoteProductCodes?: string[];
}

export interface Order {
  id: string;
  customer: string;
  product: string;
  status: OrderStatus;
  total: number;
  channel: string;
}

export interface DashboardStat {
  labelKey: string;
  value: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
}
