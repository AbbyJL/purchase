import { seedBrands, seedContracts, seedCustomers, seedDevelopments, seedOrders, seedPOs, seedPIs, seedProducts, seedQuotes, seedSuppliers } from "./seed";

type Env = {
  DB?: D1Database;
};

type RecordLike = Record<string, unknown>;

function okJson(data: unknown, init?: ResponseInit) {
  return Response.json(data, init);
}

function toStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item ?? "").trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeSupplierList(row: RecordLike) {
  const fromJson = toStringArray(safeJsonParse(row.suppliers_json ?? row.suppliersJson, []));
  if (fromJson.length > 0) return fromJson;
  return toStringArray(row.supplier);
}

function normalizeCodeList(value: unknown) {
  return toStringArray(value);
}

function mapProduct(row: RecordLike) {
  return {
    id: String(row.id),
    name: String(row.name),
    suppliers: normalizeSupplierList(row),
    categoryKey: String(row.category_key ?? row.categoryKey),
    price: Number(row.price),
    stock: Number(row.stock),
    status: String(row.status),
    imageUrl: String(row.image_url ?? row.imageUrl ?? ""),
    codePrefix: String(row.code_prefix ?? row.codePrefix ?? ""),
    quoteProductCodes: normalizeCodeList(row.quote_product_codes_json ?? row.quoteProductCodes_json ?? row.quoteProductCodes),
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
    imageUrl: String(row.image_url ?? row.imageUrl ?? ""),
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

function mapDevelopment(row: RecordLike) {
  return {
    id: String(row.id),
    developmentNo: String(row.development_no ?? row.developmentNo ?? ""),
    date: String(row.date ?? ""),
    modificationDate: String(row.modification_date ?? row.modificationDate ?? ""),
    register: String(row.register ?? ""),
    itemType: String(row.item_type ?? row.itemType ?? ""),
    brand: String(row.brand ?? ""),
    linkman: String(row.linkman ?? ""),
    salesperson: String(row.salesperson ?? ""),
    customer: String(row.customer ?? ""),
    item: String(row.item ?? ""),
    productCode: String(row.product_code ?? row.productCode ?? ""),
    productName: String(row.product_name ?? row.productName ?? ""),
    status: String(row.status),
    sourceQuoteId: String(row.source_quote_id ?? row.sourceQuoteId ?? ""),
    sourceQuoteNo: String(row.source_quote_no ?? row.sourceQuoteNo ?? ""),
    lines: safeJsonParse(row.lines_json, []),
    imageUrl: String(row.image_url ?? row.imageUrl ?? ""),
    notes: String(row.notes ?? ""),
  };
}

function mapPI(row: RecordLike) {
  const sizeDetails = safeJsonParse(row.size_details_json ?? row.sizeDetails_json ?? row.sizeDetails, []);
  const lines = safeJsonParse(row.lines_json, []);
  const fallbackQty = Array.isArray(sizeDetails)
    ? sizeDetails.reduce((sum: number, item: RecordLike) => sum + Number(item.quantity ?? 0), 0)
    : 0;
  const lineQty = Array.isArray(lines)
    ? lines.reduce((sum: number, item: RecordLike) => sum + Number(item.quantity ?? 0), 0)
    : 0;
  const orderQtyValue = row.order_qty ?? row.orderQty ?? fallbackQty ?? lineQty ?? 0;
  const orderQty = Number(orderQtyValue);
  const stockOutQtyValue = row.stock_out_qty ?? row.stockOutQty ?? orderQtyValue ?? lineQty ?? 0;
  const stockOutQty = Number(stockOutQtyValue);
  const plNo = String(row.pl_no ?? row.plNo ?? String(row.pi_no ?? row.piNo ?? "").replace(/^PI/i, "PL"));
  return {
    id: String(row.id),
    piNo: String(row.pi_no ?? row.piNo),
    plNo,
    customer: String(row.customer),
    brand: String(row.brand),
    vendor: String(row.vendor ?? ""),
    ourRefNo: String(row.our_ref_no ?? row.ourRefNo ?? ""),
    deliveryDate: String(row.delivery_date ?? row.deliveryDate ?? ""),
    deliverTo: String(row.deliver_to ?? row.deliverTo ?? ""),
    status: String(row.status),
    generatedAt: String(row.generated_at ?? row.generatedAt),
    generatedBy: String(row.generated_by ?? row.generatedBy),
    purchaseGeneratedAt: String(row.purchase_generated_at ?? row.purchaseGeneratedAt ?? ""),
    financeApprovedAt: String(row.finance_approved_at ?? row.financeApprovedAt ?? ""),
    packingInfoGeneratedAt: String(row.packing_info_generated_at ?? row.packingInfoGeneratedAt ?? ""),
    commercialInvoiceGeneratedAt: String(row.commercial_invoice_generated_at ?? row.commercialInvoiceGeneratedAt ?? ""),
    paymentConfirmedAt: String(row.payment_confirmed_at ?? row.paymentConfirmedAt ?? ""),
    pdfUrl: String(row.pdf_url ?? row.pdfUrl ?? ""),
    itemCode: String(row.item_code ?? row.itemCode ?? ""),
    description: String(row.description ?? ""),
    productType: String(row.product_type ?? row.productType ?? ""),
    size: String(row.size ?? ""),
    colors: String(row.colors ?? ""),
    finished: String(row.finished ?? ""),
    remarks: String(row.remarks ?? ""),
    imageUrl: String(row.image_url ?? row.imageUrl ?? ""),
    orderQty,
    deductedQty: Number(row.deducted_qty ?? row.deductedQty ?? 0),
    outstandingQty: Number(row.outstanding_qty ?? row.outstandingQty ?? orderQtyValue ?? lineQty ?? 0),
    inStockQty: Number(row.in_stock_qty ?? row.inStockQty ?? orderQtyValue ?? lineQty ?? 0),
    stockOutQty,
    sizeDetails,
    lines,
    notes: String(row.notes),
  };
}

function mapPO(row: RecordLike) {
  return {
    id: String(row.id),
    poType: String(row.po_type ?? row.poType ?? "purchase"),
    poNo: String(row.po_no ?? row.poNo),
    plNo: String(row.pl_no ?? row.plNo ?? ""),
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
    // Craft-specific fields
    orderNo: String(row.order_no ?? row.orderNo ?? ""),
    maker: String(row.maker ?? row.maker ?? ""),
    makeDate: String(row.make_date ?? row.makeDate ?? ""),
    styleNo: String(row.style_no ?? row.styleNo ?? ""),
    customerOrderNo: String(row.customer_order_no ?? row.customerOrderNo ?? ""),
    craftProductName: String(row.craft_product_name ?? row.craftProductName ?? ""),
    relatedOrderNo: String(row.related_order_no ?? row.relatedOrderNo ?? ""),
    sheetSize: String(row.sheet_size ?? row.sheetSize ?? ""),
    materialIn: String(row.material_in ?? row.materialIn ?? ""),
    upCount: String(row.up_count ?? row.upCount ?? ""),
    quantity: Number(row.quantity ?? 0),
    remainder: Number(row.remainder ?? 0),
    finishedQty: Number(row.finished_qty ?? 0),
    packCount: String(row.pack_count ?? row.packCount ?? ""),
    printMethod: safeJsonParse(row.print_method, []),
    proofType: safeJsonParse(row.proof_type, []),
    postProcess: safeJsonParse(row.post_process, []),
    craftNotes: String(row.craft_notes ?? row.craftNotes ?? ""),
  };
}

export async function listProducts(env: Env) {
  if (!env.DB) return seedProducts;
  const result = await env.DB.prepare("SELECT * FROM products ORDER BY id ASC").all();
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

export async function getBrandDetail(env: Env, id: string) {
  // --- 获取品牌基本信息 ---
  let brand: ReturnType<typeof mapBrand> | undefined;
  if (!env.DB) {
    brand = seedBrands.find((b) => b.id === id) as ReturnType<typeof mapBrand> | undefined;
  } else {
    const row = await env.DB.prepare(
      "SELECT id, name, code, customer, supplier, country, status, owner, notes FROM brands WHERE id = ?1",
    ).bind(id).first<RecordLike>();
    if (row) brand = mapBrand(row);
  }
  if (!brand) return { ok: false, message: "Brand not found" };

  // --- 统计数据 ---
  let stats = {
    quotes: 0,
    developments: 0,
    pis: 0,
    pos: 0,
  };

  if (!env.DB) {
    // 种子数据 fallback
    stats.quotes = seedQuotes.filter((q) => q.brand === brand!.name).length;
    stats.developments = seedDevelopments.filter((d) => d.brand === brand!.name).length;
    stats.pis = seedPIs.filter((p) => p.brand === brand!.name).length;
    // PO 无直接 brand 字段，通过关联的 PI brand 统计
    const piIds = seedPIs.filter((p) => p.brand === brand!.name).map((p) => p.id);
    stats.pos = seedPOs.filter((po) => piIds.includes(po.sourcePiId)).length;
  } else {
    const [quotesRow, devRow, pisRow] = await Promise.all([
      env.DB.prepare("SELECT COUNT(*) AS count FROM quotes WHERE brand = ?1").bind(brand.name).first<{ count: number }>(),
      env.DB.prepare("SELECT COUNT(*) AS count FROM developments WHERE brand = ?1").bind(brand.name).first<{ count: number }>(),
      env.DB.prepare("SELECT COUNT(*) AS count FROM pis WHERE brand = ?1").bind(brand.name).first<{ count: number }>(),
    ]);
    stats.quotes = Number(quotesRow?.count ?? 0);
    stats.developments = Number(devRow?.count ?? 0);
    stats.pis = Number(pisRow?.count ?? 0);

    // PO 统计：通过 PI 关联
    const piIdsResult = await env.DB.prepare(
      "SELECT id FROM pis WHERE brand = ?1",
    ).bind(brand.name).all<{ id: string }>();
    const piIds = (piIdsResult.results ?? []).map((r) => r.id);
    if (piIds.length > 0) {
      // D1 不支持 IN (?) 绑定数组，逐条查询
      let poCount = 0;
      for (const piId of piIds) {
        const row = await env.DB.prepare("SELECT COUNT(*) AS count FROM purchase_orders WHERE source_pi_id = ?1").bind(piId).first<{ count: number }>();
        poCount += Number(row?.count ?? 0);
      }
      stats.pos = poCount;
    }
  }

  return { ok: true, brand, stats };
}

export async function listCustomers(env: Env) {
  if (!env.DB) return seedCustomers;
  const result = await env.DB.prepare(
    "SELECT id, name, code, country, contact, phone, email, address, status, notes, image_url FROM customers ORDER BY id ASC",
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

export async function listDevelopments(env: Env) {
  if (!env.DB) return seedDevelopments;
  const result = await env.DB.prepare(
    "SELECT id, development_no, date, modification_date, register, item_type, brand, linkman, salesperson, customer, item, product_code, product_name, status, source_quote_id, source_quote_no, lines_json, image_url, notes FROM developments ORDER BY date DESC, development_no ASC",
  ).all();
  return (result.results ?? []).map(mapDevelopment);
}

export async function listPIs(env: Env) {
  if (!env.DB) return seedPIs;
  const result = await env.DB.prepare(
    "SELECT id, pi_no, pl_no, customer, brand, vendor, our_ref_no, delivery_date, deliver_to, status, generated_at, generated_by, purchase_generated_at, finance_approved_at, packing_info_generated_at, commercial_invoice_generated_at, payment_confirmed_at, pdf_url, order_qty, deducted_qty, outstanding_qty, in_stock_qty, stock_out_qty, item_code, description, product_type, size, colors, finished, remarks, image_url, size_details_json, lines_json, notes FROM pis ORDER BY id ASC",
  ).all();
  return (result.results ?? []).map(mapPI);
}

export async function listPOs(env: Env) {
  if (!env.DB) return seedPOs;
  const result = await env.DB.prepare(
    "SELECT id, po_type, po_no, pl_no, source_pi_id, date, vendor, vendor_address, vendor_contact, vendor_email, vendor_tel, vendor_fax, customer, our_ref_no, delivery_date, deliver_to, status, item_code, description, product_type, size, colors, finished, remarks, lines_json, packing_rows_json, notes, image_url, order_no, maker, make_date, style_no, customer_order_no, craft_product_name, related_order_no, sheet_size, material_in, up_count, quantity, remainder, finished_qty, pack_count, print_method, proof_type, post_process, craft_notes FROM purchase_orders ORDER BY date DESC, po_no ASC",
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
      developments: seedDevelopments.length,
      pis: seedPIs.length,
    };
  }

  const [productsResult, ordersResult, contractsResult, brandsResult, customersResult, suppliersResult, quotesResult, developmentsResult, pisResult] = await Promise.all([
    env.DB.prepare("SELECT COUNT(*) AS count FROM products").first<{ count: number }>(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM orders").first<{ count: number }>(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM contracts").first<{ count: number }>(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM brands").first<{ count: number }>(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM customers").first<{ count: number }>(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM suppliers").first<{ count: number }>(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM quotes").first<{ count: number }>(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM developments").first<{ count: number }>(),
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
    developments: Number(developmentsResult?.count ?? 0),
    pis: Number(pisResult?.count ?? 0),
  };
}

export async function createProduct(env: Env, input: RecordLike) {
  const id = String(input.id ?? `SPU${Date.now()}`);
  const suppliers = toStringArray(input.suppliers ?? input.suppliersJson ?? input.supplier);
  const quoteProductCodes = toStringArray(input.quoteProductCodes ?? input.quoteProductCodesJson);
  const payload = {
    id,
    name: String(input.name ?? ""),
    supplier: suppliers[0] ?? "",
    suppliers,
    categoryKey: String(input.categoryKey ?? "office"),
    price: Number(input.price ?? 0),
    stock: Number(input.stock ?? 0),
    status: String(input.status ?? "In stock"),
    imageUrl: String(input.imageUrl ?? ""),
    codePrefix: String(input.codePrefix ?? ""),
    quoteProductCodes,
  };

  if (!env.DB) {
    return { ok: false, message: "D1 not configured", product: payload };
  }

  await env.DB.prepare(
    "INSERT INTO products (id, name, supplier, suppliers_json, category_key, price, stock, status, image_url, code_prefix, quote_product_codes_json) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
  )
    .bind(
      payload.id,
      payload.name,
      payload.supplier,
      JSON.stringify(payload.suppliers),
      payload.categoryKey,
      payload.price,
      payload.stock,
      payload.status,
      payload.imageUrl,
      payload.codePrefix,
      JSON.stringify(payload.quoteProductCodes),
    )
    .run();

  return { ok: true, product: payload };
}

export async function updateProduct(env: Env, input: RecordLike) {
  const id = String(input.id ?? "");
  if (!id) return { ok: false, message: "Missing id" };
  const suppliers = toStringArray(input.suppliers ?? input.suppliersJson ?? input.supplier);
  const quoteProductCodes = toStringArray(input.quoteProductCodes ?? input.quoteProductCodesJson);

  const payload = {
    name: String(input.name ?? ""),
    supplier: suppliers[0] ?? "",
    suppliers,
    categoryKey: String(input.categoryKey ?? "office"),
    price: Number(input.price ?? 0),
    stock: Number(input.stock ?? 0),
    status: String(input.status ?? "In stock"),
    imageUrl: String(input.imageUrl ?? ""),
    codePrefix: String(input.codePrefix ?? ""),
    quoteProductCodes,
  };

  if (!env.DB) {
    return { ok: false, message: "D1 not configured" };
  }

  await env.DB.prepare(
    "UPDATE products SET name = ?2, supplier = ?3, suppliers_json = ?4, category_key = ?5, price = ?6, stock = ?7, status = ?8, image_url = ?9, code_prefix = ?10, quote_product_codes_json = ?11 WHERE id = ?1",
  )
    .bind(
      id,
      payload.name,
      payload.supplier,
      JSON.stringify(payload.suppliers),
      payload.categoryKey,
      payload.price,
      payload.stock,
      payload.status,
      payload.imageUrl,
      payload.codePrefix,
      JSON.stringify(payload.quoteProductCodes),
    )
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

async function upsertProductFromPILine(env: Env, line: RecordLike) {
  const productCode = String(line.productCode ?? "").trim();
  const productName = String(line.productName ?? "").trim();
  if (!productCode && !productName) return;
  const lineSupplier = String(line.supplier ?? "").trim();
  const codePrefix = productCode.includes("-") ? productCode.split("-")[0] : productCode.replace(/\d.*$/, "");

  const id = productCode || `SPU${Date.now().toString().slice(-6)}`;
  const existing = await env.DB!.prepare("SELECT * FROM products WHERE id = ?1").bind(id).first<RecordLike>();
  const existingSuppliers = existing ? normalizeSupplierList(existing) : [];
  const existingQuoteCodes = existing ? toStringArray(existing.quote_product_codes_json ?? existing.quoteProductCodes_json ?? existing.quoteProductCodes) : [];
  const nextQuoteCodes = Array.from(new Set([...existingQuoteCodes, ...(productCode ? [productCode] : [])]));
  const suppliers = Array.from(new Set([...existingSuppliers, ...(lineSupplier ? [lineSupplier] : [])]));
  const payload = {
    id,
    name: productName || productCode,
    supplier: suppliers[0] ?? "",
    suppliers,
    categoryKey: String(line.categoryKey ?? "accessory"),
    price: Number(line.unitPrice ?? line.price ?? 0),
    stock: Number(line.stock ?? 0),
    status: String(line.status ?? "In stock"),
    imageUrl: String(line.imageUrl ?? ""),
    codePrefix: String(existing?.code_prefix ?? existing?.codePrefix ?? codePrefix ?? ""),
    quoteProductCodes: nextQuoteCodes,
  };

  if (existing) {
    await env.DB!.prepare(
      "UPDATE products SET name = ?2, supplier = ?3, suppliers_json = ?4, category_key = ?5, price = ?6, stock = ?7, status = ?8, image_url = ?9, code_prefix = ?10, quote_product_codes_json = ?11 WHERE id = ?1",
    )
      .bind(
        id,
        payload.name,
        payload.supplier,
        JSON.stringify(payload.suppliers),
        payload.categoryKey,
        payload.price,
        payload.stock,
        payload.status,
        payload.imageUrl,
        payload.codePrefix,
        JSON.stringify(payload.quoteProductCodes),
      )
      .run();
    return;
  }

  await env.DB!.prepare(
    "INSERT INTO products (id, name, supplier, suppliers_json, category_key, price, stock, status, image_url, code_prefix, quote_product_codes_json) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
  )
    .bind(
      id,
      payload.name,
      payload.supplier,
      JSON.stringify(payload.suppliers),
      payload.categoryKey,
      payload.price,
      payload.stock,
      payload.status,
      payload.imageUrl,
      payload.codePrefix,
      JSON.stringify(payload.quoteProductCodes),
    )
    .run();
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
    imageUrl: String(input.imageUrl ?? ""),
  };
  if (!env.DB) return { ok: false, message: "D1 not configured", customer: payload };
  await env.DB.prepare(
    "INSERT INTO customers (id, name, code, country, contact, phone, email, address, status, notes, image_url) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
  )
    .bind(payload.id, payload.name, payload.code, payload.country, payload.contact, payload.phone, payload.email, payload.address, payload.status, payload.notes, payload.imageUrl)
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
    imageUrl: String(input.imageUrl ?? ""),
  };
  if (!env.DB) return { ok: false, message: "D1 not configured" };
  await env.DB.prepare(
    "UPDATE customers SET name = ?2, code = ?3, country = ?4, contact = ?5, phone = ?6, email = ?7, address = ?8, status = ?9, notes = ?10, image_url = ?11 WHERE id = ?1",
  )
    .bind(id, payload.name, payload.code, payload.country, payload.contact, payload.phone, payload.email, payload.address, payload.status, payload.notes, payload.imageUrl)
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

export async function createDevelopment(env: Env, input: RecordLike) {
  const id = String(input.id ?? `DV${Date.now().toString().slice(-6)}`);
  const payload = {
    id,
    developmentNo: String(input.developmentNo ?? input.development_no ?? id),
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
    sourceQuoteId: String(input.sourceQuoteId ?? input.source_quote_id ?? ""),
    sourceQuoteNo: String(input.sourceQuoteNo ?? input.source_quote_no ?? ""),
    lines: Array.isArray(input.lines) ? input.lines : [],
    imageUrl: String(input.imageUrl ?? ""),
    notes: String(input.notes ?? ""),
  };
  if (!env.DB) return { ok: false, message: "D1 not configured", development: payload };
  await env.DB.prepare(
    "INSERT INTO developments (id, development_no, date, modification_date, register, item_type, brand, linkman, salesperson, customer, item, product_code, product_name, status, source_quote_id, source_quote_no, lines_json, image_url, notes) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19)",
  )
    .bind(
      payload.id,
      payload.developmentNo,
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
      payload.sourceQuoteId,
      payload.sourceQuoteNo,
      JSON.stringify(payload.lines),
      payload.imageUrl,
      payload.notes,
    )
    .run();
  return { ok: true, development: payload };
}

export async function updateDevelopment(env: Env, input: RecordLike) {
  const id = String(input.id ?? "");
  if (!id) return { ok: false, message: "Missing id" };
  const payload = {
    developmentNo: String(input.developmentNo ?? input.development_no ?? id),
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
    sourceQuoteId: String(input.sourceQuoteId ?? input.source_quote_id ?? ""),
    sourceQuoteNo: String(input.sourceQuoteNo ?? input.source_quote_no ?? ""),
    lines: Array.isArray(input.lines) ? input.lines : [],
    imageUrl: String(input.imageUrl ?? ""),
    notes: String(input.notes ?? ""),
  };
  if (!env.DB) return { ok: false, message: "D1 not configured" };
  await env.DB.prepare(
    "UPDATE developments SET development_no = ?2, date = ?3, modification_date = ?4, register = ?5, item_type = ?6, brand = ?7, linkman = ?8, salesperson = ?9, customer = ?10, item = ?11, product_code = ?12, product_name = ?13, status = ?14, source_quote_id = ?15, source_quote_no = ?16, lines_json = ?17, image_url = ?18, notes = ?19 WHERE id = ?1",
  )
    .bind(
      id,
      payload.developmentNo,
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
      payload.sourceQuoteId,
      payload.sourceQuoteNo,
      JSON.stringify(payload.lines),
      payload.imageUrl,
      payload.notes,
    )
    .run();
  return { ok: true };
}

export async function deleteDevelopment(env: Env, id: string) {
  if (!env.DB) return { ok: false, message: "D1 not configured" };
  await env.DB.prepare("DELETE FROM developments WHERE id = ?1").bind(id).run();
  return { ok: true };
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
    plNo: String(input.plNo ?? input.pl_no ?? String(input.piNo ?? id).replace(/^PI/i, "PL")),
    customer: String(input.customer ?? ""),
    brand: String(input.brand ?? ""),
    vendor: String(input.vendor ?? ""),
    ourRefNo: String(input.ourRefNo ?? ""),
    deliveryDate: String(input.deliveryDate ?? ""),
    deliverTo: String(input.deliverTo ?? ""),
    status: String(input.status ?? "Draft"),
    generatedAt: String(input.generatedAt ?? new Date().toISOString()),
    generatedBy: String(input.generatedBy ?? "Jason"),
    purchaseGeneratedAt: String(input.purchaseGeneratedAt ?? ""),
    financeApprovedAt: String(input.financeApprovedAt ?? ""),
    packingInfoGeneratedAt: String(input.packingInfoGeneratedAt ?? ""),
    commercialInvoiceGeneratedAt: String(input.commercialInvoiceGeneratedAt ?? ""),
    paymentConfirmedAt: String(input.paymentConfirmedAt ?? ""),
    pdfUrl: String(input.pdfUrl ?? ""),
    orderQty: Number(input.orderQty ?? 0),
    deductedQty: Number(input.deductedQty ?? 0),
    outstandingQty: Number(input.outstandingQty ?? 0),
    inStockQty: Number(input.inStockQty ?? 0),
    stockOutQty: Number(input.stockOutQty ?? 0),
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
    "INSERT INTO pis (id, pi_no, pl_no, customer, brand, vendor, our_ref_no, delivery_date, deliver_to, status, generated_at, generated_by, purchase_generated_at, finance_approved_at, packing_info_generated_at, commercial_invoice_generated_at, payment_confirmed_at, pdf_url, order_qty, deducted_qty, outstanding_qty, in_stock_qty, stock_out_qty, item_code, description, product_type, size, colors, finished, remarks, image_url, size_details_json, lines_json, notes) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21, ?22, ?23, ?24, ?25, ?26, ?27, ?28, ?29, ?30, ?31, ?32, ?33, ?34)",
  )
    .bind(
      payload.id,
      payload.piNo,
      payload.plNo,
      payload.customer,
      payload.brand,
      payload.vendor,
      payload.ourRefNo,
      payload.deliveryDate,
      payload.deliverTo,
      payload.status,
      payload.generatedAt,
      payload.generatedBy,
      payload.purchaseGeneratedAt,
      payload.financeApprovedAt,
      payload.packingInfoGeneratedAt,
      payload.commercialInvoiceGeneratedAt,
      payload.paymentConfirmedAt,
      payload.pdfUrl,
      payload.orderQty,
      payload.deductedQty,
      payload.outstandingQty,
      payload.inStockQty,
      payload.stockOutQty,
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
  for (const line of payload.lines) {
    await upsertProductFromPILine(env, line as RecordLike);
  }
  return { ok: true, pi: payload };
}

export async function updatePI(env: Env, input: RecordLike) {
  const id = String(input.id ?? "");
  if (!id) return { ok: false, message: "Missing id" };
  const payload = {
    piNo: String(input.piNo ?? ""),
    plNo: String(input.plNo ?? input.pl_no ?? String(input.piNo ?? "").replace(/^PI/i, "PL")),
    customer: String(input.customer ?? ""),
    brand: String(input.brand ?? ""),
    vendor: String(input.vendor ?? ""),
    ourRefNo: String(input.ourRefNo ?? ""),
    deliveryDate: String(input.deliveryDate ?? ""),
    deliverTo: String(input.deliverTo ?? ""),
    status: String(input.status ?? "Draft"),
    generatedAt: String(input.generatedAt ?? new Date().toISOString()),
    generatedBy: String(input.generatedBy ?? "Jason"),
    purchaseGeneratedAt: String(input.purchaseGeneratedAt ?? ""),
    financeApprovedAt: String(input.financeApprovedAt ?? ""),
    packingInfoGeneratedAt: String(input.packingInfoGeneratedAt ?? ""),
    commercialInvoiceGeneratedAt: String(input.commercialInvoiceGeneratedAt ?? ""),
    paymentConfirmedAt: String(input.paymentConfirmedAt ?? ""),
    pdfUrl: String(input.pdfUrl ?? ""),
    orderQty: Number(input.orderQty ?? 0),
    deductedQty: Number(input.deductedQty ?? 0),
    outstandingQty: Number(input.outstandingQty ?? 0),
    inStockQty: Number(input.inStockQty ?? 0),
    stockOutQty: Number(input.stockOutQty ?? 0),
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
    "UPDATE pis SET pi_no = ?2, pl_no = ?3, customer = ?4, brand = ?5, vendor = ?6, our_ref_no = ?7, delivery_date = ?8, deliver_to = ?9, status = ?10, generated_at = ?11, generated_by = ?12, purchase_generated_at = ?13, finance_approved_at = ?14, packing_info_generated_at = ?15, commercial_invoice_generated_at = ?16, payment_confirmed_at = ?17, pdf_url = ?18, order_qty = ?19, deducted_qty = ?20, outstanding_qty = ?21, in_stock_qty = ?22, stock_out_qty = ?23, item_code = ?24, description = ?25, product_type = ?26, size = ?27, colors = ?28, finished = ?29, remarks = ?30, image_url = ?31, size_details_json = ?32, lines_json = ?33, notes = ?34 WHERE id = ?1",
  )
    .bind(
      id,
      payload.piNo,
      payload.plNo,
      payload.customer,
      payload.brand,
      payload.vendor,
      payload.ourRefNo,
      payload.deliveryDate,
      payload.deliverTo,
      payload.status,
      payload.generatedAt,
      payload.generatedBy,
      payload.purchaseGeneratedAt,
      payload.financeApprovedAt,
      payload.packingInfoGeneratedAt,
      payload.commercialInvoiceGeneratedAt,
      payload.paymentConfirmedAt,
      payload.pdfUrl,
      payload.orderQty,
      payload.deductedQty,
      payload.outstandingQty,
      payload.inStockQty,
      payload.stockOutQty,
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
  for (const line of payload.lines) {
    await upsertProductFromPILine(env, line as RecordLike);
  }
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
    poType: String(input.poType ?? input.po_type ?? "purchase"),
    poNo: String(input.poNo ?? input.po_no ?? id),
    plNo: String(input.plNo ?? input.pl_no ?? ""),
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
    // Craft-specific fields
    orderNo: String(input.orderNo ?? input.order_no ?? ""),
    maker: String(input.maker ?? ""),
    makeDate: String(input.makeDate ?? input.make_date ?? ""),
    styleNo: String(input.styleNo ?? input.style_no ?? ""),
    customerOrderNo: String(input.customerOrderNo ?? input.customer_order_no ?? ""),
    craftProductName: String(input.craftProductName ?? input.craft_product_name ?? ""),
    relatedOrderNo: String(input.relatedOrderNo ?? input.related_order_no ?? ""),
    sheetSize: String(input.sheetSize ?? input.sheet_size ?? ""),
    materialIn: String(input.materialIn ?? input.material_in ?? ""),
    upCount: String(input.upCount ?? input.up_count ?? ""),
    quantity: Number(input.quantity ?? 0),
    remainder: Number(input.remainder ?? 0),
    finishedQty: Number(input.finishedQty ?? input.finished_qty ?? 0),
    packCount: String(input.packCount ?? input.pack_count ?? ""),
    printMethod: Array.isArray(input.printMethod) ? input.printMethod : [],
    proofType: Array.isArray(input.proofType) ? input.proofType : [],
    postProcess: Array.isArray(input.postProcess) ? input.postProcess : [],
    craftNotes: String(input.craftNotes ?? input.craft_notes ?? ""),
  };
  if (!env.DB) return { ok: false, message: "D1 not configured", po: payload };
  await env.DB.prepare(
    "INSERT INTO purchase_orders (id, po_type, po_no, pl_no, source_pi_id, date, vendor, vendor_address, vendor_contact, vendor_email, vendor_tel, vendor_fax, customer, our_ref_no, delivery_date, deliver_to, status, item_code, description, product_type, size, colors, finished, remarks, lines_json, packing_rows_json, notes, image_url, order_no, maker, make_date, style_no, customer_order_no, craft_product_name, related_order_no, sheet_size, material_in, up_count, quantity, remainder, finished_qty, pack_count, print_method, proof_type, post_process, craft_notes) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21, ?22, ?23, ?24, ?25, ?26, ?27, ?28, ?29, ?30, ?31, ?32, ?33, ?34, ?35, ?36, ?37, ?38, ?39, ?40, ?41, ?42, ?43, ?44, ?45)",
  )
    .bind(
      payload.id,
      payload.poType,
      payload.poNo,
      payload.plNo,
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
      payload.orderNo,
      payload.maker,
      payload.makeDate,
      payload.styleNo,
      payload.customerOrderNo,
      payload.craftProductName,
      payload.relatedOrderNo,
      payload.sheetSize,
      payload.materialIn,
      payload.upCount,
      payload.quantity,
      payload.remainder,
      payload.finishedQty,
      payload.packCount,
      JSON.stringify(payload.printMethod),
      JSON.stringify(payload.proofType),
      JSON.stringify(payload.postProcess),
      payload.craftNotes,
    )
    .run();
  return { ok: true, po: payload };
}

export async function updatePO(env: Env, input: RecordLike) {
  const id = String(input.id ?? "");
  if (!id) return { ok: false, message: "Missing id" };
  const payload = {
    poType: String(input.poType ?? input.po_type ?? "purchase"),
    poNo: String(input.poNo ?? input.po_no ?? id),
    plNo: String(input.plNo ?? input.pl_no ?? ""),
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
    // Craft-specific fields
    orderNo: String(input.orderNo ?? input.order_no ?? ""),
    maker: String(input.maker ?? ""),
    makeDate: String(input.makeDate ?? input.make_date ?? ""),
    styleNo: String(input.styleNo ?? input.style_no ?? ""),
    customerOrderNo: String(input.customerOrderNo ?? input.customer_order_no ?? ""),
    craftProductName: String(input.craftProductName ?? input.craft_product_name ?? ""),
    relatedOrderNo: String(input.relatedOrderNo ?? input.related_order_no ?? ""),
    sheetSize: String(input.sheetSize ?? input.sheet_size ?? ""),
    materialIn: String(input.materialIn ?? input.material_in ?? ""),
    upCount: String(input.upCount ?? input.up_count ?? ""),
    quantity: Number(input.quantity ?? 0),
    remainder: Number(input.remainder ?? 0),
    finishedQty: Number(input.finishedQty ?? input.finished_qty ?? 0),
    packCount: String(input.packCount ?? input.pack_count ?? ""),
    printMethod: Array.isArray(input.printMethod) ? input.printMethod : [],
    proofType: Array.isArray(input.proofType) ? input.proofType : [],
    postProcess: Array.isArray(input.postProcess) ? input.postProcess : [],
    craftNotes: String(input.craftNotes ?? input.craft_notes ?? ""),
  };
  if (!env.DB) return { ok: false, message: "D1 not configured" };
  await env.DB.prepare(
    "UPDATE purchase_orders SET po_type = ?2, po_no = ?3, pl_no = ?4, source_pi_id = ?5, date = ?6, vendor = ?7, vendor_address = ?8, vendor_contact = ?9, vendor_email = ?10, vendor_tel = ?11, vendor_fax = ?12, customer = ?13, our_ref_no = ?14, delivery_date = ?15, deliver_to = ?16, status = ?17, item_code = ?18, description = ?19, product_type = ?20, size = ?21, colors = ?22, finished = ?23, remarks = ?24, lines_json = ?25, packing_rows_json = ?26, notes = ?27, image_url = ?28, order_no = ?29, maker = ?30, make_date = ?31, style_no = ?32, customer_order_no = ?33, craft_product_name = ?34, related_order_no = ?35, sheet_size = ?36, material_in = ?37, up_count = ?38, quantity = ?39, remainder = ?40, finished_qty = ?41, pack_count = ?42, print_method = ?43, proof_type = ?44, post_process = ?45, craft_notes = ?46 WHERE id = ?1",
  )
    .bind(
      id,
      payload.poType,
      payload.poNo,
      payload.plNo,
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
      payload.orderNo,
      payload.maker,
      payload.makeDate,
      payload.styleNo,
      payload.customerOrderNo,
      payload.craftProductName,
      payload.relatedOrderNo,
      payload.sheetSize,
      payload.materialIn,
      payload.upCount,
      payload.quantity,
      payload.remainder,
      payload.finishedQty,
      payload.packCount,
      JSON.stringify(payload.printMethod),
      JSON.stringify(payload.proofType),
      JSON.stringify(payload.postProcess),
      payload.craftNotes,
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
