const API_URL = "http://localhost:4000/api/lists";

// 🟢 Criar nova lista de compras
export async function criarLista(lista) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lista),
  });

  if (!response.ok) throw new Error("Erro ao criar lista");
  return response.json();
}

// 🔵 Buscar listas por mês
export async function buscarListasPorMes(mes) {
  const response = await fetch(`${API_URL}/month/${mes}`);
  if (!response.ok) throw new Error("Erro ao buscar listas");
  return response.json();
}
