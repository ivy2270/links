export const config = { runtime: 'edge' };

export default async function handler(req) {
  const url = new URL(req.url);
  // 1. 務必確認這個網址是正確的 GAS 部署網址（以 /exec 結尾）
  const gasUrl = "https://script.google.com/macros/s/AKfycbx-DspFQPKKLxC8WUrGO6yHFdG-HOZURibjZabX_QfEAAN6vVbaVWA120y3GIgMdbDXdw/exec";

  const searchParams = url.searchParams;

  // 處理管理請求 (包含 GET 的 action 或 POST)
  if (searchParams.has("action") || req.method === "POST") {
    let finalUrl = gasUrl;
    let options = { method: req.method };

    if (req.method === "POST") {
      options.body = await req.text(); // 直接轉發原始 body 內容
      options.headers = { "Content-Type": "application/json" };
    } else {
      // GET 請求：將所有參數重新拼接到 GAS 網址後方
      const newSearchParams = new URLSearchParams(searchParams);
      finalUrl = `${gasUrl}?${newSearchParams.toString()}`;
    }

    try {
      // 這裡就是截圖中「No outgoing requests」出錯的地方
      const response = await fetch(finalUrl, options);
      const data = await response.text(); // 先取回文字，確保不會因為 JSON 解析失敗掛掉

      return new Response(data, {
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" 
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({ status: "error", message: "Vercel 轉發 GAS 失敗: " + error.message }), { status: 500 });
    }
  }

  // --- 原有的轉址邏輯 (GET /slug) ---
  const slug = url.pathname.split('/').filter(Boolean).pop();
  if (!slug) return new Response("Admin Active", { status: 200 });

  try {
    const res = await fetch(`${gasUrl}?slug=${slug}`);
    const data = await res.json();
    if (data.status === "success") {
      return Response.redirect(data.url, 302);
    }
  } catch (e) {}

  return new Response("404 Not Found", { status: 404 });
}
