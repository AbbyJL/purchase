export const onRequestGet = async () => {
  return Response.json({
    ok: true,
    service: "woodgrain-ops",
    stack: ["Cloudflare Pages", "Workers", "D1", "R2"],
    timestamp: new Date().toISOString(),
  });
};
