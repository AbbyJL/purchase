import type { ComponentType } from "react";

export type Locale = "zh-CN" | "en-US";

export type ContractStatus = "Draft" | "Review" | "Active" | "Expired";
export type OrderStatus = "Pending" | "Paid" | "Packed" | "Shipped" | "Completed";
export type InventoryStatus = "In stock" | "Low stock" | "Out of stock";
export type BrandStatus = "Active" | "Inactive";
export type PartyStatus = "Active" | "Inactive";
export type QuoteStatus = "Draft" | "Sent" | "Approved" | "Rejected";
export type PIStatus = "Draft" | "Generated" | "Sent" | "Closed";

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
  price: number;
  sample: number;
  description: string;
  typeValue?: string;
  sizeValue?: string;
  colorValue?: string;
  finishedValue?: string;
  remarksValue?: string;
  pricingNotes: string;
  cost: string;
  costItems: QuoteCostItem[];
}

export interface Quote {
  id: string;
  quoteNo: string;
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

export interface PILineItem {
  id?: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface PISizeDetail {
  id?: string;
  size: string;
  quantity: number;
}

export interface PIRecord {
  id: string;
  piNo: string;
  customer: string;
  brand: string;
  vendor: string;
  ourRefNo: string;
  deliveryDate: string;
  deliverTo: string;
  status: PIStatus;
  generatedAt: string;
  generatedBy: string;
  pdfUrl: string;
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
  poNo: string;
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
}

export interface Product {
  id: string;
  name: string;
  categoryKey: "clothing" | "office" | "home" | "accessory";
  price: number;
  stock: number;
  status: InventoryStatus;
  imageUrl: string;
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
