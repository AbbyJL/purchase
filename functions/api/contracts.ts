import { createContract, deleteContract, listContracts, okJson, updateContract } from "../lib/db";

export const onRequestGet: PagesFunction = async (context) => {
  const data = await listContracts(context.env);
  return okJson({ data });
};

export const onRequestPost: PagesFunction = async (context) => {
  const payload = await context.request.json().catch(() => ({}));
  const result = await createContract(context.env, payload as Record<string, unknown>);
  return okJson(result, { status: result.ok ? 200 : 400 });
};

export const onRequestPatch: PagesFunction = async (context) => {
  const payload = await context.request.json().catch(() => ({}));
  const result = await updateContract(context.env, payload as Record<string, unknown>);
  return okJson(result, { status: result.ok ? 200 : 400 });
};

export const onRequestDelete: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const id = url.searchParams.get("id") ?? "";
  const result = await deleteContract(context.env, id);
  return okJson(result, { status: result.ok ? 200 : 400 });
};
