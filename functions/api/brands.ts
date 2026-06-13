import { createBrand, deleteBrand, listBrands, okJson, updateBrand } from "../lib/db";

export const onRequestGet: PagesFunction = async (context) => {
  const data = await listBrands(context.env);
  return okJson({ data });
};

export const onRequestPost: PagesFunction = async (context) => {
  const payload = await context.request.json().catch(() => ({}));
  const result = await createBrand(context.env, payload as Record<string, unknown>);
  return okJson(result, { status: result.ok ? 200 : 400 });
};

export const onRequestPatch: PagesFunction = async (context) => {
  const payload = await context.request.json().catch(() => ({}));
  const result = await updateBrand(context.env, payload as Record<string, unknown>);
  return okJson(result, { status: result.ok ? 200 : 400 });
};

export const onRequestDelete: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const id = url.searchParams.get("id") ?? "";
  const result = await deleteBrand(context.env, id);
  return okJson(result, { status: result.ok ? 200 : 400 });
};
