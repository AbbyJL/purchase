import { IconBox, IconChartBar, IconFileDescription, IconReceipt2, IconTag, IconTruck, IconUsers, IconFileInvoice } from "@tabler/icons-react";
import { seedBrands, seedContracts, seedCustomers, seedOrders, seedPOs, seedPIs, seedProducts, seedQuotes, seedSuppliers } from "../shared/seed";
import type { Brand, Contract, Customer, DashboardStat, Order, PIRecord, PORecord, Product, Quote, Supplier } from "./types";

export const dashboardStats: DashboardStat[] = [
  { labelKey: "stat.products", value: "245", icon: IconBox },
  { labelKey: "stat.brands", value: "3", icon: IconTag },
  { labelKey: "stat.orders", value: "42", icon: IconChartBar },
  { labelKey: "stat.contracts", value: "86", icon: IconFileDescription },
  { labelKey: "stat.customers", value: "2", icon: IconUsers },
  { labelKey: "stat.suppliers", value: "2", icon: IconTruck },
  { labelKey: "stat.quotes", value: "1", icon: IconReceipt2 },
  { labelKey: "stat.pis", value: "1", icon: IconFileInvoice },
];

export const products: Product[] = seedProducts.map((item) => ({
  id: item.id,
  name: item.name,
  categoryKey: item.categoryKey as Product["categoryKey"],
  price: item.price,
  stock: item.stock,
  status: item.status as Product["status"],
  imageUrl: item.imageUrl,
}));

export const orders: Order[] = seedOrders.map((item) => ({
  id: item.id,
  customer: item.customer,
  product: item.product,
  status: item.status as Order["status"],
  total: item.total,
  channel: item.channel,
}));

export const contracts: Contract[] = seedContracts.map((item) => ({
  id: item.id,
  title: item.title,
  client: item.client,
  status: item.status as Contract["status"],
  amount: item.amount,
  deadline: item.deadline,
}));

export const brands: Brand[] = seedBrands.map((item) => ({
  id: item.id,
  name: item.name,
  code: item.code,
  customer: item.customer,
  supplier: item.supplier,
  country: item.country,
  status: item.status as Brand["status"],
  owner: item.owner,
  notes: item.notes,
}));

export const customers: Customer[] = seedCustomers.map((item) => ({
  id: item.id,
  name: item.name,
  code: item.code,
  country: item.country,
  contact: item.contact,
  phone: item.phone,
  email: item.email,
  address: item.address,
  status: item.status as Customer["status"],
  notes: item.notes,
}));

export const suppliers: Supplier[] = seedSuppliers.map((item) => ({
  id: item.id,
  name: item.name,
  code: item.code,
  country: item.country,
  contact: item.contact,
  phone: item.phone,
  email: item.email,
  address: item.address,
  status: item.status as Supplier["status"],
  notes: item.notes,
}));

export const quotes: Quote[] = seedQuotes.map((item) => ({
  id: item.id,
  quoteNo: item.quoteNo,
  date: item.date,
  modificationDate: item.modificationDate,
  register: item.register,
  itemType: item.itemType,
  brand: item.brand,
  linkman: item.linkman,
  salesperson: item.salesperson,
  customer: item.customer,
  item: item.item,
  productCode: item.productCode,
  productName: item.productName,
  status: item.status as Quote["status"],
  costItems: [...item.costItems],
  tiers: [...item.tiers],
  lines: [...item.lines],
  imageUrl: item.imageUrl,
  notes: item.notes,
}));

export const pis: PIRecord[] = seedPIs.map((item) => ({
  id: item.id,
  piNo: item.piNo,
  customer: item.customer,
  brand: item.brand,
  vendor: item.vendor,
  ourRefNo: item.ourRefNo,
  deliveryDate: item.deliveryDate,
  deliverTo: item.deliverTo,
  status: item.status as PIRecord["status"],
  generatedAt: item.generatedAt,
  generatedBy: item.generatedBy,
  pdfUrl: item.pdfUrl,
  itemCode: item.itemCode,
  description: item.description,
  productType: item.productType,
  size: item.size,
  colors: item.colors,
  finished: item.finished,
  remarks: item.remarks,
  imageUrl: item.imageUrl,
  sizeDetails: [...item.sizeDetails],
  lines: [...item.lines],
  notes: item.notes,
}));

export const pos: PORecord[] = seedPOs.map((item) => ({
  id: item.id,
  poNo: item.poNo,
  sourcePiId: item.sourcePiId,
  date: item.date,
  vendor: item.vendor,
  vendorAddress: item.vendorAddress,
  vendorContact: item.vendorContact,
  vendorEmail: item.vendorEmail,
  vendorTel: item.vendorTel,
  vendorFax: item.vendorFax,
  customer: item.customer,
  ourRefNo: item.ourRefNo,
  deliveryDate: item.deliveryDate,
  deliverTo: item.deliverTo,
  status: item.status as PORecord["status"],
  itemCode: item.itemCode,
  description: item.description,
  productType: item.productType,
  size: item.size,
  colors: item.colors,
  finished: item.finished,
  remarks: item.remarks,
  lines: [...item.lines],
  packingRows: [...item.packingRows],
  notes: item.notes,
  imageUrl: item.imageUrl,
}));
