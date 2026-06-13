import { okJson, overview } from "../lib/db";

export const onRequestGet: PagesFunction = async (context) => {
  const data = await overview(context.env);
  return okJson({ data });
};
