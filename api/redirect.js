export const config = { runtime: 'edge' };

export default async function handler(req) {
  const url = new URL(req.url);
  const gasUrl = "https://script.google.com/macros/s/AKfycbx-DspFQPKKLxC8WUrGO6yHFdG-HOZURibjZabX_QfEAAN6vVbaVWA120y3GIgMdbDXdw/exec";

  // 如果是 POST 請求 (來自後台管理介面)
  if (req.method === "POST") {
    const body = await req.json();
    const response = await fetch(gasUrl, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" }
    });
    const result = await response.json();
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  // 如果是 GET 請求 (轉址邏輯)
  const slug = url.pathname.split('/').filter(Boolean).pop();
  if (!slug) return new Response("Admin Page", { status: 200 }); // 這裡可以回傳你的 index.html

  const res = await fetch(`${gasUrl}?slug=${slug}`);
  const data = await res.json();
  return (data.status === "success") ? Response.redirect(data.url, 302) : new Response("404", { status: 404 });
}
