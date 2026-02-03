export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const url = new URL(req.url);
  // 取得路徑，例如 /test 會取得 test
  const slug = url.pathname.split('/').filter(Boolean).pop(); 

  // 如果沒有 slug，回傳簡單的首頁
  if (!slug) {
    return new Response("<h1>Short Link Service</h1><p>Ready to redirect.</p>", {
      headers: { "content-type": "text/html;charset=UTF-8" },
    });
  }

  // 加上 ?slug= 參數去詢問你的 GAS
  const gasApi = `https://script.google.com/macros/s/AKfycbx-DspFQPKKLxC8WUrGO6yHFdG-HOZURibjZabX_QfEAAN6vVbaVWA120y3GIgMdbDXdw/exec?slug=${slug}`;

  try {
    const response = await fetch(gasApi);
    const data = await response.json();

    if (data.status === "success" && data.url !== "404") {
      // 302 是暫時跳轉，方便你以後隨時修改試算表裡的目標
      return Response.redirect(data.url, 302);
    } else {
      return new Response("Oops! 這個短網址不存在。", { status: 404 });
    }
  } catch (error) {
    return new Response("系統連線錯誤", { status: 500 });
  }
}
