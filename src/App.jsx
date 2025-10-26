import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./App.css";

export default function App() {
  const [itens, setItens] = useState([]);
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [preco, setPreco] = useState("");
  const [mesSelecionado, setMesSelecionado] = useState("");

  // Carregar dados do localStorage
  useEffect(() => {
    const dadosSalvos = JSON.parse(localStorage.getItem("listaCompras") || "{}");
    const currentMonth = new Date().toISOString().slice(0, 7);
    setMesSelecionado(currentMonth);
    setItens(dadosSalvos[currentMonth] || []);
  }, []);

  // Salvar no localStorage
  useEffect(() => {
    const dadosSalvos = JSON.parse(localStorage.getItem("listaCompras") || "{}");
    dadosSalvos[mesSelecionado] = itens;
    localStorage.setItem("listaCompras", JSON.stringify(dadosSalvos));
  }, [itens, mesSelecionado]);

  // Adicionar item
  const adicionarItem = () => {
    if (!nome || quantidade <= 0 || preco <= 0) {
      alert("Preencha todos os campos corretamente!");
      return;
    }

    const novoItem = {
      id: Date.now(),
      nome,
      quantidade: Number(quantidade),
      preco: Number(preco),
      subtotal: Number(quantidade) * Number(preco),
    };

    setItens([novoItem, ...itens]);
    setNome("");
    setQuantidade("");
    setPreco("");
  };

  const removerItem = (id) => {
    setItens(itens.filter((item) => item.id !== id));
  };

  const total = itens.reduce((acc, item) => acc + item.subtotal, 0);

  // Exportar PDF
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("🛒 Lista de Compras", 14, 15);

    const bodyData = itens.map((i) => [
      i.nome,
      i.quantidade,
      i.preco.toFixed(2),
      i.subtotal.toFixed(2),
    ]);

    autoTable(doc, {
      startY: 25,
      head: [["Item", "Qtd", "Preço (R$)", "Subtotal (R$)"]],
      body: bodyData,
    });

    const y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 40;
    doc.text(`Total: R$ ${total.toFixed(2)}`, 14, y);
    doc.save(`lista_compras_${mesSelecionado}.pdf`);
  };

  const mudarMes = (e) => {
    const novoMes = e.target.value;
    setMesSelecionado(novoMes);
    const dadosSalvos = JSON.parse(localStorage.getItem("listaCompras") || "{}");
    setItens(dadosSalvos[novoMes] || []);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h2> Lista de Compras</h2>
        <input
          type="month"
          value={mesSelecionado}
          onChange={mudarMes}
          className="month-picker"
        />
      </header>
      <div className="form-card">
        <input
          type="text"
          placeholder="Nome do item"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <input
          type="number"
          placeholder="Quantidade"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
        />
        <input
          type="number"
          placeholder="Preço (R$)"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
        />
        <button onClick={adicionarItem}>➕ Adicionar</button>
      </div>
      <div className="items-list">
        {itens.length === 0 && <p className="empty-msg">Nenhum item adicionado neste mês.</p>}
        {itens.map((item) => (
          <div className="item-card" key={item.id}>
            <div className="item-info">
              <h4>{item.nome}</h4>
              <p>{item.quantidade} x R$ {item.preco.toFixed(2)}</p>
            </div>
            <div className="item-actions">
              <p>Subtotal: R$ {item.subtotal.toFixed(2)}</p>
              <button onClick={() => removerItem(item.id)}>❌</button>
            </div>
          </div>
        ))}
      </div>
      <div className="footer">
        <h3>Total: R$ {total.toFixed(2)}</h3>
        <button onClick={exportarPDF}>🧾 Exportar PDF</button>
      </div>
    </div>
  );
}
