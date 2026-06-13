import { storeImageUpload } from "../lib/uploads";

export const onRequestPost: PagesFunction = async (context) => {
  const result = await storeImageUpload(context.env, context.request, "sample-images");
  return Response.json(result, { status: result.ok ? 200 : result.status });
};
