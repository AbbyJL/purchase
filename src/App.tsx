import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  IconBell,
  IconBox,
  IconChartBar,
  IconChevronRight,
  IconChevronLeft,
  IconCopy,
  IconEdit,
  IconDownload,
  IconEye,
  IconFileInvoice,
  IconHome2,
  IconFlask,
  IconLanguage,
  IconLayoutDashboard,
  IconPlus,
  IconPhoto,
  IconPrinter,
  IconSearch,
  IconTag,
  IconSettings2,
  IconTruck,
  IconUsers,
  IconLock,
  IconLockOpen,
  IconReceipt2,
  IconX,
  IconTrash,
  IconUserCircle,
} from "@tabler/icons-react";
import {
  createContract as apiCreateContract,
  createBrand as apiCreateBrand,
  createCustomer as apiCreateCustomer,
  createDevelopment as apiCreateDevelopment,
  createOrder as apiCreateOrder,
  createPI as apiCreatePI,
  createPO as apiCreatePO,
  createProduct as apiCreateProduct,
  createQuote as apiCreateQuote,
  createSupplier as apiCreateSupplier,
  deleteBrand as apiDeleteBrand,
  getBrandDetail as apiGetBrandDetail,
  deleteCustomer as apiDeleteCustomer,
  deleteContract as apiDeleteContract,
  deleteDevelopment as apiDeleteDevelopment,
  deleteOrder as apiDeleteOrder,
  deletePI as apiDeletePI,
  deletePO as apiDeletePO,
  deleteProduct as apiDeleteProduct,
  deleteQuote as apiDeleteQuote,
  deleteSupplier as apiDeleteSupplier,
  loadAdminData,
  updateBrand as apiUpdateBrand,
  updateCustomer as apiUpdateCustomer,
  updateContract as apiUpdateContract,
  updateDevelopment as apiUpdateDevelopment,
  updateOrder as apiUpdateOrder,
  updatePI as apiUpdatePI,
  updatePO as apiUpdatePO,
  updateProduct as apiUpdateProduct,
  updateQuote as apiUpdateQuote,
  updateSupplier as apiUpdateSupplier,
} from "./api";
import {
  brands as fallbackBrands,
  contracts as fallbackContracts,
  customers as fallbackCustomers,
  dashboardStats as fallbackStats,
  developments as fallbackDevelopments,
  orders as fallbackOrders,
  pos as fallbackPOs,
  pis as fallbackPIs,
  products as fallbackProducts,
  quotes as fallbackQuotes,
  suppliers as fallbackSuppliers,
} from "./data";
import { translate } from "./i18n";
import type { Brand, Contract, Customer, DevelopmentLine, DevelopmentRecord, Locale, Order, PIRecord, PORecord, POType, PrintMethod, ProofType, PostProcess, Product, Quote, QuoteCostItem, QuoteLine, QuoteTier, Supplier, PILineItem } from "./types";

const navItems = [
  { to: "/dashboard", key: "nav.dashboard", icon: IconLayoutDashboard },
  { to: "/products", key: "nav.products", icon: IconBox },
  { to: "/brands", key: "nav.brands", icon: IconTag },
  { to: "/customers", key: "nav.customers", icon: IconUsers },
  { to: "/suppliers", key: "nav.suppliers", icon: IconTruck },
  { to: "/quotes", key: "nav.quotes", icon: IconReceipt2 },
  { to: "/development", key: "nav.development", icon: IconFlask },
  { to: "/pis", key: "nav.pis", icon: IconFileInvoice },
  { to: "/po", key: "nav.po", icon: IconReceipt2 },
  { to: "/commercial-invoices", key: "nav.commercialInvoices", icon: IconFileInvoice },
  { to: "/settings", key: "nav.settings", icon: IconSettings2 },
] as const;

type ProductDraft = {
  id?: string;
  name: string;
  suppliers: string[];
  categoryKey: Product["categoryKey"];
  price: string;
  stock: string;
  status: Product["status"];
  imageUrl: string;
  codePrefix: string;
  quoteProductCodes: string[];
};

type OrderDraft = {
  id?: string;
  customer: string;
  product: string;
  status: Order["status"];
  total: string;
  channel: string;
};

type ContractDraft = {
  id?: string;
  title: string;
  client: string;
  status: Contract["status"];
  amount: string;
  deadline: string;
};

type BrandDraft = {
  id?: string;
  name: string;
  code: string;
  customer: string;
  supplier: string;
  country: string;
  status: Brand["status"];
  owner: string;
  notes: string;
};

type CustomerDraft = {
  id?: string;
  name: string;
  code: string;
  country: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  status: Customer["status"];
  notes: string;
  imageUrl: string;
};

type SupplierDraft = {
  id?: string;
  name: string;
  code: string;
  country: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  status: Supplier["status"];
  notes: string;
};

type QuoteDraft = {
  id?: string;
  quoteNo: string;
  date: string;
  modificationDate: string;
  register: string;
  itemType: string;
  brand: string;
  linkman: string;
  salesperson: string;
  customer: string;
  productCode: string;
  productName: string;
  status: Quote["status"];
  item: string;
  imageUrl: string;
  notes: string;
};

type QuoteLineDraft = QuoteLine;

type DevelopmentLineDraft = DevelopmentLine;

type DevelopmentDraft = {
  id?: string;
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
  status: DevelopmentRecord["status"];
  sourceQuoteId: string;
  sourceQuoteNo: string;
  imageUrl: string;
  notes: string;
};

type QuoteSpecField = "type" | "size" | "color" | "finished";

type QuoteSpecDraft = {
  typeValue: string;
  sizeValue: string;
  colorValue: string;
  finishedValue: string;
  remarksValue: string;
};

type QuoteSpecOptions = Record<QuoteSpecField, string[]>;

type PISizeDraft = {
  id?: string;
  size: string;
  quantity: number;
};

type PIDraft = {
  id?: string;
  piNo: string;
  plNo: string;
  customer: string;
  brand: string;
  vendor: string;
  ourRefNo: string;
  deliveryDate: string;
  deliverTo: string;
  status: PIRecord["status"];
  generatedAt: string;
  generatedBy: string;
  purchaseGeneratedAt: string;
  financeApprovedAt: string;
  packingInfoGeneratedAt: string;
  commercialInvoiceGeneratedAt: string;
  paymentConfirmedAt: string;
  pdfUrl: string;
  orderQty: number;
  deductedQty: number;
  outstandingQty: number;
  inStockQty: number;
  stockOutQty: number;
  itemCode: string;
  description: string;
  productType: string;
  size: string;
  colors: string;
  finished: string;
  remarks: string;
  imageUrl: string;
  notes: string;
};

type PODraft = {
  id?: string;
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
  status: PORecord["status"];
  itemCode: string;
  description: string;
  productType: string;
  size: string;
  colors: string;
  finished: string;
  remarks: string;
  notes: string;
  imageUrl: string;
  // Craft-specific fields
  orderNo: string;
  maker: string;
  makeDate: string;
  styleNo: string;
  customerOrderNo: string;
  craftProductName: string;
  relatedOrderNo: string;
  sheetSize: string;
  materialIn: string;
  upCount: string;
  quantity: number;
  remainder: number;
  finishedQty: number;
  packCount: string;
  printMethod: PrintMethod[];
  proofType: ProofType[];
  postProcess: PostProcess[];
  craftNotes: string;
};

type ModalKind = "product" | "brand" | "customer" | "supplier" | "quote" | "development" | "pi" | "po" | "craft" | "order" | "contract";

const emptyDraft: ProductDraft = {
  name: "",
  suppliers: [""],
  categoryKey: "clothing",
  price: "",
  stock: "",
  status: "In stock",
  imageUrl: "",
  codePrefix: "",
  quoteProductCodes: [""],
};

const emptyOrderDraft: OrderDraft = {
  customer: "",
  product: "",
  status: "Pending",
  total: "",
  channel: "",
};

const emptyContractDraft: ContractDraft = {
  title: "",
  client: "",
  status: "Draft",
  amount: "",
  deadline: new Date().toISOString().slice(0, 10),
};

const emptyBrandDraft: BrandDraft = {
  name: "",
  code: "",
  customer: "",
  supplier: "",
  country: "US",
  status: "Active",
  owner: "",
  notes: "",
};

const emptyCustomerDraft: CustomerDraft = {
  name: "",
  code: "",
  country: "",
  contact: "",
  phone: "",
  email: "",
  address: "",
  status: "Active",
  notes: "",
  imageUrl: "",
};

const emptySupplierDraft: SupplierDraft = {
  name: "",
  code: "",
  country: "",
  contact: "",
  phone: "",
  email: "",
  address: "",
  status: "Active",
  notes: "",
};

const emptyQuoteDraft: QuoteDraft = {
  quoteNo: "",
  date: new Date().toISOString().slice(0, 10),
  modificationDate: new Date().toISOString().slice(0, 10),
  register: "",
  itemType: "",
  brand: "",
  linkman: "",
  salesperson: "",
  customer: "",
  productCode: "",
  productName: "",
  status: "Draft",
  item: "",
  imageUrl: "",
  notes: "",
};

const emptyDevelopmentDraft: DevelopmentDraft = {
  developmentNo: "",
  date: new Date().toISOString().slice(0, 10),
  modificationDate: new Date().toISOString().slice(0, 10),
  register: "",
  itemType: "",
  brand: "",
  linkman: "",
  salesperson: "",
  customer: "",
  item: "",
  productCode: "",
  productName: "",
  status: "Draft",
  sourceQuoteId: "",
  sourceQuoteNo: "",
  imageUrl: "",
  notes: "",
};

const quoteSheetTemplate: {
  draft: QuoteDraft;
  lines: QuoteLineDraft[];
  tiers: QuoteTier[];
} = {
  draft: {
    quoteNo: "2606009",
    date: "2026-06-03",
    modificationDate: "2026-06-03",
    register: "朱佳毅",
    itemType: "STONEY CLOVER LANE 感恩卡、信封和贴纸",
    brand: "STONEY CLOVER LANE",
    linkman: "Anly",
    salesperson: "Jason",
    customer: "GMS",
    productCode: "SCL-001",
    productName: "感恩卡 / 信封 / 贴纸",
    status: "Draft",
    item: "感恩卡 / 信封 / 贴纸",
    imageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80",
    notes: "按订单量自动匹配档位",
  } satisfies QuoteDraft,
  lines: [
    createQuoteLine({
      checked: true,
      imageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80",
      productCode: "SCL-TK-001",
      productName: "300克书纸 感恩卡",
      description:
        "TYPE: 300克书纸（参考 APPA-T04）\nSIZE: 6.25\" x 9\" Folded 6.25\" x 4.25\"\nCOLOR: PMS 11-0104 TCX, PMS 18-5622 TCX, PMS 555C\nFINISHED: 啤形，压折位线对折\nREMARKS: 参考原版结构",
      pricingNotes: "1M:900/M\n2.5M:720/M\n5M:690/M",
      cost: "900/M",
    }),
    createQuoteLine({
      checked: true,
      imageUrl: "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?auto=format&fit=crop&w=800&q=80",
      productCode: "SCL-ENV-001",
      productName: "信封",
      description:
        "TYPE: 180克书纸信封\nSIZE: 6.5\" x 4.75\" + 3\" Flap\nCOLOR: 双面印 PMS 7621C，双面过哑油\nFINISHED: 啤形，做成信封袋，开口处粘2条双面胶\nREMARKS: 包含贴纸加工",
      pricingNotes: "1M:1350/M\n2.5M:1150/M\n5M:1100/M",
      cost: "1350/M",
    }),
    createQuoteLine({
      checked: false,
      imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
      productCode: "SCL-STK-001",
      productName: "贴纸",
      description:
        "TYPE: 300克书纸贴纸\nSIZE: 6.25\" x 9\" 适配折页\nCOLOR: CMYK + PMS 11-0104 TCX\nFINISHED: 四周圆角，局部镂空\nREMARKS: 可按批版调整",
      pricingNotes: "1M:900/M\n2.5M:720/M\n5M:690/M",
      cost: "900/M",
    }),
  ],
  tiers: [
    { id: createLineItemId(), quantity: "1M", unitPrice: 0.52 },
    { id: createLineItemId(), quantity: "2.5M", unitPrice: 0.41 },
    { id: createLineItemId(), quantity: "5M", unitPrice: 0.33 },
  ] satisfies QuoteTier[],
};

const emptyQuoteLineDraft: QuoteLineDraft = {
  checked: true,
  imageUrl: "",
  productCode: "",
  productName: "",
  suppliers: [""],
  price: 0,
  sample: 0,
  description: "",
  typeValue: "",
  sizeValue: "",
  colorValue: "",
  finishedValue: "",
  remarksValue: "",
  pricingNotes: "",
  cost: "",
  costItems: createQuoteCostItems(),
};

const emptyQuoteSpecDraft: QuoteSpecDraft = {
  typeValue: "",
  sizeValue: "",
  colorValue: "",
  finishedValue: "",
  remarksValue: "",
};

const quoteSpecFieldLabels: Record<QuoteSpecField, string> = {
  type: "TYPE",
  size: "SIZE",
  color: "COLOR",
  finished: "FINISHED",
};

const quoteSpecValueKeys: Record<QuoteSpecField, keyof QuoteSpecDraft> = {
  type: "typeValue",
  size: "sizeValue",
  color: "colorValue",
  finished: "finishedValue",
};

const quoteSpecStorageKey = "management.quoteSpecOptions";
const quoteAccessStorageKey = "management.quoteAccessGranted";

function loadQuoteAccessGranted() {
  if (typeof window === "undefined") {
    return true;
  }

  const stored = window.localStorage.getItem(quoteAccessStorageKey);
  if (stored === null) return true;
  return stored === "true";
}

const emptyPIDraft: PIDraft = {
  piNo: "",
  plNo: "",
  customer: "",
  brand: "",
  vendor: "",
  ourRefNo: "",
  deliveryDate: "",
  deliverTo: "",
  status: "Draft",
  generatedAt: new Date().toISOString(),
  generatedBy: "Jason",
  purchaseGeneratedAt: "",
  financeApprovedAt: "",
  packingInfoGeneratedAt: "",
  commercialInvoiceGeneratedAt: "",
  paymentConfirmedAt: "",
  pdfUrl: "",
  orderQty: 0,
  deductedQty: 0,
  outstandingQty: 0,
  inStockQty: 0,
  stockOutQty: 0,
  itemCode: "",
  description: "",
  productType: "",
  size: "",
  colors: "",
  finished: "",
  remarks: "",
  imageUrl: "",
  notes: "",
};

const emptyPODraft: PODraft = {
  poType: "purchase",
  poNo: "",
  plNo: "",
  sourcePiId: "",
  date: new Date().toISOString().slice(0, 10),
  vendor: "",
  vendorAddress: "",
  vendorContact: "",
  vendorEmail: "",
  vendorTel: "",
  vendorFax: "",
  customer: "",
  ourRefNo: "",
  deliveryDate: "",
  deliverTo: "",
  status: "Draft",
  itemCode: "",
  description: "",
  productType: "",
  size: "",
  colors: "",
  finished: "",
  remarks: "",
  notes: "",
  imageUrl: "",
  // Craft defaults (empty for purchase type)
  orderNo: "",
  maker: "",
  makeDate: "",
  styleNo: "",
  customerOrderNo: "",
  craftProductName: "",
  relatedOrderNo: "",
  sheetSize: "",
  materialIn: "",
  upCount: "",
  quantity: 0,
  remainder: 0,
  finishedQty: 0,
  packCount: "",
  printMethod: [],
  proofType: [],
  postProcess: [],
  craftNotes: "",
};

const emptyCraftDraft: PODraft = {
  ...emptyPODraft,
  poType: "craft",
  poNo: "",
  plNo: "",
  sourcePiId: "",
  date: new Date().toISOString().slice(0, 10),
  vendor: "嘉兴市壹佳印刷有限公司",
  customer: "",
  status: "Draft",
  // Craft defaults
  orderNo: `CRFT${Date.now().toString().slice(-9)}`,
  maker: "",
  makeDate: new Date().toISOString().slice(0, 10),
  styleNo: "",
  customerOrderNo: "",
  craftProductName: "",
  relatedOrderNo: "",
  sheetSize: "",
  materialIn: "",
  upCount: "",
  quantity: 0,
  remainder: 0,
  finishedQty: 0,
  packCount: "",
  printMethod: [],
  proofType: [],
  postProcess: [],
  craftNotes: "",
};

function createRowId(prefix: string) {
  return `${prefix}${Date.now().toString().slice(-6)}`;
}

function createLineItemId() {
  return `line-${Math.random().toString(36).slice(2, 8)}`;
}

function createQuoteCostItems(): QuoteCostItem[] {
  return [
    { id: createLineItemId(), label: "纸", amount: 0.18 },
    { id: createLineItemId(), label: "印刷", amount: 0.12 },
    { id: createLineItemId(), label: "哑油", amount: 0.04 },
    { id: createLineItemId(), label: "工艺", amount: 0.07 },
  ];
}

function normalizeQuoteSuppliers(value?: string[] | null) {
  const suppliers = (value ?? []).map((item) => String(item ?? "").trim());
  return suppliers.length > 0 ? suppliers : [""];
}

function parseQuoteLineDescription(description: string): QuoteSpecDraft {
  const parsed: QuoteSpecDraft = {
    typeValue: "",
    sizeValue: "",
    colorValue: "",
    finishedValue: "",
    remarksValue: "",
  };
  description
    .split(/\r?\n/)
    .map((line) => line.trim())
    .forEach((line) => {
      const match = line.match(/^(TYPE|SIZE|COLOR|FINISHED|REMARKS):\s*(.*)$/i);
      if (!match) return;
      const key = match[1].toLowerCase();
      const value = match[2]?.trim() ?? "";
      if (key === "type") parsed.typeValue = value;
      if (key === "size") parsed.sizeValue = value;
      if (key === "color") parsed.colorValue = value;
      if (key === "finished") parsed.finishedValue = value;
      if (key === "remarks") parsed.remarksValue = value;
    });
  return parsed;
}

function buildQuoteLineDescription(line: Partial<QuoteSpecDraft>) {
  return (
    [
      ["TYPE", line.typeValue],
      ["SIZE", line.sizeValue],
      ["COLOR", line.colorValue],
      ["FINISHED", line.finishedValue],
      ["REMARKS", line.remarksValue],
    ]
      .map(([label, value]) => `${label}: ${String(value ?? "").trim()}`)
      .filter((item) => !item.endsWith(": "))
      .join("\n") || ""
  );
}

function createQuoteSpecOptions(lines: QuoteLine[] = []): QuoteSpecOptions {
  const options: QuoteSpecOptions = {
    type: [],
    size: [],
    color: [],
    finished: [],
  };

  for (const line of lines) {
    const parsed = parseQuoteLineDescription(line.description);
    const values: Record<QuoteSpecField, string> = {
      type: line.typeValue ?? parsed.typeValue,
      size: line.sizeValue ?? parsed.sizeValue,
      color: line.colorValue ?? parsed.colorValue,
      finished: line.finishedValue ?? parsed.finishedValue,
    };

    (Object.keys(values) as QuoteSpecField[]).forEach((field) => {
      const value = values[field].trim();
      if (value && !options[field].includes(value)) {
        options[field].push(value);
      }
    });
  }

  return options;
}

function mergeQuoteSpecOptions(base: QuoteSpecOptions, next?: Partial<QuoteSpecOptions> | null) {
  const merged: QuoteSpecOptions = {
    type: [...base.type],
    size: [...base.size],
    color: [...base.color],
    finished: [...base.finished],
  };

  if (!next) return merged;

  (Object.keys(merged) as QuoteSpecField[]).forEach((field) => {
    const additions = next[field] ?? [];
    additions.forEach((item) => {
      const value = String(item ?? "").trim();
      if (value && !merged[field].includes(value)) {
        merged[field].push(value);
      }
    });
  });

  return merged;
}

function loadQuoteSpecOptions() {
  const defaults = createQuoteSpecOptions([
    ...fallbackQuotes.flatMap((quote) => quote.lines),
    ...quoteSheetTemplate.lines,
  ]);

  if (typeof window === "undefined") {
    return defaults;
  }

  const stored = window.localStorage.getItem(quoteSpecStorageKey);
  if (!stored) return defaults;

  try {
    const parsed = JSON.parse(stored) as Partial<QuoteSpecOptions>;
    return mergeQuoteSpecOptions(defaults, parsed);
  } catch {
    return defaults;
  }
}

function normalizeQuoteLineDraft(line: QuoteLine, fallbackCostItems: QuoteCostItem[] = createQuoteCostItems()) {
  const parsed = parseQuoteLineDescription(line.description);
  const spec: QuoteSpecDraft = {
    typeValue: line.typeValue ?? parsed.typeValue,
    sizeValue: line.sizeValue ?? parsed.sizeValue,
    colorValue: line.colorValue ?? parsed.colorValue,
    finishedValue: line.finishedValue ?? parsed.finishedValue,
    remarksValue: line.remarksValue ?? parsed.remarksValue,
  };
  const costItems = (line.costItems?.length ? line.costItems : fallbackCostItems).map((costItem) => ({
    ...costItem,
    id: costItem.id ?? createLineItemId(),
  }));

  return {
    ...line,
    id: line.id ?? createLineItemId(),
    ...spec,
    suppliers: normalizeQuoteSuppliers(line.suppliers),
    costItems,
    description: buildQuoteLineDescription(spec),
  };
}

function createQuoteLine(overrides: Partial<QuoteLineDraft> = {}): QuoteLineDraft {
  const parsed = parseQuoteLineDescription(overrides.description ?? "");
  const spec: QuoteSpecDraft = {
    typeValue: overrides.typeValue ?? parsed.typeValue,
    sizeValue: overrides.sizeValue ?? parsed.sizeValue,
    colorValue: overrides.colorValue ?? parsed.colorValue,
    finishedValue: overrides.finishedValue ?? parsed.finishedValue,
    remarksValue: overrides.remarksValue ?? parsed.remarksValue,
  };
  const baseLine = {
    checked: true,
    imageUrl: "",
    productCode: "",
    productName: "",
    suppliers: [""],
    price: 0,
    sample: 0,
    description: "",
    pricingNotes: "",
    cost: "",
    ...overrides,
    ...spec,
    id: overrides.id ?? createLineItemId(),
    costItems: overrides.costItems?.length ? overrides.costItems : createQuoteCostItems(),
  } as QuoteLineDraft;

  return normalizeQuoteLineDraft(
    {
      ...baseLine,
      description: buildQuoteLineDescription(spec),
    },
    baseLine.costItems,
  );
}

function updateQuoteLineSpec(line: QuoteLineDraft, field: QuoteSpecField, value: string) {
  const key = quoteSpecValueKeys[field];
  const next = {
    ...line,
    [key]: value,
  } as QuoteLineDraft;
  return {
    ...next,
    description: buildQuoteLineDescription(next),
  };
}

function createQuoteSheetTemplate() {
  return {
    draft: { ...quoteSheetTemplate.draft },
    lines: quoteSheetTemplate.lines.map((line) =>
      createQuoteLine({
        ...line,
        id: createLineItemId(),
        costItems: line.costItems.map((costItem) => ({ ...costItem, id: createLineItemId() })),
      }),
    ),
    tiers: quoteSheetTemplate.tiers.map((item) => ({ ...item, id: createLineItemId() })),
  };
}

function normalizeDevelopmentLineDraft(line: DevelopmentLine, fallbackId?: string): DevelopmentLineDraft {
  const parsed = parseQuoteLineDescription(line.description);
  const spec: QuoteSpecDraft = {
    typeValue: line.typeValue ?? parsed.typeValue,
    sizeValue: line.sizeValue ?? parsed.sizeValue,
    colorValue: line.colorValue ?? parsed.colorValue,
    finishedValue: line.finishedValue ?? parsed.finishedValue,
    remarksValue: line.remarksValue ?? parsed.remarksValue,
  };

  return {
    ...line,
    id: line.id ?? fallbackId ?? createLineItemId(),
    description: buildQuoteLineDescription(spec),
    typeValue: spec.typeValue,
    sizeValue: spec.sizeValue,
    colorValue: spec.colorValue,
    finishedValue: spec.finishedValue,
    remarksValue: spec.remarksValue,
    checked: Boolean(line.checked),
    imageUrl: line.imageUrl ?? "",
    productCode: line.productCode ?? "",
    productName: line.productName ?? "",
  };
}

function createDevelopmentLine(overrides: Partial<DevelopmentLineDraft> = {}): DevelopmentLineDraft {
  const parsed = parseQuoteLineDescription(overrides.description ?? "");
  const spec: QuoteSpecDraft = {
    typeValue: overrides.typeValue ?? parsed.typeValue,
    sizeValue: overrides.sizeValue ?? parsed.sizeValue,
    colorValue: overrides.colorValue ?? parsed.colorValue,
    finishedValue: overrides.finishedValue ?? parsed.finishedValue,
    remarksValue: overrides.remarksValue ?? parsed.remarksValue,
  };

  return normalizeDevelopmentLineDraft(
    {
      checked: true,
      imageUrl: "",
      productCode: "",
      productName: "",
      description: buildQuoteLineDescription(spec),
      typeValue: spec.typeValue,
      sizeValue: spec.sizeValue,
      colorValue: spec.colorValue,
      finishedValue: spec.finishedValue,
      remarksValue: spec.remarksValue,
      specLocked: false,
      ...overrides,
      id: overrides.id ?? createLineItemId(),
    },
    overrides.id,
  );
}

function getProductLabel(product: Product) {
  return [product.id, product.codePrefix, product.quoteProductCodes?.[0], product.name, product.suppliers.join(" / ")].filter(Boolean).join(" · ");
}

function normalizeProductSuppliers(value: unknown) {
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

function getProductSupplierLabel(product: Product) {
  return product.suppliers.length > 0 ? product.suppliers.join(" / ") : "-";
}

function mergeProductSuppliers(existing: string[], additions: string[]) {
  return Array.from(new Set([...existing, ...additions.map((item) => item.trim()).filter(Boolean)]));
}

function normalizeCodeValue(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

function normalizeProductCodePrefix(value: string) {
  const normalized = normalizeCodeValue(value);
  if (!normalized) return "";
  const parts = normalized.split("-");
  return parts[0] || normalized;
}

function normalizeProductCodeList(value: unknown) {
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

function getProductCodeCatalog(product: Product) {
  const quoteProductCodes = product.quoteProductCodes ?? [];
  return [
    ...quoteProductCodes.map((code) => ({
      code: String(code ?? "").trim(),
      normalizedCode: normalizeCodeValue(String(code ?? "")),
      product,
      priority: 0,
    })),
    product.codePrefix
      ? {
          code: String(product.codePrefix).trim(),
          normalizedCode: normalizeCodeValue(String(product.codePrefix)),
          product,
          priority: 1,
        }
      : null,
    product.id
      ? {
          code: String(product.id).trim(),
          normalizedCode: normalizeCodeValue(String(product.id)),
          product,
          priority: 2,
        }
      : null,
  ].filter((item): item is { code: string; normalizedCode: string; product: Product; priority: number } => Boolean(item));
}

function createProductCodeCatalog(products: Product[]) {
  return products.flatMap((product) => getProductCodeCatalog(product));
}

function findProductMatchByCode(products: Product[], input: string) {
  const needle = normalizeCodeValue(input);
  if (!needle) return null;

  const catalog = createProductCodeCatalog(products);
  const exactMatches = catalog.filter((item) => item.normalizedCode === needle);
  if (exactMatches.length) {
    const preferredExact = exactMatches.sort((a, b) => a.priority - b.priority || a.code.length - b.code.length)[0] ?? null;
    if (preferredExact?.priority === 0) {
      return preferredExact;
    }
    const prefixExactMatches = catalog.filter((item) => item.priority === 0 && item.normalizedCode.startsWith(needle));
    if (prefixExactMatches.length) {
      return prefixExactMatches.sort((a, b) => a.code.length - b.code.length)[0] ?? preferredExact;
    }
    return preferredExact;
  }

  const prefixMatches = catalog.filter((item) => item.normalizedCode.startsWith(needle));
  if (!prefixMatches.length) return null;

  const groupedByProduct = new Map<string, typeof prefixMatches>();
  for (const match of prefixMatches) {
    const group = groupedByProduct.get(match.product.id) ?? [];
    group.push(match);
    groupedByProduct.set(match.product.id, group);
  }

  if (groupedByProduct.size === 1) {
    const [matches] = groupedByProduct.values();
    return matches.sort((a, b) => a.priority - b.priority || a.code.length - b.code.length)[0] ?? null;
  }

  return null;
}

function getBestProductCode(product: Product) {
  const quoteProductCodes = product.quoteProductCodes ?? [];
  return quoteProductCodes[0] || product.codePrefix || product.id;
}

function getQuoteProductCodeOptions(products: Product[]) {
  const options: string[] = Array.from(new Set(products.flatMap((product) => getProductCodeCatalog(product).map((item) => item.code))));
  return options.sort((a, b) => a.localeCompare(b));
}

function syncProductsFromPILines(products: Product[], lines: PILineItem[]) {
  const next = [...products];

  for (const line of lines) {
    const productCode = line.productCode.trim();
    const productName = line.productName.trim();
    const supplier = (line.supplier ?? "").trim();
    if (!productCode && !productName) continue;
    const inferredPrefix = normalizeProductCodePrefix(productCode);

    const existingIndex = next.findIndex((item) => item.id === productCode || item.name === productName);
    if (existingIndex >= 0) {
      const suppliers = mergeProductSuppliers(next[existingIndex].suppliers, supplier ? [supplier] : []);
      const quoteProductCodes = mergeProductSuppliers(next[existingIndex].quoteProductCodes ?? [], productCode ? [productCode] : []);
      next[existingIndex] = {
        ...next[existingIndex],
        id: productCode || next[existingIndex].id,
        name: productName || next[existingIndex].name,
        suppliers,
        price: Number.isFinite(Number(line.unitPrice)) ? Number(line.unitPrice) : next[existingIndex].price,
        codePrefix: next[existingIndex].codePrefix || inferredPrefix,
        quoteProductCodes,
      };
      continue;
    }

    next.unshift({
      id: productCode || createRowId("SPU"),
      name: productName || productCode,
      suppliers: supplier ? [supplier] : [],
      categoryKey: "accessory",
      price: Number(line.unitPrice || 0),
      stock: 0,
      status: "In stock",
      imageUrl: "",
      codePrefix: inferredPrefix,
      quoteProductCodes: productCode ? [productCode] : [],
    });
  }

  return next;
}

function renderProductThumb(product: Product, alt: string) {
  return product.imageUrl ? (
    <img src={product.imageUrl} alt={alt} className="product-thumb" />
  ) : (
    <span className="product-thumb placeholder">
      <IconPhoto size={16} strokeWidth={2} />
    </span>
  );
}

function parseQuantityValue(value: string) {
  const trimmed = value.trim().toUpperCase();
  if (!trimmed) return 0;
  const parsed = Number.parseFloat(trimmed);
  if (Number.isNaN(parsed)) return 0;
  if (trimmed.endsWith("M")) return parsed * 1_000;
  if (trimmed.endsWith("K")) return parsed * 1_000;
  return parsed;
}

function formatQuantityLabel(quantity: string) {
  return quantity.trim().toUpperCase();
}

const quoteCostItemOptions = ["纸", "印刷", "哑油", "工艺"] as const;

function sumItems(items: Array<{ amount: number }>) {
  return items.reduce((total, item) => total + Number(item.amount || 0), 0);
}

function calculateQuoteTier(tiers: QuoteTier[], quantityPreview: string) {
  const target = parseQuantityValue(quantityPreview);
  const sorted = [...tiers].sort((a, b) => parseQuantityValue(a.quantity) - parseQuantityValue(b.quantity));
  if (!sorted.length) return null;
  if (!target) return sorted[0];
  return sorted.find((tier) => parseQuantityValue(tier.quantity) >= target) ?? sorted[sorted.length - 1];
}

function getQuoteCostTotal(costItems: QuoteCostItem[]) {
  return sumItems(costItems);
}

function getQuoteUnitPrice(quote: { tiers: QuoteTier[]; costItems: QuoteCostItem[] }, quantityPreview: string) {
  const tier = calculateQuoteTier(quote.tiers, quantityPreview);
  if (tier) return tier.unitPrice;
  return getQuoteCostTotal(quote.costItems);
}

function summarizeQuoteLine(line?: QuoteLine) {
  if (!line) return "-";
  const parts = [line.productCode, line.productName].filter(Boolean);
  return parts.join(" · ") || "-";
}

function stringifyLines(lines: PILineItem[]) {
  return lines.map((line) => `${line.productCode} × ${line.quantity}`).join(" / ");
}

function stringifySizeDetails(details: PISizeDraft[]) {
  return details.map((line) => `${line.size}:${line.quantity}`).join("  ");
}

function formatMoney(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "zh-CN" ? "zh-CN" : "en-US", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

type PurchaseOrderVendor = {
  name: string;
  address: string;
  contact: string;
  email: string;
  tel: string;
  fax: string;
};

function formatPoMoney(value: number) {
  return `¥${value.toFixed(2)}`;
}

function formatPoQuantity(value: number) {
  if (Number.isNaN(value)) return "-";
  return `${value.toFixed(3)} M`;
}

function formatPiQuantity(value: number) {
  if (Number.isNaN(value)) return "-";
  if (Number.isInteger(value)) return String(value);
  return value
    .toFixed(3)
    .replace(/0+$/, "")
    .replace(/\.$/, "");
}

function formatPiMoney(value: number) {
  return `US$ ${value.toFixed(2)}`;
}

function formatTimestamp(value: string, locale: Locale) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

type PITimelineStage = {
  key: string;
  labelKey: string;
  time: string;
};

function getPITimeline(pi?: PIRecord | null): PITimelineStage[] {
  if (!pi) return [];

  return [
    { key: "opened", labelKey: "pi.timeline.opened", time: pi.generatedAt },
    { key: "purchase", labelKey: "pi.timeline.purchase", time: pi.purchaseGeneratedAt },
    { key: "finance", labelKey: "pi.timeline.finance", time: pi.financeApprovedAt },
    { key: "packing", labelKey: "pi.timeline.packing", time: pi.packingInfoGeneratedAt },
    { key: "commercial", labelKey: "pi.timeline.commercial", time: pi.commercialInvoiceGeneratedAt },
    { key: "payment", labelKey: "pi.timeline.payment", time: pi.paymentConfirmedAt },
  ];
}

function touchTimelineValue(current: string, fallback: string) {
  return current || fallback;
}

function updatePITimeline(pi: PIRecord, updates: Partial<Record<"generatedAt" | "purchaseGeneratedAt" | "financeApprovedAt" | "packingInfoGeneratedAt" | "commercialInvoiceGeneratedAt" | "paymentConfirmedAt", string>>): PIRecord {
  return {
    ...pi,
    ...updates,
  };
}

type PartyDetails = {
  name: string;
  address: string;
  contact: string;
  phone: string;
  email: string;
};

const commercialCompany = {
  name: "SHANGHAI NOVA ECO TECH LTD",
  address: "NO.288, HAITANG ROAD, BAIBU TOWN, HAIYAN COUNTY, JIAXING CITY, ZHEJIANG PROVINCE CHINA.",
  phone: "(0573) 8677 7015",
  fax: "(0573) 8678 8092",
};

function getPurchaseOrderVendor(po?: PORecord | null): PurchaseOrderVendor {
  if (!po) {
    return {
      name: "",
      address: "",
      contact: "",
      email: "",
      tel: "",
      fax: "",
    };
  }

  if (po.id === "PO001" || po.poNo === "PO2603428") {
    return {
      name: "浙江嘉兴市壹佳印刷有限公司",
      address: "浙江嘉兴市海盐县百步经济开发区百步大道东海棠路288号\n中国",
      contact: "Jason(江先生)",
      email: "Jason@ye-prt.com",
      tel: "0573-86788092",
      fax: "0573-86788092",
    };
  }

  return {
    name: po.vendor || "",
    address: po.vendorAddress || "",
    contact: po.vendorContact || "",
    email: po.vendorEmail || "",
    tel: po.vendorTel || "",
    fax: po.vendorFax || "",
  };
}

function getPartyDetails<T extends { name: string; address: string; contact: string; phone: string; email: string }>(
  party?: T | null,
): PartyDetails {
  return {
    name: party?.name || "",
    address: party?.address || "",
    contact: party?.contact || "",
    phone: party?.phone || "",
    email: party?.email || "",
  };
}

function PITimelinePanel({
  locale,
  t,
  pi,
  className,
}: {
  locale: Locale;
  t: (key: string) => string;
  pi?: PIRecord | null;
  className?: string;
}) {
  const timeline = getPITimeline(pi);

  return (
    <section className={className ? `pi-timeline-panel ${className}` : "pi-timeline-panel"}>
      <div className="editable-head">
        <div>
          <strong>{t("pi.timelineTitle")}</strong>
          <p>{t("pi.timelineSubtitle")}</p>
        </div>
        <span className={`status-pill status-${(pi?.status ?? "Draft").toLowerCase()}`}>{pi ? t(`status.${pi.status}`) : t("status.Draft")}</span>
      </div>
      <div className="pi-timeline-list">
        {timeline.map((stage, index) => {
          const hasTime = Boolean(stage.time);
          return (
            <div className={hasTime ? "pi-timeline-item active" : "pi-timeline-item"} key={stage.key}>
              <div className="pi-timeline-marker">
                <span>{index + 1}</span>
              </div>
              <div className="pi-timeline-content">
                <strong>{t(stage.labelKey)}</strong>
                <p>{hasTime ? formatTimestamp(stage.time, locale) : t("pi.timelinePending")}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function App() {
  const [locale, setLocale] = useState<Locale>("zh-CN");
  const [statCards, setStatCards] = useState(fallbackStats);
  const [products, setProducts] = useState(fallbackProducts);
  const [brands, setBrands] = useState(fallbackBrands);
  const [customers, setCustomers] = useState(fallbackCustomers);
  const [suppliers, setSuppliers] = useState(fallbackSuppliers);
  const [quotes, setQuotes] = useState(fallbackQuotes);
  const [developments, setDevelopments] = useState(fallbackDevelopments);
  const [pis, setPIs] = useState(fallbackPIs);
  const [pos, setPOs] = useState<PORecord[]>(fallbackPOs);
  const [orders, setOrders] = useState(fallbackOrders);
  const [contracts, setContracts] = useState(fallbackContracts);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ModalKind | null>(null);
  const [productDraft, setProductDraft] = useState<ProductDraft>(emptyDraft);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [brandDraft, setBrandDraft] = useState<BrandDraft>(emptyBrandDraft);
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [customerDraft, setCustomerDraft] = useState<CustomerDraft>(emptyCustomerDraft);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [supplierDraft, setSupplierDraft] = useState<SupplierDraft>(emptySupplierDraft);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  const [quoteDraft, setQuoteDraft] = useState<QuoteDraft>(emptyQuoteDraft);
  const [quoteLines, setQuoteLines] = useState<QuoteLineDraft[]>([]);
  const [quoteTiers, setQuoteTiers] = useState<QuoteTier[]>([]);
  const [quotePreviewQty, setQuotePreviewQty] = useState("1M");
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [pendingQuoteSupplierFocus, setPendingQuoteSupplierFocus] = useState<{ rowIndex: number; supplierIndex: number } | null>(null);
  const [developmentDraft, setDevelopmentDraft] = useState<DevelopmentDraft>(emptyDevelopmentDraft);
  const [developmentLines, setDevelopmentLines] = useState<DevelopmentLineDraft[]>([]);
  const [editingDevelopmentId, setEditingDevelopmentId] = useState<string | null>(null);
  const [quoteSpecOptions, setQuoteSpecOptions] = useState<QuoteSpecOptions>(() => loadQuoteSpecOptions());
  const [quoteSpecNewValues, setQuoteSpecNewValues] = useState<Record<QuoteSpecField, string>>({
    type: "",
    size: "",
    color: "",
    finished: "",
  });
  const [quoteAccessGranted, setQuoteAccessGranted] = useState<boolean>(() => loadQuoteAccessGranted());
  const [piDraft, setPIDraft] = useState<PIDraft>(emptyPIDraft);
  const [piLines, setPILines] = useState<PILineItem[]>([]);
  const [piSizeDetails, setPISizeDetails] = useState<PISizeDraft[]>([]);
  const [editingPIId, setEditingPIId] = useState<string | null>(null);
  const [poDraft, setPODraft] = useState<PODraft>(emptyPODraft);
  const [editingPoId, setEditingPoId] = useState<string | null>(null);
  const [craftDraft, setCraftDraft] = useState<PODraft>(emptyCraftDraft);
  const [editingCraftId, setEditingCraftId] = useState<string | null>(null);
  const [orderDraft, setOrderDraft] = useState<OrderDraft>(emptyOrderDraft);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [contractDraft, setContractDraft] = useState<ContractDraft>(emptyContractDraft);
  const [editingContractId, setEditingContractId] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const t = (key: string) => translate(locale, key);

  const currentPage = useMemo(() => {
    if (location.pathname.startsWith("/pis/preview")) return "pi-preview";
    if (location.pathname.startsWith("/pis/print")) return "pi-print";
    if (location.pathname.startsWith("/products")) return "products";
    if (location.pathname.startsWith("/brands")) return "brands";
    if (location.pathname.startsWith("/customers")) return "customers";
    if (location.pathname.startsWith("/suppliers")) return "suppliers";
    if (location.pathname.startsWith("/quotes")) return "quotes";
    if (location.pathname.startsWith("/development")) return "development";
    if (location.pathname.startsWith("/pis")) return "pis";
    if (location.pathname.startsWith("/po/")) return "po-detail";
    if (location.pathname.startsWith("/po")) return "po";
    if (location.pathname.startsWith("/commercial-invoices")) return "commercial-invoices";
    if (location.pathname.startsWith("/orders")) return "orders";
    if (location.pathname.startsWith("/contracts")) return "contracts";
    if (location.pathname.startsWith("/settings")) return "settings";
    return "dashboard";
  }, [location.pathname]);

  useEffect(() => {
    try {
      window.localStorage.setItem(quoteSpecStorageKey, JSON.stringify(quoteSpecOptions));
    } catch {
      // Ignore storage failures and keep the editor usable.
    }
  }, [quoteSpecOptions]);

  useEffect(() => {
    try {
      window.localStorage.setItem(quoteAccessStorageKey, String(quoteAccessGranted));
    } catch {
      // Ignore storage failures and keep the editor usable.
    }
  }, [quoteAccessGranted]);

  function setQuoteLineSpecValue(rowIndex: number, field: QuoteSpecField, value: string) {
    setQuoteLines((current) => current.map((row, index) => (index === rowIndex ? updateQuoteLineSpec(row, field, value) : row)));
  }

  function setQuoteLineSupplierValue(rowIndex: number, supplierIndex: number, value: string) {
    setQuoteLines((current) =>
      current.map((row, index) =>
        index === rowIndex
          ? {
              ...row,
              suppliers: normalizeQuoteSuppliers(row.suppliers).map((supplier, currentIndex) => (currentIndex === supplierIndex ? value : supplier)),
            }
          : row,
      ),
    );
  }

  function addQuoteLineSupplier(rowIndex: number) {
    let nextSupplierIndex = 0;
    setQuoteLines((current) =>
      current.map((row, index) => {
        if (index !== rowIndex) return row;
        const suppliers = [...normalizeQuoteSuppliers(row.suppliers), ""];
        nextSupplierIndex = suppliers.length - 1;
        return {
          ...row,
          suppliers,
        };
      }),
    );
    setPendingQuoteSupplierFocus({ rowIndex, supplierIndex: nextSupplierIndex });
  }

  function removeQuoteLineSupplier(rowIndex: number, supplierIndex: number) {
    setQuoteLines((current) =>
      current.map((row, index) => {
        if (index !== rowIndex) return row;
        const suppliers = normalizeQuoteSuppliers(row.suppliers).filter((_, currentIndex) => currentIndex !== supplierIndex);
        return {
          ...row,
          suppliers: suppliers.length > 0 ? suppliers : [""],
        };
      }),
    );
  }

  function setQuoteLineRemarks(rowIndex: number, value: string) {
    setQuoteLines((current) =>
      current.map((row, index) =>
        index === rowIndex
          ? {
              ...row,
              remarksValue: value,
              description: buildQuoteLineDescription({
                typeValue: row.typeValue ?? "",
                sizeValue: row.sizeValue ?? "",
                colorValue: row.colorValue ?? "",
                finishedValue: row.finishedValue ?? "",
                remarksValue: value,
              }),
            }
          : row,
      ),
    );
  }

  function setDevelopmentLineSpecValue(rowIndex: number, field: QuoteSpecField, value: string) {
    const key = quoteSpecValueKeys[field];
    setDevelopmentLines((current) =>
      current.map((row, index) => {
        if (index !== rowIndex) return row;
        const next = { ...row, [key]: value } as DevelopmentLineDraft;
        return {
          ...next,
          description: buildQuoteLineDescription(next),
        };
      }),
    );
  }

  function setDevelopmentLineRemarks(rowIndex: number, value: string) {
    setDevelopmentLines((current) =>
      current.map((row, index) =>
        index === rowIndex
          ? {
              ...row,
              remarksValue: value,
              description: buildQuoteLineDescription({
                typeValue: row.typeValue ?? "",
                sizeValue: row.sizeValue ?? "",
                colorValue: row.colorValue ?? "",
                finishedValue: row.finishedValue ?? "",
                remarksValue: value,
              }),
            }
          : row,
      ),
    );
  }

  function updateDevelopmentLineWithProduct(rowIndex: number, productId: string) {
    const product = products.find((item) => item.id === productId);
    setDevelopmentLines((current) =>
      current.map((row, index) =>
        index === rowIndex
          ? product
            ? {
                ...row,
                productCode: getBestProductCode(product),
                productName: product.name,
                imageUrl: row.imageUrl || product.imageUrl,
              }
            : {
                ...row,
                productCode: "",
                productName: "",
              }
          : row,
      ),
    );
  }

  function getDevelopmentLineProductId(line: DevelopmentLineDraft) {
    return findProductMatchByCode(products, line.productCode)?.product.id ?? products.find((item) => item.name === line.productName)?.id ?? "";
  }

  function addQuoteSpecOption(field: QuoteSpecField) {
    const nextValue = quoteSpecNewValues[field].trim();
    if (!nextValue) return;

    setQuoteSpecOptions((current) => {
      if (current[field].includes(nextValue)) return current;
      return {
        ...current,
        [field]: [...current[field], nextValue],
      };
    });
    setQuoteSpecNewValues((current) => ({ ...current, [field]: "" }));
  }

  function updateQuoteLineWithProduct(rowIndex: number, productId: string) {
    const product = products.find((item) => item.id === productId);
    setQuoteLines((current) =>
      current.map((row, index) =>
        index === rowIndex
          ? product
            ? {
                ...row,
                productCode: getBestProductCode(product),
                productName: product.name,
                suppliers: product.suppliers.length ? [...product.suppliers] : normalizeQuoteSuppliers(row.suppliers),
                price: Number(product.price || 0),
                imageUrl: row.imageUrl || product.imageUrl,
              }
            : {
                ...row,
                productCode: "",
                productName: "",
                suppliers: normalizeQuoteSuppliers(row.suppliers),
                price: 0,
              }
          : row,
      ),
    );
  }

  function updatePILineWithProduct(rowIndex: number, productId: string) {
    const product = products.find((item) => item.id === productId);
    setPILines((current) =>
      current.map((row, index) =>
        index === rowIndex
          ? product
            ? {
                ...row,
                productCode: getBestProductCode(product),
                productName: product.name,
                supplier: row.supplier || product.suppliers[0] || "",
                unitPrice: Number(product.price || 0),
              }
            : {
                ...row,
                productCode: "",
                productName: "",
                supplier: "",
                unitPrice: 0,
              }
          : row,
      ),
    );
  }

  function getQuoteLineProductId(line: QuoteLineDraft) {
    return findProductMatchByCode(products, line.productCode)?.product.id ?? products.find((item) => item.name === line.productName)?.id ?? "";
  }

  function getPILineProductId(line: PILineItem) {
    return findProductMatchByCode(products, line.productCode)?.product.id ?? products.find((item) => item.name === line.productName)?.id ?? "";
  }

  const supplierNameOptions = useMemo(() => {
    return Array.from(new Set(suppliers.map((item) => item.name.trim()).filter(Boolean)));
  }, [suppliers]);

  const pageTitleKey =
    currentPage === "products"
      ? "page.products"
      : currentPage === "brands"
        ? "page.brands"
        : currentPage === "customers"
          ? "page.customers"
          : currentPage === "suppliers"
            ? "page.suppliers"
            : currentPage === "quotes"
              ? "page.quotes"
              : currentPage === "development"
                ? "page.development"
              : currentPage === "pis"
                  ? "page.pis"
                  : currentPage === "po"
                    ? "page.po"
                  : currentPage === "po-detail"
                    ? "page.poDetail"
                    : currentPage === "commercial-invoices"
                      ? "page.commercialInvoices"
                    : currentPage === "orders"
                      ? "page.orders"
                    : currentPage === "contracts"
                      ? "page.contracts"
                    : currentPage === "settings"
                        ? "page.settings"
                        : "page.dashboard";

  useEffect(() => {
    if (currentPage !== "quotes" || quoteAccessGranted) return;
    setNotice(t("notice.quoteAccessDenied"));
    navigate("/dashboard", { replace: true });
  }, [currentPage, navigate, quoteAccessGranted, t]);

  useEffect(() => {
    if (!pendingQuoteSupplierFocus) return;

    const frame = window.requestAnimationFrame(() => {
      const selector = `[data-quote-line-index="${pendingQuoteSupplierFocus.rowIndex}"] [data-quote-line-supplier-index="${pendingQuoteSupplierFocus.supplierIndex}"] input`;
      const input = document.querySelector<HTMLInputElement>(selector);
      if (!input) return;
      input.focus();
      input.scrollIntoView({ behavior: "smooth", block: "nearest" });
      setPendingQuoteSupplierFocus(null);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pendingQuoteSupplierFocus, quoteLines]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await loadAdminData();
        if (cancelled) return;

        setStatCards(
          fallbackStats.map((card) => {
            if (card.labelKey === "stat.products") return { ...card, value: String(data.stats.products) };
            if (card.labelKey === "stat.brands") return { ...card, value: String(data.stats.brands) };
            if (card.labelKey === "stat.customers") return { ...card, value: String(data.stats.customers) };
            if (card.labelKey === "stat.suppliers") return { ...card, value: String(data.stats.suppliers) };
            if (card.labelKey === "stat.quotes") return { ...card, value: String(data.stats.quotes) };
            if (card.labelKey === "stat.development") return { ...card, value: String(data.stats.developments) };
            if (card.labelKey === "stat.pis") return { ...card, value: String(data.stats.pis) };
            if (card.labelKey === "stat.orders") return { ...card, value: String(data.stats.orders) };
            if (card.labelKey === "stat.contracts") return { ...card, value: String(data.stats.contracts) };
            return card;
          }),
        );
        setProducts(data.products);
        setBrands(data.brands ?? fallbackBrands);
        setCustomers(data.customers ?? fallbackCustomers);
        setSuppliers(data.suppliers ?? fallbackSuppliers);
        setQuotes(data.quotes ?? fallbackQuotes);
        setDevelopments(data.developments ?? fallbackDevelopments);
        setPIs(data.pis ?? fallbackPIs);
        setPOs((data.pos ?? fallbackPOs) as PORecord[]);
        setOrders(data.orders);
        setContracts(data.contracts);
      } catch {
        if (!cancelled) {
          setNotice(t("notice.fallback"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeModal) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveModal(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModal]);

  async function refreshRemoteData() {
    const data = await loadAdminData();
    setStatCards(
      fallbackStats.map((card) => {
        if (card.labelKey === "stat.products") return { ...card, value: String(data.stats.products) };
        if (card.labelKey === "stat.brands") return { ...card, value: String(data.stats.brands) };
        if (card.labelKey === "stat.customers") return { ...card, value: String(data.stats.customers) };
        if (card.labelKey === "stat.suppliers") return { ...card, value: String(data.stats.suppliers) };
        if (card.labelKey === "stat.quotes") return { ...card, value: String(data.stats.quotes) };
        if (card.labelKey === "stat.development") return { ...card, value: String(data.stats.developments) };
        if (card.labelKey === "stat.pis") return { ...card, value: String(data.stats.pis) };
        if (card.labelKey === "stat.orders") return { ...card, value: String(data.stats.orders) };
        if (card.labelKey === "stat.contracts") return { ...card, value: String(data.stats.contracts) };
        return card;
      }),
    );
    setProducts(data.products);
    setBrands(data.brands ?? fallbackBrands);
    setCustomers(data.customers ?? fallbackCustomers);
    setSuppliers(data.suppliers ?? fallbackSuppliers);
    setQuotes(data.quotes ?? fallbackQuotes);
    setDevelopments(data.developments ?? fallbackDevelopments);
    setPIs(data.pis ?? fallbackPIs);
    setPOs((data.pos ?? fallbackPOs) as PORecord[]);
    setOrders(data.orders);
    setContracts(data.contracts);
  }

  function startCreateProduct() {
    setEditingProductId(null);
    setProductDraft(emptyDraft);
    setNotice(null);
    setActiveModal("product");
  }

  function startEditProduct(product: Product) {
    setEditingProductId(product.id);
    setProductDraft({
      id: product.id,
      name: product.name,
      suppliers: product.suppliers.length > 0 ? [...product.suppliers] : [""],
      categoryKey: product.categoryKey,
      price: String(product.price),
      stock: String(product.stock),
      status: product.status,
      imageUrl: product.imageUrl,
      codePrefix: product.codePrefix ?? "",
      quoteProductCodes: (product.quoteProductCodes ?? []).length > 0 ? [...(product.quoteProductCodes ?? [])] : [""],
    });
    setNotice(null);
    setActiveModal("product");
  }

  function startCreateBrand() {
    setEditingBrandId(null);
    setBrandDraft(emptyBrandDraft);
    setNotice(null);
    setActiveModal("brand");
  }

  function startEditBrand(brand: Brand) {
    setEditingBrandId(brand.id);
    setBrandDraft({
      id: brand.id,
      name: brand.name,
      code: brand.code,
      customer: brand.customer,
      supplier: brand.supplier,
      country: brand.country,
      status: brand.status,
      owner: brand.owner,
      notes: brand.notes,
    });
    setNotice(null);
    setActiveModal("brand");
  }

  function startCreateCustomer() {
    setEditingCustomerId(null);
    setCustomerDraft(emptyCustomerDraft);
    setNotice(null);
    setActiveModal("customer");
  }

  function startEditCustomer(customer: Customer) {
    setEditingCustomerId(customer.id);
    setCustomerDraft({
      id: customer.id,
      name: customer.name,
      code: customer.code,
      country: customer.country,
      contact: customer.contact,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      status: customer.status,
      notes: customer.notes,
      imageUrl: customer.imageUrl ?? "",
    });
    setNotice(null);
    setActiveModal("customer");
  }

  function startCreateSupplier() {
    setEditingSupplierId(null);
    setSupplierDraft(emptySupplierDraft);
    setNotice(null);
    setActiveModal("supplier");
  }

  function startEditSupplier(supplier: Supplier) {
    setEditingSupplierId(supplier.id);
    setSupplierDraft({
      id: supplier.id,
      name: supplier.name,
      code: supplier.code,
      country: supplier.country,
      contact: supplier.contact,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      status: supplier.status,
      notes: supplier.notes,
    });
    setNotice(null);
    setActiveModal("supplier");
  }

  function startCreateQuote() {
    if (!quoteAccessGranted) {
      setNotice(t("notice.quoteAccessDenied"));
      return;
    }
    setEditingQuoteId(null);
    const template = createQuoteSheetTemplate();
    setQuoteDraft(template.draft);
    setQuoteLines(template.lines.map((line) => normalizeQuoteLineDraft(line)));
    setQuoteTiers(template.tiers);
    setQuotePreviewQty("1M");
    setQuoteSpecOptions((current) => mergeQuoteSpecOptions(current, createQuoteSpecOptions(template.lines)));
    setNotice(null);
    setActiveModal("quote");
  }

  function startEditQuote(quote: Quote) {
    if (!quoteAccessGranted) {
      setNotice(t("notice.quoteAccessDenied"));
      return;
    }
    setEditingQuoteId(quote.id);
    setQuoteDraft({
      id: quote.id,
      quoteNo: quote.quoteNo,
      date: quote.date,
      modificationDate: quote.modificationDate,
      register: quote.register,
      itemType: quote.itemType,
      brand: quote.brand,
      linkman: quote.linkman,
      salesperson: quote.salesperson,
      customer: quote.customer,
      productCode: quote.productCode,
      productName: quote.productName,
      status: quote.status,
      item: quote.item || quote.productName,
      imageUrl: quote.imageUrl,
      notes: quote.notes,
    });
    setQuoteLines(
      quote.lines.map((item) => normalizeQuoteLineDraft(item, quote.costItems)),
    );
    setQuoteTiers(quote.tiers.map((item) => ({ ...item, id: item.id ?? createLineItemId() })));
    setQuotePreviewQty(quote.tiers[0]?.quantity ?? "1M");
    setQuoteSpecOptions((current) => mergeQuoteSpecOptions(current, createQuoteSpecOptions(quote.lines)));
    setNotice(null);
    setActiveModal("quote");
  }

  function startCreatePI() {
    setEditingPIId(null);
    setPIDraft(emptyPIDraft);
    setPILines([{ id: createLineItemId(), productCode: "", productName: "", supplier: "", quantity: 1, unitPrice: 0 }]);
    setPISizeDetails([
      { id: createLineItemId(), size: "14-36", quantity: 20000 },
      { id: createLineItemId(), size: "14 1/2 - 37", quantity: 20000 },
    ]);
    setNotice(null);
    setActiveModal("pi");
  }

  function startEditPI(pi: PIRecord) {
    setEditingPIId(pi.id);
    setPIDraft({
      id: pi.id,
      piNo: pi.piNo,
      plNo: pi.plNo ?? "",
      customer: pi.customer,
      brand: pi.brand,
      vendor: pi.vendor,
      ourRefNo: pi.ourRefNo,
      deliveryDate: pi.deliveryDate,
      deliverTo: pi.deliverTo,
      status: pi.status,
      generatedAt: pi.generatedAt,
      generatedBy: pi.generatedBy,
      purchaseGeneratedAt: pi.purchaseGeneratedAt,
      financeApprovedAt: pi.financeApprovedAt,
      packingInfoGeneratedAt: pi.packingInfoGeneratedAt,
      commercialInvoiceGeneratedAt: pi.commercialInvoiceGeneratedAt,
      paymentConfirmedAt: pi.paymentConfirmedAt,
      pdfUrl: pi.pdfUrl,
      orderQty: pi.orderQty ?? 0,
      deductedQty: pi.deductedQty ?? 0,
      outstandingQty: pi.outstandingQty ?? 0,
      inStockQty: pi.inStockQty ?? 0,
      stockOutQty: pi.stockOutQty ?? 0,
      itemCode: pi.itemCode,
      description: pi.description,
      productType: pi.productType,
      size: pi.size,
      colors: pi.colors,
      finished: pi.finished,
      remarks: pi.remarks,
      imageUrl: pi.imageUrl,
      notes: pi.notes,
    });
    setPILines(pi.lines.map((line) => ({ ...line, id: line.id ?? createLineItemId() })));
    setPISizeDetails((pi.sizeDetails ?? []).map((detail) => ({ ...detail, id: detail.id ?? createLineItemId() })));
    setNotice(null);
    setActiveModal("pi");
  }

  function startCreateOrder() {
    setEditingOrderId(null);
    setOrderDraft(emptyOrderDraft);
    setNotice(null);
    setActiveModal("order");
  }

  function startEditOrder(order: Order) {
    setEditingOrderId(order.id);
    setOrderDraft({
      id: order.id,
      customer: order.customer,
      product: order.product,
      status: order.status,
      total: String(order.total),
      channel: order.channel,
    });
    setNotice(null);
    setActiveModal("order");
  }

  function startCreateContract() {
    setEditingContractId(null);
    setContractDraft(emptyContractDraft);
    setNotice(null);
    setActiveModal("contract");
  }

  function startEditContract(contract: Contract) {
    setEditingContractId(contract.id);
    setContractDraft({
      id: contract.id,
      title: contract.title,
      client: contract.client,
      status: contract.status,
      amount: String(contract.amount),
      deadline: contract.deadline,
    });
    setNotice(null);
    setActiveModal("contract");
  }

  function closeModal() {
    setActiveModal(null);
  }

  async function uploadImageFile(file: File) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as
        | { ok: true; url: string; key: string }
        | { ok: false; message?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.ok ? "Upload failed" : result.message || "Upload failed");
      }

      return result.url;
    } catch {
      throw new Error("Upload failed");
    }
  }

  async function handleProductImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    try {
      const url = await uploadImageFile(file);
      setProductDraft((current) => ({ ...current, imageUrl: url }));
    } catch {
      setNotice(t("notice.imageUploadFailed"));
    }
  }

  async function handleCustomerImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    try {
      const url = await uploadImageFile(file);
      setCustomerDraft((current) => ({ ...current, imageUrl: url }));
    } catch {
      setNotice(t("notice.imageUploadFailed"));
    }
  }

  function clearProductImage() {
    setProductDraft((current) => ({ ...current, imageUrl: "" }));
  }

  function clearCustomerImage() {
    setCustomerDraft((current) => ({ ...current, imageUrl: "" }));
  }

  async function submitProductDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const suppliers = (productDraft.suppliers ?? []).map((item) => item.trim()).filter(Boolean);
    const quoteProductCodes = (productDraft.quoteProductCodes ?? []).map((item) => item.trim()).filter(Boolean);
    const draft = {
      id: editingProductId ?? `SPU${Date.now().toString().slice(-6)}`,
      name: productDraft.name.trim(),
      suppliers,
      categoryKey: productDraft.categoryKey,
      price: Number(productDraft.price),
      stock: Number(productDraft.stock),
      status: productDraft.status,
      imageUrl: productDraft.imageUrl.trim(),
      codePrefix: (productDraft.codePrefix ?? "").trim(),
      quoteProductCodes,
    } satisfies Product;

    if (!draft.name || draft.suppliers.length === 0) {
      setNotice(t("notice.productRequired"));
      return;
    }

    if (editingProductId) {
      setProducts((current) => current.map((item) => (item.id === editingProductId ? draft : item)));
    } else {
      setProducts((current) => [draft, ...current]);
    }

    try {
      if (editingProductId) {
        await apiUpdateProduct(draft);
      } else {
        await apiCreateProduct(draft);
      }
      await refreshRemoteData();
      setNotice(t("notice.saved"));
    } catch {
      setNotice(t("notice.savedLocally"));
    } finally {
      closeModal();
    }
  }

  async function removeProduct(product: Product) {
    const confirmed = window.confirm(`${t("confirm.deleteProduct")} ${product.name}?`);
    if (!confirmed) return;

    setProducts((current) => current.filter((item) => item.id !== product.id));

    try {
      await apiDeleteProduct(product.id);
      await refreshRemoteData();
      setNotice(t("notice.deleted"));
    } catch {
      setNotice(t("notice.deletedLocally"));
    }
  }

  async function submitBrandDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const draft = {
      id: editingBrandId ?? `BR${Date.now().toString().slice(-6)}`,
      name: brandDraft.name.trim(),
      code: brandDraft.code.trim(),
      customer: brandDraft.customer.trim(),
      supplier: brandDraft.supplier.trim(),
      country: brandDraft.country.trim(),
      status: brandDraft.status,
      owner: brandDraft.owner.trim(),
      notes: brandDraft.notes.trim(),
    } satisfies Brand;

    if (!draft.name || !draft.code) {
      setNotice(t("notice.brandRequired"));
      return;
    }

    // Check for duplicate brand names (case-insensitive)
    const normalizedName = draft.name.toLowerCase().replace(/\s+/g, "");
    const duplicate = brands.find(
      (item) =>
        item.id !== editingBrandId &&
        item.name.toLowerCase().replace(/\s+/g, "") === normalizedName,
    );
    if (duplicate) {
      setNotice(`${draft.name}: ${t("notice.brandDuplicate")}`);
      return;
    }

    if (editingBrandId) {
      setBrands((current) => current.map((item) => (item.id === editingBrandId ? draft : item)));
    } else {
      setBrands((current) => [draft, ...current]);
    }

    try {
      if (editingBrandId) {
        await apiUpdateBrand(draft);
      } else {
        await apiCreateBrand(draft);
      }
      await refreshRemoteData();
      setNotice(t("notice.saved"));
    } catch {
      setNotice(t("notice.savedLocally"));
    } finally {
      closeModal();
    }
  }

  function handleCheckBrands(brandsList: Brand[]) {
    const issues: string[] = [];
    const seen = new Map<string, Brand[]>();
    for (const b of brandsList) {
      const key = b.name.toLowerCase().replace(/\s+/g, "");
      const existing = seen.get(key) || [];
      existing.push(b);
      seen.set(key, existing);
    }
    for (const [, group] of seen) {
      if (group.length > 1) {
        issues.push(group.map((b) => b.name).join(" / "));
      }
    }
    if (issues.length > 0) {
      setNotice(`${t("notice.brandNameWarning")}: ${issues.join("; ")}`);
    } else {
      setNotice(t("notice.saved"));
    }
  }

  async function removeBrand(brand: Brand) {
    const confirmed = window.confirm(`${t("confirm.deleteBrand")} ${brand.name}?`);
    if (!confirmed) return;

    setBrands((current) => current.filter((item) => item.id !== brand.id));

    try {
      await apiDeleteBrand(brand.id);
      await refreshRemoteData();
      setNotice(t("notice.deleted"));
    } catch {
      setNotice(t("notice.deletedLocally"));
    }
  }

  async function submitCustomerDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const draft = {
      id: editingCustomerId ?? createRowId("CU"),
      name: customerDraft.name.trim(),
      code: customerDraft.code.trim(),
      country: customerDraft.country.trim(),
      contact: customerDraft.contact.trim(),
      phone: customerDraft.phone.trim(),
      email: customerDraft.email.trim(),
      address: customerDraft.address.trim(),
      status: customerDraft.status,
      notes: customerDraft.notes.trim(),
      imageUrl: customerDraft.imageUrl.trim(),
    } satisfies Customer;

    if (!draft.name || !draft.code) {
      setNotice(t("notice.customerRequired"));
      return;
    }

    setCustomers((current) => (editingCustomerId ? current.map((item) => (item.id === editingCustomerId ? draft : item)) : [draft, ...current]));

    try {
      if (editingCustomerId) {
        await apiUpdateCustomer(draft);
      } else {
        await apiCreateCustomer(draft);
      }
      await refreshRemoteData();
      setNotice(t("notice.saved"));
    } catch {
      setNotice(t("notice.savedLocally"));
    } finally {
      closeModal();
    }
  }

  async function removeCustomer(customer: Customer) {
    const confirmed = window.confirm(`${t("confirm.deleteCustomer")} ${customer.name}?`);
    if (!confirmed) return;

    setCustomers((current) => current.filter((item) => item.id !== customer.id));

    try {
      await apiDeleteCustomer(customer.id);
      await refreshRemoteData();
      setNotice(t("notice.deleted"));
    } catch {
      setNotice(t("notice.deletedLocally"));
    }
  }

  async function submitSupplierDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const draft = {
      id: editingSupplierId ?? createRowId("SU"),
      name: supplierDraft.name.trim(),
      code: supplierDraft.code.trim(),
      country: supplierDraft.country.trim(),
      contact: supplierDraft.contact.trim(),
      phone: supplierDraft.phone.trim(),
      email: supplierDraft.email.trim(),
      address: supplierDraft.address.trim(),
      status: supplierDraft.status,
      notes: supplierDraft.notes.trim(),
    } satisfies Supplier;

    if (!draft.name || !draft.code) {
      setNotice(t("notice.supplierRequired"));
      return;
    }

    setSuppliers((current) => (editingSupplierId ? current.map((item) => (item.id === editingSupplierId ? draft : item)) : [draft, ...current]));

    try {
      if (editingSupplierId) {
        await apiUpdateSupplier(draft);
      } else {
        await apiCreateSupplier(draft);
      }
      await refreshRemoteData();
      setNotice(t("notice.saved"));
    } catch {
      setNotice(t("notice.savedLocally"));
    } finally {
      closeModal();
    }
  }

  async function removeSupplier(supplier: Supplier) {
    const confirmed = window.confirm(`${t("confirm.deleteSupplier")} ${supplier.name}?`);
    if (!confirmed) return;

    setSuppliers((current) => current.filter((item) => item.id !== supplier.id));

    try {
      await apiDeleteSupplier(supplier.id);
      await refreshRemoteData();
      setNotice(t("notice.deleted"));
    } catch {
      setNotice(t("notice.deletedLocally"));
    }
  }

  async function submitQuoteDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedLines = quoteLines
      .map((item) => normalizeQuoteLineDraft(item, item.costItems))
      .filter((item) => item.productCode.trim() || item.productName.trim() || item.description.trim())
      .map((item) => ({
        ...item,
        id: item.id ?? createLineItemId(),
        checked: Boolean(item.checked),
        imageUrl: item.imageUrl.trim(),
        productCode: item.productCode.trim(),
        productName: item.productName.trim(),
        price: Number(item.price || 0),
        sample: Number(item.sample || 0),
        description: buildQuoteLineDescription(item),
        typeValue: String(item.typeValue ?? "").trim(),
        sizeValue: String(item.sizeValue ?? "").trim(),
        colorValue: String(item.colorValue ?? "").trim(),
        finishedValue: String(item.finishedValue ?? "").trim(),
        remarksValue: String(item.remarksValue ?? "").trim(),
        pricingNotes: item.pricingNotes.trim(),
        cost: item.cost.trim(),
        suppliers: normalizeQuoteSuppliers(item.suppliers).map((supplier) => supplier.trim()).filter(Boolean),
        costItems: (item.costItems || [])
          .filter((costItem) => costItem.label.trim())
          .map((costItem) => ({
            ...costItem,
            id: costItem.id ?? createLineItemId(),
            label: costItem.label.trim(),
            amount: Number(costItem.amount || 0),
          })),
      }));
    const firstLine = normalizedLines[0];
    const normalizedCostItems = firstLine?.costItems ?? [];
    const draft = {
      id: editingQuoteId ?? createRowId("QU"),
      quoteNo: quoteDraft.quoteNo.trim() || createRowId("NO"),
      date: quoteDraft.date,
      modificationDate: quoteDraft.modificationDate || new Date().toISOString().slice(0, 10),
      register: quoteDraft.register.trim(),
      itemType: quoteDraft.itemType.trim(),
      brand: quoteDraft.brand.trim(),
      linkman: quoteDraft.linkman.trim(),
      salesperson: quoteDraft.salesperson.trim(),
      customer: quoteDraft.customer.trim(),
      productCode: firstLine?.productCode || quoteDraft.productCode.trim(),
      productName: firstLine?.productName || quoteDraft.productName.trim(),
      status: quoteDraft.status,
      item: quoteDraft.item.trim(),
      costItems: normalizedCostItems,
      tiers: quoteTiers
        .filter((item) => item.quantity.trim())
        .map((item) => ({ ...item, id: item.id ?? createLineItemId(), quantity: item.quantity.trim(), unitPrice: Number(item.unitPrice || 0) })),
      lines: normalizedLines,
      imageUrl: quoteDraft.imageUrl.trim(),
      notes: quoteDraft.notes.trim(),
    } satisfies Quote;

    if (!draft.brand || !draft.customer || !draft.quoteNo || !draft.itemType) {
      setNotice(t("notice.quoteRequired"));
      return;
    }

    setQuotes((current) => (editingQuoteId ? current.map((item) => (item.id === editingQuoteId ? draft : item)) : [draft, ...current]));

    try {
      if (editingQuoteId) {
        await apiUpdateQuote(draft);
      } else {
        await apiCreateQuote(draft);
      }
      await refreshRemoteData();
      setNotice(t("notice.saved"));
    } catch {
      setNotice(t("notice.savedLocally"));
    } finally {
      closeModal();
    }
  }

  async function removeQuote(quote: Quote) {
    const confirmed = window.confirm(`${t("confirm.deleteQuote")} ${quote.productName}?`);
    if (!confirmed) return;

    setQuotes((current) => current.filter((item) => item.id !== quote.id));

    try {
      await apiDeleteQuote(quote.id);
      await refreshRemoteData();
      setNotice(t("notice.deleted"));
    } catch {
      setNotice(t("notice.deletedLocally"));
    }
  }

  function startCreateDevelopment(sourceQuote?: Quote) {
    setEditingDevelopmentId(null);
    const initialQuote = sourceQuote ?? quotes[0] ?? null;
    const primaryLine = initialQuote?.lines?.[0];
    setDevelopmentDraft({
      ...emptyDevelopmentDraft,
      developmentNo: createRowId("DV"),
      date: new Date().toISOString().slice(0, 10),
      modificationDate: new Date().toISOString().slice(0, 10),
      register: initialQuote?.register || "朱佳毅",
      itemType: initialQuote?.itemType || "",
      brand: initialQuote?.brand || "",
      linkman: initialQuote?.linkman || "",
      salesperson: initialQuote?.salesperson || "",
      customer: initialQuote?.customer || "",
      item: initialQuote?.item || initialQuote?.productName || "",
      productCode: initialQuote?.productCode || primaryLine?.productCode || "",
      productName: initialQuote?.productName || primaryLine?.productName || "",
      status: initialQuote ? "In progress" : "Draft",
      sourceQuoteId: initialQuote?.id || "",
      sourceQuoteNo: initialQuote?.quoteNo || "",
      imageUrl: initialQuote?.imageUrl || primaryLine?.imageUrl || "",
      notes: initialQuote ? `Generated from quote ${initialQuote.quoteNo || initialQuote.id}` : "",
    });
    setDevelopmentLines(
      initialQuote?.lines?.length
        ? initialQuote.lines.map((line) =>
            createDevelopmentLine({
              checked: line.checked,
              imageUrl: line.imageUrl,
              productCode: line.productCode,
              productName: line.productName,
              description: buildQuoteLineDescription({
                typeValue: line.typeValue ?? parseQuoteLineDescription(line.description).typeValue,
                sizeValue: line.sizeValue ?? parseQuoteLineDescription(line.description).sizeValue,
                colorValue: line.colorValue ?? parseQuoteLineDescription(line.description).colorValue,
                finishedValue: line.finishedValue ?? parseQuoteLineDescription(line.description).finishedValue,
                remarksValue: line.remarksValue ?? parseQuoteLineDescription(line.description).remarksValue,
              }),
              typeValue: line.typeValue,
              sizeValue: line.sizeValue,
              colorValue: line.colorValue,
              finishedValue: line.finishedValue,
              remarksValue: line.remarksValue,
              specLocked: line.specLocked,
            }),
          )
        : [createDevelopmentLine()],
    );
    setNotice(null);
    setActiveModal("development");
  }

  function updateDevelopmentQuote(sourceQuoteId: string) {
    const sourceQuote = quotes.find((item) => item.id === sourceQuoteId || item.quoteNo === sourceQuoteId) ?? null;
    setDevelopmentDraft((current) => ({
      ...current,
      sourceQuoteId: sourceQuote?.id ?? "",
      sourceQuoteNo: sourceQuote?.quoteNo ?? "",
      register: sourceQuote?.register || current.register,
      itemType: sourceQuote?.itemType || current.itemType,
      brand: sourceQuote?.brand || current.brand,
      linkman: sourceQuote?.linkman || current.linkman,
      salesperson: sourceQuote?.salesperson || current.salesperson,
      customer: sourceQuote?.customer || current.customer,
      item: sourceQuote?.item || sourceQuote?.productName || current.item,
      productCode: sourceQuote?.productCode || current.productCode,
      productName: sourceQuote?.productName || current.productName,
      imageUrl: sourceQuote?.imageUrl || current.imageUrl,
    }));

    if (sourceQuote) {
      setDevelopmentLines(
        sourceQuote.lines.length
          ? sourceQuote.lines.map((line) =>
              createDevelopmentLine({
                checked: line.checked,
                imageUrl: line.imageUrl,
                productCode: line.productCode,
                productName: line.productName,
                description: buildQuoteLineDescription({
                  typeValue: line.typeValue ?? parseQuoteLineDescription(line.description).typeValue,
                  sizeValue: line.sizeValue ?? parseQuoteLineDescription(line.description).sizeValue,
                  colorValue: line.colorValue ?? parseQuoteLineDescription(line.description).colorValue,
                  finishedValue: line.finishedValue ?? parseQuoteLineDescription(line.description).finishedValue,
                  remarksValue: line.remarksValue ?? parseQuoteLineDescription(line.description).remarksValue,
                }),
                typeValue: line.typeValue,
                sizeValue: line.sizeValue,
                colorValue: line.colorValue,
                finishedValue: line.finishedValue,
                remarksValue: line.remarksValue,
                specLocked: line.specLocked,
              }),
            )
          : [createDevelopmentLine()],
      );
    } else {
      setDevelopmentLines([createDevelopmentLine()]);
    }
  }

  function startEditDevelopment(development: DevelopmentRecord) {
    setEditingDevelopmentId(development.id);
    setDevelopmentDraft({
      id: development.id,
      developmentNo: development.developmentNo,
      date: development.date,
      modificationDate: development.modificationDate,
      register: development.register,
      itemType: development.itemType,
      brand: development.brand,
      linkman: development.linkman,
      salesperson: development.salesperson,
      customer: development.customer,
      item: development.item,
      productCode: development.productCode,
      productName: development.productName,
      status: development.status,
      sourceQuoteId: development.sourceQuoteId,
      sourceQuoteNo: development.sourceQuoteNo,
      imageUrl: development.imageUrl,
      notes: development.notes,
    });
    setDevelopmentLines((development.lines ?? []).map((line) => normalizeDevelopmentLineDraft(line)));
    setNotice(null);
    setActiveModal("development");
  }

  async function submitDevelopmentDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedLines = developmentLines
      .map((item) => normalizeDevelopmentLineDraft(item))
      .filter((item) => item.productCode.trim() || item.productName.trim() || item.description.trim())
      .map((item) => ({
        ...item,
        id: item.id ?? createLineItemId(),
        checked: Boolean(item.checked),
        imageUrl: item.imageUrl.trim(),
        productCode: item.productCode.trim(),
        productName: item.productName.trim(),
        description: buildQuoteLineDescription({
          typeValue: String(item.typeValue ?? "").trim(),
          sizeValue: String(item.sizeValue ?? "").trim(),
          colorValue: String(item.colorValue ?? "").trim(),
          finishedValue: String(item.finishedValue ?? "").trim(),
          remarksValue: String(item.remarksValue ?? "").trim(),
        }),
        typeValue: String(item.typeValue ?? "").trim(),
        sizeValue: String(item.sizeValue ?? "").trim(),
        colorValue: String(item.colorValue ?? "").trim(),
        finishedValue: String(item.finishedValue ?? "").trim(),
        remarksValue: String(item.remarksValue ?? "").trim(),
        specLocked: Boolean(item.specLocked),
      }));

    const firstLine = normalizedLines[0];
    const draft = {
      id: editingDevelopmentId ?? createRowId("DV"),
      developmentNo: developmentDraft.developmentNo.trim() || createRowId("DV"),
      date: developmentDraft.date,
      modificationDate: developmentDraft.modificationDate || new Date().toISOString().slice(0, 10),
      register: developmentDraft.register.trim(),
      itemType: developmentDraft.itemType.trim(),
      brand: developmentDraft.brand.trim(),
      linkman: developmentDraft.linkman.trim(),
      salesperson: developmentDraft.salesperson.trim(),
      customer: developmentDraft.customer.trim(),
      item: developmentDraft.item.trim(),
      productCode: firstLine?.productCode || developmentDraft.productCode.trim(),
      productName: firstLine?.productName || developmentDraft.productName.trim(),
      status: developmentDraft.status,
      sourceQuoteId: developmentDraft.sourceQuoteId.trim(),
      sourceQuoteNo: developmentDraft.sourceQuoteNo.trim(),
      lines: normalizedLines,
      imageUrl: developmentDraft.imageUrl.trim(),
      notes: developmentDraft.notes.trim(),
    } satisfies DevelopmentRecord;

    if (!draft.developmentNo || !draft.brand || !draft.customer || !draft.sourceQuoteId) {
      setNotice(t("notice.developmentRequired"));
      return;
    }

    setDevelopments((current) => (editingDevelopmentId ? current.map((item) => (item.id === editingDevelopmentId ? draft : item)) : [draft, ...current]));

    try {
      if (editingDevelopmentId) {
        await apiUpdateDevelopment(draft);
      } else {
        await apiCreateDevelopment(draft);
      }
      await refreshRemoteData();
      setNotice(t("notice.saved"));
    } catch {
      setNotice(t("notice.savedLocally"));
    } finally {
      closeModal();
    }
  }

  async function removeDevelopment(development: DevelopmentRecord) {
    const confirmed = window.confirm(`${t("confirm.deleteDevelopment")} ${development.developmentNo}?`);
    if (!confirmed) return;

    setDevelopments((current) => current.filter((item) => item.id !== development.id));

    try {
      await apiDeleteDevelopment(development.id);
      await refreshRemoteData();
      setNotice(t("notice.deleted"));
    } catch {
      setNotice(t("notice.deletedLocally"));
    }
  }

  async function submitPIDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedSizeDetails = piSizeDetails
      .filter((line) => line.size.trim())
      .map((line) => ({
        ...line,
        id: line.id ?? createLineItemId(),
        size: line.size.trim(),
        quantity: Number(line.quantity || 0),
      }));
    const draft = {
      id: editingPIId ?? createRowId("PI"),
      piNo: piDraft.piNo.trim() || createRowId("PI"),
      plNo: piDraft.plNo.trim(),
      customer: piDraft.customer.trim(),
      brand: piDraft.brand.trim(),
      vendor: piDraft.vendor.trim(),
      ourRefNo: piDraft.ourRefNo.trim(),
      deliveryDate: piDraft.deliveryDate,
      deliverTo: piDraft.deliverTo.trim(),
      status: piDraft.status,
      generatedAt: piDraft.generatedAt || new Date().toISOString(),
      generatedBy: piDraft.generatedBy.trim() || "Jason",
      purchaseGeneratedAt: piDraft.purchaseGeneratedAt.trim(),
      financeApprovedAt: piDraft.financeApprovedAt.trim(),
      packingInfoGeneratedAt: piDraft.packingInfoGeneratedAt.trim(),
      commercialInvoiceGeneratedAt: piDraft.commercialInvoiceGeneratedAt.trim(),
      paymentConfirmedAt: piDraft.paymentConfirmedAt.trim(),
      pdfUrl: piDraft.pdfUrl.trim(),
      orderQty: Number(piDraft.orderQty) || 0,
      deductedQty: Number(piDraft.deductedQty) || 0,
      outstandingQty: Number(piDraft.outstandingQty) || 0,
      inStockQty: Number(piDraft.inStockQty) || 0,
      stockOutQty: Number(piDraft.stockOutQty) || 0,
      itemCode: piDraft.itemCode.trim(),
      description: piDraft.description.trim(),
      productType: piDraft.productType.trim(),
      size: piDraft.size.trim(),
      colors: piDraft.colors.trim(),
      finished: piDraft.finished.trim(),
      remarks: piDraft.remarks.trim(),
      imageUrl: piDraft.imageUrl.trim(),
      sizeDetails: normalizedSizeDetails,
      lines: piLines
        .filter((line) => line.productCode.trim() || line.productName.trim())
        .map((line) => ({
          ...line,
          id: line.id ?? createLineItemId(),
          productCode: line.productCode.trim(),
          productName: line.productName.trim(),
          supplier: (line.supplier ?? "").trim(),
          quantity: Number(line.quantity || 0),
          unitPrice: Number(line.unitPrice || 0),
        })),
      notes: piDraft.notes.trim(),
    } satisfies PIRecord;

    if (!draft.piNo || !draft.customer || !draft.brand) {
      setNotice(t("notice.piRequired"));
      return;
    }

    const missingSupplierLine = draft.lines.find((line) => (line.productCode.trim() || line.productName.trim()) && !line.supplier.trim());
    if (missingSupplierLine) {
      setNotice(t("notice.piLineSupplierRequired"));
      return;
    }

    setPIs((current) => (editingPIId ? current.map((item) => (item.id === editingPIId ? draft : item)) : [draft, ...current]));
    setProducts((current) => syncProductsFromPILines(current, draft.lines));

    try {
      if (editingPIId) {
        await apiUpdatePI(draft);
      } else {
        await apiCreatePI(draft);
      }
      await refreshRemoteData();
      setNotice(t("notice.saved"));
    } catch {
      setNotice(t("notice.savedLocally"));
    } finally {
      closeModal();
    }
  }

  async function removePI(pi: PIRecord) {
    const confirmed = window.confirm(`${t("confirm.deletePI")} ${pi.piNo}?`);
    if (!confirmed) return;

    setPIs((current) => current.filter((item) => item.id !== pi.id));

    try {
      await apiDeletePI(pi.id);
      await refreshRemoteData();
      setNotice(t("notice.deleted"));
    } catch {
      setNotice(t("notice.deletedLocally"));
    }
  }

function generatePIFromQuote(quote: Quote) {
    const now = new Date().toISOString();
    const firstQuoteLine = quote.lines[0];
    const quoteQty = quote.lines.reduce((sum, line) => {
      const lineQty = Number(line.sample || 0) > 0 ? Number(line.sample || 0) : Math.max(1, parseQuantityValue(quote.tiers[0]?.quantity ?? "1"));
      return sum + lineQty;
    }, 0);
    const normalizedQuoteLines = quote.lines
      .filter((line) => line.productCode.trim() || line.productName.trim() || line.description.trim())
      .map((line) => ({
        id: line.id ?? createLineItemId(),
        productCode: line.productCode.trim(),
        productName: line.productName.trim(),
        supplier: line.suppliers?.find((item) => item.trim()) ?? products.find((item) => item.id === line.productCode.trim() || item.name === line.productName.trim())?.suppliers[0] ?? "",
        quantity: Number(line.sample || 0) > 0 ? Number(line.sample || 0) : Math.max(1, parseQuantityValue(quote.tiers[0]?.quantity ?? "1")),
        unitPrice: Number(line.price || 0) || getQuoteUnitPrice(quote, quote.tiers[0]?.quantity ?? "1"),
      }));
    const firstLine = normalizedQuoteLines[0] ?? firstQuoteLine;
    setEditingPIId(null);
    setPIDraft({
      ...emptyPIDraft,
      piNo: createRowId("PI"),
      plNo: createRowId("PL"),
      customer: quote.customer,
      brand: quote.brand,
      vendor: "",
      ourRefNo: quote.quoteNo,
      deliveryDate: "",
      deliverTo: "",
      status: "Generated",
      generatedAt: now,
      generatedBy: "Jason",
      purchaseGeneratedAt: "",
      financeApprovedAt: "",
      packingInfoGeneratedAt: "",
      commercialInvoiceGeneratedAt: "",
      paymentConfirmedAt: "",
      pdfUrl: "",
      orderQty: quoteQty || 0,
      deductedQty: 0,
      outstandingQty: quoteQty || 0,
      inStockQty: quoteQty || 0,
      stockOutQty: quoteQty || 0,
      itemCode: quote.productCode || firstLine?.productCode || "",
      description: quote.item || quote.productName || firstLine?.productName || "",
      productType: quote.itemType || quote.productName || "",
      size: "",
      colors: "",
      finished: "",
      remarks: quote.notes || "",
      imageUrl: quote.imageUrl || firstQuoteLine?.imageUrl || "",
      notes: `Generated from quote ${quote.id}`,
    });
    setPILines(
      normalizedQuoteLines.length
        ? normalizedQuoteLines
        : [
            {
              id: createLineItemId(),
              productCode: quote.productCode || firstLine?.productCode || "",
              productName: quote.productName || firstLine?.productName || "",
              supplier:
                firstLine?.supplier ||
                products.find((item) => item.id === quote.productCode || item.name === quote.productName || item.id === firstLine?.productCode || item.name === firstLine?.productName)?.suppliers[0] ||
                "",
              quantity: Math.max(1, parseQuantityValue(quote.tiers[0]?.quantity ?? "1")),
              unitPrice: getQuoteUnitPrice(quote, quote.tiers[0]?.quantity ?? "1") || firstQuoteLine?.price || 0,
            },
          ],
    );
    setPISizeDetails([]);
    setNotice(null);
    setActiveModal("pi");
  }

  function generatePIFromOrder(order: Order) {
    const now = new Date().toISOString();
    setEditingPIId(null);
    setPIDraft({
      ...emptyPIDraft,
      piNo: createRowId("PI"),
      plNo: createRowId("PL"),
      customer: order.customer,
      brand: "",
      vendor: "",
      ourRefNo: order.id,
      deliveryDate: "",
      deliverTo: "",
      status: "Generated",
      generatedAt: now,
      generatedBy: "Jason",
      purchaseGeneratedAt: "",
      financeApprovedAt: "",
      packingInfoGeneratedAt: "",
      commercialInvoiceGeneratedAt: "",
      paymentConfirmedAt: "",
      pdfUrl: "",
      orderQty: 1,
      deductedQty: 0,
      outstandingQty: 1,
      inStockQty: 1,
      stockOutQty: 1,
      itemCode: order.id,
      description: order.product,
      productType: order.channel,
      size: "",
      colors: "",
      finished: "",
      remarks: `Generated from order ${order.id}`,
      imageUrl: "",
      notes: `Generated from order ${order.id}`,
    });
    setPILines([
      {
        id: createLineItemId(),
        productCode: order.product,
        productName: order.product,
        supplier: products.find((item) => item.id === order.product || item.name === order.product)?.suppliers[0] ?? "",
        quantity: 1,
        unitPrice: order.total,
      },
    ]);
    setPISizeDetails([]);
    setNotice(null);
    setActiveModal("pi");
  }

  async function submitOrderDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const draft = {
      id: editingOrderId ?? `OR${Date.now().toString().slice(-6)}`,
      customer: orderDraft.customer.trim(),
      product: orderDraft.product.trim(),
      status: orderDraft.status,
      total: Number(orderDraft.total),
      channel: orderDraft.channel.trim(),
    } satisfies Order;

    if (!draft.customer || !draft.product || !draft.total) {
      setNotice(t("notice.orderRequired"));
      return;
    }

    if (editingOrderId) {
      setOrders((current) => current.map((item) => (item.id === editingOrderId ? draft : item)));
    } else {
      setOrders((current) => [draft, ...current]);
    }

    try {
      if (editingOrderId) {
        await apiUpdateOrder(draft);
      } else {
        await apiCreateOrder(draft);
      }
      await refreshRemoteData();
      setNotice(t("notice.saved"));
    } catch {
      setNotice(t("notice.savedLocally"));
    } finally {
      closeModal();
    }
  }

  async function removeOrder(order: Order) {
    const confirmed = window.confirm(`${t("confirm.deleteOrder")} ${order.customer}?`);
    if (!confirmed) return;

    setOrders((current) => current.filter((item) => item.id !== order.id));

    try {
      await apiDeleteOrder(order.id);
      await refreshRemoteData();
      setNotice(t("notice.deleted"));
    } catch {
      setNotice(t("notice.deletedLocally"));
    }
  }

  async function submitContractDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const draft = {
      id: editingContractId ?? `CT-${Date.now().toString().slice(-6)}`,
      title: contractDraft.title.trim(),
      client: contractDraft.client.trim(),
      status: contractDraft.status,
      amount: Number(contractDraft.amount),
      deadline: contractDraft.deadline,
    } satisfies Contract;

    if (!draft.title || !draft.client || !draft.amount || !draft.deadline) {
      setNotice(t("notice.contractRequired"));
      return;
    }

    if (editingContractId) {
      setContracts((current) => current.map((item) => (item.id === editingContractId ? draft : item)));
    } else {
      setContracts((current) => [draft, ...current]);
    }

    try {
      if (editingContractId) {
        await apiUpdateContract(draft);
      } else {
        await apiCreateContract(draft);
      }
      await refreshRemoteData();
      setNotice(t("notice.saved"));
    } catch {
      setNotice(t("notice.savedLocally"));
    } finally {
      closeModal();
    }
  }

  async function removeContract(contract: Contract) {
    const confirmed = window.confirm(`${t("confirm.deleteContract")} ${contract.title}?`);
    if (!confirmed) return;

    setContracts((current) => current.filter((item) => item.id !== contract.id));

    try {
      await apiDeleteContract(contract.id);
      await refreshRemoteData();
      setNotice(t("notice.deleted"));
    } catch {
      setNotice(t("notice.deletedLocally"));
    }
  }

  function startCreatePO(sourcePi?: PIRecord) {
    setEditingPoId(null);
    setPODraft(sourcePi ? {
      ...emptyPODraft,
      sourcePiId: sourcePi.id,
      customer: sourcePi.customer,
      plNo: sourcePi.plNo || createRowId("PL"),
    } : { ...emptyPODraft });
    setNotice(null);
    setActiveModal("po");
  }

  function startCreateCraft() {
    setEditingCraftId(null);
    setCraftDraft({
      ...emptyCraftDraft,
      orderNo: `CRFT${Date.now().toString().slice(-9)}`,
      makeDate: new Date().toISOString().slice(0, 10),
    });
    setNotice(null);
    setActiveModal("craft");
  }

  function startEditPO(po: PORecord) {
    setEditingPoId(po.id);
    setPODraft({
      id: po.id,
      poType: po.poType,
      poNo: po.poNo,
      plNo: po.plNo ?? "",
      sourcePiId: po.sourcePiId,
      date: po.date,
      vendor: po.vendor,
      vendorAddress: po.vendorAddress,
      vendorContact: po.vendorContact,
      vendorEmail: po.vendorEmail,
      vendorTel: po.vendorTel,
      vendorFax: po.vendorFax,
      customer: po.customer,
      ourRefNo: po.ourRefNo,
      deliveryDate: po.deliveryDate,
      deliverTo: po.deliverTo,
      status: po.status,
      itemCode: po.itemCode,
      description: po.description,
      productType: po.productType,
      size: po.size,
      colors: po.colors,
      finished: po.finished,
      remarks: po.remarks,
      notes: po.notes,
      imageUrl: po.imageUrl,
      // Craft fields
      orderNo: po.orderNo,
      maker: po.maker,
      makeDate: po.makeDate,
      styleNo: po.styleNo,
      customerOrderNo: po.customerOrderNo,
      craftProductName: po.craftProductName,
      relatedOrderNo: po.relatedOrderNo,
      sheetSize: po.sheetSize,
      materialIn: po.materialIn,
      upCount: po.upCount,
      quantity: po.quantity,
      remainder: po.remainder,
      finishedQty: po.finishedQty,
      packCount: po.packCount,
      printMethod: po.printMethod,
      proofType: po.proofType,
      postProcess: po.postProcess,
      craftNotes: po.craftNotes,
    });
    setNotice(null);
    setActiveModal("po");
  }

  function startEditCraft(po: PORecord) {
    setEditingCraftId(po.id);
    setCraftDraft({
      id: po.id,
      poType: "craft",
      poNo: po.poNo,
      plNo: po.plNo ?? "",
      sourcePiId: "",
      date: po.date,
      vendor: po.vendor,
      vendorAddress: po.vendorAddress,
      vendorContact: po.vendorContact,
      vendorEmail: po.vendorEmail,
      vendorTel: po.vendorTel,
      vendorFax: po.vendorFax,
      customer: po.customer,
      ourRefNo: po.ourRefNo,
      deliveryDate: po.deliveryDate,
      deliverTo: po.deliverTo,
      status: po.status,
      itemCode: po.itemCode,
      description: po.description,
      productType: po.productType,
      size: po.size,
      colors: po.colors,
      finished: po.finished,
      remarks: po.remarks,
      notes: po.notes,
      imageUrl: po.imageUrl,
      // Craft fields
      orderNo: po.orderNo,
      maker: po.maker,
      makeDate: po.makeDate,
      styleNo: po.styleNo,
      customerOrderNo: po.customerOrderNo,
      craftProductName: po.craftProductName,
      relatedOrderNo: po.relatedOrderNo,
      sheetSize: po.sheetSize,
      materialIn: po.materialIn,
      upCount: po.upCount,
      quantity: po.quantity,
      remainder: po.remainder,
      finishedQty: po.finishedQty,
      packCount: po.packCount,
      printMethod: po.printMethod,
      proofType: po.proofType,
      postProcess: po.postProcess,
      craftNotes: po.craftNotes,
    });
    setNotice(null);
    setActiveModal("craft");
  }

  async function submitPODraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const now = new Date().toISOString();
    const draft = {
      id: editingPoId ?? createRowId("PO"),
      poNo: poDraft.poNo.trim() || createRowId("PO"),
      plNo: (poDraft.plNo ?? "").trim(),
      sourcePiId: poDraft.sourcePiId.trim(),
      date: poDraft.date,
      vendor: poDraft.vendor.trim(),
      vendorAddress: poDraft.vendorAddress.trim(),
      vendorContact: poDraft.vendorContact.trim(),
      vendorEmail: poDraft.vendorEmail.trim(),
      vendorTel: poDraft.vendorTel.trim(),
      vendorFax: poDraft.vendorFax.trim(),
      customer: poDraft.customer.trim(),
      ourRefNo: poDraft.ourRefNo.trim(),
      deliveryDate: poDraft.deliveryDate,
      deliverTo: poDraft.deliverTo.trim(),
      status: poDraft.status,
      itemCode: poDraft.itemCode.trim(),
      description: poDraft.description.trim(),
      productType: poDraft.productType.trim(),
      size: poDraft.size.trim(),
      colors: poDraft.colors.trim(),
      finished: poDraft.finished.trim(),
      remarks: poDraft.remarks.trim(),
      lines: [],
      packingRows: [],
      notes: poDraft.notes.trim(),
      imageUrl: poDraft.imageUrl.trim(),
      poType: "purchase" as const,
      orderNo: "",
      maker: "",
      makeDate: "",
      styleNo: "",
      customerOrderNo: "",
      craftProductName: "",
      relatedOrderNo: "",
      sheetSize: "",
      materialIn: "",
      upCount: "",
      quantity: 0,
      remainder: 0,
      finishedQty: 0,
      packCount: "",
      printMethod: [],
      proofType: [],
      postProcess: [],
      craftNotes: "",
    } satisfies PORecord;

    const linkedPi = draft.sourcePiId ? pis.find((item) => item.id === draft.sourcePiId || item.piNo === draft.sourcePiId) ?? null : null;
    const nextPi = linkedPi
      ? updatePITimeline(linkedPi, {
          purchaseGeneratedAt: touchTimelineValue(linkedPi.purchaseGeneratedAt, now),
          financeApprovedAt:
            draft.status !== "Draft" ? touchTimelineValue(linkedPi.financeApprovedAt, now) : linkedPi.financeApprovedAt,
          packingInfoGeneratedAt:
            draft.status === "Sent" || draft.status === "Closed"
              ? touchTimelineValue(linkedPi.packingInfoGeneratedAt, now)
              : linkedPi.packingInfoGeneratedAt,
          commercialInvoiceGeneratedAt: linkedPi.commercialInvoiceGeneratedAt,
          paymentConfirmedAt:
            draft.status === "Closed" ? touchTimelineValue(linkedPi.paymentConfirmedAt, now) : linkedPi.paymentConfirmedAt,
        })
      : null;

    if (!draft.poNo || !draft.customer) {
      setNotice(t("notice.poRequired"));
      return;
    }

    setPOs((current) => (editingPoId ? current.map((item) => (item.id === editingPoId ? draft : item)) : [draft, ...current]));

    try {
      if (editingPoId) {
        await apiUpdatePO(draft);
      } else {
        await apiCreatePO(draft);
      }
      let piSynced = false;
      if (nextPi) {
        try {
          await apiUpdatePI(nextPi);
          piSynced = true;
        } catch {
          piSynced = false;
        }
      }
      await refreshRemoteData();
      if (nextPi && !piSynced) {
        setPIs((current) => current.map((item) => (item.id === nextPi.id ? nextPi : item)));
      }
      setNotice(t("notice.saved"));
    } catch {
      setNotice(t("notice.savedLocally"));
    } finally {
      closeModal();
    }
  }

  async function submitCraftDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const draft: PORecord = {
      id: editingCraftId ?? createRowId("CRFT"),
      poType: "craft",
      poNo: craftDraft.poNo.trim() || craftDraft.orderNo || createRowId("CRFT"),
      plNo: (craftDraft.plNo ?? "").trim(),
      sourcePiId: "",
      date: craftDraft.date,
      vendor: craftDraft.vendor.trim(),
      vendorAddress: craftDraft.vendorAddress.trim(),
      vendorContact: craftDraft.vendorContact.trim(),
      vendorEmail: craftDraft.vendorEmail.trim(),
      vendorTel: craftDraft.vendorTel.trim(),
      vendorFax: craftDraft.vendorFax.trim(),
      customer: craftDraft.customer.trim(),
      ourRefNo: "",
      deliveryDate: craftDraft.deliveryDate,
      deliverTo: "",
      status: craftDraft.status,
      itemCode: "",
      description: "",
      productType: "",
      size: "",
      colors: "",
      finished: "",
      remarks: "",
      lines: [],
      packingRows: [],
      notes: craftDraft.notes.trim(),
      imageUrl: "",
      // Craft fields from form
      orderNo: craftDraft.orderNo.trim(),
      maker: craftDraft.maker.trim(),
      makeDate: craftDraft.makeDate,
      styleNo: craftDraft.styleNo.trim(),
      customerOrderNo: craftDraft.customerOrderNo.trim(),
      craftProductName: craftDraft.craftProductName.trim(),
      relatedOrderNo: craftDraft.relatedOrderNo.trim(),
      sheetSize: craftDraft.sheetSize.trim(),
      materialIn: craftDraft.materialIn.trim(),
      upCount: craftDraft.upCount.trim(),
      quantity: Number(craftDraft.quantity) || 0,
      remainder: Number(craftDraft.remainder) || 0,
      finishedQty: Number(craftDraft.finishedQty) || 0,
      packCount: craftDraft.packCount.trim(),
      printMethod: craftDraft.printMethod,
      proofType: craftDraft.proofType,
      postProcess: craftDraft.postProcess,
      craftNotes: craftDraft.craftNotes.trim(),
    };

    if (!draft.orderNo || !draft.customer) {
      setNotice(t("notice.poRequired"));
      return;
    }

    setPOs((current) => (editingCraftId ? current.map((item) => (item.id === editingCraftId ? draft : item)) : [draft, ...current]));

    try {
      if (editingCraftId) {
        await apiUpdatePO(draft);
      } else {
        await apiCreatePO(draft);
      }
      await refreshRemoteData();
      setNotice(t("notice.saved"));
    } catch {
      setNotice(t("notice.savedLocally"));
    } finally {
      closeModal();
    }
  }

  async function removePO(po: PORecord) {
    const confirmed = window.confirm(`${t("confirm.deletePO")} ${po.poNo}?`);
    if (!confirmed) return;

    setPOs((current) => current.filter((item) => item.id !== po.id));

    try {
      await apiDeletePO(po.id);
      await refreshRemoteData();
      setNotice(t("notice.deleted"));
    } catch {
      setNotice(t("notice.deletedLocally"));
    }
  }

  const quotePreviewTier = calculateQuoteTier(quoteTiers, quotePreviewQty);
  const quotePreviewCostItems = quoteLines.find((line) => line.costItems?.length)?.costItems ?? quoteLines[0]?.costItems ?? [];
  const quotePreviewUnitPrice = getQuoteUnitPrice({ tiers: quoteTiers, costItems: quotePreviewCostItems }, quotePreviewQty);
  const quotePreviewTotal = parseQuantityValue(quotePreviewQty) * quotePreviewUnitPrice;
  const quoteSupplierCount = quoteLines.reduce((total, line) => total + normalizeQuoteSuppliers(line.suppliers).filter((item) => item.trim()).length, 0);
  const quoteFilledLineCount = quoteLines.filter((line) => line.productCode.trim() || line.productName.trim() || line.description.trim()).length;
  const quoteProductCodeOptions = useMemo(() => getQuoteProductCodeOptions(products), [products]);
  const openPurchaseOrder = (poId: string) => {
    navigate(`/po/${encodeURIComponent(poId)}`);
  };
  const selectedPiId = new URLSearchParams(location.search).get("pi") ?? pis[0]?.id ?? "";
  const selectedPi = useMemo(() => pis.find((item) => item.id === selectedPiId || item.piNo === selectedPiId) ?? pis[0] ?? null, [pis, selectedPiId]);
  const selectedPiCustomer = getPartyDetails(customers.find((item) => item.name === selectedPi?.customer) ?? null);
  const getLinkedPOForPI = (pi: PIRecord) =>
    [...pos]
      .filter((po) => po.sourcePiId === pi.id || po.poNo === pi.piNo || po.plNo === pi.plNo)
      .sort((a, b) => `${b.date}${b.id}`.localeCompare(`${a.date}${a.id}`))[0] ?? null;
  const selectedPiVendor = (() => {
    const linkedPO = selectedPi ? getLinkedPOForPI(selectedPi) : null;
    const vendorName = linkedPO?.vendor || selectedPi?.vendor || "";
    return getPartyDetails(suppliers.find((item) => item.name === vendorName) ?? (vendorName ? { id: "", name: vendorName, address: linkedPO?.vendorAddress ?? "", contact: linkedPO?.vendorContact ?? "", email: linkedPO?.vendorEmail ?? "", phone: linkedPO?.vendorTel ?? "", website: "", notes: "", status: "active" } : null));
  })();
  const openProformaInvoice = (pi: PIRecord) => {
    window.open(pi.pdfUrl || `/pis/print?pi=${encodeURIComponent(pi.id)}`, "_blank", "noopener,noreferrer");
  };
  const openProformaInvoicePreview = (pi: PIRecord) => {
    navigate(`/pis/preview?pi=${encodeURIComponent(pi.id)}`);
  };
  const selectedCommercialInvoiceId = new URLSearchParams(location.search).get("ci") ?? pos[0]?.id ?? "";
  const selectedCommercialInvoice = useMemo(
    () => pos.find((item) => item.id === selectedCommercialInvoiceId || item.poNo === selectedCommercialInvoiceId || item.plNo === selectedCommercialInvoiceId) ?? pos[0] ?? null,
    [pos, selectedCommercialInvoiceId],
  );
  const selectedCommercialInvoiceVendor = getPurchaseOrderVendor(selectedCommercialInvoice);
  const selectedCommercialInvoiceCustomer = getPartyDetails(
    customers.find((item) => item.name === selectedCommercialInvoice?.customer) ?? (selectedCommercialInvoice?.customer ? {
      name: selectedCommercialInvoice.customer,
      address: selectedCommercialInvoice.deliverTo || "",
      contact: "",
      phone: "",
      email: "",
    } : null),
  );
  const openCommercialInvoice = (poId: string) => {
    navigate(`/commercial-invoices?ci=${encodeURIComponent(poId)}`);
  };
  const openPurchaseOrderPreviewFromPI = (pi: PIRecord) => {
    const po = getLinkedPOForPI(pi);
    if (!po) {
      setNotice(t("notice.noLinkedPO"));
      return;
    }
    openPurchaseOrder(po.id);
  };
  const openCommercialInvoiceFromPI = (pi: PIRecord) => {
    const po = getLinkedPOForPI(pi);
    if (!po) {
      setNotice(t("notice.noLinkedPO"));
      return;
    }
    const now = new Date().toISOString();
    const nextPi = updatePITimeline(pi, {
      commercialInvoiceGeneratedAt: touchTimelineValue(pi.commercialInvoiceGeneratedAt, now),
    });
    setPIs((current) => current.map((item) => (item.id === nextPi.id ? nextPi : item)));
    apiUpdatePI(nextPi).catch(() => {
      setPIs((current) => current.map((item) => (item.id === nextPi.id ? nextPi : item)));
    });
    openCommercialInvoice(po.id);
  };
  const openPurchaseOrderFromPI = (pi: PIRecord) => {
    const po = getLinkedPOForPI(pi);
    if (po) {
      openPurchaseOrder(po.id);
    } else {
      startCreatePO(pi);
    }
  };

  return (
    <div className={currentPage === "po-detail" || currentPage === "commercial-invoices" || currentPage === "pi-print" || currentPage === "pi-preview" ? "app-shell document-shell print-shell" : "app-shell"}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <IconHome2 size={22} strokeWidth={2.2} />
          </div>
          <div>
            <div className="brand-name">{t("appName")}</div>
            <div className="brand-subtitle">{t("appSubtitle")}</div>
          </div>
        </div>

        <nav className="side-nav" aria-label="primary">
          {navItems.map(({ to, key, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              aria-disabled={to === "/quotes" && !quoteAccessGranted}
              onClick={(event) => {
                if (to === "/quotes" && !quoteAccessGranted) {
                  event.preventDefault();
                  setNotice(t("notice.quoteAccessDenied"));
                }
              }}
              className={({ isActive }) => {
                const disabled = to === "/quotes" && !quoteAccessGranted;
                return `${isActive ? "side-link active" : "side-link"}${disabled ? " disabled" : ""}`;
              }}
            >
              <span className="side-link-icon">
                <Icon size={20} strokeWidth={2} />
              </span>
              <span>{t(key)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-card">
          <div className="sidebar-card-title">{t("settings.locale")}</div>
          <div className="locale-switcher" role="tablist" aria-label="language switcher">
            {(["zh-CN", "en-US"] as Locale[]).map((value) => (
              <button
                key={value}
                className={value === locale ? "locale-btn active" : "locale-btn"}
                onClick={() => setLocale(value)}
                type="button"
              >
                <IconLanguage size={16} strokeWidth={2} />
                <span>{value === "zh-CN" ? "中文" : "EN"}</span>
              </button>
            ))}
          </div>
          <p className="sidebar-card-copy">{t("settings.localeDesc")}</p>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="topbar-copy">
            <div className="breadcrumb">
              <span>{t("topbar.dashboard")}</span>
              <IconChevronRight size={14} strokeWidth={2} />
              <span>{t(pageTitleKey)}</span>
            </div>
            <h1>{t(pageTitleKey)}</h1>
          </div>

          <div className="topbar-search">
            <IconSearch size={16} strokeWidth={2} />
            <input
              type="search"
              placeholder={
                currentPage === "brands"
                  ? t("search.brands")
                  : currentPage === "customers"
                    ? t("search.customers")
                    : currentPage === "suppliers"
                    ? t("search.suppliers")
                  : currentPage === "quotes"
                        ? t("search.quotes")
                        : currentPage === "development"
                          ? t("search.development")
                  : currentPage === "pis"
                    ? t("search.pis")
                    : currentPage === "po" || currentPage === "po-detail"
                      ? t("search.po")
                      : currentPage === "commercial-invoices"
                        ? t("search.commercialInvoices")
                        : currentPage === "orders"
                        ? t("search.orders")
                            : currentPage === "contracts"
                              ? t("search.contracts")
                              : t("search.samples")
              }
            />
          </div>

          <div className="topbar-actions">
            <button className="icon-btn" type="button" aria-label={t("topbar.notifications")}>
              <IconBell size={18} strokeWidth={2} />
            </button>
            <button className="profile-chip" type="button" aria-label={t("topbar.profile")}>
              <IconUserCircle size={18} strokeWidth={2} />
              <span>{t("topbar.user")}</span>
            </button>
          </div>
        </header>

        {currentPage === "dashboard" ? (
          <section className="stats-grid">
            {statCards.map((item) => {
              const Icon = item.icon;
              return (
                <article className="stat-card" key={item.labelKey}>
                  <div className="stat-copy">
                    <span className="stat-label">{t(item.labelKey)}</span>
                    <strong className="stat-value">{item.value}</strong>
                  </div>
                  <div className="stat-icon">
                    <Icon size={20} strokeWidth={2} />
                  </div>
                </article>
              );
            })}
          </section>
        ) : null}

        {loading ? <div className="loading-bar">{t("notice.loading")}</div> : null}
        {notice ? <div className="notice-bar">{notice}</div> : null}

        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={<DashboardPage locale={locale} t={t} products={products} brands={brands} orders={orders} contracts={contracts} quotes={quotes} onEditProduct={startEditProduct} onDeleteProduct={removeProduct} onEditBrand={startEditBrand} onDeleteBrand={removeBrand} />}
          />
          <Route
            path="/products"
            element={
              <ProductsPage
                locale={locale}
                t={t}
                products={products}
                onStartCreate={startCreateProduct}
                onEditProduct={startEditProduct}
                onDeleteProduct={removeProduct}
              />
            }
          />
          <Route
            path="/brands"
            element={
              <BrandsPage
                locale={locale}
                t={t}
                brands={brands}
                onStartCreate={startCreateBrand}
                onEditBrand={startEditBrand}
                onDeleteBrand={removeBrand}
                onCheckBrands={handleCheckBrands}
              />
            }
          />
          <Route
            path="/brands/:brandId"
            element={
              <BrandDetailPage
                locale={locale}
                t={t}
              />
            }
          />
          <Route
            path="/customers/:customerId"
            element={
              <CustomerDetailPage
                locale={locale}
                t={t}
                customers={customers}
                quotes={quotes}
                pis={pis}
              />
            }
          />
          <Route
            path="/customers"
            element={
              <CustomersPage
                locale={locale}
                t={t}
                customers={customers}
                onStartCreate={startCreateCustomer}
                onEditCustomer={startEditCustomer}
                onDeleteCustomer={removeCustomer}
                onViewCustomer={(customer) => navigate(`/customers/${encodeURIComponent(customer.id)}`)}
              />
            }
          />
          <Route
            path="/suppliers"
            element={
              <SuppliersPage
                locale={locale}
                t={t}
                suppliers={suppliers}
                onStartCreate={startCreateSupplier}
                onEditSupplier={startEditSupplier}
                onDeleteSupplier={removeSupplier}
              />
            }
          />
          <Route
            path="/quotes"
            element={
              <QuotesPage
                locale={locale}
                t={t}
                quotes={quotes}
                customers={customers}
                brands={brands}
                quoteAccessGranted={quoteAccessGranted}
                onStartCreate={startCreateQuote}
                onEditQuote={startEditQuote}
                onDeleteQuote={removeQuote}
                onGeneratePI={generatePIFromQuote}
                onPreviewPI={generatePIFromQuote}
                quantityPreview={quotePreviewQty}
                setQuantityPreview={setQuotePreviewQty}
              />
            }
          />
          <Route
            path="/development"
            element={
              <DevelopmentPage
                t={t}
                developments={developments}
                quotes={quotes}
                onStartCreate={startCreateDevelopment}
                onEditDevelopment={startEditDevelopment}
                onDeleteDevelopment={removeDevelopment}
              />
            }
          />
          <Route
            path="/pis"
            element={
              <PIsPage
                locale={locale}
                t={t}
                pis={pis}
                pos={pos}
                onStartCreate={startCreatePI}
                onEditPI={startEditPI}
                onDeletePI={removePI}
                onOpenPurchaseOrder={openPurchaseOrderFromPI}
                onViewPurchaseOrder={openPurchaseOrderPreviewFromPI}
                onViewCommercialInvoice={openCommercialInvoiceFromPI}
                onPreviewPI={openProformaInvoicePreview}
                onGeneratePdf={openProformaInvoice}
                onGenerateFromOrder={generatePIFromOrder}
                onGenerateFromQuote={generatePIFromQuote}
                orders={orders}
                quotes={quotes}
              />
            }
          />
          <Route
            path="/pis/preview"
            element={
              <ProformaInvoicePage
                locale={locale}
                t={t}
                pis={pis}
                pos={pos}
                selectedPi={selectedPi}
                selectedPiCustomer={selectedPiCustomer}
                selectedPiVendor={selectedPiVendor}
                onSelectPi={(piId) => navigate(`/pis/preview?pi=${encodeURIComponent(piId)}`)}
                onExportPdf={() => window.print()}
              />
            }
          />
          <Route
            path="/pis/print"
            element={
              <ProformaInvoicePage
                locale={locale}
                t={t}
                pis={pis}
                pos={pos}
                selectedPi={selectedPi}
                selectedPiCustomer={selectedPiCustomer}
                selectedPiVendor={selectedPiVendor}
                onSelectPi={(piId) => navigate(`/pis/print?pi=${encodeURIComponent(piId)}`)}
                onExportPdf={() => window.print()}
              />
            }
          />
          <Route
            path="/po/:poId"
            element={
              <PoDetailPage
                locale={locale}
                t={t}
                pos={pos as PORecord[]}
              />
            }
          />
          <Route
            path="/po"
            element={
              <PurchaseOrderPage
                locale={locale}
                t={t}
                pos={pos as PORecord[]}
                onStartCreate={startCreatePO}
                onStartCraft={startCreateCraft}
                onEditPO={startEditPO}
                onEditCraft={startEditCraft}
                onDeletePO={removePO}
                onPreviewPO={(po) => navigate(`/po/${encodeURIComponent(po.id)}`)}
              />
            }
          />
          <Route
            path="/commercial-invoices"
            element={
              <CommercialInvoicePage
                locale={locale}
                t={t}
                pos={pos as PORecord[]}
                selectedPo={selectedCommercialInvoice as PORecord | null}
                selectedPoVendor={selectedCommercialInvoiceVendor}
                selectedPoCustomer={selectedCommercialInvoiceCustomer}
                onSelectPo={openCommercialInvoice}
                onExportPdf={() => window.print()}
              />
            }
          />
          <Route
            path="/orders"
            element={
              <OrdersPage
                locale={locale}
                t={t}
                orders={orders}
                onStartCreate={startCreateOrder}
                onEditOrder={startEditOrder}
                onDeleteOrder={removeOrder}
                onGeneratePI={generatePIFromOrder}
              />
            }
          />
          <Route
            path="/contracts"
            element={
              <ContractsPage
                locale={locale}
                t={t}
                contracts={contracts}
                onStartCreate={startCreateContract}
                onEditContract={startEditContract}
                onDeleteContract={removeContract}
              />
            }
          />
          <Route
            path="/settings"
            element={
              <SettingsPage
                locale={locale}
                t={t}
                currentPage={currentPage}
                quoteAccessGranted={quoteAccessGranted}
                onToggleQuoteAccess={setQuoteAccessGranted}
              />
            }
          />
        </Routes>

        {activeModal === "product" ? (
          <EditorModal title={editingProductId ? t("form.editProduct") : t("form.createProduct")} onClose={closeModal}>
            <form className="modal-form" onSubmit={submitProductDraft}>
              <div className="form-grid">
                <label>
                  <span>{t("form.productName")}</span>
                  <input
                    value={productDraft.name}
                    onChange={(event) => setProductDraft({ ...productDraft, name: event.target.value })}
                    placeholder={t("form.productNamePlaceholder")}
                  />
                </label>
                <label>
                  <span>{t("table.category")}</span>
                  <select
                    value={productDraft.categoryKey}
                    onChange={(event) => setProductDraft({ ...productDraft, categoryKey: event.target.value as Product["categoryKey"] })}
                  >
                    <option value="clothing">{t("category.clothing")}</option>
                    <option value="office">{t("category.office")}</option>
                    <option value="home">{t("category.home")}</option>
                    <option value="accessory">{t("category.accessory")}</option>
                  </select>
                </label>
                <label>
                  <span>{t("table.price")}</span>
                  <input
                    type="number"
                    min="0"
                    value={productDraft.price}
                    onChange={(event) => setProductDraft({ ...productDraft, price: event.target.value })}
                    placeholder="199"
                  />
                </label>
                <label>
                  <span>{t("table.stock")}</span>
                  <input
                    type="number"
                    min="0"
                    value={productDraft.stock}
                    onChange={(event) => setProductDraft({ ...productDraft, stock: event.target.value })}
                    placeholder="100"
                  />
                </label>
                <label>
                  <span>{t("table.status")}</span>
                  <select
                    value={productDraft.status}
                    onChange={(event) => setProductDraft({ ...productDraft, status: event.target.value as Product["status"] })}
                  >
                    <option value="In stock">{t("status.In stock")}</option>
                    <option value="Low stock">{t("status.Low stock")}</option>
                    <option value="Out of stock">{t("status.Out of stock")}</option>
                  </select>
                </label>
                <label>
                  <span>{t("form.productCodePrefix")}</span>
                  <input
                    value={productDraft.codePrefix}
                    onChange={(event) => setProductDraft({ ...productDraft, codePrefix: event.target.value })}
                    placeholder="SCL"
                  />
                </label>
              </div>

              <section className="editable-block">
                <div className="editable-head">
                  <div>
                    <strong>{t("form.productSuppliers")}</strong>
                    <p>{t("form.productSuppliersHelp")}</p>
                  </div>
                  <button
                    type="button"
                    className="secondary-button tiny-button"
                    onClick={() => setProductDraft((current) => ({ ...current, suppliers: [...current.suppliers, ""] }))}
                  >
                    <IconPlus size={16} strokeWidth={2} />
                    {t("button.addProductSupplier")}
                  </button>
                </div>
                <div className="editable-list">
                  {productDraft.suppliers.map((supplier, index) => (
                    <div className="editable-row" key={index}>
                      <input
                        value={supplier}
                        onChange={(event) =>
                          setProductDraft((current) => ({
                            ...current,
                            suppliers: current.suppliers.map((item, supplierIndex) => (supplierIndex === index ? event.target.value : item)),
                          }))
                        }
                        placeholder={t("form.productSupplierPlaceholder")}
                      />
                      <button
                        type="button"
                        className="action-link delete"
                        onClick={() =>
                          setProductDraft((current) => ({
                            ...current,
                            suppliers: current.suppliers.length > 1 ? current.suppliers.filter((_, supplierIndex) => supplierIndex !== index) : [""],
                          }))
                        }
                      >
                        <IconTrash size={16} strokeWidth={2} />
                        {t("action.delete")}
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="editable-block">
                <div className="editable-head">
                  <div>
                    <strong>{t("form.quoteProductCodes")}</strong>
                    <p>{t("form.quoteProductCodesHelp")}</p>
                  </div>
                  <button
                    type="button"
                    className="secondary-button tiny-button"
                    onClick={() =>
                      setProductDraft((current) => ({
                        ...current,
                        quoteProductCodes: [...current.quoteProductCodes, ""],
                      }))
                    }
                  >
                    <IconPlus size={16} strokeWidth={2} />
                    {t("button.addProductCode")}
                  </button>
                </div>
                <div className="editable-list">
                  {(productDraft.quoteProductCodes ?? []).map((code, index) => (
                    <div className="editable-row" key={`${productDraft.id ?? "product"}-code-${index}`}>
                      <input
                        value={code}
                        onChange={(event) =>
                          setProductDraft((current) => ({
                            ...current,
                            quoteProductCodes: (current.quoteProductCodes ?? []).map((item, codeIndex) => (codeIndex === index ? event.target.value : item)),
                          }))
                        }
                        placeholder={t("form.quoteProductCodePlaceholder")}
                      />
                      <button
                        type="button"
                        className="action-link delete"
                        onClick={() =>
                          setProductDraft((current) => ({
                            ...current,
                            quoteProductCodes:
                              (current.quoteProductCodes ?? []).length > 1
                                ? (current.quoteProductCodes ?? []).filter((_, codeIndex) => codeIndex !== index)
                                : [""],
                          }))
                        }
                      >
                        <IconTrash size={16} strokeWidth={2} />
                        {t("action.delete")}
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <div className="product-image-panel">
                <div className="product-image-preview">
                  {productDraft.imageUrl ? (
                    <img src={productDraft.imageUrl} alt={productDraft.name || t("form.productImagePreview")} />
                  ) : (
                    <div className="product-image-placeholder">
                      <IconPhoto size={22} strokeWidth={1.8} />
                      <span>{t("form.productImagePlaceholder")}</span>
                    </div>
                  )}
                </div>
                <div className="product-image-controls">
                  <label>
                    <span>{t("form.productImageUpload")}</span>
                    <input type="file" accept="image/*" onChange={handleProductImageUpload} />
                  </label>
                  <label>
                    <span>{t("form.productImageUrl")}</span>
                    <input
                      value={productDraft.imageUrl}
                      onChange={(event) => setProductDraft({ ...productDraft, imageUrl: event.target.value })}
                      placeholder="https://..."
                    />
                  </label>
                  <button type="button" className="secondary-button tiny-button" onClick={clearProductImage}>
                    {t("form.productImageClear")}
                  </button>
                </div>
              </div>

              <div className="form-actions">
                <button className="secondary-button" type="button" onClick={closeModal}>
                  {t("button.cancel")}
                </button>
                <button className="primary-button" type="submit">
                  {editingProductId ? t("button.save") : t("button.create")}
                </button>
              </div>
            </form>
          </EditorModal>
        ) : null}

        {activeModal === "brand" ? (
          <EditorModal title={editingBrandId ? t("form.editBrand") : t("form.createBrand")} onClose={closeModal}>
            <form className="modal-form" onSubmit={submitBrandDraft}>
              <div className="form-grid">
                <label>
                  <span>{t("form.brandName")}</span>
                  <input value={brandDraft.name} onChange={(event) => setBrandDraft({ ...brandDraft, name: event.target.value })} />
                </label>
                <label>
                  <span>{t("form.brandCode")}</span>
                  <input value={brandDraft.code} onChange={(event) => setBrandDraft({ ...brandDraft, code: event.target.value })} />
                </label>
                <label>
                  <span>{t("form.brandCustomer")}</span>
                  <input value={brandDraft.customer} onChange={(event) => setBrandDraft({ ...brandDraft, customer: event.target.value })} />
                </label>
                <label>
                  <span>{t("form.brandSupplier")}</span>
                  <input value={brandDraft.supplier} onChange={(event) => setBrandDraft({ ...brandDraft, supplier: event.target.value })} />
                </label>
                <label>
                  <span>{t("form.brandCountry")}</span>
                  <input value={brandDraft.country} onChange={(event) => setBrandDraft({ ...brandDraft, country: event.target.value })} />
                </label>
                <label>
                  <span>{t("form.brandStatus")}</span>
                  <select value={brandDraft.status} onChange={(event) => setBrandDraft({ ...brandDraft, status: event.target.value as Brand["status"] })}>
                    <option value="Active">{t("status.Active")}</option>
                    <option value="Inactive">{t("status.Inactive")}</option>
                  </select>
                </label>
                <label>
                  <span>{t("form.brandOwner")}</span>
                  <input value={brandDraft.owner} onChange={(event) => setBrandDraft({ ...brandDraft, owner: event.target.value })} />
                </label>
                <label className="full-span">
                  <span>{t("form.brandNotes")}</span>
                  <textarea rows={4} value={brandDraft.notes} onChange={(event) => setBrandDraft({ ...brandDraft, notes: event.target.value })} />
                </label>
              </div>

              <div className="form-actions">
                <button className="secondary-button" type="button" onClick={closeModal}>
                  {t("button.cancel")}
                </button>
                <button className="primary-button" type="submit">
                  {editingBrandId ? t("button.save") : t("button.create")}
                </button>
              </div>
            </form>
          </EditorModal>
        ) : null}

        {activeModal === "customer" ? (
          <EditorModal title={editingCustomerId ? t("form.editCustomer") : t("form.createCustomer")} onClose={closeModal}>
            <form className="modal-form" onSubmit={submitCustomerDraft}>
              <div className="form-grid">
                <label>
                  <span>{t("form.customerName")}</span>
                  <input value={customerDraft.name} onChange={(event) => setCustomerDraft({ ...customerDraft, name: event.target.value })} />
                </label>
                <label>
                  <span>{t("form.customerCode")}</span>
                  <input value={customerDraft.code} onChange={(event) => setCustomerDraft({ ...customerDraft, code: event.target.value })} />
                </label>
                <label>
                  <span>{t("form.customerCountry")}</span>
                  <input value={customerDraft.country} onChange={(event) => setCustomerDraft({ ...customerDraft, country: event.target.value })} />
                </label>
                <label>
                  <span>{t("form.customerContact")}</span>
                  <input value={customerDraft.contact} onChange={(event) => setCustomerDraft({ ...customerDraft, contact: event.target.value })} />
                </label>
                <label>
                  <span>{t("form.customerPhone")}</span>
                  <input value={customerDraft.phone} onChange={(event) => setCustomerDraft({ ...customerDraft, phone: event.target.value })} />
                </label>
                <label>
                  <span>{t("form.customerEmail")}</span>
                  <input value={customerDraft.email} onChange={(event) => setCustomerDraft({ ...customerDraft, email: event.target.value })} />
                </label>
                <label className="full-span">
                  <span>{t("form.customerAddress")}</span>
                  <input value={customerDraft.address} onChange={(event) => setCustomerDraft({ ...customerDraft, address: event.target.value })} />
                </label>
                <label>
                  <span>{t("form.customerStatus")}</span>
                  <select value={customerDraft.status} onChange={(event) => setCustomerDraft({ ...customerDraft, status: event.target.value as Customer["status"] })}>
                    <option value="Active">{t("status.Active")}</option>
                    <option value="Inactive">{t("status.Inactive")}</option>
                  </select>
                </label>
                <label className="full-span">
                  <span>{t("form.customerNotes")}</span>
                  <textarea rows={3} value={customerDraft.notes} onChange={(event) => setCustomerDraft({ ...customerDraft, notes: event.target.value })} />
                </label>
              </div>
              <div className="product-image-panel">
                <div className="product-image-preview">
                  {customerDraft.imageUrl ? (
                    <img src={customerDraft.imageUrl} alt={customerDraft.name || t("form.customerImagePreview")} />
                  ) : (
                    <div className="product-image-placeholder">
                      <IconUserCircle size={22} strokeWidth={1.8} />
                      <span>{t("form.customerImagePlaceholder")}</span>
                    </div>
                  )}
                </div>
                <div className="product-image-controls">
                  <label>
                    <span>{t("form.customerImageUpload")}</span>
                    <input type="file" accept="image/*" onChange={handleCustomerImageUpload} />
                  </label>
                  <label>
                    <span>{t("form.customerImageUrl")}</span>
                    <input
                      value={customerDraft.imageUrl}
                      onChange={(event) => setCustomerDraft({ ...customerDraft, imageUrl: event.target.value })}
                      placeholder="https://..."
                    />
                  </label>
                  <button type="button" className="secondary-button tiny-button" onClick={clearCustomerImage}>
                    {t("form.customerImageClear")}
                  </button>
                </div>
              </div>
              <div className="form-actions">
                <button className="secondary-button" type="button" onClick={closeModal}>
                  {t("button.cancel")}
                </button>
                <button className="primary-button" type="submit">
                  {editingCustomerId ? t("button.save") : t("button.create")}
                </button>
              </div>
            </form>
          </EditorModal>
        ) : null}

        {activeModal === "supplier" ? (
          <EditorModal title={editingSupplierId ? t("form.editSupplier") : t("form.createSupplier")} onClose={closeModal}>
            <form className="modal-form" onSubmit={submitSupplierDraft}>
              <div className="form-grid">
                <label>
                  <span>{t("form.supplierName")}</span>
                  <input value={supplierDraft.name} onChange={(event) => setSupplierDraft({ ...supplierDraft, name: event.target.value })} />
                </label>
                <label>
                  <span>{t("form.supplierCode")}</span>
                  <input value={supplierDraft.code} onChange={(event) => setSupplierDraft({ ...supplierDraft, code: event.target.value })} />
                </label>
                <label>
                  <span>{t("form.supplierCountry")}</span>
                  <input value={supplierDraft.country} onChange={(event) => setSupplierDraft({ ...supplierDraft, country: event.target.value })} />
                </label>
                <label>
                  <span>{t("form.supplierContact")}</span>
                  <input value={supplierDraft.contact} onChange={(event) => setSupplierDraft({ ...supplierDraft, contact: event.target.value })} />
                </label>
                <label>
                  <span>{t("form.supplierPhone")}</span>
                  <input value={supplierDraft.phone} onChange={(event) => setSupplierDraft({ ...supplierDraft, phone: event.target.value })} />
                </label>
                <label>
                  <span>{t("form.supplierEmail")}</span>
                  <input value={supplierDraft.email} onChange={(event) => setSupplierDraft({ ...supplierDraft, email: event.target.value })} />
                </label>
                <label className="full-span">
                  <span>{t("form.supplierAddress")}</span>
                  <input value={supplierDraft.address} onChange={(event) => setSupplierDraft({ ...supplierDraft, address: event.target.value })} />
                </label>
                <label>
                  <span>{t("form.supplierStatus")}</span>
                  <select value={supplierDraft.status} onChange={(event) => setSupplierDraft({ ...supplierDraft, status: event.target.value as Supplier["status"] })}>
                    <option value="Active">{t("status.Active")}</option>
                    <option value="Inactive">{t("status.Inactive")}</option>
                  </select>
                </label>
                <label className="full-span">
                  <span>{t("form.supplierNotes")}</span>
                  <textarea rows={3} value={supplierDraft.notes} onChange={(event) => setSupplierDraft({ ...supplierDraft, notes: event.target.value })} />
                </label>
              </div>
              <div className="form-actions">
                <button className="secondary-button" type="button" onClick={closeModal}>
                  {t("button.cancel")}
                </button>
                <button className="primary-button" type="submit">
                  {editingSupplierId ? t("button.save") : t("button.create")}
                </button>
              </div>
            </form>
          </EditorModal>
        ) : null}

        {activeModal === "quote" ? (
          <EditorModal className="quote-modal-card quote-workbench-modal" title={editingQuoteId ? t("form.editQuote") : t("form.createQuote")} onClose={closeModal}>
            <form className="modal-form quote-sheet-form quote-workbench-form" onSubmit={submitQuoteDraft}>
              <div className="quote-workbench-shell">
                <main className="quote-workbench-main">
                  <section className="quote-hero-panel">
                    <div className="quote-hero-copy">
                      <p className="quote-hero-eyebrow">{editingQuoteId ? t("form.editQuote") : t("form.createQuote")}</p>
                      <h3>{quoteDraft.item || quoteDraft.itemType || t("page.quotes")}</h3>
                      <p>{t("quote.sheetSubtitle")}</p>
                    </div>
                    <div className="quote-hero-actions">
                      <button type="button" className="secondary-button tiny-button" onClick={() => document.getElementById("quote-lines-panel")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                        {t("button.addQuoteLine")}
                      </button>
                      <button type="button" className="secondary-button tiny-button" onClick={() => document.getElementById("quote-tiers-panel")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                        {t("button.addQuoteTier")}
                      </button>
                    </div>
                  </section>

                  <section className="quote-header-panel">
                    <div className="quote-header-grid quote-header-grid-top">
                      <label>
                        <span>{t("form.quoteNo")}</span>
                        <input value={quoteDraft.quoteNo} onChange={(event) => setQuoteDraft({ ...quoteDraft, quoteNo: event.target.value })} placeholder="2606009" />
                      </label>
                      <label>
                        <span>{t("form.quoteDate")}</span>
                        <input type="date" value={quoteDraft.date} onChange={(event) => setQuoteDraft({ ...quoteDraft, date: event.target.value })} />
                      </label>
                      <label>
                        <span>{t("form.quoteModificationDate")}</span>
                        <input type="date" value={quoteDraft.modificationDate} onChange={(event) => setQuoteDraft({ ...quoteDraft, modificationDate: event.target.value })} />
                      </label>
                      <label>
                        <span>{t("form.quoteRegister")}</span>
                        <input value={quoteDraft.register} onChange={(event) => setQuoteDraft({ ...quoteDraft, register: event.target.value })} placeholder="朱佳毅" />
                      </label>
                    </div>
                    <div className="quote-header-grid quote-header-grid-mid">
                      <label className="full-span">
                        <span>{t("form.quoteItemType")}</span>
                        <input value={quoteDraft.itemType} onChange={(event) => setQuoteDraft({ ...quoteDraft, itemType: event.target.value })} placeholder="STONEY CLOVER LANE 感恩卡、信封和贴纸" />
                      </label>
                    </div>
                    <div className="quote-header-grid quote-header-grid-bottom">
                      <label>
                        <span>{t("form.quoteBrand")}</span>
                        <select value={quoteDraft.brand} onChange={(event) => setQuoteDraft({ ...quoteDraft, brand: event.target.value })}>
                          <option value="">-</option>
                          {brands.map((item) => (
                            <option key={item.id} value={item.name}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>{t("form.quoteLinkman")}</span>
                        <input value={quoteDraft.linkman} onChange={(event) => setQuoteDraft({ ...quoteDraft, linkman: event.target.value })} placeholder="Anly" />
                      </label>
                      <label>
                        <span>{t("form.quoteSalesperson")}</span>
                        <input value={quoteDraft.salesperson} onChange={(event) => setQuoteDraft({ ...quoteDraft, salesperson: event.target.value })} placeholder="Jason" />
                      </label>
                      <label>
                        <span>{t("form.quoteCustomer")}</span>
                        <select value={quoteDraft.customer} onChange={(event) => setQuoteDraft({ ...quoteDraft, customer: event.target.value })}>
                          <option value="">-</option>
                          {customers.map((item) => (
                            <option key={item.id} value={item.name}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="quote-header-grid quote-header-grid-image">
                      <label className="full-span">
                        <span>{t("form.quoteItem")}</span>
                        <input value={quoteDraft.item} onChange={(event) => setQuoteDraft({ ...quoteDraft, item: event.target.value })} placeholder="信封 / 贴纸 / 纸卡" />
                      </label>
                      <label className="full-span">
                        <span>{t("form.quoteImage")}</span>
                        <input value={quoteDraft.imageUrl} onChange={(event) => setQuoteDraft({ ...quoteDraft, imageUrl: event.target.value })} placeholder="https://..." />
                      </label>
                    </div>
                  </section>

                  <section className="quote-lines-panel" id="quote-lines-panel">
                    <div className="editable-head">
                      <div>
                        <strong>{t("table.quoteLines")}</strong>
                        <p>{t("quote.linesHelp")}</p>
                      </div>
                      <button type="button" className="secondary-button tiny-button" onClick={() => setQuoteLines((current) => [...current, createQuoteLine()])}>
                        <IconPlus size={16} strokeWidth={2} />
                        {t("button.addQuoteLine")}
                      </button>
                    </div>

                    <div className="quote-spec-panel">
                      <div className="editable-head">
                        <div>
                          <strong>{t("quote.specTitle")}</strong>
                          <p>TYPE、SIZE、COLOR、FINISHED 在报价录入页只允许选择，新增选项在这里维护。</p>
                        </div>
                      </div>
                      <div className="quote-spec-config">
                        {(Object.keys(quoteSpecFieldLabels) as QuoteSpecField[]).map((field) => (
                          <div className="quote-spec-config-row" key={field}>
                            <span>{quoteSpecFieldLabels[field]}</span>
                            <select value={quoteSpecNewValues[field]} onChange={(event) => setQuoteSpecNewValues((current) => ({ ...current, [field]: event.target.value }))}>
                              <option value="">选择已有选项</option>
                              {quoteSpecOptions[field].map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                            <input value={quoteSpecNewValues[field]} onChange={(event) => setQuoteSpecNewValues((current) => ({ ...current, [field]: event.target.value }))} placeholder={`新增 ${quoteSpecFieldLabels[field]} 选项`} />
                            <button type="button" className="secondary-button tiny-button" onClick={() => addQuoteSpecOption(field)}>
                              新增
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="quote-lines-table">
                      <div className="quote-lines-head">
                        <span>CHECK</span>
                        <span>IMAGE</span>
                        <span>ITEM</span>
                        <span>PRICE</span>
                        <span>SAMPLE</span>
                        <span>SPEC</span>
                        <span>PRICING</span>
                        <span>COST</span>
                        <span className="cost-col-toggle">{t("form.quoteCostToggle")}</span>
                      </div>
                      {quoteLines.map((line, index) => {
                        const hasCostItems = (line.costItems ?? []).length > 0;
                        const lineSuppliers = normalizeQuoteSuppliers(line.suppliers);
                        return (
                          <div className="quote-line-group" key={line.id ?? index} data-quote-line-index={index}>
                            <div className="quote-line-row">
                              <label className="quote-line-check">
                                <input type="checkbox" checked={Boolean(line.checked)} onChange={(event) => setQuoteLines((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, checked: event.target.checked } : row)))} />
                              </label>
                              <label className="quote-line-image">
                                {line.imageUrl ? <img src={line.imageUrl} alt={line.productName || line.productCode || "quote line"} /> : <div className="quote-line-thumb placeholder"><IconPhoto size={18} strokeWidth={2} /></div>}
                                <input value={line.imageUrl} onChange={(event) => setQuoteLines((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, imageUrl: event.target.value } : row)))} placeholder="Image URL" />
                              </label>
                              <div className="quote-line-item">
                                <select value={getQuoteLineProductId(line)} onChange={(event) => updateQuoteLineWithProduct(index, event.target.value)}>
                                  <option value="">{t("form.lineSamplePlaceholder")}</option>
                                  {products.map((product) => (
                                    <option key={product.id} value={product.id}>
                                      {getProductLabel(product)}
                                    </option>
                                  ))}
                                </select>
                                <input value={line.productName} onChange={(event) => setQuoteLines((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, productName: event.target.value } : row)))} placeholder="产品名称" />
                                <input
                                  list={`quote-product-code-options-${index}`}
                                  value={line.productCode}
                                  onChange={(event) => {
                                    const nextCode = event.target.value;
                                    const match = findProductMatchByCode(products, nextCode);
                                    setQuoteLines((current) =>
                                      current.map((row, rowIndex) =>
                                        rowIndex === index
                                          ? match
                                            ? {
                                                ...row,
                                                productCode: match.code,
                                                productName: match.product.name,
                                                suppliers: match.product.suppliers.length ? [...match.product.suppliers] : normalizeQuoteSuppliers(row.suppliers),
                                                price: Number(match.product.price || 0),
                                                imageUrl: row.imageUrl || match.product.imageUrl,
                                              }
                                            : { ...row, productCode: nextCode }
                                          : row,
                                      ),
                                    );
                                  }}
                                  onBlur={(event) => {
                                    const match = findProductMatchByCode(products, event.target.value);
                                    if (!match) return;
                                    setQuoteLines((current) =>
                                      current.map((row, rowIndex) =>
                                        rowIndex === index
                                          ? {
                                              ...row,
                                              productCode: match.code,
                                              productName: match.product.name,
                                              suppliers: match.product.suppliers.length ? [...match.product.suppliers] : normalizeQuoteSuppliers(row.suppliers),
                                              price: Number(match.product.price || 0),
                                              imageUrl: row.imageUrl || match.product.imageUrl,
                                            }
                                          : row,
                                      ),
                                    );
                                  }}
                                  placeholder={t("form.quoteProductCodePlaceholder")}
                                />
                                <datalist id={`quote-product-code-options-${index}`}>
                                  {quoteProductCodeOptions.map((option) => (
                                    <option key={`${line.id ?? index}-${option}`} value={option} />
                                  ))}
                                </datalist>
                              </div>
                              <input type="number" min="0" step="0.01" value={line.price} onChange={(event) => setQuoteLines((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, price: Number(event.target.value) } : row)))} placeholder="0" />
                              <input type="number" min="0" step="1" value={line.sample} onChange={(event) => setQuoteLines((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, sample: Number(event.target.value) } : row)))} placeholder="0" />
                              <div className="quote-line-specs">
                                <button
                                  type="button"
                                  className={`spec-lock-btn${line.specLocked ? " locked" : ""}`}
                                  onClick={() => setQuoteLines((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, specLocked: !row.specLocked } : row)))}
                                  title={line.specLocked ? t("form.specUnlock") : t("form.specLock")}
                                >
                                  {line.specLocked ? <IconLock size={14} strokeWidth={2} /> : <IconLockOpen size={14} strokeWidth={2} />}
                                </button>
                                {line.specLocked ? (
                                  <div className="quote-spec-readonly">
                                    {(["type", "size", "color", "finished"] as QuoteSpecField[]).map((field) => {
                                      const value = line[quoteSpecValueKeys[field]];
                                      return value ? (
                                        <div key={field} className="spec-readonly-line">
                                          <span className="spec-readonly-label">{quoteSpecFieldLabels[field]}:</span>
                                          <span className="spec-readonly-value">{value}</span>
                                        </div>
                                      ) : null;
                                    })}
                                    {line.remarksValue ? (
                                      <div className="spec-readonly-line remarks">
                                        <span className="spec-readonly-label">REMARKS:</span>
                                        <span className="spec-readonly-value">{line.remarksValue}</span>
                                      </div>
                                    ) : null}
                                  </div>
                                ) : (
                                  <>
                                    <label>
                                      <span>{quoteSpecFieldLabels.type}</span>
                                      <select value={line.typeValue ?? ""} onChange={(event) => setQuoteLineSpecValue(index, "type", event.target.value)}>
                                        <option value="">-</option>
                                        {quoteSpecOptions.type.map((option) => (
                                          <option key={option} value={option}>
                                            {option}
                                          </option>
                                        ))}
                                      </select>
                                    </label>
                                    <label>
                                      <span>{quoteSpecFieldLabels.size}</span>
                                      <select value={line.sizeValue ?? ""} onChange={(event) => setQuoteLineSpecValue(index, "size", event.target.value)}>
                                        <option value="">-</option>
                                        {quoteSpecOptions.size.map((option) => (
                                          <option key={option} value={option}>
                                            {option}
                                          </option>
                                        ))}
                                      </select>
                                    </label>
                                    <label>
                                      <span>{quoteSpecFieldLabels.color}</span>
                                      <select value={line.colorValue ?? ""} onChange={(event) => setQuoteLineSpecValue(index, "color", event.target.value)}>
                                        <option value="">-</option>
                                        {quoteSpecOptions.color.map((option) => (
                                          <option key={option} value={option}>
                                            {option}
                                          </option>
                                        ))}
                                      </select>
                                    </label>
                                    <label>
                                      <span>{quoteSpecFieldLabels.finished}</span>
                                      <select value={line.finishedValue ?? ""} onChange={(event) => setQuoteLineSpecValue(index, "finished", event.target.value)}>
                                        <option value="">-</option>
                                        {quoteSpecOptions.finished.map((option) => (
                                          <option key={option} value={option}>
                                            {option}
                                          </option>
                                        ))}
                                      </select>
                                    </label>
                                    <label className="quote-line-remarks">
                                      <span>REMARKS</span>
                                      <textarea rows={5} value={line.remarksValue ?? ""} onChange={(event) => setQuoteLineRemarks(index, event.target.value)} placeholder="备注说明" />
                                    </label>
                                  </>
                                )}
                              </div>
                              <textarea rows={5} value={line.pricingNotes} onChange={(event) => setQuoteLines((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, pricingNotes: event.target.value } : row)))} placeholder={"1M: ...\n2.5M: ...\n5M: ..."} />
                              <div className="quote-line-cost">
                                <input value={line.cost} onChange={(event) => setQuoteLines((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, cost: event.target.value } : row)))} placeholder="900/M" />
                                <button type="button" className="action-link delete" onClick={() => setQuoteLines((current) => current.filter((_, rowIndex) => rowIndex !== index))}>
                                  <IconTrash size={16} strokeWidth={2} />
                                  {t("action.delete")}
                                </button>
                              </div>
                              <div className="quote-line-cost-side">
                                {hasCostItems ? (
                                  <div className="cost-mini-list">
                                    {(line.costItems ?? []).map((item, costIndex) => (
                                      <div className="cost-mini-row" key={item.id ?? costIndex}>
                                        <select
                                          value={item.label}
                                          onChange={(event) =>
                                            setQuoteLines((current) =>
                                              current.map((row, rowIndex) =>
                                                rowIndex === index
                                                  ? {
                                                      ...row,
                                                      costItems: (row.costItems ?? []).map((costItem, rowCostIndex) =>
                                                        rowCostIndex === costIndex ? { ...costItem, label: event.target.value } : costItem,
                                                      ),
                                                    }
                                                  : row,
                                              ),
                                            )
                                          }
                                        >
                                          {quoteCostItemOptions.map((option) => (
                                            <option key={option} value={option}>
                                              {option}
                                            </option>
                                          ))}
                                        </select>
                                        <input
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          value={item.amount}
                                          onChange={(event) =>
                                            setQuoteLines((current) =>
                                              current.map((row, rowIndex) =>
                                                rowIndex === index
                                                  ? {
                                                      ...row,
                                                      costItems: (row.costItems ?? []).map((costItem, rowCostIndex) =>
                                                        rowCostIndex === costIndex ? { ...costItem, amount: Number(event.target.value) } : costItem,
                                                      ),
                                                    }
                                                  : row,
                                              ),
                                            )
                                          }
                                          placeholder="0.18"
                                        />
                                        <button
                                          type="button"
                                          className="action-link delete"
                                          onClick={() =>
                                            setQuoteLines((current) =>
                                              current.map((row, rowIndex) =>
                                                rowIndex === index
                                                  ? { ...row, costItems: (row.costItems ?? []).filter((_, rowCostIndex) => rowCostIndex !== costIndex) }
                                                  : row,
                                              ),
                                            )
                                          }
                                        >
                                          <IconTrash size={14} strokeWidth={2} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ) : null}
                                <button
                                  type="button"
                                  className="secondary-button tiny-button cost-add-btn"
                                  onClick={() =>
                                    setQuoteLines((current) =>
                                      current.map((row, rowIndex) =>
                                        rowIndex === index
                                          ? {
                                              ...row,
                                              costItems: [...(row.costItems ?? []), { id: createLineItemId(), label: quoteCostItemOptions[0], amount: 0 }],
                                            }
                                          : row,
                                      ),
                                    )
                                  }
                                >
                                  <IconPlus size={14} strokeWidth={2} />
                                </button>
                              </div>
                            </div>
                            <div className="quote-line-suppliers">
                              <div className="quote-line-suppliers-head">
                                <span>{t("form.quoteSuppliers")}</span>
                                <button type="button" className="secondary-button tiny-button" onClick={() => addQuoteLineSupplier(index)}>
                                  <IconPlus size={14} strokeWidth={2} />
                                  {t("button.addQuoteSupplier")}
                                </button>
                              </div>
                              <div className="quote-line-supplier-list">
                                {lineSuppliers.map((supplier, supplierIndex) => (
                                  <div className="quote-line-supplier-row" key={`${line.id ?? index}-supplier-${supplierIndex}`} data-quote-line-supplier-index={supplierIndex}>
                                    <input
                                      list="quote-supplier-options"
                                      value={supplier}
                                      onChange={(event) => setQuoteLineSupplierValue(index, supplierIndex, event.target.value)}
                                      placeholder={t("form.quoteSupplierPlaceholder")}
                                    />
                                    <button
                                      type="button"
                                      className="action-link delete"
                                      onClick={() => removeQuoteLineSupplier(index, supplierIndex)}
                                      disabled={lineSuppliers.length === 1 && !supplier.trim()}
                                    >
                                      <IconTrash size={14} strokeWidth={2} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <datalist id="quote-supplier-options">
                        {supplierNameOptions.map((supplierName) => (
                          <option key={supplierName} value={supplierName} />
                        ))}
                      </datalist>
                    </div>
                  </section>

                  <section className="quote-tier-panel" id="quote-tiers-panel">
                    <div className="editable-block">
                      <div className="editable-head">
                        <button type="button" className="toggle-btn tier-toggle" onClick={() => { const el = document.getElementById("quote-tiers-body"); if (el) el.style.display = el.style.display === "none" ? "block" : "none"; }}>
                          {t("form.quoteTierToggle")}
                        </button>
                        <strong>{t("form.quoteTier")}</strong>
                        <button type="button" className="secondary-button tiny-button" onClick={() => setQuoteTiers((current) => [...current, { id: createLineItemId(), quantity: "", unitPrice: 0 }])}>
                          <IconPlus size={16} strokeWidth={2} />
                          {t("button.addQuoteTier")}
                        </button>
                      </div>
                      <div className="editable-list" id="quote-tiers-body">
                        {quoteTiers.map((item, index) => (
                          <div className="editable-row tier-row" key={item.id ?? index}>
                            <input value={item.quantity} onChange={(event) => setQuoteTiers((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, quantity: event.target.value } : row)))} placeholder="1M" />
                            <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(event) => setQuoteTiers((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, unitPrice: Number(event.target.value) } : row)))} placeholder="0.52" />
                            <button type="button" className="action-link delete" onClick={() => setQuoteTiers((current) => current.filter((_, rowIndex) => rowIndex !== index))}>
                              <IconTrash size={16} strokeWidth={2} />
                              {t("action.delete")}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  <label className="full-span quote-notes-field">
                    <span>{t("form.quoteNotes")}</span>
                    <textarea rows={4} value={quoteDraft.notes} onChange={(event) => setQuoteDraft({ ...quoteDraft, notes: event.target.value })} />
                  </label>

                  <div className="form-actions quote-form-actions">
                    <button className="secondary-button" type="button" onClick={closeModal}>
                      {t("button.cancel")}
                    </button>
                    <button className="primary-button" type="submit">
                      {editingQuoteId ? t("button.save") : t("button.create")}
                    </button>
                  </div>
                </main>

                <aside className="quote-workbench-rail">
                  <section className="quote-preview-card quote-preview-rail">
                    <div>
                      <strong>{t("table.quoteId")}</strong>
                      <p>{quoteDraft.quoteNo || "-"}</p>
                    </div>
                    <div>
                      <strong>{t("form.quoteStatus")}</strong>
                      <p>{t(`status.${quoteDraft.status}`)}</p>
                    </div>
                    <div>
                      <strong>{t("button.previewCalc")}</strong>
                      <p>{quotePreviewTier ? `${quotePreviewTier.quantity} · ${formatMoney(quotePreviewUnitPrice, locale)}` : "-"}</p>
                    </div>
                    <div>
                      <strong>{t("table.amount")}</strong>
                      <p>{formatMoney(quotePreviewTotal, locale)}</p>
                    </div>
                  </section>

                  <section className="quote-rail-card">
                    <div className="editable-head">
                      <div>
                        <strong>{t("quote.summaryTitle")}</strong>
                        <p>{t("quote.summaryHelp")}</p>
                      </div>
                    </div>
                    <div className="quote-summary-list">
                      <div>
                        <span>{t("quote.summaryLines")}</span>
                        <strong>{quoteFilledLineCount}</strong>
                      </div>
                      <div>
                        <span>{t("quote.summarySuppliers")}</span>
                        <strong>{quoteSupplierCount}</strong>
                      </div>
                      <div>
                        <span>{t("quote.summaryTiers")}</span>
                        <strong>{quoteTiers.length}</strong>
                      </div>
                    </div>
                  </section>
                </aside>
              </div>
            </form>
          </EditorModal>
        ) : null}

        {activeModal === "development" ? (
          <EditorModal className="quote-modal-card" title={editingDevelopmentId ? t("form.editDevelopment") : t("form.createDevelopment")} onClose={closeModal}>
            <form className="modal-form quote-sheet-form" onSubmit={submitDevelopmentDraft}>
              <div className="quote-preview-card quote-preview-wide">
                <div>
                  <strong>{t("table.developmentNo")}</strong>
                  <p>{developmentDraft.developmentNo || "-"}</p>
                </div>
                <div>
                  <strong>{t("form.developmentStatus")}</strong>
                  <p>{t(`status.${developmentDraft.status}`)}</p>
                </div>
                <div>
                  <strong>{t("form.developmentQuote")}</strong>
                  <p>{developmentDraft.sourceQuoteNo || "-"}</p>
                </div>
                <div>
                  <strong>{t("table.customer")}</strong>
                  <p>{developmentDraft.customer || "-"}</p>
                </div>
              </div>

              <section className="quote-header-panel">
                <div className="quote-header-grid">
                  <label>
                    <span>{t("form.developmentNo")}</span>
                    <input value={developmentDraft.developmentNo} onChange={(event) => setDevelopmentDraft({ ...developmentDraft, developmentNo: event.target.value })} placeholder="DV2606001" />
                  </label>
                  <label>
                    <span>{t("form.developmentDate")}</span>
                    <input type="date" value={developmentDraft.date} onChange={(event) => setDevelopmentDraft({ ...developmentDraft, date: event.target.value })} />
                  </label>
                  <label>
                    <span>{t("form.developmentModificationDate")}</span>
                    <input type="date" value={developmentDraft.modificationDate} onChange={(event) => setDevelopmentDraft({ ...developmentDraft, modificationDate: event.target.value })} />
                  </label>
                  <label>
                    <span>{t("form.developmentRegister")}</span>
                    <input value={developmentDraft.register} onChange={(event) => setDevelopmentDraft({ ...developmentDraft, register: event.target.value })} placeholder="朱佳毅" />
                  </label>
                  <label>
                    <span>{t("form.developmentQuote")}</span>
                    <select value={developmentDraft.sourceQuoteId} onChange={(event) => updateDevelopmentQuote(event.target.value)}>
                      <option value="">{t("form.developmentQuote")}</option>
                      {quotes.map((quote) => (
                        <option key={quote.id} value={quote.id}>
                          {quote.quoteNo || quote.id} · {quote.customer}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>{t("form.developmentBrand")}</span>
                    <input value={developmentDraft.brand} onChange={(event) => setDevelopmentDraft({ ...developmentDraft, brand: event.target.value })} placeholder="STONEY CLOVER LANE" />
                  </label>
                  <label>
                    <span>{t("form.developmentCustomer")}</span>
                    <input value={developmentDraft.customer} onChange={(event) => setDevelopmentDraft({ ...developmentDraft, customer: event.target.value })} placeholder="GMS" />
                  </label>
                  <label>
                    <span>{t("form.developmentLinkman")}</span>
                    <input value={developmentDraft.linkman} onChange={(event) => setDevelopmentDraft({ ...developmentDraft, linkman: event.target.value })} placeholder="Anly" />
                  </label>
                  <label>
                    <span>{t("form.developmentSalesperson")}</span>
                    <input value={developmentDraft.salesperson} onChange={(event) => setDevelopmentDraft({ ...developmentDraft, salesperson: event.target.value })} placeholder="Jason" />
                  </label>
                  <label>
                    <span>{t("form.developmentItemType")}</span>
                    <input value={developmentDraft.itemType} onChange={(event) => setDevelopmentDraft({ ...developmentDraft, itemType: event.target.value })} placeholder="STONEY CLOVER LANE 感恩卡、信封和贴纸" />
                  </label>
                  <label>
                    <span>{t("form.developmentItem")}</span>
                    <input value={developmentDraft.item} onChange={(event) => setDevelopmentDraft({ ...developmentDraft, item: event.target.value })} placeholder="感恩卡 / 信封 / 贴纸" />
                  </label>
                  <label>
                    <span>{t("form.developmentImage")}</span>
                    <input value={developmentDraft.imageUrl} onChange={(event) => setDevelopmentDraft({ ...developmentDraft, imageUrl: event.target.value })} placeholder="https://..." />
                  </label>
                  <label>
                    <span>{t("form.developmentStatus")}</span>
                    <select value={developmentDraft.status} onChange={(event) => setDevelopmentDraft({ ...developmentDraft, status: event.target.value as DevelopmentRecord["status"] })}>
                      <option value="Draft">{t("status.Draft")}</option>
                      <option value="In progress">{t("status.In progress")}</option>
                      <option value="Confirmed">{t("status.Confirmed")}</option>
                      <option value="Closed">{t("status.Closed")}</option>
                    </select>
                  </label>
                </div>
              </section>

              <section className="quote-lines-panel" id="development-lines-panel">
                <div className="editable-head">
                  <div>
                    <strong>{t("section.development")}</strong>
                    <p>{t("development.linesHelp")}</p>
                  </div>
                  <button type="button" className="secondary-button tiny-button" onClick={() => setDevelopmentLines((current) => [...current, createDevelopmentLine()])}>
                    <IconPlus size={16} strokeWidth={2} />
                    {t("button.addDevelopment")}
                  </button>
                </div>

                <div className="quote-lines-table">
                  <div className="quote-lines-head">
                    <span>{t("form.developmentLineImage")}</span>
                    <span>{t("form.developmentLineProductCode")}</span>
                    <span>{t("form.developmentLineProductName")}</span>
                    <span>{t("form.developmentLineDescription")}</span>
                    <span>{t("form.developmentLineLocked")}</span>
                  </div>
                  {developmentLines.map((line, index) => (
                    <div className="quote-line-group" key={line.id ?? index}>
                      <div className="quote-line-row">
                        <label className="quote-line-check">
                          <input type="checkbox" checked={Boolean(line.checked)} onChange={(event) => setDevelopmentLines((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, checked: event.target.checked } : row)))} />
                          <span />
                        </label>
                        <label className="quote-line-image">
                          {line.imageUrl ? <img src={line.imageUrl} alt={line.productName || line.productCode || "development line"} /> : <div className="quote-line-thumb placeholder"><IconPhoto size={18} strokeWidth={2} /></div>}
                        </label>
                        <div className="quote-line-item">
                          <select value={getDevelopmentLineProductId(line)} onChange={(event) => updateDevelopmentLineWithProduct(index, event.target.value)}>
                            <option value="">{t("form.lineSamplePlaceholder")}</option>
                            {products.map((product) => (
                              <option value={product.id} key={product.id}>
                                {getProductLabel(product)}
                              </option>
                            ))}
                          </select>
                          <input value={line.productCode} onChange={(event) => setDevelopmentLines((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, productCode: event.target.value } : row)))} placeholder={t("form.lineProductCode")} />
                          <input value={line.productName} onChange={(event) => setDevelopmentLines((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, productName: event.target.value } : row)))} placeholder={t("form.lineProductName")} />
                        </div>
                        <div className="quote-line-specs">
                          <div className="quote-spec-readonly">
                            {(Object.keys(quoteSpecFieldLabels) as QuoteSpecField[]).map((field) => {
                              const value = line[quoteSpecValueKeys[field]];
                              return value ? (
                                <div key={field} className="quote-spec-chip">
                                  <span className="spec-readonly-label">{quoteSpecFieldLabels[field]}:</span>
                                  <span>{value}</span>
                                </div>
                              ) : null;
                            })}
                          </div>
                          <div className="quote-spec-editor">
                            <label>
                              <span>{quoteSpecFieldLabels.type}</span>
                              <select value={line.typeValue ?? ""} onChange={(event) => setDevelopmentLineSpecValue(index, "type", event.target.value)}>
                                <option value="">{quoteSpecFieldLabels.type}</option>
                                {quoteSpecOptions.type.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label>
                              <span>{quoteSpecFieldLabels.size}</span>
                              <select value={line.sizeValue ?? ""} onChange={(event) => setDevelopmentLineSpecValue(index, "size", event.target.value)}>
                                <option value="">{quoteSpecFieldLabels.size}</option>
                                {quoteSpecOptions.size.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label>
                              <span>{quoteSpecFieldLabels.color}</span>
                              <select value={line.colorValue ?? ""} onChange={(event) => setDevelopmentLineSpecValue(index, "color", event.target.value)}>
                                <option value="">{quoteSpecFieldLabels.color}</option>
                                {quoteSpecOptions.color.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label>
                              <span>{quoteSpecFieldLabels.finished}</span>
                              <select value={line.finishedValue ?? ""} onChange={(event) => setDevelopmentLineSpecValue(index, "finished", event.target.value)}>
                                <option value="">{quoteSpecFieldLabels.finished}</option>
                                {quoteSpecOptions.finished.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="quote-line-remarks">
                              <span>{t("pi.remarks")}</span>
                              <textarea rows={3} value={line.remarksValue ?? ""} onChange={(event) => setDevelopmentLineRemarks(index, event.target.value)} />
                            </label>
                          </div>
                        </div>
                        <label className="quote-line-cost">
                          <span>{t("form.developmentLineLocked")}</span>
                          <button type="button" className={`toggle-btn${line.specLocked ? " active" : ""}`} onClick={() => setDevelopmentLines((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, specLocked: !row.specLocked } : row)))}>
                            {line.specLocked ? t("form.specLock") : t("form.specUnlock")}
                          </button>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="quote-toolbar">
                <label className="inline-field quote-item-field">
                  <span>{t("development.sourceHelp")}</span>
                  <input value={developmentDraft.sourceQuoteNo || developmentDraft.sourceQuoteId} readOnly placeholder={t("form.developmentQuote")} />
                </label>
              </div>

              <div className="quote-tier-panel">
                <label>
                  <span>{t("form.developmentNotes")}</span>
                  <textarea rows={4} value={developmentDraft.notes} onChange={(event) => setDevelopmentDraft({ ...developmentDraft, notes: event.target.value })} />
                </label>
              </div>

              <div className="form-actions">
                <button className="secondary-button" type="button" onClick={closeModal}>
                  {t("button.cancel")}
                </button>
                <button className="primary-button" type="submit">
                  {editingDevelopmentId ? t("button.save") : t("button.create")}
                </button>
              </div>
            </form>
          </EditorModal>
        ) : null}

        {activeModal === "pi" ? (
          <EditorModal className="pi-modal-card" title={editingPIId ? t("form.editPI") : t("form.createPI")} onClose={closeModal}>
            <form className="modal-form pi-sheet-form" onSubmit={submitPIDraft}>
              <section className="pi-meta-panel">
                <div className="editable-head">
                  <div>
                    <strong>{t("pi.sheetTitle")}</strong>
                    <p>{t("pi.sheetSubtitle")}</p>
                  </div>
                  <span className="brand-pill">{piDraft.status || t("status.Draft")}</span>
                </div>
                <div className="pi-meta-grid">
                  <label>
                    <span>{t("form.piPlNo")}</span>
                    <input value={piDraft.plNo} onChange={(event) => setPIDraft({ ...piDraft, plNo: event.target.value })} />
                  </label>
                  <label>
                    <span>{t("form.piNo")}</span>
                    <input value={piDraft.piNo} onChange={(event) => setPIDraft({ ...piDraft, piNo: event.target.value })} />
                  </label>
                  <label>
                    <span>{t("form.piCustomer")}</span>
                    <select value={piDraft.customer} onChange={(event) => setPIDraft({ ...piDraft, customer: event.target.value })}>
                      <option value="">-</option>
                      {customers.map((item) => (
                        <option key={item.id} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>{t("form.piBrand")}</span>
                    <select value={piDraft.brand} onChange={(event) => setPIDraft({ ...piDraft, brand: event.target.value })}>
                      <option value="">-</option>
                      {brands.map((item) => (
                        <option key={item.id} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>{t("form.piStatus")}</span>
                    <select value={piDraft.status} onChange={(event) => setPIDraft({ ...piDraft, status: event.target.value as PIRecord["status"] })}>
                      <option value="Draft">{t("status.Draft")}</option>
                      <option value="Generated">{t("status.Generated")}</option>
                      <option value="Sent">{t("status.Sent")}</option>
                      <option value="Closed">{t("status.Closed")}</option>
                    </select>
                  </label>
                  <label>
                    <span>{t("form.piGeneratedAt")}</span>
                    <input type="datetime-local" value={piDraft.generatedAt.slice(0, 16)} onChange={(event) => setPIDraft({ ...piDraft, generatedAt: new Date(event.target.value).toISOString() })} />
                  </label>
                  <label>
                    <span>{t("form.piGeneratedBy")}</span>
                    <input value={piDraft.generatedBy} onChange={(event) => setPIDraft({ ...piDraft, generatedBy: event.target.value })} />
                  </label>
                  <label>
                    <span>{t("form.piOurRefNo")}</span>
                    <input value={piDraft.ourRefNo} onChange={(event) => setPIDraft({ ...piDraft, ourRefNo: event.target.value })} />
                  </label>
                  <label>
                    <span>{t("form.piDeliveryDate")}</span>
                    <input type="date" value={piDraft.deliveryDate} onChange={(event) => setPIDraft({ ...piDraft, deliveryDate: event.target.value })} />
                  </label>
                  <label className="full-span">
                    <span>{t("form.piDeliverTo")}</span>
                    <input value={piDraft.deliverTo} onChange={(event) => setPIDraft({ ...piDraft, deliverTo: event.target.value })} placeholder="Deliver to" />
                  </label>
                </div>
              </section>

              <section className="pi-size-panel">
                <div className="editable-head">
                  <div>
                    <strong>{t("pi.quantityTitle")}</strong>
                    <p>{t("pi.quantitySubtitle")}</p>
                  </div>
                </div>
                <div className="pi-meta-grid">
                  <label>
                    <span>{t("form.piOrderQty")}</span>
                    <input type="number" min="0" value={piDraft.orderQty} onChange={(event) => setPIDraft({ ...piDraft, orderQty: Number(event.target.value) })} />
                  </label>
                  <label>
                    <span>{t("form.piDeductedQty")}</span>
                    <input type="number" min="0" value={piDraft.deductedQty} onChange={(event) => setPIDraft({ ...piDraft, deductedQty: Number(event.target.value) })} />
                  </label>
                  <label>
                    <span>{t("form.piOutstandingQty")}</span>
                    <input type="number" min="0" value={piDraft.outstandingQty} onChange={(event) => setPIDraft({ ...piDraft, outstandingQty: Number(event.target.value) })} />
                  </label>
                  <label>
                    <span>{t("form.piInStockQty")}</span>
                    <input type="number" min="0" value={piDraft.inStockQty} onChange={(event) => setPIDraft({ ...piDraft, inStockQty: Number(event.target.value) })} />
                  </label>
                  <label>
                    <span>{t("form.piStockOutQty")}</span>
                    <input type="number" min="0" value={piDraft.stockOutQty} onChange={(event) => setPIDraft({ ...piDraft, stockOutQty: Number(event.target.value) })} />
                  </label>
                </div>
              </section>

              <div className="pi-spec-layout">
                <section className="pi-spec-panel">
                  <div className="editable-head">
                    <div>
                      <strong>{t("pi.specTitle")}</strong>
                      <p>{t("pi.specSubtitle")}</p>
                    </div>
                    <button type="button" className="secondary-button tiny-button" onClick={() => setPIDraft((current) => ({ ...current, imageUrl: current.imageUrl || "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80" }))}>
                      <IconPhoto size={16} strokeWidth={2} />
                      {t("pi.fillImage")}
                    </button>
                  </div>
                  <div className="pi-spec-grid">
                    <label>
                      <span>{t("pi.itemCode")}</span>
                      <input value={piDraft.itemCode} onChange={(event) => setPIDraft({ ...piDraft, itemCode: event.target.value })} />
                    </label>
                    <label>
                      <span>{t("pi.productType")}</span>
                      <input value={piDraft.productType} onChange={(event) => setPIDraft({ ...piDraft, productType: event.target.value })} />
                    </label>
                    <label className="full-span">
                      <span>{t("pi.description")}</span>
                      <textarea rows={3} value={piDraft.description} onChange={(event) => setPIDraft({ ...piDraft, description: event.target.value })} />
                    </label>
                    <label>
                      <span>{t("pi.size")}</span>
                      <input value={piDraft.size} onChange={(event) => setPIDraft({ ...piDraft, size: event.target.value })} />
                    </label>
                    <label>
                      <span>{t("pi.colors")}</span>
                      <input value={piDraft.colors} onChange={(event) => setPIDraft({ ...piDraft, colors: event.target.value })} />
                    </label>
                    <label className="full-span">
                      <span>{t("pi.finished")}</span>
                      <input value={piDraft.finished} onChange={(event) => setPIDraft({ ...piDraft, finished: event.target.value })} />
                    </label>
                    <label className="full-span">
                      <span>{t("pi.remarks")}</span>
                      <textarea rows={3} value={piDraft.remarks} onChange={(event) => setPIDraft({ ...piDraft, remarks: event.target.value })} />
                    </label>
                  </div>
                </section>

                <aside className="pi-image-panel">
                  <div className="editable-head">
                    <div>
                      <strong>{t("pi.imageTitle")}</strong>
                      <p>{t("pi.imageSubtitle")}</p>
                    </div>
                  </div>
                  <div className="pi-image-frame">
                    {piDraft.imageUrl ? <img src={piDraft.imageUrl} alt={piDraft.itemCode || piDraft.piNo || "PI"} /> : <div className="pi-image-placeholder">{t("pi.imagePlaceholder")}</div>}
                  </div>
                  <label className="pi-image-input">
                    <span>{t("pi.imageUrl")}</span>
                    <input value={piDraft.imageUrl} onChange={(event) => setPIDraft({ ...piDraft, imageUrl: event.target.value })} placeholder="https://..." />
                  </label>
                </aside>
              </div>

              <section className="pi-size-panel">
                <div className="editable-head">
                  <div>
                    <strong>{t("pi.sizeTitle")}</strong>
                    <p>{t("pi.sizeSubtitle")}</p>
                  </div>
                </div>
                {piSizeDetails.map((line, index) => (
                  <div className="pi-size" key={line.id ?? index}>
                    <div className="pi-size-card-header">
                      <strong>Size #{index + 1}</strong>
                      <div className="pi-size-card-actions">
                        <button type="button" className="delete" onClick={() => setPISizeDetails((current) => current.filter((_, rowIndex) => rowIndex !== index))}>
                          <IconTrash size={16} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                    <div className="pi-size-card-body">
                      <label>
                        <span>{t("pi.size")}</span>
                        <input value={line.size} onChange={(event) => setPISizeDetails((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, size: event.target.value } : row)))} placeholder="14-36" />
                      </label>
                      <label>
                        <span>{t("pi.quantity")}</span>
                        <input type="number" min="0" value={line.quantity} onChange={(event) => setPISizeDetails((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, quantity: Number(event.target.value) } : row)))} placeholder="20000" />
                      </label>
                    </div>
                  </div>
                ))}
                <button type="button" className="pi-add-line-btn" onClick={() => setPISizeDetails((current) => [...current, { id: createLineItemId(), size: "", quantity: 0 }])}>
                  <IconPlus size={16} strokeWidth={2} />
                  {t("button.addPISizeRow")}
                </button>
              </section>

              <section className="pi-line-panel">
                <div className="editable-head">
                  <div>
                    <strong>{t("table.piLines")}</strong>
                    <p>{t("pi.lineSubtitle")}</p>
                  </div>
                </div>
                {piLines.map((line, index) => (
                  <div className="pi-line-card" key={line.id ?? index}>
                    <div className="pi-line-card-header">
                      <strong>Line #{index + 1}</strong>
                      <div className="pi-line-card-actions">
                        <button type="button" className="delete" onClick={() => setPILines((current) => current.filter((_, rowIndex) => rowIndex !== index))}>
                          <IconTrash size={16} strokeWidth={2} />
                          {t("action.delete")}
                        </button>
                      </div>
                    </div>
                    <div className="pi-line-card-body">
                      <label className="pi-line-full">
                        <span>{t("form.lineProduct")}</span>
                        <select value={getPILineProductId(line)} onChange={(event) => updatePILineWithProduct(index, event.target.value)}>
                          <option value="">{t("form.lineSamplePlaceholder")}</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {getProductLabel(product)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>{t("form.lineSupplier")}</span>
                        <input value={line.supplier} onChange={(event) => setPILines((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, supplier: event.target.value } : row)))} placeholder={t("form.lineSupplier")} />
                      </label>
                      <label>
                        <span>{t("form.lineProductCode")}</span>
                        <input value={line.productCode} onChange={(event) => setPILines((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, productCode: event.target.value } : row)))} placeholder={t("form.lineProductCode")} />
                      </label>
                      <label className="pi-line-full">
                        <span>{t("form.lineProductName")}</span>
                        <input value={line.productName} onChange={(event) => setPILines((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, productName: event.target.value } : row)))} placeholder={t("form.lineProductName")} />
                      </label>
                      <label>
                        <span>{t("form.lineQuantity")}</span>
                        <input type="number" min="0" value={line.quantity} onChange={(event) => setPILines((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, quantity: Number(event.target.value) } : row)))} placeholder={t("form.lineQuantity")} />
                      </label>
                      <label>
                        <span>{t("form.lineUnitPrice")}</span>
                        <input type="number" min="0" step="0.01" value={line.unitPrice} onChange={(event) => setPILines((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, unitPrice: Number(event.target.value) } : row)))} placeholder={t("form.lineUnitPrice")} />
                      </label>
                    </div>
                  </div>
                ))}
                <button type="button" className="pi-add-line-btn" onClick={() => setPILines((current) => [...current, { id: createLineItemId(), productCode: "", productName: "", supplier: "", quantity: 1, unitPrice: 0 }])}>
                  <IconPlus size={16} strokeWidth={2} />
                  {t("button.addPILine")}
                </button>
              </section>

              <div className="pi-footer-grid">
                <label className="full-span">
                  <span>{t("form.piPdfUrl")}</span>
                  <input value={piDraft.pdfUrl} onChange={(event) => setPIDraft({ ...piDraft, pdfUrl: event.target.value })} placeholder="https://..." />
                </label>
                <label className="full-span">
                  <span>{t("form.piNotes")}</span>
                  <textarea rows={3} value={piDraft.notes} onChange={(event) => setPIDraft({ ...piDraft, notes: event.target.value })} />
                </label>
              </div>

              <section className="pi-timeline-editor">
                <div className="editable-head">
                  <div>
                    <strong>{t("pi.timelineTitle")}</strong>
                    <p>{t("pi.timelineSubtitle")}</p>
                  </div>
                </div>
                <p className="pi-timeline-note">{t("pi.timelineAutoNote")}</p>
              </section>

              <div className="form-actions">
                <button className="secondary-button" type="button" onClick={closeModal}>
                  {t("button.cancel")}
                </button>
                <button className="primary-button" type="submit">
                  {editingPIId ? t("button.save") : t("button.create")}
                </button>
              </div>
            </form>
          </EditorModal>
        ) : null}

        {activeModal === "order" ? (
          <EditorModal title={editingOrderId ? t("form.editOrder") : t("form.createOrder")} onClose={closeModal}>
            <form className="modal-form" onSubmit={submitOrderDraft}>
              <div className="form-grid">
                <label>
                  <span>{t("form.customerName")}</span>
                  <input
                    value={orderDraft.customer}
                    onChange={(event) => setOrderDraft({ ...orderDraft, customer: event.target.value })}
                    placeholder={t("form.customerNamePlaceholder")}
                  />
                </label>
                <label>
                  <span>{t("form.orderProduct")}</span>
                  <input
                    value={orderDraft.product}
                    onChange={(event) => setOrderDraft({ ...orderDraft, product: event.target.value })}
                    placeholder={t("form.orderProductPlaceholder")}
                  />
                </label>
                <label>
                  <span>{t("form.orderStatus")}</span>
                  <select
                    value={orderDraft.status}
                    onChange={(event) => setOrderDraft({ ...orderDraft, status: event.target.value as Order["status"] })}
                  >
                    <option value="Pending">{t("status.Pending")}</option>
                    <option value="Paid">{t("status.Paid")}</option>
                    <option value="Packed">{t("status.Packed")}</option>
                    <option value="Shipped">{t("status.Shipped")}</option>
                    <option value="Completed">{t("status.Completed")}</option>
                  </select>
                </label>
                <label>
                  <span>{t("form.orderTotal")}</span>
                  <input
                    type="number"
                    min="0"
                    value={orderDraft.total}
                    onChange={(event) => setOrderDraft({ ...orderDraft, total: event.target.value })}
                    placeholder="1990"
                  />
                </label>
                <label>
                  <span>{t("form.orderChannel")}</span>
                  <input
                    value={orderDraft.channel}
                    onChange={(event) => setOrderDraft({ ...orderDraft, channel: event.target.value })}
                    placeholder="线上"
                  />
                </label>
              </div>

              <div className="form-actions">
                <button className="secondary-button" type="button" onClick={closeModal}>
                  {t("button.cancel")}
                </button>
                <button className="primary-button" type="submit">
                  {editingOrderId ? t("button.save") : t("button.create")}
                </button>
              </div>
            </form>
          </EditorModal>
        ) : null}

        {activeModal === "contract" ? (
          <EditorModal title={editingContractId ? t("form.editContract") : t("form.createContract")} onClose={closeModal}>
            <form className="modal-form" onSubmit={submitContractDraft}>
              <div className="form-grid">
                <label>
                  <span>{t("form.contractTitle")}</span>
                  <input
                    value={contractDraft.title}
                    onChange={(event) => setContractDraft({ ...contractDraft, title: event.target.value })}
                    placeholder={t("form.contractTitlePlaceholder")}
                  />
                </label>
                <label>
                  <span>{t("form.contractClient")}</span>
                  <input
                    value={contractDraft.client}
                    onChange={(event) => setContractDraft({ ...contractDraft, client: event.target.value })}
                    placeholder={t("form.contractClientPlaceholder")}
                  />
                </label>
                <label>
                  <span>{t("form.contractStatus")}</span>
                  <select
                    value={contractDraft.status}
                    onChange={(event) => setContractDraft({ ...contractDraft, status: event.target.value as Contract["status"] })}
                  >
                    <option value="Draft">{t("status.Draft")}</option>
                    <option value="Review">{t("status.Review")}</option>
                    <option value="Active">{t("status.Active")}</option>
                    <option value="Expired">{t("status.Expired")}</option>
                  </select>
                </label>
                <label>
                  <span>{t("form.contractAmount")}</span>
                  <input
                    type="number"
                    min="0"
                    value={contractDraft.amount}
                    onChange={(event) => setContractDraft({ ...contractDraft, amount: event.target.value })}
                    placeholder="186000"
                  />
                </label>
                <label>
                  <span>{t("form.contractDeadline")}</span>
                  <input
                    type="date"
                    value={contractDraft.deadline}
                    onChange={(event) => setContractDraft({ ...contractDraft, deadline: event.target.value })}
                  />
                </label>
              </div>

              <div className="form-actions">
                <button className="secondary-button" type="button" onClick={closeModal}>
                  {t("button.cancel")}
                </button>
                <button className="primary-button" type="submit">
                  {editingContractId ? t("button.save") : t("button.create")}
                </button>
              </div>
            </form>
          </EditorModal>
        ) : null}

        {activeModal === "po" ? (
          <EditorModal title={editingPoId ? t("form.editPO") : t("form.createPO")} onClose={closeModal}>
            <form className="modal-form" onSubmit={submitPODraft}>
              <div className="form-grid">
                <label>
                  <span>{t("table.poNo")}</span>
                  <input value={poDraft.poNo} onChange={(event) => setPODraft({ ...poDraft, poNo: event.target.value })} placeholder="PO2603428" />
                </label>
                <label>
                  <span>{t("table.customer")}</span>
                  <input value={poDraft.customer} onChange={(event) => setPODraft({ ...poDraft, customer: event.target.value })} placeholder={t("form.customerPlaceholder")} />
                </label>
                <label>
                  <span>{t("table.poVendor")}</span>
                  <input value={poDraft.vendor} onChange={(event) => setPODraft({ ...poDraft, vendor: event.target.value })} placeholder={t("form.vendorPlaceholder")} />
                </label>
                <label>
                  <span>{t("table.poDate")}</span>
                  <input type="date" value={poDraft.date} onChange={(event) => setPODraft({ ...poDraft, date: event.target.value })} />
                </label>
                <label>
                  <span>{t("table.poRefNo")}</span>
                  <input value={poDraft.ourRefNo} onChange={(event) => setPODraft({ ...poDraft, ourRefNo: event.target.value })} />
                </label>
                <label>
                  <span>{t("form.piDeliverTo")}</span>
                  <input value={poDraft.deliverTo} onChange={(event) => setPODraft({ ...poDraft, deliverTo: event.target.value })} />
                </label>
                <label>
                  <span>{t("form.piDeliveryDate")}</span>
                  <input type="date" value={poDraft.deliveryDate} onChange={(event) => setPODraft({ ...poDraft, deliveryDate: event.target.value })} />
                </label>
                <label>
                  <span>{t("table.status")}</span>
                  <select value={poDraft.status} onChange={(event) => setPODraft({ ...poDraft, status: event.target.value as PORecord["status"] })}>
                    <option value="Draft">{t("status.Draft")}</option>
                    <option value="Confirmed">{t("status.Confirmed")}</option>
                    <option value="Sent">{t("status.Sent")}</option>
                    <option value="Closed">{t("status.Closed")}</option>
                  </select>
                </label>
                <label>
                  <span>{t("po.itemCode")}</span>
                  <input value={poDraft.itemCode} onChange={(event) => setPODraft({ ...poDraft, itemCode: event.target.value })} />
                </label>
                <label className="full-span">
                  <span>{t("po.description")}</span>
                  <input value={poDraft.description} onChange={(event) => setPODraft({ ...poDraft, description: event.target.value })} />
                </label>
                <label>
                  <span>{t("po.productType")}</span>
                  <input value={poDraft.productType} onChange={(event) => setPODraft({ ...poDraft, productType: event.target.value })} />
                </label>
                <label>
                  <span>{t("po.size")}</span>
                  <input value={poDraft.size} onChange={(event) => setPODraft({ ...poDraft, size: event.target.value })} />
                </label>
                <label>
                  <span>{t("po.colors")}</span>
                  <input value={poDraft.colors} onChange={(event) => setPODraft({ ...poDraft, colors: event.target.value })} />
                </label>
                <label>
                  <span>{t("po.finished")}</span>
                  <input value={poDraft.finished} onChange={(event) => setPODraft({ ...poDraft, finished: event.target.value })} />
                </label>
                <label className="full-span">
                  <span>{t("po.remarks")}</span>
                  <textarea rows={3} value={poDraft.remarks} onChange={(event) => setPODraft({ ...poDraft, remarks: event.target.value })} />
                </label>
              </div>

              <div className="form-actions">
                <button className="secondary-button" type="button" onClick={closeModal}>
                  {t("button.cancel")}
                </button>
                <button className="primary-button" type="submit">
                  {editingPoId ? t("button.save") : t("button.create")}
                </button>
              </div>
            </form>
          </EditorModal>
        ) : null}

        {activeModal === "craft" ? (
          <EditorModal title={editingCraftId ? t("form.editPO") : t("form.createPO")} onClose={closeModal}>
            <form className="modal-form" onSubmit={submitCraftDraft}>
              <div className="form-grid">
                <label><span>{t("craft.orderNo")}</span><input value={craftDraft.orderNo} onChange={(e) => setCraftDraft({ ...craftDraft, orderNo: e.target.value })} placeholder="260605006" /></label>
                <label><span>{t("table.customer")}</span><input value={craftDraft.customer} onChange={(e) => setCraftDraft({ ...craftDraft, customer: e.target.value })} placeholder="022" /></label>
                <label><span>{t("form.piDeliveryDate")}</span><input type="date" value={craftDraft.deliveryDate} onChange={(e) => setCraftDraft({ ...craftDraft, deliveryDate: e.target.value })} /></label>
                <label>
                  <span>{t("table.status")}</span>
                  <select value={craftDraft.status} onChange={(e) => setCraftDraft({ ...craftDraft, status: e.target.value as PORecord["status"] })}>
                    <option value="Draft">{t("status.Draft")}</option><option value="Confirmed">{t("status.Confirmed")}</option><option value="Sent">{t("status.Sent")}</option><option value="Closed">{t("status.Closed")}</option>
                  </select>
                </label>
                <label><span>{t("craft.maker")}</span><input value={craftDraft.maker} onChange={(e) => setCraftDraft({ ...craftDraft, maker: e.target.value })} placeholder="FC007" /></label>
                <label><span>{t("craft.makeDate")}</span><input type="date" value={craftDraft.makeDate} onChange={(e) => setCraftDraft({ ...craftDraft, makeDate: e.target.value })} /></label>

                {/* 款号信息 */}
                <label><span>{t("craft.styleNo")}</span><input value={craftDraft.styleNo} onChange={(e) => setCraftDraft({ ...craftDraft, styleNo: e.target.value })} placeholder="SKI DEV 挂牌" /></label>
                <label><span>{t("craft.customerOrderNo")}</span><input value={craftDraft.customerOrderNo} onChange={(e) => setCraftDraft({ ...craftDraft, customerOrderNo: e.target.value })} /></label>
                <label><span>{t("craft.productName")}</span><input value={craftDraft.craftProductName} onChange={(e) => setCraftDraft({ ...craftDraft, craftProductName: e.target.value })} placeholder="250g双铜 标规" /></label>
                <label><span>{t("craft.relatedOrderNo")}</span><input value={craftDraft.relatedOrderNo} onChange={(e) => setCraftDraft({ ...craftDraft, relatedOrderNo: e.target.value })} placeholder="26006882" /></label>

                {/* 规格 */}
                <label><span>{t("craft.sheetSize")}</span><input value={craftDraft.sheetSize} onChange={(e) => setCraftDraft({ ...craftDraft, sheetSize: e.target.value })} placeholder="230 * 325" /></label>
                <label><span>{t("craft.materialIn")}</span><input value={craftDraft.materialIn} onChange={(e) => setCraftDraft({ ...craftDraft, materialIn: e.target.value })} placeholder="35" /></label>
                <label><span>{t("craft.upCount")}</span><input value={craftDraft.upCount} onChange={(e) => setCraftDraft({ ...craftDraft, upCount: e.target.value })} placeholder="9" /></label>

                {/* 数量 */}
                <label><span>{t("craft.quantity")}</span><input type="number" min="0" value={craftDraft.quantity || ""} onChange={(e) => setCraftDraft({ ...craftDraft, quantity: Number(e.target.value) || 0 })} placeholder="315" /></label>
                <label><span>{t("craft.remainder")}</span><input type="number" min="0" value={craftDraft.remainder || ""} onChange={(e) => setCraftDraft({ ...craftDraft, remainder: Number(e.target.value) || 0 })} placeholder="200" /></label>
                <label><span>{t("craft.finishedQty")}</span><input type="number" min="0" value={craftDraft.finishedQty || ""} onChange={(e) => setCraftDraft({ ...craftDraft, finishedQty: Number(e.target.value) || 0 })} placeholder="115" /></label>
                <label><span>{t("craft.packCount")}</span><input value={craftDraft.packCount} onChange={(e) => setCraftDraft({ ...craftDraft, packCount: e.target.value })} /></label>

                {/* 印刷方式 - 多选 */}
                <label className="full-span">
                  <span>{t("craft.printMethod")}</span>
                  <div className="craft-check-group">
                    {(["single_side", "double_side", "work_and_turn", "work_and_tumble"] as PrintMethod[]).map((m) => (
                      <label key={m} className="craft-check-item">
                        <input type="checkbox" checked={craftDraft.printMethod.includes(m)} onChange={(e) => {
                          if (e.target.checked) setCraftDraft({ ...craftDraft, printMethod: [...craftDraft.printMethod, m] });
                          else setCraftDraft({ ...craftDraft, printMethod: craftDraft.printMethod.filter((x) => x !== m) });
                        }} />
                        <span>{t(`craft.print${m.charAt(0).toUpperCase() + m.slice(1).replace(/_(.)/g, (_, c) => c.toUpperCase())}`)}</span>
                      </label>
                    ))}
                  </div>
                </label>

                {/* 看样类型 - 多选 */}
                <label className="full-span">
                  <span>{t("craft.proofType")}</span>
                  <div className="craft-check-group">
                    {(["sample", "ps_plate", "ctp_plate"] as ProofType[]).map((m) => (
                      <label key={m} className="craft-check-item">
                        <input type="checkbox" checked={craftDraft.proofType.includes(m)} onChange={(e) => {
                          if (e.target.checked) setCraftDraft({ ...craftDraft, proofType: [...craftDraft.proofType, m] });
                          else setCraftDraft({ ...craftDraft, proofType: craftDraft.proofType.filter((x) => x !== m) });
                        }} />
                        <span>{t(`craft.proof${m.charAt(0).toUpperCase() + m.slice(1).replace(/_(.)/g, (_, c) => c.toUpperCase())}`)}</span>
                      </label>
                    ))}
                  </div>
                </label>

                {/* 后道要求 - 多选 */}
                <label className="full-span">
                  <span>{t("craft.postProcess")}</span>
                  <div className="craft-post-grid">
                    {(["printing", "laminating", "mounting", "die_cutting", "uv_coating"] as PostProcess[]).map((m) => (
                      <label key={m} className="craft-post-item">
                        <input type="checkbox" checked={craftDraft.postProcess.includes(m)} onChange={(e) => {
                          if (e.target.checked) setCraftDraft({ ...craftDraft, postProcess: [...craftDraft.postProcess, m] });
                          else setCraftDraft({ ...craftDraft, postProcess: craftDraft.postProcess.filter((x) => x !== m) });
                        }} />
                        <span>{t(`craft.post${m.charAt(0).toUpperCase() + m.slice(1).replace(/_(.)/g, (_, c) => c.toUpperCase())}`)}</span>
                      </label>
                    ))}
                  </div>
                </label>

                {/* 备注 */}
                <label className="full-span">
                  <span>{t("craft.notes")}</span>
                  <textarea rows={3} value={craftDraft.craftNotes} onChange={(e) => setCraftDraft({ ...craftDraft, craftNotes: e.target.value })} placeholder="单面四色印 覆哑膜 轻刀裱 logo上UV" />
                </label>
              </div>

              <div className="form-actions">
                <button className="secondary-button" type="button" onClick={closeModal}>{t("button.cancel")}</button>
                <button className="primary-button" type="submit">{editingCraftId ? t("button.save") : t("button.create")}</button>
              </div>
            </form>
          </EditorModal>
        ) : null}
      </main>
    </div>
  );
}

function SectionShell({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="section-card">
      <div className="section-head">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function DashboardPage({
  locale,
  t,
  products,
  brands,
  orders,
  contracts,
  quotes,
  onEditProduct,
  onDeleteProduct,
  onEditBrand,
  onDeleteBrand,
}: {
  locale: Locale;
  t: (key: string) => string;
  products: Product[];
  brands: Brand[];
  orders: typeof fallbackOrders;
  contracts: typeof fallbackContracts;
  quotes: Quote[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onEditBrand: (brand: Brand) => void;
  onDeleteBrand: (brand: Brand) => void;
}) {
  const recentQuotes = useMemo(() => {
    return [...quotes]
      .sort((a, b) => (b.modificationDate || b.date).localeCompare(a.modificationDate || a.date))
      .slice(0, 10);
  }, [quotes]);

  const duplicateGroups = useMemo(() => {
    const groups = new Map<string, Quote[]>();
    const now = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;
    for (const q of recentQuotes) {
      const key = `${q.brand}::${q.customer}`;
      const qDate = new Date(q.modificationDate || q.date);
      if (now.getTime() - qDate.getTime() < oneDayMs) {
        const existing = groups.get(key) || [];
        existing.push(q);
        groups.set(key, existing);
      }
    }
    const dups = new Map<string, Quote[]>();
    for (const [key, qs] of groups) {
      if (qs.length > 1) dups.set(key, qs);
    }
    return dups;
  }, [recentQuotes]);
  return (
    <div className="page-stack">
      <SectionShell
        title={t("section.products")}
        action={
          <Link className="primary-button" to="/products">
            <IconPlus size={18} strokeWidth={2} />
            {t("button.addProduct")}
          </Link>
        }
      >
        <Table
        columns={[t("table.image"), t("table.productId"), t("table.productName"), t("table.supplier"), t("table.category"), t("table.price"), t("table.stock"), t("table.actions")]}
        rows={products.slice(0, 2).map((item) => [
          renderProductThumb(item, item.name),
          item.id,
          item.name,
          getProductSupplierLabel(item),
          t(`category.${item.categoryKey}`),
          formatMoney(item.price, locale),
          String(item.stock),
            <TableActions key={item.id} t={t} onEdit={() => onEditProduct(item)} onDelete={() => onDeleteProduct(item)} />,
          ])}
        />
      </SectionShell>

      <SectionShell
        title={t("dashboard.recentQuotes")}
        action={
          <Link className="secondary-button" to="/quotes">
            <IconFileInvoice size={18} strokeWidth={2} />
            {t("section.quotes")}
          </Link>
        }
      >
        <p className="section-desc">{t("dashboard.recentQuotesDesc")}</p>
        <div className="dashboard-quote-list">
          {recentQuotes.length === 0 ? (
            <p className="empty-hint">{t("table.empty")}</p>
          ) : (
            recentQuotes.map((item) => {
              const dupKey = `${item.brand}::${item.customer}`;
              const isDuplicate = duplicateGroups.has(dupKey);
              return (
                <div className={`dashboard-quote-row${isDuplicate ? " duplicate-warn" : ""}`} key={item.id}>
                  <div className="dashboard-quote-main">
                    <strong>{item.quoteNo || item.id}</strong>
                    <span>{item.brand} &middot; {item.customer}</span>
                  </div>
                  <div className="dashboard-quote-meta">
                    <span>{item.modificationDate || item.date}</span>
                    <span className={`status-pill status-${item.status.toLowerCase()}`}>{t(`status.${item.status}`)}</span>
                    {isDuplicate ? <span className="duplicate-badge" title={t("dashboard.duplicateWarning")}>⚠ {t("dashboard.duplicateWarning")}</span> : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SectionShell>

      <div className="two-column">
        <SectionShell title={t("section.orders")}>
          <MiniList
            rows={orders.slice(0, 3).map((item) => ({
              title: item.customer,
              subtitle: `${item.id} · ${item.product}`,
              meta: `${formatMoney(item.total, locale)} · ${t(`status.${item.status}`)}`,
            }))}
          />
        </SectionShell>

        <SectionShell title={t("section.brands")}>
          <MiniList
            rows={brands.slice(0, 3).map((item) => ({
              title: item.name,
              subtitle: `${item.code} · ${item.customer}`,
              meta: `${item.country} · ${item.supplier}`,
            }))}
          />
        </SectionShell>

        <SectionShell title={t("section.contracts")}>
          <MiniList
            rows={contracts.slice(0, 3).map((item) => ({
              title: item.client,
              subtitle: `${item.id} · ${item.title}`,
              meta: `${formatMoney(item.amount, locale)} · ${t(`status.${item.status}`)}`,
            }))}
          />
        </SectionShell>
      </div>
    </div>
  );
}

function BrandsPage({
  locale,
  t,
  brands,
  onStartCreate,
  onEditBrand,
  onDeleteBrand,
  onCheckBrands,
}: {
  locale: Locale;
  t: (key: string) => string;
  brands: Brand[];
  onStartCreate: () => void;
  onEditBrand: (brand: Brand) => void;
  onDeleteBrand: (brand: Brand) => void;
  onCheckBrands: (brands: Brand[]) => void;
}) {
  return (
    <div className="page-stack">
      <SectionShell
        title={t("section.brands")}
        action={
          <div className="section-actions">
            <button className="secondary-button" type="button" onClick={() => onCheckBrands(brands)}>
              <IconSearch size={18} strokeWidth={2} />
              {t("button.checkBrands")}
            </button>
            <button className="primary-button" type="button" onClick={onStartCreate}>
              <IconPlus size={18} strokeWidth={2} />
              {t("button.addBrand")}
            </button>
          </div>
        }
      >
        <Table
          columns={[t("table.brandId"), t("table.brandName"), t("table.brandCode"), t("table.client"), t("table.supplier"), t("table.country"), t("table.owner"), t("table.notes"), t("table.actions")]}
          template="120px minmax(180px, 1.5fr) 130px minmax(170px, 1.1fr) minmax(170px, 1.1fr) 96px 120px minmax(220px, 1.2fr) 152px"
          minWidth={1360}
          rows={brands.map((item) => [
            item.id,
            <Link key={`${item.id}-name`} to={`/brands/${encodeURIComponent(item.id)}`} className="table-link">
              {item.name}
            </Link>,
            item.code,
            item.customer,
            item.supplier,
            item.country,
            item.owner,
            item.notes,
            <TableActions key={`${item.id}-actions`} t={t} onEdit={() => onEditBrand(item)} onDelete={() => onDeleteBrand(item)} />,
          ])}
        />
      </SectionShell>
    </div>
  );
}

function BrandDetailPage({
  locale,
  t,
}: {
  locale: Locale;
  t: (key: string) => string;
}) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [brand, setBrand] = useState<Brand | null>(null);
  const [stats, setStats] = useState<{ quotes: number; developments: number; pis: number; pos: number } | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");
    apiGetBrandDetail(id)
      .then((res) => {
        if (res.ok && res.brand) {
          setBrand(res.brand);
          setStats(res.stats ?? null);
        } else {
          setError(res.message ?? "Brand not found");
        }
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-stack"><p>{t("status.loading")}</p></div>;
  if (error) return <div className="page-stack"><p className="text-danger">{error}</p><button className="secondary-button" onClick={() => navigate("/brands")}>{t("button.back")}</button></div>;
  if (!brand) return null;

  const statCards = stats ? [
    { label: t("section.quotes"), value: stats.quotes, color: "#6366f1" },
    { label: t("section.development"), value: stats.developments, color: "#f59e0b" },
    { label: t("section.pis"), value: stats.pis, color: "#10b981" },
    { label: t("section.po"), value: stats.pos, color: "#3b82f6" },
  ] : [];

  return (
    <div className="page-stack">
      <SectionShell
        title={brand.name}
        action={
          <div className="section-actions">
            <button className="secondary-button" type="button" onClick={() => navigate("/brands")}>
              <IconChevronLeft size={18} strokeWidth={2} />
              {t("button.back")}
            </button>
          </div>
        }
      >
        <div className="detail-grid">
          <div className="detail-section">
            <h3 className="detail-section-title">{t("form.brandInfo")}</h3>
            <div className="detail-fields">
              <div className="detail-field">
                <span className="detail-label">{t("table.brandId")}</span>
                <span className="detail-value">{brand.id}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">{t("form.brandName")}</span>
                <span className="detail-value">{brand.name}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">{t("form.brandCode")}</span>
                <span className="detail-value">{brand.code}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">{t("form.brandCustomer")}</span>
                <span className="detail-value">{brand.customer}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">{t("form.brandSupplier")}</span>
                <span className="detail-value">{brand.supplier}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">{t("form.brandCountry")}</span>
                <span className="detail-value">{brand.country}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">{t("form.brandStatus")}</span>
                <span className={`status-pill status-${brand.status.toLowerCase()}`}>{t(`status.${brand.status}`)}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">{t("form.brandOwner")}</span>
                <span className="detail-value">{brand.owner}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">{t("form.brandNotes")}</span>
                <span className="detail-value">{brand.notes}</span>
              </div>
            </div>
          </div>
          <div className="detail-section">
            <h3 className="detail-section-title">{t("section.statistics")}</h3>
            <div className="stats-grid">
              {statCards.map((card) => (
                <div key={card.label} className="stat-card" style={{ borderTopColor: card.color }}>
                  <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
                  <div className="stat-label">{card.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionShell>
    </div>
  );
}

function CustomersPage({
  locale,
  t,
  customers,
  onStartCreate,
  onViewCustomer,
  onEditCustomer,
  onDeleteCustomer,
}: {
  locale: Locale;
  t: (key: string) => string;
  customers: Customer[];
  onStartCreate: () => void;
  onViewCustomer: (customer: Customer) => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customer: Customer) => void;
}) {
  return (
    <div className="page-stack">
      <SectionShell
        title={t("section.customers")}
        action={
          <button className="primary-button" type="button" onClick={onStartCreate}>
            <IconPlus size={18} strokeWidth={2} />
            {t("button.addCustomer")}
          </button>
        }
      >
        <Table
          columns={[t("table.image"), t("table.customerId"), t("table.customerName"), t("table.customerCode"), t("table.country"), t("table.contact"), t("table.phone"), t("table.email"), t("table.address"), t("table.status"), t("table.notes"), t("table.actions")]}
          rows={customers.map((item) => [
            item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="product-thumb" key={`${item.id}-image`} /> : <span className="product-thumb placeholder" key={`${item.id}-image-placeholder`}><IconPhoto size={18} strokeWidth={2} /></span>,
            item.id,
            <button type="button" className="link-button" onClick={() => onViewCustomer(item)} key={`${item.id}-name`}>{item.name}</button>,
            item.code,
            item.country,
            item.contact,
            item.phone,
            item.email,
            item.address,
            <span className={`status-pill status-${item.status.toLowerCase()}`} key={`${item.id}-status`}>
              {t(`status.${item.status}`)}
            </span>,
            item.notes,
            <TableActions key={`${item.id}-actions`} t={t} onView={() => onViewCustomer(item)} onEdit={() => onEditCustomer(item)} onDelete={() => onDeleteCustomer(item)} />,
          ])}
        />
      </SectionShell>
    </div>
  );
}

function SuppliersPage({
  locale,
  t,
  suppliers,
  onStartCreate,
  onEditSupplier,
  onDeleteSupplier,
}: {
  locale: Locale;
  t: (key: string) => string;
  suppliers: Supplier[];
  onStartCreate: () => void;
  onEditSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (supplier: Supplier) => void;
}) {
  return (
    <div className="page-stack">
      <SectionShell
        title={t("section.suppliers")}
        action={
          <button className="primary-button" type="button" onClick={onStartCreate}>
            <IconPlus size={18} strokeWidth={2} />
            {t("button.addSupplier")}
          </button>
        }
      >
        <Table
          columns={[t("table.supplierId"), t("table.supplierName"), t("table.supplierCode"), t("table.country"), t("table.contact"), t("table.phone"), t("table.email"), t("table.address"), t("table.status"), t("table.notes"), t("table.actions")]}
          rows={suppliers.map((item) => [
            item.id,
            item.name,
            item.code,
            item.country,
            item.contact,
            item.phone,
            item.email,
            item.address,
            <span className={`status-pill status-${item.status.toLowerCase()}`} key={`${item.id}-status`}>
              {t(`status.${item.status}`)}
            </span>,
            item.notes,
            <TableActions key={`${item.id}-actions`} t={t} onEdit={() => onEditSupplier(item)} onDelete={() => onDeleteSupplier(item)} />,
          ])}
        />
      </SectionShell>
    </div>
  );
}

function QuotesPage({
  locale,
  t,
  quotes,
  customers,
  brands,
  quoteAccessGranted,
  onStartCreate,
  onEditQuote,
  onDeleteQuote,
  onGeneratePI,
  onPreviewPI,
  quantityPreview,
  setQuantityPreview,
}: {
  locale: Locale;
  t: (key: string) => string;
  quotes: Quote[];
  customers: Customer[];
  brands: Brand[];
  quoteAccessGranted: boolean;
  onStartCreate: () => void;
  onEditQuote: (quote: Quote) => void;
  onDeleteQuote: (quote: Quote) => void;
  onGeneratePI: (quote: Quote) => void;
  onPreviewPI: (quote: Quote) => void;
  quantityPreview: string;
  setQuantityPreview: (value: string) => void;
}) {
  return (
    <div className="page-stack">
      <SectionShell
      title={t("section.quotes")}
      action={
          <button className="primary-button" type="button" onClick={onStartCreate} disabled={!quoteAccessGranted}>
            <IconPlus size={18} strokeWidth={2} />
            {t("button.addQuote")}
          </button>
        }
      >
        {!quoteAccessGranted ? (
          <div className="permission-banner">
            <div>
              <strong>{t("notice.quoteAccessDenied")}</strong>
              <p>{t("notice.quoteAccessHint")}</p>
            </div>
          </div>
        ) : null}
        <div className="quote-toolbar">
          <label className="inline-field">
            <span>{t("form.quoteQty")}</span>
            <input value={quantityPreview} onChange={(event) => setQuantityPreview(event.target.value)} placeholder="1M" />
          </label>
          <div className="quote-toolbar-copy">
            {t("button.previewCalc")} · {t("section.quotes")}
          </div>
        </div>
        <Table
          columns={[t("table.quoteId"), t("table.quoteBrand"), t("table.customer"), t("table.quoteProduct"), t("table.quoteTier"), t("table.status"), t("table.actions")]}
          rows={quotes.map((item) => {
            const tier = calculateQuoteTier(item.tiers, quantityPreview);
            const unitPrice = getQuoteUnitPrice(item, quantityPreview);
            const total = parseQuantityValue(quantityPreview) * unitPrice;
            const firstLine = item.lines[0];
            return [
              item.quoteNo || item.id,
              item.brand,
              <div key={`${item.id}-customer`}>
                <strong>{item.customer}</strong>
                <p>{item.register || t("table.quoteId")}</p>
              </div>,
              <div className="quote-product-cell" key={`${item.id}-product`}>
                {firstLine?.imageUrl || item.imageUrl ? <img src={firstLine?.imageUrl || item.imageUrl} alt={firstLine?.productName || item.productName} className="quote-thumb" /> : <span className="quote-thumb placeholder"><IconPhoto size={18} strokeWidth={2} /></span>}
                <div>
                  <strong>{firstLine?.productName || item.productName}</strong>
                  <p>{firstLine?.productCode || item.productCode}</p>
                </div>
              </div>,
              <div key={`${item.id}-tier`}>
                <strong>{tier ? tier.quantity : "-"}</strong>
                <p>{tier ? `${formatMoney(unitPrice, locale)} · ${formatMoney(total, locale)}` : "-"}</p>
              </div>,
              <span className={`status-pill status-${item.status.toLowerCase()}`} key={`${item.id}-status`}>
                {t(`status.${item.status}`)}
              </span>,
              <TableActions
                key={`${item.id}-actions`}
                t={t}
                extraActions={
                  <>
                    <button type="button" className="action-link preview" onClick={() => onPreviewPI(item)}>
                      <IconCopy size={16} strokeWidth={2} />
                      {t("action.preview")}
                    </button>
                    <button type="button" className="action-link generate" onClick={() => onGeneratePI(item)}>
                      <IconFileInvoice size={16} strokeWidth={2} />
                      {t("action.generate")}
                    </button>
                  </>
                }
                onEdit={() => onEditQuote(item)}
                onDelete={() => onDeleteQuote(item)}
              />,
            ];
          })}
        />
        <div className="hint-grid">
          <div className="hint-card">
            <strong>动态成本项</strong>
            <p>支持纸、印刷、哑油、工艺及自定义项，每个产品独立维护。</p>
          </div>
          <div className="hint-card">
            <strong>分档报价</strong>
            <p>按 1M、2.5M、5M 等档位自动匹配单价，试算结果直接展示。</p>
          </div>
          <div className="hint-card">
            <strong>图片资料</strong>
            <p>报价图片可展示产品与附件内容，方便和旧系统一致。</p>
          </div>
        </div>
      </SectionShell>
    </div>
  );
}

function DevelopmentPage({
  t,
  developments,
  quotes,
  onStartCreate,
  onEditDevelopment,
  onDeleteDevelopment,
}: {
  t: (key: string) => string;
  developments: DevelopmentRecord[];
  quotes: Quote[];
  onStartCreate: (quote?: Quote) => void;
  onEditDevelopment: (development: DevelopmentRecord) => void;
  onDeleteDevelopment: (development: DevelopmentRecord) => void;
}) {
  return (
    <div className="page-stack">
      <SectionShell
        title={t("section.development")}
        action={
          <button className="primary-button" type="button" onClick={() => onStartCreate()}>
            <IconPlus size={18} strokeWidth={2} />
            {t("button.addDevelopment")}
          </button>
        }
      >
        <div className="pi-shortcuts">
          <div className="shortcut-group">
            <strong>{t("button.generateDevelopmentFromQuote")}</strong>
            <div className="shortcut-list">
              {quotes.slice(0, 3).map((quote) => (
                <button key={quote.id} type="button" className="pill-button" onClick={() => onStartCreate(quote)}>
                  {quote.quoteNo || quote.id} · {quote.productName}
                </button>
              ))}
            </div>
          </div>
        </div>
        <Table
          columns={[t("table.developmentNo"), t("table.developmentQuote"), t("table.customer"), t("table.developmentItem"), t("table.status"), t("table.actions")]}
          rows={developments.map((item) => {
            const firstLine = item.lines[0];
            const linkedQuote = quotes.find((quote) => quote.id === item.sourceQuoteId || quote.quoteNo === item.sourceQuoteNo) ?? null;
            return [
              item.developmentNo,
              <div key={`${item.id}-quote`}>
                <strong>{item.sourceQuoteNo || linkedQuote?.quoteNo || "-"}</strong>
                <p>{linkedQuote?.brand || item.brand || "-"}</p>
              </div>,
              item.customer,
              <div className="quote-product-cell" key={`${item.id}-item`}>
                {firstLine?.imageUrl || item.imageUrl ? (
                  <img src={firstLine?.imageUrl || item.imageUrl} alt={firstLine?.productName || item.productName} className="quote-thumb" />
                ) : (
                  <span className="quote-thumb placeholder">
                    <IconPhoto size={18} strokeWidth={2} />
                  </span>
                )}
                <div>
                  <strong>{firstLine?.productName || item.productName}</strong>
                  <p>{firstLine?.productCode || item.productCode}</p>
                </div>
              </div>,
              <span className={`status-pill status-${item.status.toLowerCase()}`} key={`${item.id}-status`}>
                {t(`status.${item.status}`)}
              </span>,
              <TableActions
                key={`${item.id}-actions`}
                t={t}
                onEdit={() => onEditDevelopment(item)}
                onDelete={() => onDeleteDevelopment(item)}
              />,
            ];
          })}
        />
      </SectionShell>
    </div>
  );
}

function PIsPage({
  locale,
  t,
  pis,
  pos,
  onStartCreate,
  onEditPI,
  onDeletePI,
  onOpenPurchaseOrder,
  onViewPurchaseOrder,
  onViewCommercialInvoice,
  onPreviewPI,
  onGeneratePdf,
  onGenerateFromOrder,
  onGenerateFromQuote,
  orders,
  quotes,
}: {
  locale: Locale;
  t: (key: string) => string;
  pis: PIRecord[];
  pos: PORecord[];
  onStartCreate: () => void;
  onEditPI: (pi: PIRecord) => void;
  onDeletePI: (pi: PIRecord) => void;
  onOpenPurchaseOrder: (pi: PIRecord) => void;
  onViewPurchaseOrder: (pi: PIRecord) => void;
  onViewCommercialInvoice: (pi: PIRecord) => void;
  onPreviewPI: (pi: PIRecord) => void;
  onGeneratePdf: (pi: PIRecord) => void;
  onGenerateFromOrder: (order: Order) => void;
  onGenerateFromQuote: (quote: Quote) => void;
  orders: Order[];
  quotes: Quote[];
}) {
  return (
    <div className="page-stack">
      <SectionShell
        title={t("section.pis")}
        action={
          <div className="section-actions">
            <Link className="secondary-button" to="/po">
              <IconReceipt2 size={18} strokeWidth={2} />
              {t("button.previewPO")}
            </Link>
            <button className="primary-button" type="button" onClick={onStartCreate}>
              <IconPlus size={18} strokeWidth={2} />
              {t("button.addPI")}
            </button>
          </div>
        }
      >
        <div className="pi-shortcuts">
          <div className="shortcut-group">
            <strong>{t("button.generateFromOrder")}</strong>
            <div className="shortcut-list">
              {orders.slice(0, 3).map((order) => (
                <button key={order.id} type="button" className="pill-button" onClick={() => onGenerateFromOrder(order)}>
                  {order.id} · {order.customer}
                </button>
              ))}
            </div>
          </div>
          <div className="shortcut-group">
            <strong>{t("button.generateFromQuote")}</strong>
            <div className="shortcut-list">
              {quotes.slice(0, 3).map((quote) => (
                <button key={quote.id} type="button" className="pill-button" onClick={() => onGenerateFromQuote(quote)}>
                  {quote.id} · {quote.productName}
                </button>
              ))}
            </div>
          </div>
        </div>
        <Table
          columns={[
            t("table.piNo"),
            t("table.piPlNo"),
            t("table.piVendor"),
            t("table.piOurRefNo"),
            t("table.customer"),
            t("table.piStockOutQty"),
            t("table.piDeliveryDate"),
            t("table.status"),
            t("table.piGenerated"),
            t("table.actions"),
          ]}
          rows={pis.map((item) => [
            item.piNo,
            item.plNo || "-",
            (() => { const linked = pos.find((po) => po.sourcePiId === item.id || po.poNo === item.piNo); return linked?.vendor || item.vendor || item.brand; })(),
            item.ourRefNo || "-",
            item.customer,
            formatPiQuantity(Number(item.stockOutQty || item.orderQty || 0)),
            item.deliveryDate || "-",
            <span className={`status-pill status-${item.status.toLowerCase()}`} key={`${item.id}-status`}>
              {t(`status.${item.status}`)}
            </span>,
            <div key={`${item.id}-generated`}>
              <strong>{formatDate(item.generatedAt, locale)}</strong>
              <p>{item.generatedBy}</p>
            </div>,
            <TableActions
              key={`${item.id}-actions`}
              t={t}
              extraActions={
                <>
                  <button type="button" className="action-link preview" onClick={() => onPreviewPI(item)}>
                    <IconCopy size={16} strokeWidth={2} />
                    {t("action.preview")}
                  </button>
                  <button type="button" className="action-link generate" onClick={() => onViewPurchaseOrder(item)}>
                    <IconReceipt2 size={16} strokeWidth={2} />
                    {t("button.viewPO")}
                  </button>
                  <button type="button" className="action-link preview" onClick={() => onViewCommercialInvoice(item)}>
                    <IconFileInvoice size={16} strokeWidth={2} />
                    {t("button.viewCommercialInvoice")}
                  </button>
                  <button type="button" className="action-link generate" onClick={() => onOpenPurchaseOrder(item)}>
                    <IconReceipt2 size={16} strokeWidth={2} />
                    {t("button.generatePO")}
                  </button>
                  <button type="button" className="action-link preview" onClick={() => onGeneratePdf(item)}>
                    <IconDownload size={16} strokeWidth={2} />
                    {t("button.generatePdf")}
                  </button>
                </>
              }
              onEdit={() => onEditPI(item)}
              onDelete={() => onDeletePI(item)}
            />,
          ])}
        />
      </SectionShell>
    </div>
  );
}

function ProformaInvoicePage({
  locale,
  t,
  pis,
  pos,
  selectedPi,
  selectedPiCustomer,
  selectedPiVendor,
  onSelectPi,
  onExportPdf,
}: {
  locale: Locale;
  t: (key: string) => string;
  pis: PIRecord[];
  pos: PORecord[];
  selectedPi: PIRecord | null;
  selectedPiCustomer: PartyDetails;
  selectedPiVendor: PartyDetails;
  onSelectPi: (piId: string) => void;
  onExportPdf: () => void;
}) {
  const location = useLocation();
  const autoPrint = location.pathname === "/pis/print";

  useEffect(() => {
    if (!selectedPi || !autoPrint) return;
    const timer = window.setTimeout(() => window.print(), 250);
    return () => window.clearTimeout(timer);
  }, [autoPrint, selectedPi?.id]);

  const linkedPO = useMemo(
    () => (selectedPi ? [...pos].find((po) => po.sourcePiId === selectedPi.id || po.poNo === selectedPi.piNo) ?? null : null),
    [pos, selectedPi],
  );

  const invoiceLines =
    selectedPi?.lines?.length && selectedPi.lines.some((line) => line.productCode || line.productName)
      ? selectedPi.lines
      : selectedPi
        ? [
            {
              id: "fallback",
              productCode: selectedPi.itemCode || selectedPi.piNo || "-",
              productName: selectedPi.description || selectedPi.productType || selectedPi.brand || "-",
              quantity: Math.max(1, Number(selectedPi.sizeDetails?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0)),
              unitPrice: 0,
            },
          ]
        : [];
  const mainLine = invoiceLines[0] ?? null;
  const invoiceQuantity = invoiceLines.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || Number(selectedPi?.sizeDetails?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0);
  const invoiceUnitPrice = mainLine?.unitPrice ?? 0;
  const invoiceTotal = invoiceLines.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0) || invoiceQuantity * invoiceUnitPrice;
  const invoiceDate = selectedPi?.deliveryDate || selectedPi?.generatedAt?.slice(0, 10) || "-";
  const printNo = selectedPi?.piNo || selectedPi?.id || "-";
  const printPlNo = selectedPi?.plNo || "-";
  const sellerAddress = selectedPiVendor.address || " ";
  const buyerAddress = selectedPiCustomer.address || " ";
  const sizeSummary = selectedPi?.sizeDetails?.length
    ? selectedPi.sizeDetails.map((item) => `${item.size || "-"}: ${formatPiQuantity(Number(item.quantity || 0))}`).join(" / ")
    : selectedPi?.size || "-";
  const sellerName = selectedPiVendor.name || selectedPi?.vendor || "-";
  const buyerName = selectedPiCustomer.name || selectedPi?.customer || "-";
  const sellerPhone = selectedPiVendor.phone || selectedPiVendor.email || "-";
  const buyerPhone = selectedPiCustomer.phone || selectedPiCustomer.email || "-";

  return (
    <div className="page-stack pi-print-page">
      <div className="pi-print-toolbar no-print">
        <div className="ci-toolbar-copy">
          <h2>{t("pi.printTitle")}</h2>
          <p>{t("pi.printSubtitle")}</p>
        </div>
        <div className="ci-toolbar-actions">
          <label className="ci-select">
            <span>{t("ci.selectSource")}</span>
            <select value={selectedPi?.id ?? ""} onChange={(event) => onSelectPi(event.target.value)}>
              {pis.map((pi) => (
                <option key={pi.id} value={pi.id}>
                  {pi.piNo} · {pi.customer}
                </option>
              ))}
            </select>
          </label>
          <button className="primary-button" type="button" onClick={onExportPdf} disabled={!selectedPi}>
            <IconPrinter size={18} strokeWidth={2} />
            {t("button.generatePdf")}
          </button>
        </div>
      </div>

      <article className="pi-print-sheet">
        <div className="pi-print-toprule" />
        <header className="pi-print-header">
          <div className="pi-print-party">
            <span>{t("pi.printSeller")}</span>
            <strong>{sellerName}</strong>
            <p>{sellerAddress || sellerName}</p>
            <p>{selectedPiVendor.contact || "-"}</p>
            <p>{sellerPhone}</p>
          </div>

          <div className="pi-print-title">
            <div className="pi-print-brand">{selectedPi?.brand || selectedPi?.customer || "SYNSHOO"}</div>
            <h1>{t("pi.printTitle")}</h1>
            <div className="pi-print-origin">{t("pi.printOriginal")}</div>
          </div>

          <div className="pi-print-meta">
            <div>
              <span>{t("pi.printNo")}</span>
              <strong>{printNo}</strong>
            </div>
            <div>
              <span>{t("pi.printPlNo")}</span>
              <strong>{printPlNo}</strong>
            </div>
            <div>
              <span>{t("pi.printDate")}</span>
              <strong>{invoiceDate}</strong>
            </div>
            <div>
              <span>{t("ci.terms")}</span>
              <strong>{t("ci.termsValue")}</strong>
            </div>
          </div>
        </header>

        <section className="pi-print-parties">
          <div className="pi-print-party-card">
            <span>{t("pi.printSeller")}</span>
            <strong>{sellerName}</strong>
            <p>{selectedPiVendor.address || sellerName}</p>
            <p>{selectedPiVendor.contact || "-"}</p>
            <p>{sellerPhone}</p>
          </div>
          <div className="pi-print-party-card">
            <span>{t("pi.printBuyer")}</span>
            <strong>{buyerName}</strong>
            <p>{buyerAddress || buyerName}</p>
            <p>{selectedPiCustomer.contact || "-"}</p>
            <p>{buyerPhone}</p>
          </div>
        </section>

        <section className="pi-print-table">
          <div className="pi-print-table-head">
            <span>{t("pi.printDescription")}</span>
            <span>{t("pi.printType")}</span>
            <span>{t("pi.printCustPo")}</span>
            <span>{t("pi.printItemCode")}</span>
            <span>{t("pi.printQty")}</span>
            <span>{t("pi.printUnitPrice")}</span>
            <span>{t("pi.printAmount")}</span>
          </div>
          {invoiceLines.length ? (
            invoiceLines.map((line, index) => {
              const lineQty = Number(line.quantity || 0);
              const lineAmount = lineQty * Number(line.unitPrice || 0);
              return (
                <div className="pi-print-table-row" key={`${line.productCode || line.productName || "line"}-${index}`}>
                  <span>{selectedPi?.description || line.productName || "-"}</span>
                  <span>{selectedPi?.productType || selectedPi?.size || "-"}</span>
                  <span>{selectedPi?.ourRefNo || "-"}</span>
                  <span>{line.productCode || selectedPi?.itemCode || "-"}</span>
                  <span>{formatPiQuantity(lineQty)}</span>
                  <span>{formatPiMoney(Number(line.unitPrice || 0))}</span>
                  <span>{formatPiMoney(lineAmount)}</span>
                </div>
              );
            })
          ) : (
            <div className="pi-print-table-row pi-print-empty">
              <span>-</span>
              <span>-</span>
              <span>-</span>
              <span>-</span>
              <span>-</span>
              <span>-</span>
              <span>-</span>
            </div>
          )}
        </section>

        <section className="pi-print-summary">
          <div className="pi-print-summary-left">
            <div>
              <span>{t("pi.printSizeSummary")}</span>
              <strong>{sizeSummary}</strong>
            </div>
            <div>
              <span>{t("pi.remarks")}</span>
              <strong>{selectedPi?.remarks || "-"}</strong>
            </div>
          </div>
          <div className="pi-print-summary-right">
            <div>
              <span>{t("ci.total")}</span>
              <strong>{formatPiMoney(invoiceTotal)}</strong>
            </div>
            <div>
              <span>{t("pi.printPcs")}</span>
              <strong>{formatPiQuantity(invoiceQuantity)}</strong>
            </div>
          </div>
        </section>

        <PITimelinePanel locale={locale} t={t} pi={selectedPi} className="no-print" />

        <section className="pi-preview-bundle no-print">
          <div className="editable-head">
            <div>
              <strong>{t("pi.previewBundleTitle")}</strong>
              <p>{t("pi.previewBundleSubtitle")}</p>
            </div>
          </div>

          <div className="pi-preview-grid">
            <article className="pi-preview-card">
              <div className="pi-preview-card-head">
                <strong>{t("pi.previewPurchaseTitle")}</strong>
                <span className="status-pill status-closed">{linkedPO ? t("notice.previewLinked") : t("notice.previewMissing")}</span>
              </div>
              <dl className="pi-preview-list">
                <div>
                  <dt>{t("table.poNo")}</dt>
                  <dd>{linkedPO?.poNo || "-"}</dd>
                </div>
                <div>
                  <dt>{t("table.poVendor")}</dt>
                  <dd>{linkedPO?.vendor || selectedPi?.vendor || "-"}</dd>
                </div>
                <div>
                  <dt>{t("table.poDate")}</dt>
                  <dd>{linkedPO?.date || "-"}</dd>
                </div>
                <div>
                  <dt>{t("table.poRefNo")}</dt>
                  <dd>{linkedPO?.ourRefNo || selectedPi?.ourRefNo || "-"}</dd>
                </div>
              </dl>
              <div className="pi-preview-lines">
                {(linkedPO?.lines?.length ? linkedPO.lines : selectedPi?.lines ?? []).map((line, index) => {
                  const description = "itemDescription" in line ? line.itemDescription : line.productName;
                  return (
                    <div key={`${line.productCode || line.productName || index}`} className="pi-preview-line">
                      <span>{line.productCode || "-"}</span>
                      <span>{description || "-"}</span>
                      <span>{formatPiQuantity(Number(line.quantity || 0))}</span>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="pi-preview-card">
              <div className="pi-preview-card-head">
                <strong>{t("pi.previewPackingTitle")}</strong>
                <span className="status-pill status-generated">{linkedPO?.packingRows?.length ? t("notice.previewExpanded") : t("notice.previewEmpty")}</span>
              </div>
              <div className="pi-preview-table">
                <div className="pi-preview-table-head">
                  <span>{t("po.lot")}</span>
                  <span>{t("po.size")}</span>
                  <span>{t("po.qtyPcs")}</span>
                </div>
                {(linkedPO?.packingRows?.length ? linkedPO.packingRows : selectedPi?.sizeDetails?.map((item, index) => ({ lot: String(index + 1), size: item.size, quantity: item.quantity })) ?? []).map((row, index) => (
                  <div key={`${row.lot || index}`} className="pi-preview-table-row">
                    <span>{row.lot || String(index + 1)}</span>
                    <span>{row.size || "-"}</span>
                    <span>{formatPiQuantity(Number(row.quantity || 0))}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="pi-preview-card">
              <div className="pi-preview-card-head">
                <strong>{t("pi.previewCommercialTitle")}</strong>
                <span className="status-pill status-sent">{selectedPi?.commercialInvoiceGeneratedAt ? t("notice.previewLinked") : t("notice.previewMissing")}</span>
              </div>
              <dl className="pi-preview-list">
                <div>
                  <dt>{t("ci.invoiceNo")}</dt>
                  <dd>{linkedPO?.poNo || selectedPi?.piNo || "-"}</dd>
                </div>
                <div>
                  <dt>{t("ci.contractRef")}</dt>
                  <dd>{selectedPi?.ourRefNo || linkedPO?.ourRefNo || "-"}</dd>
                </div>
                <div>
                  <dt>{t("ci.shipTo")}</dt>
                  <dd>{linkedPO?.deliverTo || selectedPi?.deliverTo || selectedPiCustomer.address || "-"}</dd>
                </div>
                <div>
                  <dt>{t("ci.total")}</dt>
                  <dd>{formatPiMoney(invoiceTotal)}</dd>
                </div>
              </dl>
              <div className="pi-preview-lines">
                {invoiceLines.map((line, index) => (
                  <div key={`${line.productCode || line.productName || index}-ci`} className="pi-preview-line">
                    <span>{line.productCode || "-"}</span>
                    <span>{line.productName || selectedPi?.description || "-"}</span>
                    <span>{formatPiMoney(Number(line.unitPrice || 0))}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>
      </article>
    </div>
  );
}

function PurchaseOrderPage({
  locale,
  t,
  pos,
  onStartCreate,
  onStartCraft,
  onEditPO,
  onEditCraft,
  onDeletePO,
  onPreviewPO,
}: {
  locale: Locale;
  t: (key: string) => string;
  pos: PORecord[];
  onStartCreate: () => void;
  onStartCraft: () => void;
  onEditPO: (po: PORecord) => void;
  onEditCraft: (po: PORecord) => void;
  onDeletePO: (po: PORecord) => void;
  onPreviewPO: (po: PORecord) => void;
}) {
  return (
    <div className="page-stack">
      <SectionShell
        title={t("po.listTitle")}
        action={
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="primary-button" type="button" onClick={onStartCreate}>
              <IconPlus size={18} strokeWidth={2} />
              {t("button.addPurchase")}
            </button>
            <button className="secondary-button" type="button" onClick={onStartCraft} style={{ background: "#e8f5e9", color: "#2e7d32", border: "1px solid #a5d6a7" }}>
              <IconPlus size={18} strokeWidth={2} />
              {t("button.addCraft")}
            </button>
          </div>
        }
      >
        <Table
          columns={[t("table.poType"), t("table.poNo"), t("table.poVendor"), t("table.customer"), t("table.poDate"), t("table.status"), t("table.actions")]}
          rows={pos.map((item) => [
            <span key={`${item.id}-type`} className={`status-pill status-${item.poType === "craft" ? "confirmed" : "draft"}`}>
              {item.poType === "craft" ? t("po.typeCraft") : t("po.typePurchase")}
            </span>,
            item.poNo,
            item.vendor || "-",
            item.customer || "-",
            item.date,
            <span className={`status-pill status-${item.status.toLowerCase()}`} key={`${item.id}-status`}>
              {t(`status.${item.status}`)}
            </span>,
            <TableActions
              key={`${item.id}-actions`}
              t={t}
              extraActions={
                <button type="button" className="action-link preview" onClick={() => onPreviewPO(item)}>
                  <IconCopy size={16} strokeWidth={2} />
                  {t("button.previewPO")}
                </button>
              }
              onEdit={() => item.poType === "craft" ? onEditCraft(item) : onEditPO(item)}
              onDelete={() => onDeletePO(item)}
            />,
          ])}
        />
      </SectionShell>
    </div>
  );
}

function PoDetailPage({
  locale,
  t,
  pos,
}: {
  locale: Locale;
  t: (key: string) => string;
  pos: PORecord[];
}) {
  const { poId } = useParams<{ poId: string }>();
  const navigate = useNavigate();
  const po = useMemo(() => pos.find((item) => item.id === poId || item.poNo === poId) ?? null, [pos, poId]);
  const vendor = getPurchaseOrderVendor(po);
  const sourceLine = po?.lines?.[0] ?? null;
  const lineQuantity = sourceLine?.quantity ?? 0;
  const lineUnitPrice = sourceLine?.unitPrice ?? 0;
  const lineAmount = lineQuantity * lineUnitPrice;
  const totalAmount = po?.lines.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) ?? 0;
  const packingQty = po?.packingRows?.reduce((sum, detail) => sum + Number(detail.quantity || 0), 0) || Math.round(lineQuantity * 1000) || 0;

  if (!po) {
    return (
      <div className="page-stack">
        <SectionShell title={t("po.detailTitle")}>
          <p>{t("po.notFound")}</p>
          <button className="secondary-button" type="button" onClick={() => navigate("/po")}>
            {t("button.back")}
          </button>
        </SectionShell>
      </div>
    );
  }

  // Render craft sheet for craft type POs
  if (po.poType === "craft") {
    return (
      <div className="page-stack craft-page">
        <SectionShell
          title={t("craft.detailTitle")}
          action={
            <div className="section-actions no-print">
              <button className="secondary-button" type="button" onClick={() => navigate("/po")}>
                <IconChevronLeft size={18} strokeWidth={2} />
                {t("button.back")}
              </button>
              <button className="primary-button" type="button" onClick={() => window.print()}>
                <IconDownload size={18} strokeWidth={2} />
                {t("button.exportPdf")}
              </button>
            </div>
          }
        >
          <p className="no-print">{t("craft.previewSubtitle")}</p>
        </SectionShell>

        <article className="craft-sheet">
          {/* Header: Company name + barcode */}
          <header className="craft-header">
            <h1>{t("craft.companyName")}</h1>
          </header>
          <div className="craft-barcode">
            <div className="craft-barcode-inner" title={`Barcode: ${po.orderNo || po.poNo}`} />
          </div>

          {/* Main table */}
          <table className="craft-table">
            <tbody>
              {/* Row 1: 订单编号, 客户, 交货日期 */}
              <tr>
                <th>{t("craft.orderNo")}</th>
                <td className="craft-value">{po.orderNo || po.poNo || "-"}</td>
                <th>{t("table.customer")}</th>
                <td className="craft-value">{po.customer || "-"}</td>
                <th>{t("form.piDeliveryDate")}</th>
                <td className="craft-value">{po.deliveryDate || "-"}</td>
              </tr>
              {/* Row 2: 订单状态, 制单人, 制单日期 */}
              <tr>
                <th>{t("table.status")}</th>
                <td className="craft-value"><span className={`status-pill status-${po.status.toLowerCase()}`}>{t(`status.${po.status}`)}</span></td>
                <th>{t("craft.maker")}</th>
                <td className="craft-value">{po.maker || "-"}</td>
                <th>{t("craft.makeDate")}</th>
                <td className="craft-value">{po.makeDate || "-"}</td>
              </tr>
              {/* Row 3: 款号, 客户单号 */}
              <tr>
                <th>{t("craft.styleNo")}</th>
                <td colSpan={2} className="craft-value">{po.styleNo || "-"}</td>
                <th>{t("craft.customerOrderNo")}</th>
                <td colSpan={2} className="craft-value">{po.customerOrderNo || "-"}</td>
              </tr>
              {/* Row 4: 品名, 订单号 */}
              <tr>
                <th>{t("craft.productName")}</th>
                <td colSpan={2} className="craft-value">{po.craftProductName || "-"}</td>
                <th>{t("craft.relatedOrderNo")}</th>
                <td colSpan={2} className="craft-value">{po.relatedOrderNo || "-"}</td>
              </tr>
              {/* Row 5: 开张, 来料, 开数 */}
              <tr>
                <th>{t("craft.sheetSize")}</th>
                <td className="craft-value">{po.sheetSize || "-"}</td>
                <th>{t("craft.materialIn")}</th>
                <td className="craft-value">{po.materialIn || "-"}</td>
                <th>{t("craft.upCount")}</th>
                <td className="craft-value">{po.upCount || "-"}</td>
              </tr>
              {/* Row 6: 数量, 余量, 成品, 拼数 */}
              <tr>
                <th>{t("craft.quantity")}</th>
                <td className="craft-value">{po.quantity || "-"}</td>
                <th>{t("craft.remainder")}</th>
                <td className="craft-value">{po.remainder || "-"}</td>
                <th>{t("craft.finishedQty")}</th>
                <td className="craft-value">{po.finishedQty || "-"}</td>
              </tr>
              <tr>
                <th>{t("craft.packCount")}</th>
                <td className="craft-value" colSpan={5}>{po.packCount || "-"}</td>
              </tr>

              {/* Row: 印刷方式 (checkboxes) */}
              <tr>
                <th>{t("craft.printMethod")}</th>
                <td colSpan={5}>
                  <div className="craft-check-group">
                    {(["single_side", "double_side", "work_and_turn", "work_and_tumble"] as PrintMethod[]).map((m) => (
                      <label key={m} className="craft-check-item">
                        <input type="checkbox" checked={po.printMethod?.includes(m) ?? false} readOnly />
                        <span>{
                          m === "single_side" ? t("craft.printSingleSide") :
                          m === "double_side" ? t("craft.printDoubleSide") :
                          m === "work_and_turn" ? t("craft.printWorkAndTurn") :
                          t("craft.printWorkAndTumble")
                        }</span>
                      </label>
                    ))}
                  </div>
                </td>
              </tr>

              {/* Row: 看样类型 (checkboxes) */}
              <tr>
                <th>{t("craft.proofType")}</th>
                <td colSpan={5}>
                  <div className="craft-check-group">
                    {(["sample", "ps_plate", "ctp_plate"] as ProofType[]).map((m) => (
                      <label key={m} className="craft-check-item">
                        <input type="checkbox" checked={po.proofType?.includes(m) ?? false} readOnly />
                        <span>{
                          m === "sample" ? t("craft.proofSample") :
                          m === "ps_plate" ? t("craft.proofPSPlate") :
                          t("craft.proofCTPPlate")
                        }</span>
                      </label>
                    ))}
                  </div>
                </td>
              </tr>

              {/* Row: 后道要求 (checkbox grid) */}
              <tr>
                <th>{t("craft.postProcess")}</th>
                <td colSpan={5}>
                  <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", padding: "3px 0" }}>
                    {["printing", "laminating", "mounting", "die_cutting", "uv_coating"].map((m) => (
                      <label key={m} className="craft-post-item" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <input type="checkbox" checked={po.postProcess?.includes(m as PostProcess) ?? false} readOnly />
                        <span>{
                          m === "printing" ? t("craft.postPrinting") :
                          m === "laminating" ? t("craft.postLaminating") :
                          m === "mounting" ? t("craft.postMounting") :
                          m === "die_cutting" ? t("craft.postDieCutting") :
                          t("craft.postUVCoating")
                        }</span>
                      </label>
                    ))}
                    {/* 上UV is shown separately on the right in the original image - include it inline here too */}
                    <span style={{ marginLeft: "auto" }}>
                      <label className="craft-post-item" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <input type="checkbox" checked={po.postProcess?.includes("uv_coating") ?? false} readOnly />
                        <span>上UV</span>
                      </label>
                    </span>
                  </div>
                </td>
              </tr>

              {/* Row: 备注 */}
              <tr>
                <th>{t("craft.notes")}</th>
                <td colSpan={5}>
                  <textarea className="craft-notes-area" value={po.craftNotes || ""} readOnly rows={2} />
                </td>
              </tr>
            </tbody>
          </table>

          <div className="craft-footer-note">
            注：以上印刷施工单请核对，仅供参考，如有问题，请致电联系！
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="page-stack po-page">
      <SectionShell
        title={t("po.detailTitle")}
        action={
          <div className="section-actions no-print">
            <button className="secondary-button" type="button" onClick={() => navigate("/po")}>
              <IconChevronLeft size={18} strokeWidth={2} />
              {t("button.back")}
            </button>
            <button className="primary-button" type="button" onClick={() => window.print()}>
              <IconDownload size={18} strokeWidth={2} />
              {t("button.exportPdf")}
            </button>
          </div>
        }
      >
        <p className="no-print">{t("po.previewSubtitle")}</p>
      </SectionShell>

      <article className="po-sheet">
        <div className="po-top-rule" />
        <header className="po-header">
          <h1>
            <span>PURCHASE ORDER NO. / 訂單號碼：</span>
            <strong>{po.poNo || "-"}</strong>
          </h1>
          <div className="po-date">
            {t("po.date")}: <strong>{po.date || "-"}</strong>
          </div>
        </header>

        <section className="po-vendor-block">
          <h2>{t("po.vendorInfo")}</h2>
          <div className="po-vendor-grid">
            <div className="po-vendor-main">
              <strong>{vendor.name || "-"}</strong>
              <p>{vendor.address || "-"}</p>
              <p>
                {vendor.contact || "-"}, {vendor.email || "-"}
              </p>
              <p>
                TEL: {vendor.tel || "-"}, FAX: {vendor.fax || "-"}
              </p>
            </div>
            <div className="po-vendor-meta">
              <div>
                <span>{t("table.poRefNo")}</span>
                <strong>{po.ourRefNo || "-"}</strong>
              </div>
              <div>
                <span>{t("table.poDate")}</span>
                <strong>{po.deliveryDate || "-"}</strong>
              </div>
              <div className="po-deliver-to">
                <span>{t("form.piDeliverTo")}</span>
                <strong>{po.deliverTo || "-"}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="po-item-block">
          <div className="po-item-head">
            <span>{t("po.itemDescription")}</span>
            <span>{t("table.orderId")}</span>
            <span>{t("table.price")}</span>
            <span>{t("table.amount")}</span>
          </div>
          <div className="po-item-row">
            <div className="po-item-desc">
              <strong>{po.itemCode || sourceLine?.itemCode || "-"}</strong>
              <p>{po.description || sourceLine?.itemDescription || "-"}</p>
              <p>{po.productType || sourceLine?.itemDescription || "-"}</p>
              <p>{po.size ? `- ${po.size}` : ""}</p>
            </div>
            <div className="po-item-qty">{formatPoQuantity(lineQuantity)}</div>
            <div className="po-item-cost">{formatPoMoney(lineUnitPrice)}</div>
            <div className="po-item-amt">{formatPoMoney(lineAmount)}</div>
          </div>
          <div className="po-total-row">
            <span>TOTAL</span>
            <strong>{formatPoMoney(totalAmount)} RMB</strong>
          </div>
        </section>

        <section className="po-spec-block">
          <h2>{t("po.specTitle")}</h2>
          <dl className="po-spec-list">
            <div>
              <dt>{t("po.itemCode")}</dt>
              <dd>{po.itemCode || "-"}</dd>
            </div>
            <div>
              <dt>{t("po.description")}</dt>
              <dd>{po.description || "-"}</dd>
            </div>
            <div>
              <dt>{t("po.productType")}</dt>
              <dd>{po.productType || "-"}</dd>
            </div>
            <div>
              <dt>{t("po.size")}</dt>
              <dd>{po.size || "-"}</dd>
            </div>
            <div>
              <dt>{t("po.colors")}</dt>
              <dd>{po.colors || "-"}</dd>
            </div>
            <div>
              <dt>{t("po.finished")}</dt>
              <dd>{po.finished || "-"}</dd>
            </div>
            <div>
              <dt>{t("po.remarks")}</dt>
              <dd>{po.remarks || "-"}</dd>
            </div>
          </dl>
        </section>

        <section className="po-pack-block">
          <div className="po-pack-title">
            {`Packing Instruction of ${po.itemCode || "-"} (${po.ourRefNo || "-"}) / ${t("po.packLabel")}`}
          </div>
          <div className="po-pack-table">
            <div className="po-pack-row po-pack-head">
              <span>{t("po.lot")}</span>
              <span>{t("po.size")}</span>
              <span>{t("po.qtyPcs")}</span>
            </div>
            {(po.packingRows?.length ? po.packingRows : [{ lot: "1", size: "", quantity: packingQty }]).map((row, index) => (
              <div className="po-pack-row" key={`${po.id}-${index}`}>
                <span>{row.lot || String(index + 1)}</span>
                <span>{row.size || " "}</span>
                <span>{row.quantity || "-"}</span>
              </div>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}

function CustomerDetailPage({
  locale,
  t,
  customers,
  quotes,
  pis,
}: {
  locale: Locale;
  t: (key: string) => string;
  customers: Customer[];
  quotes: Quote[];
  pis: PIRecord[];
}) {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const customer = useMemo(
    () => customers.find((item) => item.id === customerId || item.name === customerId) ?? null,
    [customers, customerId],
  );

  const stats = useMemo(() => {
    if (!customer) return { quoteCount: 0, piCount: 0 };
    const customerName = customer.name;
    const quoteCount = quotes.filter((q) => q.customer === customerName).length;
    const piCount = pis.filter((p) => p.customer === customerName).length;
    return { quoteCount, piCount };
  }, [customer, quotes, pis]);

  if (!customer) {
    return (
      <div className="page-stack">
        <SectionShell title={t("customer.detailTitle")}>
          <p>{t("customer.notFound")}</p>
          <button className="secondary-button" type="button" onClick={() => navigate("/customers")}>
            {t("button.back")}
          </button>
        </SectionShell>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <SectionShell
        title={t("customer.detailTitle")}
        action={
          <button className="secondary-button" type="button" onClick={() => navigate("/customers")}>
            <IconChevronLeft size={18} strokeWidth={2} />
            {t("button.back")}
          </button>
        }
      >
        <div className="detail-grid">
          <section className="detail-card">
            <h3>{t("customer.basicInfo")}</h3>
            <dl className="detail-list">
              <div>
                <dt>{t("table.image")}</dt>
                <dd>
                  {customer.imageUrl ? (
                    <img src={customer.imageUrl} alt={customer.name} className="product-thumb" />
                  ) : (
                    "-"
                  )}
                </dd>
              </div>
              <div>
                <dt>{t("table.customerId")}</dt>
                <dd>{customer.id}</dd>
              </div>
              <div>
                <dt>{t("table.customerName")}</dt>
                <dd>{customer.name}</dd>
              </div>
              <div>
                <dt>{t("table.customerCode")}</dt>
                <dd>{customer.code || "-"}</dd>
              </div>
              <div>
                <dt>{t("table.country")}</dt>
                <dd>{customer.country || "-"}</dd>
              </div>
              <div>
                <dt>{t("table.contact")}</dt>
                <dd>{customer.contact || "-"}</dd>
              </div>
              <div>
                <dt>{t("table.phone")}</dt>
                <dd>{customer.phone || "-"}</dd>
              </div>
              <div>
                <dt>{t("table.email")}</dt>
                <dd>{customer.email || "-"}</dd>
              </div>
              <div>
                <dt>{t("table.address")}</dt>
                <dd>{customer.address || "-"}</dd>
              </div>
              <div>
                <dt>{t("table.status")}</dt>
                <dd>
                  <span className={`status-pill status-${customer.status.toLowerCase()}`}>{t(`status.${customer.status}`)}</span>
                </dd>
              </div>
              <div>
                <dt>{t("table.notes")}</dt>
                <dd>{customer.notes || "-"}</dd>
              </div>
            </dl>
          </section>

          <section className="detail-card">
            <h3>{t("customer.statistics")}</h3>
            <div className="stat-cards">
              <div className="stat-card">
                <strong>{stats.quoteCount}</strong>
                <span>{t("customer.quoteCount")}</span>
              </div>
              <div className="stat-card">
                <strong>{stats.piCount}</strong>
                <span>{t("customer.piCount")}</span>
              </div>
            </div>
          </section>
        </div>
      </SectionShell>
    </div>
  );
}

function CommercialInvoicePage({
  locale,
  t,
  pos,
  selectedPo,
  selectedPoVendor,
  selectedPoCustomer,
  onSelectPo,
  onExportPdf,
}: {
  locale: Locale;
  t: (key: string) => string;
  pos: PORecord[];
  selectedPo: PORecord | null;
  selectedPoVendor: PurchaseOrderVendor;
  selectedPoCustomer: PartyDetails;
  onSelectPo: (poId: string) => void;
  onExportPdf: () => void;
}) {
  const invoiceLines = selectedPo?.lines ?? [];
  const invoiceTotal = invoiceLines.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const invoiceNo = selectedPo?.poNo || selectedPo?.id || "-";
  const contractRef = selectedPo?.ourRefNo || "-";
  const invoiceDate = selectedPo?.date || "-";
  const shipTo = selectedPo?.deliverTo || selectedPo?.customer || "-";
  const sourceLine = invoiceLines[0] ?? null;
  const packingQuantity =
    selectedPo?.packingRows?.reduce((sum, detail) => sum + Number(detail.quantity || 0), 0) ||
    Math.round(invoiceLines.reduce((sum, item) => sum + Number(item.quantity || 0), 0) * 1000) ||
    0;
  const packingRows =
    selectedPo?.packingRows?.length
      ? selectedPo.packingRows
      : selectedPo
        ? [{ lot: "1", size: selectedPo.size || sourceLine?.itemDescription || "-", quantity: packingQuantity }]
        : [];
  const packingRowsForList = packingRows.length
    ? packingRows
    : selectedPo
      ? [{ lot: "1", size: selectedPo.size || sourceLine?.itemDescription || "-", quantity: packingQuantity }]
      : [];
  const totalPackedQty = packingRowsForList.reduce((sum, row) => sum + Number(row.quantity || 0), 0);
  const totalCtns = packingRowsForList.length || 1;
  const grossWeight = Number((Math.max(totalPackedQty / 1000, totalCtns * 10.8)).toFixed(1));
  const netWeight = Number((Math.max(totalPackedQty / 1100, totalCtns * 10.2)).toFixed(1));
  const cbm = Number((Math.max(totalCtns * 0.03, totalPackedQty / 100000)).toFixed(2));
  const packingSummaryRows = invoiceLines.length
    ? invoiceLines.map((line, index) => ({
        itemNo: index + 1,
        codeRef: line.productCode || selectedPo?.itemCode || "-",
        program: "Program",
        item: line.productName || selectedPo?.description || "-",
        quantity: Number(line.quantity || 0) > 0 ? Number(line.quantity || 0) * 1000 : totalPackedQty,
      }))
    : [
        {
          itemNo: 1,
          codeRef: selectedPo?.itemCode || "-",
          program: "Program",
          item: selectedPo?.description || "-",
          quantity: totalPackedQty,
        },
      ];
  const formatCiQuantity = (value: number) => (Number.isInteger(value) ? String(value) : value.toFixed(3));
  const formatCiUnitPrice = (value: number) => value.toFixed(4);
  const formatCiAmount = (value: number) => value.toFixed(2);

  return (
    <div className="page-stack ci-page">
      <div className="ci-toolbar no-print">
        <div className="ci-toolbar-copy">
          <h2>{t("ci.detailTitle")}</h2>
          <p>{t("ci.previewSubtitle")}</p>
        </div>
        <div className="ci-toolbar-actions">
          <label className="ci-select">
            <span>{t("ci.selectSource")}</span>
            <select value={selectedPo?.id ?? ""} onChange={(event) => onSelectPo(event.target.value)}>
              {pos.map((po) => (
                <option key={po.id} value={po.id}>
                  {po.poNo} · {po.customer}
                </option>
              ))}
            </select>
          </label>
          <button className="primary-button" type="button" onClick={onExportPdf}>
            <IconDownload size={18} strokeWidth={2} />
            {t("button.exportPdf")}
          </button>
        </div>
      </div>

      <article className="ci-sheet">
        <div className="ci-disclaimer">
          This sale contract is made as per the following terms/conditions mutually confirmed:
        </div>
        <div className="ci-topbar">
          <div className="ci-logo-block">
            <div className="ci-logo-mark">S</div>
            <div className="ci-logo-text">SYNSHOO</div>
          </div>
          <div className="ci-company">
            <h1>{commercialCompany.name}</h1>
            <p>{commercialCompany.address}</p>
            <p>Tel: {commercialCompany.phone} Fax: {commercialCompany.fax}</p>
          </div>
        </div>

        <div className="ci-meta">
          <div className="ci-meta-left">
            <div>
              <span>{t("ci.invoiceNo")}</span>
              <strong>{invoiceNo}</strong>
            </div>
            <div>
              <span>{t("ci.contractRef")}</span>
              <strong>{contractRef}</strong>
            </div>
          </div>
          <div className="ci-title">COMMERCIAL INVOICE</div>
          <div className="ci-meta-right">
            <div>
              <span>{t("ci.printDate")}</span>
              <strong>{invoiceDate}</strong>
            </div>
            <div>
              <span>{t("ci.date")}</span>
              <strong>{invoiceDate}</strong>
            </div>
          </div>
        </div>

        <section className="ci-header-grid">
          <div className="ci-panel">
            <h2>{t("ci.shipTo")}</h2>
            <p>{shipTo}</p>
            <div className="ci-panel-foot">
              <span>ZIP:</span>
              <span>TEL:</span>
            </div>
            <p className="ci-contact">Contact: {selectedPoVendor.contact || "Sweet"}</p>
          </div>
          <div className="ci-panel">
            <div className="ci-two-line">
              <span>{t("ci.airwaybill")}:</span>
              <strong>-</strong>
            </div>
            <div className="ci-two-line">
              <span>{t("ci.shipVia")}:</span>
              <strong>-</strong>
            </div>
            <div className="ci-terms-line">
              <span>{t("ci.terms")}:</span>
              <strong>{t("ci.termsValue")}</strong>
            </div>
          </div>
        </section>

        <section className="ci-item-block">
          <div className="ci-item-head">
            <span>QUANTITY</span>
            <span>{t("ci.itemDescription")}</span>
            <span>{t("ci.description")}</span>
            <span>{t("ci.unitPrice")}</span>
            <span>{t("ci.amount")}</span>
          </div>
          {invoiceLines.length ? (
            invoiceLines.map((line, index) => {
              const amount = line.quantity * line.unitPrice;
              return (
                <div className="ci-item-row" key={`${line.itemCode}-${index}`}>
                  <span>{formatCiQuantity(line.quantity)}</span>
                  <span>{line.itemCode || "-"}</span>
                  <span>{line.itemDescription || "-"}</span>
                  <span>{formatCiUnitPrice(line.unitPrice)}</span>
                  <span>{formatCiAmount(amount)}</span>
                </div>
              );
            })
          ) : (
            <div className="ci-item-row ci-item-empty">
              <span>-</span>
              <span>{sourceLine?.itemCode || selectedPo?.itemCode || "-"}</span>
              <span>{sourceLine?.itemDescription || selectedPo?.description || "-"}</span>
              <span>{formatCiUnitPrice(sourceLine?.unitPrice ?? 0)}</span>
              <span>{formatCiAmount(0)}</span>
            </div>
          )}
          <div className="ci-total-row">
            <span>{t("ci.total")}</span>
            <strong>{formatCiAmount(invoiceTotal)}</strong>
          </div>
        </section>

        <section className="ci-footer">
          <div>
            <span>{t("ci.poNumber")}:</span>
            <strong>{selectedPo?.sourcePiId || selectedPo?.ourRefNo || "-"}</strong>
          </div>
          <div>
            <span>{t("ci.countryOfOrigin")}:</span>
            <strong>CHINA</strong>
          </div>
          <div>
            <span>{t("ci.remarks")}:</span>
            <strong>{selectedPo?.remarks || "-"}</strong>
          </div>
          <div>
            <span>{t("ci.moon")}:</span>
            <strong>{selectedPo?.notes || "-"}</strong>
          </div>
        </section>
      </article>

      <article className="packing-sheet">
        <div className="packing-topbar">
          <div className="packing-logo-block">
            <div className="packing-logo-mark">S</div>
            <div className="packing-logo-text">SYNSHOO</div>
          </div>
          <div className="packing-company">
            <h1>{commercialCompany.name}</h1>
            <p>{commercialCompany.address}</p>
            <p>Tel: {commercialCompany.phone} Fax: {commercialCompany.fax}</p>
          </div>
        </div>

        <h1 className="packing-title">PACKING LIST</h1>

        <section className="packing-meta">
          <div>
            <span>Ci Ref:</span>
            <strong>{invoiceNo}</strong>
          </div>
          <div>
            <span>Contract Ref:</span>
            <strong>{contractRef}</strong>
          </div>
          <div>
            <span>Date:</span>
            <strong>{invoiceDate.replace(/-/g, "/")}</strong>
          </div>
        </section>

        <section className="packing-address-grid">
          <div className="packing-address-card">
            <span>To:</span>
            <strong>{selectedPoCustomer.name || selectedPo?.customer || "-"}</strong>
            <p>{selectedPoCustomer.address || selectedPo?.deliverTo || "-"}</p>
            <p>
              ATT: {selectedPoCustomer.contact || selectedPoVendor.contact || "-"}<br />
              ZIP: -<br />
              TEL: {selectedPoCustomer.phone || "-"}<br />
              Fax: -
            </p>
          </div>
          <div className="packing-summary-box">
            <div className="packing-summary-row">
              <span>Nos of CTNs</span>
              <strong>{totalCtns}</strong>
            </div>
            <div className="packing-summary-row">
              <span>Gross Weight (kg)</span>
              <strong>{grossWeight}</strong>
            </div>
            <div className="packing-summary-row">
              <span>Net Weight (kg)</span>
              <strong>{netWeight}</strong>
            </div>
            <div className="packing-summary-row">
              <span>CBM</span>
              <strong>{cbm}</strong>
            </div>
          </div>
        </section>

        <div className="packing-awb">AWB: {selectedPo?.poNo || "-"}</div>

        <section className="packing-table">
          <div className="packing-head">
            <span>Package No.</span>
            <span>Lot/P.O.#</span>
            <span>Code Ref.</span>
            <span>Size</span>
            <span>Color</span>
            <span>No.of Pkgs</span>
            <span>Quantity[pcs]</span>
          </div>
          {packingRowsForList.map((row, index) => {
            const poLabel = selectedPo?.ourRefNo || selectedPo?.poNo || "-";
            return (
              <div className="packing-row" key={`${selectedPo?.id ?? "packing"}-${index}`}>
                <span>{row.lot || String(index + 1)}</span>
                <span>{poLabel}</span>
                <span>{selectedPo?.itemCode || "-"}</span>
                <span>{row.size || selectedPo?.size || "-"}</span>
                <span>{selectedPo?.colors || "-"}</span>
                <span>1</span>
                <span>{formatCiQuantity(Number(row.quantity || 0))}</span>
              </div>
            );
          })}
        </section>

        <section className="packing-summary-table">
          <div className="packing-summary-head">
            <span>Item</span>
            <span>Code Ref:</span>
            <span>Description</span>
            <span>Total Quantity(PCS)</span>
          </div>
          {packingSummaryRows.map((row) => (
            <div className="packing-summary-row" key={`${row.codeRef}-${row.itemNo}`}>
              <span>{row.itemNo}</span>
              <span>{row.codeRef}</span>
              <span>
                <div className="packing-summary-description">
                  <strong>Program</strong>
                  <div>{row.item}</div>
                </div>
              </span>
              <span>{formatCiQuantity(row.quantity)}</span>
            </div>
          ))}
        </section>

        <footer className="packing-footer">
          <div className="packing-ack">
            <strong>Acknowledged Receipt The</strong>
            <strong>Captioned Goods In Good Conditions</strong>
          </div>
          <div className="packing-sign">
            <span>Prepare by</span>
            <div className="packing-sign-line" />
          </div>
          <div className="packing-stamp">
            <span>Authenticated Signature &amp; Chop</span>
            <div className="packing-stamp-line" />
          </div>
        </footer>
      </article>
    </div>
  );
}

function ProductsPage({
  locale,
  t,
  products,
  onStartCreate,
  onEditProduct,
  onDeleteProduct,
}: {
  locale: Locale;
  t: (key: string) => string;
  products: Product[];
  onStartCreate: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
}) {
  return (
    <div className="page-stack">
      <SectionShell
        title={t("section.products")}
        action={
          <button className="primary-button" type="button" onClick={onStartCreate}>
            <IconPlus size={18} strokeWidth={2} />
            {t("button.addProduct")}
          </button>
        }
      >
      <Table
          columns={[
            t("table.image"),
            t("table.productId"),
            t("table.productCodePrefix"),
            t("table.productQuoteCodes"),
            t("table.productName"),
            t("table.supplier"),
            t("table.category"),
            t("table.price"),
            t("table.stock"),
            t("table.actions"),
          ]}
          rows={products.map((item) => [
            renderProductThumb(item, item.name),
            item.id,
            item.codePrefix || "-",
            (item.quoteProductCodes ?? []).length > 0 ? (item.quoteProductCodes ?? []).join(" / ") : "-",
            item.name,
            getProductSupplierLabel(item),
            t(`category.${item.categoryKey}`),
            formatMoney(item.price, locale),
            String(item.stock),
            <TableActions key={item.id} t={t} onEdit={() => onEditProduct(item)} onDelete={() => onDeleteProduct(item)} />,
          ])}
        />
      </SectionShell>
    </div>
  );
}

function OrdersPage({
  locale,
  t,
  orders,
  onStartCreate,
  onEditOrder,
  onDeleteOrder,
  onGeneratePI,
}: {
  locale: Locale;
  t: (key: string) => string;
  orders: Order[];
  onStartCreate: () => void;
  onEditOrder: (order: Order) => void;
  onDeleteOrder: (order: Order) => void;
  onGeneratePI: (order: Order) => void;
}) {
  return (
    <SectionShell
      title={t("section.orders")}
      action={
        <button className="primary-button" type="button" onClick={onStartCreate}>
          <IconPlus size={18} strokeWidth={2} />
          {t("button.addOrder")}
        </button>
      }
    >
      <Table
        columns={[t("table.orderId"), t("table.customer"), t("table.productName"), t("table.status"), t("table.amount"), t("table.channel"), t("table.actions")]}
        rows={orders.map((item) => [
          item.id,
          item.customer,
          item.product,
          <span className={`status-pill status-${item.status.toLowerCase()}`} key={`${item.id}-status`}>
            {t(`status.${item.status}`)}
          </span>,
          formatMoney(item.total, locale),
          item.channel,
          <TableActions
            key={`${item.id}-actions`}
            t={t}
            extraActions={
              <button type="button" className="action-link generate" onClick={() => onGeneratePI(item)}>
                <IconFileInvoice size={16} strokeWidth={2} />
                {t("action.generate")}
              </button>
            }
            onEdit={() => onEditOrder(item)}
            onDelete={() => onDeleteOrder(item)}
          />,
        ])}
      />
    </SectionShell>
  );
}

function ContractsPage({
  locale,
  t,
  contracts,
  onStartCreate,
  onEditContract,
  onDeleteContract,
}: {
  locale: Locale;
  t: (key: string) => string;
  contracts: Contract[];
  onStartCreate: () => void;
  onEditContract: (contract: Contract) => void;
  onDeleteContract: (contract: Contract) => void;
}) {
  return (
    <SectionShell
      title={t("section.contracts")}
      action={
        <button className="primary-button" type="button" onClick={onStartCreate}>
          <IconPlus size={18} strokeWidth={2} />
          {t("button.addContract")}
        </button>
      }
    >
      <Table
        columns={[t("table.contractId"), t("table.client"), t("table.contractName"), t("table.status"), t("table.amount"), t("table.deadline"), t("table.actions")]}
        rows={contracts.map((item) => [
          item.id,
          item.client,
          item.title,
          <span className={`status-pill status-${item.status.toLowerCase()}`} key={`${item.id}-status`}>
            {t(`status.${item.status}`)}
          </span>,
          formatMoney(item.amount, locale),
          formatDate(item.deadline, locale),
          <TableActions key={`${item.id}-actions`} t={t} onEdit={() => onEditContract(item)} onDelete={() => onDeleteContract(item)} />,
        ])}
      />
    </SectionShell>
  );
}

function SettingsPage({
  t,
  currentPage,
  quoteAccessGranted,
  onToggleQuoteAccess,
}: {
  locale: Locale;
  t: (key: string) => string;
  currentPage: string;
  quoteAccessGranted: boolean;
  onToggleQuoteAccess: (value: boolean) => void;
}) {
  return (
    <div className="two-column settings-grid">
      <SectionShell title={t("settings.theme")}>
        <div className="settings-card-copy">{t("settings.themeDesc")}</div>
        <div className="color-chip-row">
          <span />
          <span />
          <span />
        </div>
      </SectionShell>

      <SectionShell title={t("section.architecture")}>
        <div className="stack-list">
          <div>
            <strong>{t("arch.pages")}</strong>
            <p>{t("arch.desc")}</p>
          </div>
          <div>
            <strong>{t("arch.workers")}</strong>
            <p>{t("arch.workersDesc")}</p>
          </div>
          <div>
            <strong>{t("arch.d1")}</strong>
            <p>{t("arch.d1Desc")}</p>
          </div>
          <div>
            <strong>{t("arch.r2")}</strong>
            <p>{t("arch.r2Desc")}</p>
          </div>
          <div>
            <strong>{t("arch.queues")}</strong>
            <p>{t("arch.queuesDesc")}</p>
          </div>
        </div>
        <div className="settings-toggle-card">
          <div>
            <strong>{t("settings.quoteAccess")}</strong>
            <p>{t("settings.quoteAccessDesc")}</p>
          </div>
          <button
            type="button"
            className={quoteAccessGranted ? "primary-button" : "secondary-button"}
            onClick={() => onToggleQuoteAccess(!quoteAccessGranted)}
          >
            {quoteAccessGranted ? t("settings.quoteAccessOn") : t("settings.quoteAccessOff")}
          </button>
        </div>
        <div className="settings-card-copy">
          {t("settings.currentPage")} {t(`page.${currentPage}`)}
        </div>
      </SectionShell>
    </div>
  );
}

function Table({
  columns,
  rows,
  template: templateOverride,
  minWidth: minWidthOverride,
}: {
  columns: string[];
  rows: ReactNode[][];
  template?: string;
  minWidth?: number;
}) {
  const template = templateOverride ?? `repeat(${columns.length}, minmax(0, 1fr))`;
  const minWidth = minWidthOverride ?? Math.max(columns.length * 120, 960);
  return (
    <div className="table-card">
      <div className="table-head-row" style={{ gridTemplateColumns: template, minWidth }}>
        {columns.map((column) => (
          <span key={column}>{column}</span>
        ))}
      </div>
      <div className="table-body">
        {rows.map((row, index) => (
          <div className="table-row" key={index} style={{ gridTemplateColumns: template, minWidth }}>
            {row.map((cell, cellIndex) => (
              <div className="table-cell" key={cellIndex}>
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniList({ rows }: { rows: Array<{ title: string; subtitle: string; meta: string }> }) {
  return (
    <div className="mini-list">
      {rows.map((item, index) => (
        <article className="mini-item" key={`${item.title}-${index}`}>
          <div>
            <strong>{item.title}</strong>
            <p>{item.subtitle}</p>
          </div>
          <span>{item.meta}</span>
        </article>
      ))}
    </div>
  );
}

function TableActions({
  t,
  extraActions,
  onView,
  onEdit,
  onDelete,
}: {
  t: (key: string) => string;
  extraActions?: ReactNode;
  onView?: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="action-links">
      {extraActions}
      {onView && (
        <button type="button" className="action-link view" onClick={onView}>
          <IconEye size={16} strokeWidth={2} />
          {t("action.view")}
        </button>
      )}
      <button type="button" className="action-link edit" onClick={onEdit}>
        <IconEdit size={16} strokeWidth={2} />
        {t("action.edit")}
      </button>
      <button type="button" className="action-link delete" onClick={onDelete}>
        <IconTrash size={16} strokeWidth={2} />
        {t("action.delete")}
      </button>
    </div>
  );
}

function EditorModal({ title, onClose, children, className = "" }: { title: string; onClose: () => void; children: ReactNode; className?: string }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className={`modal-card ${className}`.trim()} role="dialog" aria-modal="true" aria-labelledby="editor-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <p className="modal-eyebrow">Woodgrain Ops</p>
            <h2 id="editor-modal-title">{title}</h2>
          </div>
          <button className="icon-btn modal-close" type="button" onClick={onClose} aria-label="Close dialog">
            <IconX size={18} strokeWidth={2} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default App;
