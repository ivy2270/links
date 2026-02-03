export const config = { runtime: 'edge' };

export default async function handler(req) {
  const url = new URL(req.url);
  const gasUrl = "https://script.google.com/macros/s/AKfycbx-DspFQPKKLxC8WUrGO6yHFdG-HOZURibjZabX_QfEAAN6vVbaVWA120y3GIgMdbDXdw/exec"; // 務必確保是最新部署的網址

  // 取得所有網址參數 (例如 action, id_token, slug)
  const searchParams = url.searchParams.toString();

  // --- 處理管理請求 (POST: 新增/修改) ---
  if (req.method === "POST") {
    const bodyData = await req.json();
    const response = await fetch(gasUrl, {
      method: "POST",
      body: JSON.stringify(bodyData),
      headers: { "Content-Type": "application/json" }
    });
    const result = await response.json();
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  // --- 處理讀取請求 (GET: action=list) ---
  if (url.searchParams.has("action")) {
    // 確保將 action 和 id_token 拼接到 GAS 網址後方
    const targetApi = `${gasUrl}?${searchParams}`;
    const gasRes = await fetch(targetApi);
    const result = await gasRes.json();
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  // --- 處理短網址轉址 (GET: 無 action) ---
  const slug = url.pathname.split('/').filter(Boolean).pop();
  if (!slug) return new Response("Admin Active", { status: 200 });

  const res = await fetch(`${gasUrl}?slug=${slug}`);
  const data = await res.json();
  
  if (data.status === "success") {
    return Response.redirect(data.url, 302);
  } else {
    return new Response("404 Not Found", { status: 404 });
  }
}
