import { readImageUpload } from "../../lib/uploads";

export const onRequestGet: PagesFunction = async (context) => {
  const key = decodeURIComponent(context.params.key);
  const result = await readImageUpload(context.env, key);

  if (!result.ok) {
    return Response.json(result, { status: result.status });
  }

  return new Response(result.body, {
    status: 200,
    headers: result.headers,
  });
};
