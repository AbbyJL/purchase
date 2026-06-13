import { createSupplier, deleteSupplier, listSuppliers, okJson, updateSupplier } from "../lib/db";

export const onRequestGet: PagesFunction = async (context) => {
  const data = await listSuppliers(context.env);
  return okJson({ data });
};

export const onRequestPost: PagesFunction = async (context) => {
  const payload = await context.request.json().catch(() => ({}));
  const result = await createSupplier(context.env, payload as Record<string, unknown>);
  return okJson(result, { status: result.ok ? 200 : 400 });
};

export const onRequestPatch: PagesFunction = async (context) => {
  const payload = await context.request.json().catch(() => ({}));
  const result = await updateSupplier(context.env, payload as Record<string, unknown>);
  return okJson(result, { status: result.ok ? 200 : 400 });
};

export const onRequestDelete: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const id = url.searchParams.get("id") ?? "";
  const result = await deleteSupplier(context.env, id);
  return okJson(result, { status: result.ok ? 200 : 400 });
};
