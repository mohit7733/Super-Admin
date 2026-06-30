// export async function apiFetch(url, options = {}) {
//     const token = sessionStorage.getItem("superadmin_token");


//     const isFormData = options.body instanceof FormData;

//     const headers = {
//         ...(isFormData ? {} : { "Content-Type": "application/json" }),
//         ...(options.headers || {}),
//         ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     };

//     const response = await fetch(url, {
//         ...options,
//         headers,
//     });

//     if (response.status === 401) {
//         sessionStorage.clear();
//         window.location.href = "/login";
//         return;
//     }

   
//     const text = await response.text();
//     if (!text) return null; 

//     try {
//         return JSON.parse(text);
//     } catch (err) {
//         console.error("Failed to parse JSON:", err, "Response text:", text);
//         return null;
//     }
// }
export async function apiFetch(url, options = {}) {
  const token = sessionStorage.getItem("superadmin_token");

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // ✅ FIX 1: Proper 401 handling
  if (response.status === 401) {
    sessionStorage.clear();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  const text = await response.text();
  if (!text) return null;

  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    console.error("JSON parse error:", text);
    throw err;
  }

 
  if (!response.ok) {
    throw data;
  }

  return data;
}
