import { readImageUpload } from "../../lib/uploads";

export const onRequestGet: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const key = url.pathname.replace(/^\/api\/uploads\//, "");
  const result = await readImageUpload(context.env, key);

  if (!result.ok) {
    return Response.json(result, { status: result.status });
  }

  return new Response(result.body, {
    status: 200,
    headers: result.headers,
  });
};
