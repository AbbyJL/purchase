import { seedBrands, seedContracts, seedCustomers, seedOrders, seedPOs, seedPIs, seedProducts, seedQuotes, seedSuppliers } from "./seed";

type Env = {
  DB?: D1Database;
};

type RecordLike = Record<string, unknown>;

function okJson(data: unknown, init?: ResponseInit) {
  return Response.json(data, init);
}

function mapProduct(row: RecordLike) {
  return {
    id: String(row.id),
    name: String(row.name),
    categoryKey: String(row.category_key ?? row.categoryKey),
    price: Number(row.price),
    stock: Number(row.stock),
    status: String(row.status),
    imageUrl: String(row.image_url ?? row.imageUrl ?? ""),
  };
}

function mapOrder(row: RecordLike) {
  return {
    id: String(row.id),
    customer: String(row.customer),
    product: String(row.product),
    status: String(row.status),
    total: Number(row.total),
    channel: String(row.channel),
  };
}

function mapContract(row: RecordLike) {
  return {
    id: String(row.id),
    title: String(row.title),
    client: String(row.client),
    status: String(row.status),
    amount: Number(row.amount),
    deadline: String(row.deadline),
  };
}

function mapBrand(row: RecordLike) {
  return {
    id: String(row.id),
    name: String(row.name),
    code: String(row.code),
    customer: String(row.customer),
    supplier: String(row.supplier),
    country: String(row.country),
    status: String(row.status),
    owner: String(row.owner),
    notes: String(row.notes),
  };
}

function mapCustomer(row: RecordLike) {
  return {
    id: String(row.id),
    name: String(row.name),
    code: String(row.code),
    country: String(row.country),
    contact: String(row.contact),
    phone: String(row.phone),
    email: String(row.email),
    address: String(row.address),
    status: String(row.status),
    notes: String(row.notes),
  };
}

function mapSupplier(row: RecordLike) {
  return {
    id: String(row.id),
    name: String(row.name),
    code: String(row.code),
    country: String(row.country),
    contact: String(row.contact),
    phone: String(row.phone),
    email: String(row.email),
    address: String(row.address),
    status: String(row.status),
    notes: String(row.notes),
  };
}

function safeJsonParse(value: unknown, fallback: unknown) {
  if (typeof value !== "string") return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function mapQuote(row: RecordLike) {
  return {
    id: String(row.id),
    quoteNo: String(row.quote_no ?? row.quoteNo ?? ""),
    date: String(row.date ?? ""),
    modificationDate: String(row.modification_date ?? row.modificationDate ?? ""),
    register: String(row.register ?? ""),
    itemType: String(row.item_type ?? row.itemType ?? ""),
    brand: String(row.brand),
    linkman: String(row.linkman ?? ""),
    salesperson: String(row.salesperson ?? ""),
    customer: String(row.customer),
    item: String(row.item ?? ""),
    productCode: String(row.product_code ?? row.productCode),
    productName: String(row.product_name ?? row.productName),
    status: String(row.status),
    costItems: safeJsonParse(row.cost_items_json, []),
    tiers: safeJsonParse(row.tiers_json, []),
    lines: safeJsonParse(row.lines_json, []),
    imageUrl: String(row.image_url ?? row.imageUrl ?? ""),
    notes: String(row.notes),
  };
}

function mapPI(row: RecordLike) {
  return {
    id: String(row.id),
    piNo: String(row.pi_no ?? row.piNo),
    customer: String(row.customer),
    brand: String(row.brand),
    vendor: String(row.vendor ?? ""),
    ourRefNo: String(row.our_ref_no ?? row.ourRefNo ?? ""),
    deliveryDate: String(row.delivery_date ?? row.deliveryDate ?? ""),
    deliverTo: String(row.deliver_to ?? row.deliverTo ?? ""),
    status: String(row.status),
    generatedAt: String(row.generated_at ?? row.generatedAt),
    generatedBy: String(row.generated_by ?? row.generatedBy),
    pdfUrl: String(row.pdf_url ?? row.pdfUrl ?? ""),
    itemCode: String(row.item_code ?? row.itemCode ?? ""),
    description: String(row.description ?? ""),
    productType: String(row.product_type ?? row.productType ?? ""),
    size: String(row.size ?? ""),
    colors: String(row.colors ?? ""),
    finished: String(row.finished ?? ""),
    remarks: String(row.remarks ?? ""),
    imageUrl: String(row.image_url ?? row.imageUrl ?? ""),
    sizeDetails: safeJsonParse(row.size_details_json ?? row.sizeDetails_json ?? row.sizeDetails, []),
    lines: safeJsonParse(row.lines_json, []),
    notes: String(row.notes),
  };
}

function mapPO(row: RecordLike) {
  return {
    id: String(row.id),
    poNo: String(row.po_no ?? row.poNo),
    sourcePiId: String(row.source_pi_id ?? row.sourcePiId ?? ""),
    date: String(row.date ?? ""),
    vendor: String(row.vendor ?? ""),
    vendorAddress: String(row.vendor_address ?? row.vendorAddress ?? ""),
    vendorContact: String(row.vendor_contact ?? row.vendorContact ?? ""),
    vendorEmail: String(row.vendor_email ?? row.vendorEmail ?? ""),
    vendorTel: String(row.vendor_tel ?? row.vendorTel ?? ""),
    vendorFax: String(row.vendor_fax ?? row.vendorFax ?? ""),
    customer: String(row.customer ?? ""),
    ourRefNo: String(row.our_ref_no ?? row.ourRefNo ?? ""),
    deliveryDate: String(row.delivery_date ?? row.deliveryDate ?? ""),
    deliverTo: String(row.deliver_to ?? row.deliverTo ?? ""),
    status: String(row.status),
    itemCode: String(row.item_code ?? row.itemCode ?? ""),
    description: String(row.description ?? ""),
    productType: String(row.product_type ?? row.productType ?? ""),
    size: String(row.size ?? ""),
    colors: String(row.colors ?? ""),
    finished: String(row.finished ?? ""),
    remarks: String(row.remarks ?? ""),
    lines: safeJsonParse(row.lines_json, []),
    packingRows: safeJsonParse(row.packing_rows_json, []),
    notes: String(row.notes ?? ""),
    imageUrl: String(row.image_url ?? row.imageUrl ?? ""),
  };
}

export async function listProducts(env: Env) {
  if (!env.DB) return seedProducts;
  const result = await env.DB.prepare(
    "SELECT id, name, category_key, price, stock, status, image_url FROM products ORDER BY id ASC",
  ).all();
  return (result.results ?? []).map(mapProduct);
}

export async function listOrders(env: Env) {
  if (!env.DB) return seedOrders;
  const result = await env.DB.prepare(
    "SELECT id, customer, product, status, total, channel FROM orders ORDER BY id ASC",
  ).all();
  return (result.results ?? []).map(mapOrder);
}

export async function listContracts(env: Env) {
  if (!env.DB) return seedContracts;
  const result = await env.DB.prepare(
    "SELECT id, title, client, status, amount, deadline FROM contracts ORDER BY id ASC",
  ).all();
  return (result.results ?? []).map(mapContract);
}

export async function listBrands(env: Env) {
  if (!env.DB) return seedBrands;
  const result = await env.DB.prepare(
    "SELECT id, name, code, customer, supplier, country, status, owner, notes FROM brands ORDER BY id ASC",
  ).all();
  return (result.results ?? []).map(mapBrand);
}

export async function listCustomers(env: Env) {
  if (!env.DB) return seedCustomers;
  const result = await env.DB.prepare(
    "SELECT id, name, code, country, contact, phone, email, address, status, notes FROM customers ORDER BY id ASC",
  ).all();
  return (result.results ?? []).map(mapCustomer);
}

export async function listSuppliers(env: Env) {
  if (!env.DB) return seedSuppliers;
  const result = await env.DB.prepare(
    "SELECT id, name, code, country, contact, phone, email, address, status, notes FROM suppliers ORDER BY id ASC",
  ).all();
  return (result.results ?? []).map(mapSupplier);
}

export async function listQuotes(env: Env) {
  if (!env.DB) return seedQuotes;
  const result = await env.DB.prepare(
    "SELECT id, quote_no, date, modification_date, register, item_type, brand, linkman, salesperson, customer, item, product_code, product_name, status, cost_items_json, tiers_json, lines_json, image_url, notes FROM quotes ORDER BY id ASC",
  ).all();
  return (result.results ?? []).map(mapQuote);
}

export async function listPIs(env: Env) {
  if (!env.DB) return seedPIs;
  const result = await env.DB.prepare(
    "SELECT id, pi_no, customer, brand, vendor, our_ref_no, delivery_date, deliver_to, status, generated_at, generated_by, pdf_url, item_code, description, product_type, size, colors, finished, remarks, image_url, size_details_json, lines_json, notes FROM pis ORDER BY id ASC",
  ).all();
  return (result.results ?? []).map(mapPI);
}

export async function listPOs(env: Env) {
  if (!env.DB) return seedPOs;
  const result = await env.DB.prepare(
    "SELECT id, po_no, source_pi_id, date, vendor, vendor_address, vendor_contact, vendor_email, vendor_tel, vendor_fax, customer, our_ref_no, delivery_date, deliver_to, status, item_code, description, product_type, size, colors, finished, remarks, lines_json, packing_rows_json, notes, image_url FROM purchase_orders ORDER BY date DESC, po_no ASC",
  ).all();
  return (result.results ?? []).map(mapPO);
}

export async function overview(env: Env) {
  if (!env.DB) {
    return {
      products: seedProducts.length,
      orders: seedOrders.length,
      contracts: seedContracts.length,
      brands: seedBrands.length,
      customers: seedCustomers.length,
      suppliers: seedSuppliers.length,
      quotes: seedQuotes.length,
      pis: seedPIs.length,
    };
  }

  const [productsResult, ordersResult, contractsResult, brandsResult, customersResult, suppliersResult, quotesResult, pisResult] = await Promise.all([
    env.DB.prepare("SELECT COUNT(*) AS count FROM products").first<{ count: number }>(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM orders").first<{ count: number }>(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM contracts").first<{ count: number }>(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM brands").first<{ count: number }>(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM customers").first<{ count: number }>(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM suppliers").first<{ count: number }>(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM quotes").first<{ count: number }>(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM pis").first<{ count: number }>(),
  ]);

  return {
    products: Number(productsResult?.count ?? 0),
    orders: Number(ordersResult?.count ?? 0),
    contracts: Number(contractsResult?.count ?? 0),
    brands: Number(brandsResult?.count ?? 0),
    customers: Number(customersResult?.count ?? 0),
    suppliers: Number(suppliersResult?.count ?? 0),
    quotes: Number(quotesResult?.count ?? 0),
    pis: Number(pisResult?.count ?? 0),
  };
}

export async function createProduct(env: Env, input: RecordLike) {
  const id = String(input.id ?? `SPU${Date.now()}`);
  const payload = {
    id,
    name: String(input.name ?? ""),
    categoryKey: String(input.categoryKey ?? "office"),
    price: Number(input.price ?? 0),
    stock: Number(input.stock ?? 0),
    status: String(input.status ?? "In stock"),
    imageUrl: String(input.imageUrl ?? ""),
  };

  if (!env.DB) {
    return { ok: false, message: "D1 not configured", product: payload };
  }

  await env.DB.prepare(
    "INSERT INTO products (id, name, category_key, price, stock, status, image_url) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
  )
    .bind(payload.id, payload.name, payload.categoryKey, payload.price, payload.stock, payload.status, payload.imageUrl)
    .run();

  return { ok: true, product: payload };
}

export async function updateProduct(env: Env, input: RecordLike) {
  const id = String(input.id ?? "");
  if (!id) return { ok: false, message: "Missing id" };

  const payload = {
    name: String(input.name ?? ""),
    categoryKey: String(input.categoryKey ?? "office"),
    price: Number(input.price ?? 0),
    stock: Number(input.stock ?? 0),
    status: String(input.status ?? "In stock"),
    imageUrl: String(input.imageUrl ?? ""),
  };

  if (!env.DB) {
    return { ok: false, message: "D1 not configured" };
  }

  await env.DB.prepare(
    "UPDATE products SET name = ?2, category_key = ?3, price = ?4, stock = ?5, status = ?6, image_url = ?7 WHERE id = ?1",
  )
    .bind(id, payload.name, payload.categoryKey, payload.price, payload.stock, payload.status, payload.imageUrl)
    .run();

  return { ok: true };
}

export async function deleteProduct(env: Env, id: string) {
  if (!env.DB) {
    return { ok: false, message: "D1 not configured" };
  }

  await env.DB.prepare("DELETE FROM products WHERE id = ?1").bind(id).run();
  return { ok: true };
}

export async function createOrder(env: Env, input: RecordLike) {
  const id = String(input.id ?? `OR${Date.now().toString().slice(-6)}`);
  const payload = {
    id,
    customer: String(input.customer ?? ""),
    product: String(input.product ?? ""),
    status: String(input.status ?? "Pending"),
    total: Number(input.total ?? 0),
    channel: String(input.channel ?? "线上"),
  };

  if (!env.DB) {
    return { ok: false, message: "D1 not configured", order: payload };
  }

  await env.DB.prepare(
    "INSERT INTO orders (id, customer, product, status, total, channel) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
  )
    .bind(payload.id, payload.customer, payload.product, payload.status, payload.total, payload.channel)
    .run();

  return { ok: true, order: payload };
}

export async function updateOrder(env: Env, input: RecordLike) {
  const id = String(input.id ?? "");
  if (!id) return { ok: false, message: "Missing id" };

  const payload = {
    customer: String(input.customer ?? ""),
    product: String(input.product ?? ""),
    status: String(input.status ?? "Pending"),
    total: Number(input.total ?? 0),
    channel: String(input.channel ?? "线上"),
  };

  if (!env.DB) {
    return { ok: false, message: "D1 not configured" };
  }

  await env.DB.prepare(
    "UPDATE orders SET customer = ?2, product = ?3, status = ?4, total = ?5, channel = ?6 WHERE id = ?1",
  )
    .bind(id, payload.customer, payload.product, payload.status, payload.total, payload.channel)
    .run();

  return { ok: true };
}

export async function deleteOrder(env: Env, id: string) {
  if (!env.DB) {
    return { ok: false, message: "D1 not configured" };
  }

  await env.DB.prepare("DELETE FROM orders WHERE id = ?1").bind(id).run();
  return { ok: true };
}

export async function createContract(env: Env, input: RecordLike) {
  const id = String(input.id ?? `CT-${Date.now().toString().slice(-6)}`);
  const payload = {
    id,
    title: String(input.title ?? ""),
    client: String(input.client ?? ""),
    status: String(input.status ?? "Draft"),
    amount: Number(input.amount ?? 0),
    deadline: String(input.deadline ?? new Date().toISOString().slice(0, 10)),
  };

  if (!env.DB) {
    return { ok: false, message: "D1 not configured", contract: payload };
  }

  await env.DB.prepare(
    "INSERT INTO contracts (id, title, client, status, amount, deadline) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
  )
    .bind(payload.id, payload.title, payload.client, payload.status, payload.amount, payload.deadline)
    .run();

  return { ok: true, contract: payload };
}

export async function updateContract(env: Env, input: RecordLike) {
  const id = String(input.id ?? "");
  if (!id) return { ok: false, message: "Missing id" };

  const payload = {
    title: String(input.title ?? ""),
    client: String(input.client ?? ""),
    status: String(input.status ?? "Draft"),
    amount: Number(input.amount ?? 0),
    deadline: String(input.deadline ?? new Date().toISOString().slice(0, 10)),
  };

  if (!env.DB) {
    return { ok: false, message: "D1 not configured" };
  }

  await env.DB.prepare(
    "UPDATE contracts SET title = ?2, client = ?3, status = ?4, amount = ?5, deadline = ?6 WHERE id = ?1",
  )
    .bind(id, payload.title, payload.client, payload.status, payload.amount, payload.deadline)
    .run();

  return { ok: true };
}

export async function deleteContract(env: Env, id: string) {
  if (!env.DB) {
    return { ok: false, message: "D1 not configured" };
  }

  await env.DB.prepare("DELETE FROM contracts WHERE id = ?1").bind(id).run();
  return { ok: true };
}

export async function createBrand(env: Env, input: RecordLike) {
  const id = String(input.id ?? `BR${Date.now().toString().slice(-6)}`);
  const payload = {
    id,
    name: String(input.name ?? ""),
    code: String(input.code ?? ""),
    customer: String(input.customer ?? ""),
    supplier: String(input.supplier ?? ""),
    country: String(input.country ?? "CN"),
    status: String(input.status ?? "Active"),
    owner: String(input.owner ?? ""),
    notes: String(input.notes ?? ""),
  };

  if (!env.DB) return { ok: false, message: "D1 not configured", brand: payload };

  await env.DB.prepare(
    "INSERT INTO brands (id, name, code, customer, supplier, country, status, owner, notes) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
  )
    .bind(
      payload.id,
      payload.name,
      payload.code,
      payload.customer,
      payload.supplier,
      payload.country,
      payload.status,
      payload.owner,
      payload.notes,
    )
    .run();

  return { ok: true, brand: payload };
}

export async function updateBrand(env: Env, input: RecordLike) {
  const id = String(input.id ?? "");
  if (!id) return { ok: false, message: "Missing id" };

  const payload = {
    name: String(input.name ?? ""),
    code: String(input.code ?? ""),
    customer: String(input.customer ?? ""),
    supplier: String(input.supplier ?? ""),
    country: String(input.country ?? "CN"),
    status: String(input.status ?? "Active"),
    owner: String(input.owner ?? ""),
    notes: String(input.notes ?? ""),
  };

  if (!env.DB) return { ok: false, message: "D1 not configured" };

  await env.DB.prepare(
    "UPDATE brands SET name = ?2, code = ?3, customer = ?4, supplier = ?5, country = ?6, status = ?7, owner = ?8, notes = ?9 WHERE id = ?1",
  )
    .bind(id, payload.name, payload.code, payload.customer, payload.supplier, payload.country, payload.status, payload.owner, payload.notes)
    .run();

  return { ok: true };
}

export async function deleteBrand(env: Env, id: string) {
  if (!env.DB) return { ok: false, message: "D1 not configured" };
  await env.DB.prepare("DELETE FROM brands WHERE id = ?1").bind(id).run();
  return { ok: true };
}

export async function createCustomer(env: Env, input: RecordLike) {
  const id = String(input.id ?? `CU${Date.now().toString().slice(-6)}`);
  const payload = {
    id,
    name: String(input.name ?? ""),
    code: String(input.code ?? ""),
    country: String(input.country ?? ""),
    contact: String(input.contact ?? ""),
    phone: String(input.phone ?? ""),
    email: String(input.email ?? ""),
    address: String(input.address ?? ""),
    status: String(input.status ?? "Active"),
    notes: String(input.notes ?? ""),
  };
  if (!env.DB) return { ok: false, message: "D1 not configured", customer: payload };
  await env.DB.prepare(
    "INSERT INTO customers (id, name, code, country, contact, phone, email, address, status, notes) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
  )
    .bind(payload.id, payload.name, payload.code, payload.country, payload.contact, payload.phone, payload.email, payload.address, payload.status, payload.notes)
    .run();
  return { ok: true, customer: payload };
}

export async function updateCustomer(env: Env, input: RecordLike) {
  const id = String(input.id ?? "");
  if (!id) return { ok: false, message: "Missing id" };
  const payload = {
    name: String(input.name ?? ""),
    code: String(input.code ?? ""),
    country: String(input.country ?? ""),
    contact: String(input.contact ?? ""),
    phone: String(input.phone ?? ""),
    email: String(input.email ?? ""),
    address: String(input.address ?? ""),
    status: String(input.status ?? "Active"),
    notes: String(input.notes ?? ""),
  };
  if (!env.DB) return { ok: false, message: "D1 not configured" };
  await env.DB.prepare(
    "UPDATE customers SET name = ?2, code = ?3, country = ?4, contact = ?5, phone = ?6, email = ?7, address = ?8, status = ?9, notes = ?10 WHERE id = ?1",
  )
    .bind(id, payload.name, payload.code, payload.country, payload.contact, payload.phone, payload.email, payload.address, payload.status, payload.notes)
    .run();
  return { ok: true };
}

export async function deleteCustomer(env: Env, id: string) {
  if (!env.DB) return { ok: false, message: "D1 not configured" };
  await env.DB.prepare("DELETE FROM customers WHERE id = ?1").bind(id).run();
  return { ok: true };
}

export async function createSupplier(env: Env, input: RecordLike) {
  const id = String(input.id ?? `SU${Date.now().toString().slice(-6)}`);
  const payload = {
    id,
    name: String(input.name ?? ""),
    code: String(input.code ?? ""),
    country: String(input.country ?? ""),
    contact: String(input.contact ?? ""),
    phone: String(input.phone ?? ""),
    email: String(input.email ?? ""),
    address: String(input.address ?? ""),
    status: String(input.status ?? "Active"),
    notes: String(input.notes ?? ""),
  };
  if (!env.DB) return { ok: false, message: "D1 not configured", supplier: payload };
  await env.DB.prepare(
    "INSERT INTO suppliers (id, name, code, country, contact, phone, email, address, status, notes) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
  )
    .bind(payload.id, payload.name, payload.code, payload.country, payload.contact, payload.phone, payload.email, payload.address, payload.status, payload.notes)
    .run();
  return { ok: true, supplier: payload };
}

export async function updateSupplier(env: Env, input: RecordLike) {
  const id = String(input.id ?? "");
  if (!id) return { ok: false, message: "Missing id" };
  const payload = {
    name: String(input.name ?? ""),
    code: String(input.code ?? ""),
    country: String(input.country ?? ""),
    contact: String(input.contact ?? ""),
    phone: String(input.phone ?? ""),
    email: String(input.email ?? ""),
    address: String(input.address ?? ""),
    status: String(input.status ?? "Active"),
    notes: String(input.notes ?? ""),
  };
  if (!env.DB) return { ok: false, message: "D1 not configured" };
  await env.DB.prepare(
    "UPDATE suppliers SET name = ?2, code = ?3, country = ?4, contact = ?5, phone = ?6, email = ?7, address = ?8, status = ?9, notes = ?10 WHERE id = ?1",
  )
    .bind(id, payload.name, payload.code, payload.country, payload.contact, payload.phone, payload.email, payload.address, payload.status, payload.notes)
    .run();
  return { ok: true };
}

export async function deleteSupplier(env: Env, id: string) {
  if (!env.DB) return { ok: false, message: "D1 not configured" };
  await env.DB.prepare("DELETE FROM suppliers WHERE id = ?1").bind(id).run();
  return { ok: true };
}

export async function createQuote(env: Env, input: RecordLike) {
  const id = String(input.id ?? `QU${Date.now().toString().slice(-6)}`);
  const payload = {
    id,
    quoteNo: String(input.quoteNo ?? input.quote_no ?? id),
    date: String(input.date ?? new Date().toISOString().slice(0, 10)),
    modificationDate: String(input.modificationDate ?? input.modification_date ?? new Date().toISOString().slice(0, 10)),
    register: String(input.register ?? ""),
    itemType: String(input.itemType ?? input.item_type ?? ""),
    brand: String(input.brand ?? ""),
    linkman: String(input.linkman ?? ""),
    salesperson: String(input.salesperson ?? ""),
    customer: String(input.customer ?? ""),
    item: String(input.item ?? ""),
    productCode: String(input.productCode ?? ""),
    productName: String(input.productName ?? ""),
    status: String(input.status ?? "Draft"),
    costItems: Array.isArray(input.costItems) ? input.costItems : [],
    tiers: Array.isArray(input.tiers) ? input.tiers : [],
    lines: Array.isArray(input.lines) ? input.lines : [],
    imageUrl: String(input.imageUrl ?? ""),
    notes: String(input.notes ?? ""),
  };
  if (!env.DB) return { ok: false, message: "D1 not configured", quote: payload };
  await env.DB.prepare(
    "INSERT INTO quotes (id, quote_no, date, modification_date, register, item_type, brand, linkman, salesperson, customer, item, product_code, product_name, status, cost_items_json, tiers_json, lines_json, image_url, notes) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19)",
  )
    .bind(
      payload.id,
      payload.quoteNo,
      payload.date,
      payload.modificationDate,
      payload.register,
      payload.itemType,
      payload.brand,
      payload.linkman,
      payload.salesperson,
      payload.customer,
      payload.item,
      payload.productCode,
      payload.productName,
      payload.status,
      JSON.stringify(payload.costItems),
      JSON.stringify(payload.tiers),
      JSON.stringify(payload.lines),
      payload.imageUrl,
      payload.notes,
    )
    .run();
  return { ok: true, quote: payload };
}

export async function updateQuote(env: Env, input: RecordLike) {
  const id = String(input.id ?? "");
  if (!id) return { ok: false, message: "Missing id" };
  const payload = {
    quoteNo: String(input.quoteNo ?? input.quote_no ?? id),
    date: String(input.date ?? new Date().toISOString().slice(0, 10)),
    modificationDate: String(input.modificationDate ?? input.modification_date ?? new Date().toISOString().slice(0, 10)),
    register: String(input.register ?? ""),
    itemType: String(input.itemType ?? input.item_type ?? ""),
    brand: String(input.brand ?? ""),
    linkman: String(input.linkman ?? ""),
    salesperson: String(input.salesperson ?? ""),
    customer: String(input.customer ?? ""),
    item: String(input.item ?? ""),
    productCode: String(input.productCode ?? ""),
    productName: String(input.productName ?? ""),
    status: String(input.status ?? "Draft"),
    costItems: Array.isArray(input.costItems) ? input.costItems : [],
    tiers: Array.isArray(input.tiers) ? input.tiers : [],
    lines: Array.isArray(input.lines) ? input.lines : [],
    imageUrl: String(input.imageUrl ?? ""),
    notes: String(input.notes ?? ""),
  };
  if (!env.DB) return { ok: false, message: "D1 not configured" };
  await env.DB.prepare(
    "UPDATE quotes SET quote_no = ?2, date = ?3, modification_date = ?4, register = ?5, item_type = ?6, brand = ?7, linkman = ?8, salesperson = ?9, customer = ?10, item = ?11, product_code = ?12, product_name = ?13, status = ?14, cost_items_json = ?15, tiers_json = ?16, lines_json = ?17, image_url = ?18, notes = ?19 WHERE id = ?1",
  )
    .bind(
      id,
      payload.quoteNo,
      payload.date,
      payload.modificationDate,
      payload.register,
      payload.itemType,
      payload.brand,
      payload.linkman,
      payload.salesperson,
      payload.customer,
      payload.item,
      payload.productCode,
      payload.productName,
      payload.status,
      JSON.stringify(payload.costItems),
      JSON.stringify(payload.tiers),
      JSON.stringify(payload.lines),
      payload.imageUrl,
      payload.notes,
    )
    .run();
  return { ok: true };
}

export async function deleteQuote(env: Env, id: string) {
  if (!env.DB) return { ok: false, message: "D1 not configured" };
  await env.DB.prepare("DELETE FROM quotes WHERE id = ?1").bind(id).run();
  return { ok: true };
}

export async function createPI(env: Env, input: RecordLike) {
  const id = String(input.id ?? `PI${Date.now().toString().slice(-6)}`);
  const payload = {
    id,
    piNo: String(input.piNo ?? id),
    customer: String(input.customer ?? ""),
    brand: String(input.brand ?? ""),
    vendor: String(input.vendor ?? ""),
    ourRefNo: String(input.ourRefNo ?? ""),
    deliveryDate: String(input.deliveryDate ?? ""),
    deliverTo: String(input.deliverTo ?? ""),
    status: String(input.status ?? "Draft"),
    generatedAt: String(input.generatedAt ?? new Date().toISOString()),
    generatedBy: String(input.generatedBy ?? "Jason"),
    pdfUrl: String(input.pdfUrl ?? ""),
    itemCode: String(input.itemCode ?? ""),
    description: String(input.description ?? ""),
    productType: String(input.productType ?? ""),
    size: String(input.size ?? ""),
    colors: String(input.colors ?? ""),
    finished: String(input.finished ?? ""),
    remarks: String(input.remarks ?? ""),
    imageUrl: String(input.imageUrl ?? ""),
    sizeDetails: Array.isArray(input.sizeDetails) ? input.sizeDetails : [],
    lines: Array.isArray(input.lines) ? input.lines : [],
    notes: String(input.notes ?? ""),
  };
  if (!env.DB) return { ok: false, message: "D1 not configured", pi: payload };
  await env.DB.prepare(
    "INSERT INTO pis (id, pi_no, customer, brand, vendor, our_ref_no, delivery_date, deliver_to, status, generated_at, generated_by, pdf_url, item_code, description, product_type, size, colors, finished, remarks, image_url, size_details_json, lines_json, notes) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21, ?22, ?23)",
  )
    .bind(
      payload.id,
      payload.piNo,
      payload.customer,
      payload.brand,
      payload.vendor,
      payload.ourRefNo,
      payload.deliveryDate,
      payload.deliverTo,
      payload.status,
      payload.generatedAt,
      payload.generatedBy,
      payload.pdfUrl,
      payload.itemCode,
      payload.description,
      payload.productType,
      payload.size,
      payload.colors,
      payload.finished,
      payload.remarks,
      payload.imageUrl,
      JSON.stringify(payload.sizeDetails),
      JSON.stringify(payload.lines),
      payload.notes,
    )
    .run();
  return { ok: true, pi: payload };
}

export async function updatePI(env: Env, input: RecordLike) {
  const id = String(input.id ?? "");
  if (!id) return { ok: false, message: "Missing id" };
  const payload = {
    piNo: String(input.piNo ?? ""),
    customer: String(input.customer ?? ""),
    brand: String(input.brand ?? ""),
    vendor: String(input.vendor ?? ""),
    ourRefNo: String(input.ourRefNo ?? ""),
    deliveryDate: String(input.deliveryDate ?? ""),
    deliverTo: String(input.deliverTo ?? ""),
    status: String(input.status ?? "Draft"),
    generatedAt: String(input.generatedAt ?? new Date().toISOString()),
    generatedBy: String(input.generatedBy ?? "Jason"),
    pdfUrl: String(input.pdfUrl ?? ""),
    itemCode: String(input.itemCode ?? ""),
    description: String(input.description ?? ""),
    productType: String(input.productType ?? ""),
    size: String(input.size ?? ""),
    colors: String(input.colors ?? ""),
    finished: String(input.finished ?? ""),
    remarks: String(input.remarks ?? ""),
    imageUrl: String(input.imageUrl ?? ""),
    sizeDetails: Array.isArray(input.sizeDetails) ? input.sizeDetails : [],
    lines: Array.isArray(input.lines) ? input.lines : [],
    notes: String(input.notes ?? ""),
  };
  if (!env.DB) return { ok: false, message: "D1 not configured" };
  await env.DB.prepare(
    "UPDATE pis SET pi_no = ?2, customer = ?3, brand = ?4, vendor = ?5, our_ref_no = ?6, delivery_date = ?7, deliver_to = ?8, status = ?9, generated_at = ?10, generated_by = ?11, pdf_url = ?12, item_code = ?13, description = ?14, product_type = ?15, size = ?16, colors = ?17, finished = ?18, remarks = ?19, image_url = ?20, size_details_json = ?21, lines_json = ?22, notes = ?23 WHERE id = ?1",
  )
    .bind(
      id,
      payload.piNo,
      payload.customer,
      payload.brand,
      payload.vendor,
      payload.ourRefNo,
      payload.deliveryDate,
      payload.deliverTo,
      payload.status,
      payload.generatedAt,
      payload.generatedBy,
      payload.pdfUrl,
      payload.itemCode,
      payload.description,
      payload.productType,
      payload.size,
      payload.colors,
      payload.finished,
      payload.remarks,
      payload.imageUrl,
      JSON.stringify(payload.sizeDetails),
      JSON.stringify(payload.lines),
      payload.notes,
    )
    .run();
  return { ok: true };
}

export async function deletePI(env: Env, id: string) {
  if (!env.DB) return { ok: false, message: "D1 not configured" };
  await env.DB.prepare("DELETE FROM pis WHERE id = ?1").bind(id).run();
  return { ok: true };
}

export async function createPO(env: Env, input: RecordLike) {
  const id = String(input.id ?? `PO${Date.now().toString().slice(-6)}`);
  const payload = {
    id,
    poNo: String(input.poNo ?? input.po_no ?? id),
    sourcePiId: String(input.sourcePiId ?? input.source_pi_id ?? ""),
    date: String(input.date ?? new Date().toISOString().slice(0, 10)),
    vendor: String(input.vendor ?? ""),
    vendorAddress: String(input.vendorAddress ?? input.vendor_address ?? ""),
    vendorContact: String(input.vendorContact ?? input.vendor_contact ?? ""),
    vendorEmail: String(input.vendorEmail ?? input.vendor_email ?? ""),
    vendorTel: String(input.vendorTel ?? input.vendor_tel ?? ""),
    vendorFax: String(input.vendorFax ?? input.vendor_fax ?? ""),
    customer: String(input.customer ?? ""),
    ourRefNo: String(input.ourRefNo ?? input.our_ref_no ?? ""),
    deliveryDate: String(input.deliveryDate ?? input.delivery_date ?? ""),
    deliverTo: String(input.deliverTo ?? input.deliver_to ?? ""),
    status: String(input.status ?? "Draft"),
    itemCode: String(input.itemCode ?? input.item_code ?? ""),
    description: String(input.description ?? ""),
    productType: String(input.productType ?? input.product_type ?? ""),
    size: String(input.size ?? ""),
    colors: String(input.colors ?? ""),
    finished: String(input.finished ?? ""),
    remarks: String(input.remarks ?? ""),
    lines: Array.isArray(input.lines) ? input.lines : [],
    packingRows: Array.isArray(input.packingRows) ? input.packingRows : [],
    notes: String(input.notes ?? ""),
    imageUrl: String(input.imageUrl ?? ""),
  };
  if (!env.DB) return { ok: false, message: "D1 not configured", po: payload };
  await env.DB.prepare(
    "INSERT INTO purchase_orders (id, po_no, source_pi_id, date, vendor, vendor_address, vendor_contact, vendor_email, vendor_tel, vendor_fax, customer, our_ref_no, delivery_date, deliver_to, status, item_code, description, product_type, size, colors, finished, remarks, lines_json, packing_rows_json, notes, image_url) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21, ?22, ?23, ?24, ?25, ?26)",
  )
    .bind(
      payload.id,
      payload.poNo,
      payload.sourcePiId,
      payload.date,
      payload.vendor,
      payload.vendorAddress,
      payload.vendorContact,
      payload.vendorEmail,
      payload.vendorTel,
      payload.vendorFax,
      payload.customer,
      payload.ourRefNo,
      payload.deliveryDate,
      payload.deliverTo,
      payload.status,
      payload.itemCode,
      payload.description,
      payload.productType,
      payload.size,
      payload.colors,
      payload.finished,
      payload.remarks,
      JSON.stringify(payload.lines),
      JSON.stringify(payload.packingRows),
      payload.notes,
      payload.imageUrl,
    )
    .run();
  return { ok: true, po: payload };
}

export async function updatePO(env: Env, input: RecordLike) {
  const id = String(input.id ?? "");
  if (!id) return { ok: false, message: "Missing id" };
  const payload = {
    poNo: String(input.poNo ?? input.po_no ?? id),
    sourcePiId: String(input.sourcePiId ?? input.source_pi_id ?? ""),
    date: String(input.date ?? new Date().toISOString().slice(0, 10)),
    vendor: String(input.vendor ?? ""),
    vendorAddress: String(input.vendorAddress ?? input.vendor_address ?? ""),
    vendorContact: String(input.vendorContact ?? input.vendor_contact ?? ""),
    vendorEmail: String(input.vendorEmail ?? input.vendor_email ?? ""),
    vendorTel: String(input.vendorTel ?? input.vendor_tel ?? ""),
    vendorFax: String(input.vendorFax ?? input.vendor_fax ?? ""),
    customer: String(input.customer ?? ""),
    ourRefNo: String(input.ourRefNo ?? input.our_ref_no ?? ""),
    deliveryDate: String(input.deliveryDate ?? input.delivery_date ?? ""),
    deliverTo: String(input.deliverTo ?? input.deliver_to ?? ""),
    status: String(input.status ?? "Draft"),
    itemCode: String(input.itemCode ?? input.item_code ?? ""),
    description: String(input.description ?? ""),
    productType: String(input.productType ?? input.product_type ?? ""),
    size: String(input.size ?? ""),
    colors: String(input.colors ?? ""),
    finished: String(input.finished ?? ""),
    remarks: String(input.remarks ?? ""),
    lines: Array.isArray(input.lines) ? input.lines : [],
    packingRows: Array.isArray(input.packingRows) ? input.packingRows : [],
    notes: String(input.notes ?? ""),
    imageUrl: String(input.imageUrl ?? ""),
  };
  if (!env.DB) return { ok: false, message: "D1 not configured" };
  await env.DB.prepare(
    "UPDATE purchase_orders SET po_no = ?2, source_pi_id = ?3, date = ?4, vendor = ?5, vendor_address = ?6, vendor_contact = ?7, vendor_email = ?8, vendor_tel = ?9, vendor_fax = ?10, customer = ?11, our_ref_no = ?12, delivery_date = ?13, deliver_to = ?14, status = ?15, item_code = ?16, description = ?17, product_type = ?18, size = ?19, colors = ?20, finished = ?21, remarks = ?22, lines_json = ?23, packing_rows_json = ?24, notes = ?25, image_url = ?26 WHERE id = ?1",
  )
    .bind(
      id,
      payload.poNo,
      payload.sourcePiId,
      payload.date,
      payload.vendor,
      payload.vendorAddress,
      payload.vendorContact,
      payload.vendorEmail,
      payload.vendorTel,
      payload.vendorFax,
      payload.customer,
      payload.ourRefNo,
      payload.deliveryDate,
      payload.deliverTo,
      payload.status,
      payload.itemCode,
      payload.description,
      payload.productType,
      payload.size,
      payload.colors,
      payload.finished,
      payload.remarks,
      JSON.stringify(payload.lines),
      JSON.stringify(payload.packingRows),
      payload.notes,
      payload.imageUrl,
    )
    .run();
  return { ok: true };
}

export async function deletePO(env: Env, id: string) {
  if (!env.DB) return { ok: false, message: "D1 not configured" };
  await env.DB.prepare("DELETE FROM purchase_orders WHERE id = ?1").bind(id).run();
  return { ok: true };
}

export { okJson };
