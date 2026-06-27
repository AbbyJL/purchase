import React from "react";
import { Modal, Form, Input, Select, DatePicker, Upload, Button, Checkbox, InputNumber, Collapse } from "antd";
import { PlusOutlined, DeleteOutlined, UploadOutlined, LockOutlined } from "@ant-design/icons";
import type { Quote, QuoteLine, QuoteTier, QuoteCostItem, Product, Brand, Customer, Supplier } from "./types";

const { TextArea } = Input;

/** 供应商定价条目（UI 层用，序列化时存入 QuoteLine.supplierPricing） */
export interface SupplierPricing {
  supplierName: string;
  unitPrice: number;
  sampleQty: number;
  priceNotes: string;
  costItems: QuoteCostItem[];
}

interface QuoteFormProps {
  open: boolean;
  isEditing: boolean;
  quoteDraft: Quote;
  quoteLines: QuoteLine[];
  quoteTiers: QuoteTier[];
  products: Product[];
  brands: Brand[];
  customers: Customer[];
  suppliers: Supplier[];
  onCancel: () => void;
  onSubmit: () => void;
  onDraftChange: (draft: Quote) => void;
  onLinesChange: (lines: QuoteLine[]) => void;
  onTiersChange: (tiers: QuoteTier[]) => void;
  onImageUpload: (file: File) => void;
  onLineImageUpload: (index: number, file: File) => void;
  onClearImage: () => void;
  onDateChange?: (date: string) => void; // 父组件用此回调按日期重新生成报价单号
}

/** 从 QuoteLine 读取供应商定价列表（兼容旧数据 string[]） */
function readSupplierPricing(line: QuoteLine): SupplierPricing[] {
  const raw = (line as any).supplierPricing;
  if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === "object" && "supplierName" in raw[0]) {
    return raw as SupplierPricing[];
  }
  // 兼容旧数据：string[] → 转为 SupplierPricing[]
  const oldSuppliers: string[] = line.suppliers ?? [];
  return oldSuppliers
    .filter((s) => s.trim())
    .map((name) => ({
      supplierName: name,
      unitPrice: line.price ?? 0,
      sampleQty: line.sample ?? 0,
      priceNotes: line.pricingNotes || line.description || "",
      costItems: line.costItems ?? [],
    }));
}

/** 默认成本项选项 */
const DEFAULT_COST_LABELS = ["纸", "印刷", "哑油", "工艺", "覆膜", "烫金", "模切", "其它"];

const QuoteForm: React.FC<QuoteFormProps> = ({
  open,
  isEditing,
  quoteDraft,
  quoteLines,
  quoteTiers,
  products,
  brands,
  customers,
  suppliers,
  onCancel,
  onSubmit,
  onDraftChange,
  onLinesChange,
  onTiersChange,
  onImageUpload,
  onLineImageUpload,
  onClearImage,
  onDateChange,
}) => {
  const handleBrandChange = (value: string) => {
    onDraftChange({ ...quoteDraft, brand: value });
  };

  const handleCustomerChange = (value: string) => {
    onDraftChange({ ...quoteDraft, customer: value });
  };

  const handleAddLine = () => {
    const newLine: QuoteLine = {
      id: Date.now(),
      productId: "",
      productName: "",
      productCode: "",
      quantity: 0,
      price: 0,
      sample: 0,
      costItems: [],
      suppliers: [],
      checked: false,
      imageUrl: "",
      spec: { type: "", size: "", color: "", finished: "", remarks: "" },
      pricingNotes: "",
      description: "",
    };
    onLinesChange([...quoteLines, newLine]);
  };

  const handleRemoveLine = (index: number) => {
    onLinesChange(quoteLines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const newLines = [...quoteLines];
    (newLines[index] as any)[field] = value;
    onLinesChange(newLines);
  };

  /** 更新某行的供应商定价列表 */
  const handleSupplierPricingChange = (lineIndex: number, pricingList: SupplierPricing[]) => {
    const newLines = [...quoteLines];
    // 同时回写 suppliers（字符串数组）和 supplierPricing（结构化数据）
    const supNames = pricingList.map((p) => p.supplierName);
    newLines[lineIndex] = {
      ...newLines[lineIndex],
      suppliers: supNames.length > 0 ? supNames : [""],
      // 将第一个供应商的单价/数量同步到行级别字段
      price: pricingList[0]?.unitPrice ?? 0,
      sample: pricingList[0]?.sampleQty ?? 0,
      costItems: pricingList[0]?.costItems ?? [],
      pricingNotes: pricingList[0]?.priceNotes ?? "",
    };
    (newLines[lineIndex] as any).supplierPricing = pricingList;
    onLinesChange(newLines);
  };

  const handleAddTier = () => {
    const newTier: QuoteTier = {
      id: Date.now(),
      quantity: "",
      unitPrice: 0,
      note: "",
    };
    onTiersChange([...quoteTiers, newTier]);
  };

  /** 新增供应商定价卡片 */
  const handleAddSupplier = (lineIndex: number) => {
    const current = readSupplierPricing(quoteLines[lineIndex]);
    const newPricing: SupplierPricing = {
      supplierName: "",
      unitPrice: 0,
      sampleQty: 0,
      priceNotes: "",
      costItems: [{ label: "纸", amount: 0 }],
    };
    handleSupplierPricingChange(lineIndex, [...current, newPricing]);
  };

  /** 删除供应商定价卡片 */
  const handleRemoveSupplier = (lineIndex: number, supIndex: number) => {
    const current = readSupplierPricing(quoteLines[lineIndex]);
    const updated = current.filter((_, i) => i !== supIndex);
    handleSupplierPricingChange(lineIndex, updated);
  };

  /** 更新供应商定价的某个字段 */
  const handlePricingFieldChange = (
    lineIndex: number,
    supIndex: number,
    field: keyof SupplierPricing,
    value: any
  ) => {
    const current = readSupplierPricing(quoteLines[lineIndex]);
    const updated = [...current];
    updated[supIndex] = { ...updated[supIndex], [field]: value };
    handleSupplierPricingChange(lineIndex, updated);
  };

  /** 新增成本项 */
  const handleAddCostItem = (lineIndex: number, supIndex: number) => {
    const current = readSupplierPricing(quoteLines[lineIndex]);
    const updated = [...current];
    const costs = [...(updated[supIndex].costItems ?? []), { label: "其它", amount: 0 }];
    updated[supIndex] = { ...updated[supIndex], costItems: costs };
    handleSupplierPricingChange(lineIndex, updated);
  };

  /** 删除成本项 */
  const handleRemoveCostItem = (lineIndex: number, supIndex: number, costIdx: number) => {
    const current = readSupplierPricing(quoteLines[lineIndex]);
    const updated = [...current];
    const costs = updated[supIndex].costItems.filter((_, i) => i !== costIdx);
    updated[supIndex] = { ...updated[supIndex], costItems: costs };
    handleSupplierPricingChange(lineIndex, updated);
  };

  /** 更新成本项 */
  const handleCostItemChange = (
    lineIndex: number,
    supIndex: number,
    costIdx: number,
    field: keyof QuoteCostItem,
    value: any
  ) => {
    const current = readSupplierPricing(quoteLines[lineIndex]);
    const updated = [...current];
    const costs = [...updated[supIndex].costItems];
    costs[costIdx] = { ...costs[costIdx], [field]: value };
    updated[supIndex] = { ...updated[supIndex], costItems: costs };
    handleSupplierPricingChange(lineIndex, updated);
  };

  return (
    <Modal
      title={isEditing ? "编辑报价" : "新增报价"}
      open={open}
      onCancel={onCancel}
      width={960}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取 消
        </Button>,
        <Button key="submit" type="primary" onClick={onSubmit}>
          {isEditing ? "保 存" : "创 建"}
        </Button>,
      ]}
    >
      <Form layout="vertical" className="quote-sheet-form">
        {/* 基本信息 */}
        <fieldset className="quote-section">
          <legend><strong>基本信息</strong></legend>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
            <Form.Item label={<>品牌 <span style={{ color: "#cf1322" }}>*</span></>}>
              <Select
                value={quoteDraft.brand}
                onChange={handleBrandChange}
                placeholder="-"
                options={brands.map((b) => ({ label: b.name, value: b.name }))}
              />
            </Form.Item>
            <Form.Item label={<>客户 <span style={{ color: "#cf1322" }}>*</span></>}>
              <Select
                value={quoteDraft.customer}
                onChange={handleCustomerChange}
                placeholder="-"
                options={customers.map((c) => ({ label: c.name, value: c.name }))}
              />
            </Form.Item>
            <Form.Item label="报价单号">
              <Input
                value={quoteDraft.quoteNo}
                onChange={(e) => onDraftChange({ ...quoteDraft, quoteNo: e.target.value })}
                placeholder="QU + YYMM + 3位流水号"
                style={{ color: "#1677ff", fontWeight: 600 }}
              />
            </Form.Item>
            <Form.Item label="日期">
              <DatePicker
                value={undefined}
                onChange={(date: any) => {
                  const dateStr = date ? date.format("YYYY-MM-DD") : "";
                  onDraftChange({ ...quoteDraft, date: dateStr });
                  if (dateStr) onDateChange?.(dateStr);
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item label="登记人">
              <Input value={quoteDraft.register} onChange={(e) => onDraftChange({ ...quoteDraft, register: e.target.value })} />
            </Form.Item>
            <Form.Item label="修改日期">
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="业务员">
              <Input value={quoteDraft.salesperson} onChange={(e) => onDraftChange({ ...quoteDraft, salesperson: e.target.value })} />
            </Form.Item>
            <Form.Item label="联系人">
              <Input value={quoteDraft.linkman} onChange={(e) => onDraftChange({ ...quoteDraft, linkman: e.target.value })} />
            </Form.Item>
          </div>
          <Form.Item label="ITEM TYPE" style={{ marginTop: 8 }}>
            <Input value={quoteDraft.itemType} onChange={(e) => onDraftChange({ ...quoteDraft, itemType: e.target.value })} />
          </Form.Item>
          <Form.Item label="ITEM">
            <Input value={quoteDraft.item} onChange={(e) => onDraftChange({ ...quoteDraft, item: e.target.value })} />
          </Form.Item>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 140, height: 100, border: "1px dashed #d9d9d9", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
              {quoteDraft.imageUrl ? (
                <img src={quoteDraft.imageUrl} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <UploadOutlined style={{ fontSize: 24, color: "#ccc" }} />
              )}
            </div>
            <div>
              <Upload beforeUpload={(file) => { onImageUpload(file as File); return false; }} showUploadList={false}>
                <Button icon={<UploadOutlined />}>上传图片</Button>
              </Upload>
              <Button style={{ marginTop: 4 }} onClick={onClearImage}>清除图片</Button>
            </div>
          </div>
        </fieldset>

        {/* 明细行 */}
        <fieldset className="quote-section">
          <legend style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>明细行</strong>
            <Button type="default" size="small" icon={<PlusOutlined />} onClick={handleAddLine}>
              新增明细
            </Button>
          </legend>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {quoteLines.map((line, index) => {
              const pricingList = readSupplierPricing(line);
              return (
                <div key={line.id ?? index} style={{ border: "1px solid #e8e8e8", borderRadius: 10, padding: 14, background: "#fff" }}>
                  {/* 行头部：复选框 + 图片 + 产品信息 + 单价/数量 */}
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <Checkbox checked={line.checked} onChange={(e) => handleLineChange(index, "checked", e.target.checked)} style={{ marginTop: 6 }} />
                    {/* 产品图片上传 */}
                    <div style={{ width: 100, minHeight: 80, border: "1px dashed #d9d9d9", borderRadius: 6, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                      {line.imageUrl ? (
                        <img src={line.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <UploadOutlined style={{ color: "#ccc" }} />
                      )}
                      <label style={{ cursor: "pointer", fontSize: 10, color: "#1677ff" }}>
                        上传
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && onLineImageUpload(index, e.target.files[0])} />
                      </label>
                    </div>
                    {/* 产品信息 */}
                    <div style={{ flex: 1, display: "grid", gap: 6, gridTemplateColumns: "1fr 1fr" }}>
                      <Select
                        value={line.productId}
                        onChange={(val) => handleLineChange(index, "productId", val)}
                        placeholder="从样品管理选择或手动输入"
                        options={products.map((p) => ({ label: p.name, value: p.id }))}
                        style={{ gridColumn: "1 / -1" }}
                      />
                      <Input value={line.productName} onChange={(e) => handleLineChange(index, "productName", e.target.value)} placeholder="产品名称" />
                      <Input value={line.productCode} onChange={(e) => handleLineChange(index, "productCode", e.target.value)} placeholder="产品代码" />
                      {/* 单价 & 数量 */}
                      <InputNumber
                        value={line.price}
                        onChange={(val) => handleLineChange(index, "price", val ?? 0)}
                        placeholder="单价"
                        prefix="¥"
                        min={0}
                        precision={2}
                        size="small"
                        style={{ width: "100%" }}
                      />
                      <InputNumber
                        value={line.quantity}
                        onChange={(val) => handleLineChange(index, "quantity", val ?? 0)}
                        placeholder="数量"
                        min={0}
                        precision={0}
                        size="small"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  {/* 规格说明 */}
                  <Collapse
                    size="small"
                    items={[{
                      key: "spec",
                      label: (
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          📐 规格说明
                          {line.specLocked !== false && <LockOutlined style={{ fontSize: 11, color: "#1677ff" }} />}
                          {line.specLocked === false && (
                            <Button type="link" size="small" style={{ fontSize: 11, padding: 0, marginLeft: 4 }}
                              onClick={() => handleLineChange(index, "specLocked", true)}>
                              锁定
                            </Button>
                          )}
                        </span>
                      ),
                      children: (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                          <Input value={line.spec?.type} onChange={(e) => handleLineChange(index, "spec", { ...line.spec, type: e.target.value })} placeholder="TYPE (类型)" size="small" disabled={!!line.specLocked} />
                          <Input value={line.spec?.size} onChange={(e) => handleLineChange(index, "spec", { ...line.spec, size: e.target.value })} placeholder="SIZE (尺寸)" size="small" disabled={!!line.specLocked} />
                          <Input value={line.spec?.color} onChange={(e) => handleLineChange(index, "spec", { ...line.spec, color: e.target.value })} placeholder="COLOR (颜色)" size="small" disabled={!!line.specLocked} />
                          <Input value={line.spec?.finished} onChange={(e) => handleLineChange(index, "spec", { ...line.spec, finished: e.target.value })} placeholder="FINISHED (后道)" size="small" disabled={!!line.specLocked} />
                          <TextArea value={line.spec?.remarks} onChange={(e) => handleLineChange(index, "spec", { ...line.spec, remarks: e.target.value })} placeholder="备注说明" rows={2} size="small" disabled={!!line.specLocked} />
                        </div>
                      ),
                    }]}
                    style={{ marginTop: 8, border: "none", background: "transparent" }}
                  />

                  {/* 供应商定价 */}
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>🏭 供应商定价</span>
                      <Button type="default" size="small" style={{ borderColor: "#1677ff", background: "#e6f4ff", color: "#1677ff" }} onClick={() => handleAddSupplier(index)}>
                        + 新增供应商
                      </Button>
                    </div>
                    {pricingList.map((pricing, si) => (
                      <div key={si} style={{ marginTop: 8, background: "#fafafa", borderRadius: 8, padding: 12, border: "1px solid #e8e8e8" }}>
                        {/* 供应商选择 + 删除 */}
                        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 10 }}>
                          <Select
                            value={pricing.supplierName || undefined}
                            onChange={(val) => handlePricingFieldChange(index, si, "supplierName", val)}
                            placeholder="选择供应商"
                            options={suppliers.map((s) => ({ label: s.name, value: s.name }))}
                            style={{ flex: 1 }}
                            size="small"
                            showSearch
                            filterOption={(input, option) =>
                              (option?.label?.toString() ?? "").toLowerCase().includes(input.toLowerCase())
                            }
                          />
                          <Button type="text" danger size="small" onClick={() => handleRemoveSupplier(index, si)}>
                            ×
                          </Button>
                        </div>

                        {/* 单价(PER) | 样品数 */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                          <div>
                            <label style={{ fontSize: 12, color: "#666", marginBottom: 2, display: "block" }}>单价(PER)</label>
                            <InputNumber
                              value={pricing.unitPrice}
                              onChange={(val) => handlePricingFieldChange(index, si, "unitPrice", val ?? 0)}
                              placeholder="0.00"
                              min={0}
                              precision={2}
                              size="small"
                              style={{ width: "100%" }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: 12, color: "#666", marginBottom: 2, display: "block" }}>样品数</label>
                            <InputNumber
                              value={pricing.sampleQty}
                              onChange={(val) => handlePricingFieldChange(index, si, "sampleQty", val ?? 0)}
                              placeholder="0"
                              min={0}
                              precision={0}
                              size="small"
                              style={{ width: "100%" }}
                            />
                          </div>
                        </div>

                        {/* 价格说明 | 成本项 */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, alignItems: "start" }}>
                          <div>
                            <label style={{ fontSize: 12, color: "#666", marginBottom: 2, display: "block" }}>价格说明</label>
                            <TextArea
                              value={pricing.priceNotes}
                              onChange={(e) => handlePricingFieldChange(index, si, "priceNotes", e.target.value)}
                              placeholder="如：1M:900/M&#10;2.5M:720/M"
                              rows={3}
                              size="small"
                              style={{ fontSize: 12 }}
                            />
                          </div>
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                              <label style={{ fontSize: 12, color: "#666" }}>成本项</label>
                              <Button type="link" size="small" style={{ fontSize: 11, padding: 0, color: "#1677ff", height: "auto" }}
                                onClick={() => handleAddCostItem(index, si)}>
                                +新增
                              </Button>
                            </div>
                            {(pricing.costItems ?? []).map((ci, ciIdx) => (
                              <div key={ciIdx} style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 4 }}>
                                <Select
                                  value={ci.label}
                                  onChange={(val) => handleCostItemChange(index, si, ciIdx, "label", val)}
                                  size="small"
                                  style={{ width: 90 }}
                                  options={[
                                    ...DEFAULT_COST_LABELS.filter(
                                      (l) => !(pricing.costItems ?? []).some((item, i) => item.label === l && i !== ciIdx)
                                    ).map((l) => ({ label: l, value: l })),
                                    { label: ci.label && !DEFAULT_COST_LABELS.includes(ci.label) ? ci.label : "", value: "" },
                                  ].filter((o) => o.value)}
                                />
                                <InputNumber
                                  value={ci.amount}
                                  onChange={(val) => handleCostItemChange(index, si, ciIdx, "amount", val ?? 0)}
                                  placeholder="金额"
                                  min={0}
                                  precision={2}
                                  size="small"
                                  style={{ flex: 1 }}
                                />
                                <Button type="text" danger size="small" style={{ fontSize: 14, padding: "0 2px" }}
                                  onClick={() => handleRemoveCostItem(index, si, ciIdx)}>
                                  ×
                                </Button>
                              </div>
                            ))}
                            {(pricing.costItems ?? []).length === 0 && (
                              <div style={{ fontSize: 11, color: "#bbb" }}>暂无成本项，点击"+新增"添加</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {pricingList.length === 0 && (
                      <div style={{ textAlign: "center", color: "#bbb", fontSize: 12, padding: "8px 0" }}>
                        暂无供应商定价，点击右上角&quot;+ 新增供应商&quot;添加
                      </div>
                    )}
                  </div>

                  {/* SYNSHOO 报价说明 */}
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 11, color: "#fa8c16" }}>🔒 SYNSHOO 报价说明（仅自己可见）</div>
                    <TextArea value={line.synshooQuoteNotes} onChange={(e) => handleLineChange(index, "synshooQuoteNotes", e.target.value)} placeholder="此处填写报给客户的最终价格，不会出现在其他同事的系统中" rows={2} size="small" />
                  </div>

                  {/* 删除按钮 */}
                  <div style={{ marginTop: 8, textAlign: "right" }}>
                    <Button type="default" danger size="small" icon={<DeleteOutlined />} onClick={() => handleRemoveLine(index)}>
                      删除此行
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </fieldset>

        {/* 价格档位 */}
        <Collapse
          items={[{
            key: "tiers",
            label: <span><strong>价格档位</strong></span>,
            children: (
              <div>
                <p style={{ fontSize: 11, color: "#888", marginBottom: 8 }}>档位数量的单价会自动同步到每条明细的价格说明中。</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {quoteTiers.map((tier, ti) => (
                    <div key={tier.id ?? ti} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <Input value={tier.quantity} onChange={(e) => {
                        const newTiers = [...quoteTiers];
                        newTiers[ti] = { ...newTiers[ti], quantity: e.target.value };
                        onTiersChange(newTiers);
                      }} placeholder="数量" style={{ width: 120 }} />
                      <InputNumber value={tier.unitPrice} onChange={(val) => {
                        const newTiers = [...quoteTiers];
                        newTiers[ti] = { ...newTiers[ti], unitPrice: val ?? 0 };
                        onTiersChange(newTiers);
                      }} placeholder="单价" style={{ width: 120 }} />
                      <Input value={tier.note} onChange={(e) => {
                        const newTiers = [...quoteTiers];
                        newTiers[ti] = { ...newTiers[ti], note: e.target.value };
                        onTiersChange(newTiers);
                      }} placeholder="备注" flex={1} />
                      <Button type="default" danger size="small" onClick={() => onTiersChange(quoteTiers.filter((_, i) => i !== ti))}>
                        删除
                      </Button>
                    </div>
                  ))}
                  <Button type="default" size="small" icon={<PlusOutlined />} onClick={handleAddTier}>
                    新增档位
                  </Button>
                </div>
              </div>
            ),
          }]}
          style={{ marginTop: 12, border: "1px solid #e8e8e8", borderRadius: 8 }}
        />

        {/* 备注 */}
        <Form.Item label="备注" style={{ marginTop: 12 }}>
          <TextArea value={quoteDraft.notes} onChange={(e) => onDraftChange({ ...quoteDraft, notes: e.target.value })} rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default QuoteForm;
