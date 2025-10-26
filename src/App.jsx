import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./App.css";

export default function App() {
  const [itens, setItens] = useState([]);
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [preco, setPreco] = useState("");
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroMes, setFiltroMes] = useState("");

  useEffect(() => {
    fetch("https://lista-compras-psi-two.vercel.app/")
      .then((res) => res.json())
      .then((data) => setItens(data))
      .catch((err) => console.error(err));
  }, []);

  const adicionarItem = () => {
    if (!nome || quantidade <= 0 || preco <= 0) {
      alert("Preencha todos os campos corretamente!");
      return;
    }

    const novoItem = {
      nome,
      quantidade: Number(quantidade),
      preco: Number(preco),
      subtotal: Number(quantidade) * Number(preco),
    };

    fetch("http://localhost:3000/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoItem),
    })
      .then((res) => res.json())
      .then((data) => {
        setItens([...itens, data]);
        setNome("");
        setQuantidade("");
        setPreco("");
      })
      .catch((err) => console.error(err));
  };

  const removerItem = (id) => {
    fetch(`http://localhost:3000/tasks/${id}`, { method: "DELETE" })
      .then(() => setItens(itens.filter((item) => item.id !== id)))
      .catch((err) => console.error(err));
  };

  const itensFiltrados = itens.filter((item) => {
    const nomeMatch = item.nome
      .toLowerCase()
      .includes(filtroNome.toLowerCase());
    if (!filtroMes) return nomeMatch;
    const itemMes = new Date(item.createdAt).getMonth() + 1;
    return nomeMatch && itemMes === Number(filtroMes);
  });

  const total = itensFiltrados.reduce(
    (acc, item) => acc + (item.subtotal || item.quantidade * item.preco),
    0
  );

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("🛒 Lista de Compras", 14, 15);
    doc.autoTable({
      startY: 25,
      head: [["Item", "Qtd", "Preço (R$)", "Subtotal (R$)"]],
      body: itensFiltrados.map((i) => [
        i.nome,
        i.quantidade,
        i.preco.toFixed(2),
        (i.subtotal || i.quantidade * i.preco).toFixed(2),
      ]),
    });
    const y = doc.lastAutoTable.finalY + 10;
    doc.text(`Total: R$ ${total.toFixed(2)}`, 14, y);
    doc.save("lista_compras.pdf");
  };

  const meses = [
    { value: "", label: "Todos os meses" },
    { value: "1", label: "Janeiro" },
    { value: "2", label: "Fevereiro" },
    { value: "3", label: "Março" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Maio" },
    { value: "6", label: "Junho" },
    { value: "7", label: "Julho" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
  ];

  return (
    <div className="app-container">
      <header className="header">
        <h2> Lista de Compras</h2>
        <div className="filters">
          <input
            placeholder="Filtrar por nome"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
          />
          <select
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
          >
            {meses.map((mes) => (
              <option key={mes.value} value={mes.value}>
                {mes.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      <main className="main">
        <div className="form">
          <input
            placeholder="Item"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <input
            type="number"
            placeholder="Qtd"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
          />
          <input
            type="number"
            placeholder="Preço (R$)"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
          />
          <button onClick={adicionarItem}>Adicionar</button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qtd</th>
                <th>Preço (R$)</th>
                <th>Subtotal (R$)</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {itensFiltrados.map((item) => (
                <tr key={item.id}>
                  <td>{item.nome}</td>
                  <td>{item.quantidade}</td>
                  <td>{item.preco.toFixed(2)}</td>
                  <td>
                    {(item.subtotal || item.quantidade * item.preco).toFixed(2)}
                  </td>
                  <td>
                    <button onClick={() => removerItem(item.id)}>❌</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <footer className="footer">
        <h3>Total: R$ {total.toFixed(2)}</h3>
        <button onClick={exportarPDF}>🧾 Exportar PDF</button>
      </footer>
    </div>
  );
}
