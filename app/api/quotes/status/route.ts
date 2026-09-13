// The dedicated Cloudflare quote Worker owns /api/quotes* after activation.
// Until then, explicitly retain the working email preparation flow.
export function GET() {
  return Response.json(
    { available: false },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
