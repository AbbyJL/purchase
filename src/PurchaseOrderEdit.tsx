import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IconChevronLeft, IconDownload, IconPlus, IconTrash } from "@tabler/icons-react";
import type { Locale, PIRecord, PORecord, PurchaseOrderDraft, PurchaseOrderLine, ProofingLine } from "./types";
import { translate as t } from "./i18n";

function createLineId() {
  return `pol_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function emptyLine(): PurchaseOrderLine {
  return { id: createLineId(), vendorCode: "", vendorName: "", productCode: "", productName: "", spec: "", unit: "千个", quantity: 0, unitPrice: 0, quotedPrice: 0, minAmount: 0 };
}

function emptyProofingLine(): ProofingLine {
  return { id: createLineId(), item: "", vendorInfo: "", description: "", unit: "千个", proofingFee: 0, moldFee: 0, qty1: 0, qty2: 0 };
}

export default function PurchaseOrderEditPage({
  locale,
  pos,
  pis,
  onSave,
}: {
  locale: Locale;
  pos: PORecord[];
  pis: PIRecord[];
  onSave: (draft: PurchaseOrderDraft) => void;
}) {
  const { poId } = useParams<{ poId: string }>();
  const navigate = useNavigate();
  const sourcePO = useMemo(() => pos.find((p) => p.id === poId || p.poNo === poId) ?? null, [pos, poId]);
  const sourcePI = useMemo(() => (sourcePO?.sourcePiId ? pis.find((p) => p.id === sourcePO.sourcePiId || p.piNo === sourcePO.sourcePiId) ?? null : null), [pis, sourcePO]);

  const [draft, setDraft] = useState<PurchaseOrderDraft>(() => ({
    sourcePoId: sourcePO?.id ?? "",
    sourcePiId: sourcePO?.sourcePiId ?? "",
    poNo: sourcePO ? `${sourcePO.poNo}-1` : `PO${Date.now()}`,
    status: sourcePO?.status ?? "Draft",
    orderNo: sourcePO?.ourRefNo ?? "",
    customerOrderNo: sourcePO?.ourRefNo ?? "",
    customer: sourcePO?.customer ?? sourcePI?.customer ?? "",
    vendor: sourcePO?.vendor ?? sourcePI?.vendor ?? "",
    code: sourcePO?.itemCode ?? sourcePI?.itemCode ?? "",
    maker: "Jason",
    makeDate: new Date().toISOString().slice(0, 10),
    reviewer: "",
    reviewDate: "",
    deliveryDate: sourcePO?.deliveryDate ?? sourcePI?.deliveryDate ?? "",
    notes: sourcePO?.remarks ?? "",
    lines: sourcePO?.lines?.length
      ? sourcePO.lines.map((l) => ({
          id: createLineId(),
          vendorCode: l.productCode ?? "",
          vendorName: sourcePO?.vendor ?? "",
          productCode: l.itemCode ?? "",
          productName: l.itemDescription ?? l.productName ?? "",
          spec: "",
          unit: "千个",
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          quotedPrice: 0,
          minAmount: 0,
        }))
      : [emptyLine()],
    proofingLines: [emptyProofingLine()],
  }));

  const goodsTotal = useMemo(() => draft.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0), [draft.lines]);
  const proofingTotal = useMemo(() => draft.proofingLines.reduce((s, l) => s + l.proofingFee + l.moldFee, 0), [draft.proofingLines]);
  const grandTotal = goodsTotal + proofingTotal;

  function updateLine(id: string, patch: Partial<PurchaseOrderLine>) {
    setDraft((d) => ({ ...d, lines: d.lines.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
  }
  function addLine() { setDraft((d) => ({ ...d, lines: [...d.lines, emptyLine()] })); }
  function removeLine(id: string) { setDraft((d) => ({ ...d, lines: d.lines.filter((l) => l.id !== id) })); }

  function updateProofLine(id: string, patch: Partial<ProofingLine>) {
    setDraft((d) => ({ ...d, proofingLines: d.proofingLines.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
  }
  function addProofLine() { setDraft((d) => ({ ...d, proofingLines: [...d.proofingLines, emptyProofingLine()] })); }
  function removeProofLine(id: string) { setDraft((d) => ({ ...d, proofingLines: d.proofingLines.filter((l) => l.id !== id) })); }

  function handleSave() {
    onSave(draft);
    navigate("/po");
  }

  const tr = (key: string) => t(locale, key);

  if (!sourcePO) {
    return <div className="page-stack"><div className="card"><p>{tr("po.notFound")}</p><button className="secondary-button" onClick={() => navigate("/po")}>{tr("button.back")}</button></div></div>;
  }

  return (
    <div className="page-stack purchase-edit-page">
      {/* 顶部操作栏 */}
      <div className="po-edit-header">
        <div className="po-edit-title">
          <button className="secondary-button" onClick={() => navigate("/po")} style={{ minWidth: "auto", padding: "4px 8px" }}>
            <IconChevronLeft size={18} />
          </button>
          <h2>{tr("button.generateAccept")}</h2>
        </div>
        <div className="po-edit-actions">
          <button className="secondary-button" onClick={() => window.print()}>
            <IconDownload size={16} /> {tr("button.exportPdf")}
          </button>
          <button className="primary-button" onClick={handleSave} style={{ background: "#1D9E75", border: "none", color: "#fff" }}>
            {tr("button.save")}
          </button>
        </div>
      </div>

      {/* 基本信息卡片 */}
      <div className="card">
        <h3 className="card-title">基本信息</h3>
        <div className="po-edit-grid">
          <label><span>采购单号</span><input value={draft.poNo} onChange={(e) => setDraft({ ...draft, poNo: e.target.value })} /></label>
          <label><span>订单状态</span>
            <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as PORecord["status"] })}>
              <option value="Draft">{tr("status.Draft")}</option>
              <option value="Confirmed">{tr("status.Confirmed")}</option>
              <option value="Sent">{tr("status.Sent")}</option>
              <option value="Closed">{tr("status.Closed")}</option>
            </select>
          </label>
          <label><span>来源PO</span><input value={sourcePO?.poNo ?? ""} readOnly /></label>
          <label><span>来源PI</span><input value={sourcePI?.piNo ?? ""} readOnly /></label>
          <label><span>订单编号</span><input value={draft.orderNo} onChange={(e) => setDraft({ ...draft, orderNo: e.target.value })} /></label>
          <label><span>客户名称</span><input value={draft.customer} readOnly /></label>
          <label><span>代码</span><input value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} /></label>
          <label><span>制单人</span><input value={draft.maker} onChange={(e) => setDraft({ ...draft, maker: e.target.value })} /></label>
          <label><span>制单日期</span><input type="date" value={draft.makeDate} onChange={(e) => setDraft({ ...draft, makeDate: e.target.value })} /></label>
          <label><span>审核人</span><input value={draft.reviewer} onChange={(e) => setDraft({ ...draft, reviewer: e.target.value })} /></label>
          <label><span>审核日期</span><input type="date" value={draft.reviewDate} onChange={(e) => setDraft({ ...draft, reviewDate: e.target.value })} /></label>
          <label><span>交货日期</span><input type="date" value={draft.deliveryDate} onChange={(e) => setDraft({ ...draft, deliveryDate: e.target.value })} /></label>
        </div>
        <label style={{ display: "block", marginTop: "8px" }}><span>备注</span><textarea rows={2} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} /></label>
      </div>

      {/* 供应商明细表 */}
      <div className="card">
        <div className="card-header-row">
          <h3 className="card-title">供应商明细</h3>
          <button className="secondary-button" onClick={addLine} style={{ padding: "4px 10px", fontSize: "12px" }}>
            <IconPlus size={14} /> 新增行
          </button>
        </div>
        <div className="po-table-wrap">
          <table className="po-edit-table">
            <thead>
              <tr>
                <th className="w-s">供应商编号</th><th>供应商名称</th><th className="w-s">编号</th><th>名称</th>
                <th className="w-s">规格</th><th className="w-xs">单位</th><th className="w-n">数量</th>
                <th className="w-n">采购单价</th><th className="w-n">报价</th><th className="w-n">保底金额</th><th className="w-xs"></th>
              </tr>
            </thead>
            <tbody>
              {draft.lines.map((line) => (
                <tr key={line.id}>
                  <td><input value={line.vendorCode} onChange={(e) => updateLine(line.id, { vendorCode: e.target.value })} /></td>
                  <td><input value={line.vendorName} onChange={(e) => updateLine(line.id, { vendorName: e.target.value })} /></td>
                  <td><input value={line.productCode} onChange={(e) => updateLine(line.id, { productCode: e.target.value })} /></td>
                  <td><input value={line.productName} onChange={(e) => updateLine(line.id, { productName: e.target.value })} /></td>
                  <td><input value={line.spec} onChange={(e) => updateLine(line.id, { spec: e.target.value })} /></td>
                  <td><input value={line.unit} onChange={(e) => updateLine(line.id, { unit: e.target.value })} className="ta-c" /></td>
                  <td><input type="number" value={line.quantity || ""} onChange={(e) => updateLine(line.id, { quantity: Number(e.target.value) })} className="ta-r" /></td>
                  <td><input type="number" value={line.unitPrice || ""} onChange={(e) => updateLine(line.id, { unitPrice: Number(e.target.value) })} className="ta-r" step="0.01" /></td>
                  <td><input type="number" value={line.quotedPrice || ""} onChange={(e) => updateLine(line.id, { quotedPrice: Number(e.target.value) })} className="ta-r" step="0.01" /></td>
                  <td><input type="number" value={line.minAmount || ""} onChange={(e) => updateLine(line.id, { minAmount: Number(e.target.value) })} className="ta-r" step="0.01" /></td>
                  <td><button className="action-link delete" onClick={() => removeLine(line.id)} title="删除"><IconTrash size={14} /></button></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={6} className="ta-r" style={{ fontWeight: 500 }}>合计</td>
                <td className="ta-r" style={{ fontWeight: 500 }}>{draft.lines.reduce((s, l) => s + l.quantity, 0)}</td>
                <td colSpan={2}></td>
                <td className="ta-r" style={{ fontWeight: 500, color: "#1D9E75" }}>¥{goodsTotal.toLocaleString()}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 打样费用表 */}
      <div className="card">
        <div className="card-header-row">
          <h3 className="card-title">打样费用明细</h3>
          <button className="secondary-button" onClick={addProofLine} style={{ padding: "4px 10px", fontSize: "12px" }}>
            <IconPlus size={14} /> 新增行
          </button>
        </div>
        <div className="po-table-wrap">
          <table className="po-edit-table">
            <thead>
              <tr>
                <th>ITEM</th><th>VENDOR INFO</th><th>DESCRIPTION</th><th className="w-xs">Unit</th>
                <th className="w-n">打样费</th><th className="w-n">模具费</th>
                <th className="w-n">QTY1</th><th className="w-n">QTY2</th><th className="w-xs"></th>
              </tr>
            </thead>
            <tbody>
              {draft.proofingLines.map((line) => (
                <tr key={line.id}>
                  <td><input value={line.item} onChange={(e) => updateProofLine(line.id, { item: e.target.value })} /></td>
                  <td><input value={line.vendorInfo} onChange={(e) => updateProofLine(line.id, { vendorInfo: e.target.value })} /></td>
                  <td><input value={line.description} onChange={(e) => updateProofLine(line.id, { description: e.target.value })} /></td>
                  <td><input value={line.unit} onChange={(e) => updateProofLine(line.id, { unit: e.target.value })} className="ta-c" /></td>
                  <td><input type="number" value={line.proofingFee || ""} onChange={(e) => updateProofLine(line.id, { proofingFee: Number(e.target.value) })} className="ta-r" step="0.01" /></td>
                  <td><input type="number" value={line.moldFee || ""} onChange={(e) => updateProofLine(line.id, { moldFee: Number(e.target.value) })} className="ta-r" step="0.01" /></td>
                  <td><input type="number" value={line.qty1 || ""} onChange={(e) => updateProofLine(line.id, { qty1: Number(e.target.value) })} className="ta-r" /></td>
                  <td><input type="number" value={line.qty2 || ""} onChange={(e) => updateProofLine(line.id, { qty2: Number(e.target.value) })} className="ta-r" /></td>
                  <td><button className="action-link delete" onClick={() => removeProofLine(line.id)} title="删除"><IconTrash size={14} /></button></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="ta-r" style={{ fontWeight: 500 }}>打样费用合计</td>
                <td className="ta-r" style={{ fontWeight: 500, color: "#1D9E75" }}>¥{draft.proofingLines.reduce((s, l) => s + l.proofingFee, 0).toLocaleString()}</td>
                <td className="ta-r" style={{ fontWeight: 500, color: "#1D9E75" }}>¥{draft.proofingLines.reduce((s, l) => s + l.moldFee, 0).toLocaleString()}</td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 价格汇总 */}
      <div className="po-total-bar">
        <div className="total-item"><span>商品总额</span><strong>¥{goodsTotal.toLocaleString()}</strong></div>
        <div className="total-item"><span>打样费用</span><strong>¥{proofingTotal.toLocaleString()}</strong></div>
        <div className="total-item total-grand"><span>采购总额</span><strong>¥{grandTotal.toLocaleString()}</strong></div>
      </div>
    </div>
  );
}
