import { seedContracts, seedCustomers, seedOrders, seedPOs, seedPIs, seedProducts, seedQuotes, seedSuppliers } from "../shared/seed";
import type { Brand, Contract, Customer, Order, PIRecord, PORecord, Product, Quote, QuoteLine, Supplier } from "./types";

type JsonResponse<T> = {
  data: T;
};

type AdminStats = {
  products: number;
  orders: number;
  contracts: number;
  brands: number;
  customers: number;
  suppliers: number;
  quotes: number;
  pis: number;
};

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

function mapProduct(item: (typeof seedProducts)[number]): Product {
  return {
    id: item.id,
    name: item.name,
    categoryKey: item.categoryKey as Product["categoryKey"],
    price: item.price,
    stock: item.stock,
    status: item.status as Product["status"],
    imageUrl: item.imageUrl,
  };
}

function mapOrder(item: (typeof seedOrders)[number]): Order {
  return {
    id: item.id,
    customer: item.customer,
    product: item.product,
    status: item.status as Order["status"],
    total: item.total,
    channel: item.channel,
  };
}

function mapContract(item: (typeof seedContracts)[number]): Contract {
  return {
    id: item.id,
    title: item.title,
    client: item.client,
    status: item.status as Contract["status"],
    amount: item.amount,
    deadline: item.deadline,
  };
}

function mapCustomer(item: (typeof seedCustomers)[number]): Customer {
  return {
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
  };
}

function mapSupplier(item: (typeof seedSuppliers)[number]): Supplier {
  return {
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
  };
}

function mapQuote(item: (typeof seedQuotes)[number]): Quote {
  return {
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
    costItems: item.costItems.map((costItem) => ({ ...costItem })),
    tiers: item.tiers.map((tier) => ({ ...tier })),
    lines: item.lines.map(mapQuoteLine),
    imageUrl: item.imageUrl,
    notes: item.notes,
  };
}

function mapQuoteLine(item: (typeof seedQuotes)[number]["lines"][number]): QuoteLine {
  return {
    ...item,
    costItems: item.costItems.map((costItem) => ({ ...costItem })),
  };
}

function mapPI(item: (typeof seedPIs)[number]): PIRecord {
  return {
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
  };
}

function mapPO(item: (typeof seedPOs)[number]): PORecord {
  return {
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
  };
}

export async function loadAdminData() {
  const [overview, products, orders, contracts, brands, customers, suppliers, quotes, pis, pos] = await Promise.allSettled([
    requestJson<JsonResponse<AdminStats>>("/api/overview"),
    requestJson<JsonResponse<Product[]>>("/api/products"),
    requestJson<JsonResponse<Order[]>>("/api/orders"),
    requestJson<JsonResponse<Contract[]>>("/api/contracts"),
    requestJson<JsonResponse<Brand[]>>("/api/brands"),
    requestJson<JsonResponse<Customer[]>>("/api/customers"),
    requestJson<JsonResponse<Supplier[]>>("/api/suppliers"),
    requestJson<JsonResponse<Quote[]>>("/api/quotes"),
    requestJson<JsonResponse<PIRecord[]>>("/api/pis"),
    requestJson<JsonResponse<PORecord[]>>("/api/pos"),
  ]);

  return {
    stats:
      overview.status === "fulfilled"
        ? overview.value.data
        : {
            products: seedProducts.length,
            orders: seedOrders.length,
            contracts: seedContracts.length,
            brands: 3,
            customers: seedCustomers.length,
            suppliers: seedSuppliers.length,
            quotes: seedQuotes.length,
            pis: seedPIs.length,
          },
    products:
      products.status === "fulfilled" ? products.value.data : seedProducts.map(mapProduct),
    orders:
      orders.status === "fulfilled" ? orders.value.data : seedOrders.map(mapOrder),
    contracts:
      contracts.status === "fulfilled" ? contracts.value.data : seedContracts.map(mapContract),
    brands:
      brands.status === "fulfilled"
        ? brands.value.data
        : [
            { id: "BR001", name: "STONEY CLOVER LANE", code: "SCL-001", customer: "GMS", supplier: "Anly", country: "US", status: "Active", owner: "Jason", notes: "贴纸 / 信封 / 纸卡" },
            { id: "BR002", name: "SYNSHOO", code: "SYN-2606", customer: "SYNSHOO LA INC", supplier: "ZheJiang Factory", country: "US", status: "Active", owner: "Linda", notes: "吊牌 / 商业发票" },
            { id: "BR003", name: "GLOBAL ERP DEMO", code: "GRP-1001", customer: "Sample Customer", supplier: "Internal", country: "CN", status: "Inactive", owner: "Cheese", notes: "用于测试品牌关联" },
          ].map((item) => item as Brand),
    customers: customers.status === "fulfilled" ? customers.value.data : seedCustomers.map(mapCustomer),
    suppliers: suppliers.status === "fulfilled" ? suppliers.value.data : seedSuppliers.map(mapSupplier),
    quotes: quotes.status === "fulfilled" ? quotes.value.data : seedQuotes.map(mapQuote),
    pis: pis.status === "fulfilled" ? pis.value.data : seedPIs.map(mapPI),
    pos: pos.status === "fulfilled" ? pos.value.data : seedPOs.map(mapPO),
  };
}

export async function createProduct(input: Partial<Product> & { id?: string }) {
  return requestJson<JsonResponse<Product> | { ok: boolean; product: Product }>("/api/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateProduct(input: Partial<Product> & { id: string }) {
  return requestJson<{ ok: boolean }>("/api/products", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteProduct(id: string) {
  return requestJson<{ ok: boolean }>(`/api/products?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function createOrder(input: Partial<Order> & { id?: string }) {
  return requestJson<JsonResponse<Order> | { ok: boolean; order: Order }>("/api/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateOrder(input: Partial<Order> & { id: string }) {
  return requestJson<{ ok: boolean }>("/api/orders", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteOrder(id: string) {
  return requestJson<{ ok: boolean }>(`/api/orders?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function createContract(input: Partial<Contract> & { id?: string }) {
  return requestJson<JsonResponse<Contract> | { ok: boolean; contract: Contract }>("/api/contracts", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateContract(input: Partial<Contract> & { id: string }) {
  return requestJson<{ ok: boolean }>("/api/contracts", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteContract(id: string) {
  return requestJson<{ ok: boolean }>(`/api/contracts?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function createBrand(input: Partial<Brand> & { id?: string }) {
  return requestJson<JsonResponse<Brand> | { ok: boolean; brand: Brand }>("/api/brands", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateBrand(input: Partial<Brand> & { id: string }) {
  return requestJson<{ ok: boolean }>("/api/brands", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteBrand(id: string) {
  return requestJson<{ ok: boolean }>(`/api/brands?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function createCustomer(input: Partial<Customer> & { id?: string }) {
  return requestJson<JsonResponse<Customer> | { ok: boolean; customer: Customer }>("/api/customers", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCustomer(input: Partial<Customer> & { id: string }) {
  return requestJson<{ ok: boolean }>("/api/customers", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteCustomer(id: string) {
  return requestJson<{ ok: boolean }>(`/api/customers?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function createSupplier(input: Partial<Supplier> & { id?: string }) {
  return requestJson<JsonResponse<Supplier> | { ok: boolean; supplier: Supplier }>("/api/suppliers", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateSupplier(input: Partial<Supplier> & { id: string }) {
  return requestJson<{ ok: boolean }>("/api/suppliers", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteSupplier(id: string) {
  return requestJson<{ ok: boolean }>(`/api/suppliers?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function createQuote(input: Partial<Quote> & { id?: string }) {
  return requestJson<JsonResponse<Quote> | { ok: boolean; quote: Quote }>("/api/quotes", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateQuote(input: Partial<Quote> & { id: string }) {
  return requestJson<{ ok: boolean }>("/api/quotes", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteQuote(id: string) {
  return requestJson<{ ok: boolean }>(`/api/quotes?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function createPI(input: Partial<PIRecord> & { id?: string }) {
  return requestJson<JsonResponse<PIRecord> | { ok: boolean; pi: PIRecord }>("/api/pis", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updatePI(input: Partial<PIRecord> & { id: string }) {
  return requestJson<{ ok: boolean }>("/api/pis", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deletePI(id: string) {
  return requestJson<{ ok: boolean }>(`/api/pis?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function createPO(input: Partial<PORecord> & { id?: string }) {
  return requestJson<JsonResponse<PORecord> | { ok: boolean; po: PORecord }>("/api/pos", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updatePO(input: Partial<PORecord> & { id: string }) {
  return requestJson<{ ok: boolean }>("/api/pos", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deletePO(id: string) {
  return requestJson<{ ok: boolean }>(`/api/pos?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
