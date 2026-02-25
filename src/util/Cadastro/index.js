import { useState } from "react";
import CapturaBI from "../CapturaBI";


export default function Cadastro() {

  // 🔹 Estado do formulário
  const [form, setForm] = useState({
    nome: "",
    numeroBi: "",
    dataNascimento: "",
    sexo: "",
    pai: "",
    mae: "",
    emissao: "",
    validade: ""
  });

  // 🔹 Função QUE VAI PARA O CapturaBI
  const preencherComBI = (dados) => {
    console.log("Dados recebidos do backend:", dados);

    setForm({
      nome: dados.nome || "",
      numeroBi: dados.numeroBi || "",
      dataNascimento: dados.dataNascimento || "",
      sexo: dados.sexo || "",
      pai: dados.pai || "",
      mae: dados.mae || "",
      emissao: dados.emissao || "",
      validade: dados.validade || ""
    });
  };

  // 🔹 Submeter formulário (exemplo)
  const salvar = () => {
    console.log("Formulário final:", form);
    alert("Cadastro pronto para salvar");
  };

  return (
    <div style={{ padding: 20, maxWidth: 600 }}>

      <h2>Cadastro por BI</h2>

      {/* 🔹 CAPTURA DO BI */}
      <CapturaBI onResultado={preencherComBI} />

      <hr />

      {/* 🔹 FORMULÁRIO */}
      <label>Nome</label>
      <input
        value={form.nome}
        onChange={e => setForm({ ...form, nome: e.target.value })}
      />

      <label>Nº do BI</label>
      <input
        value={form.numeroBi}
        onChange={e => setForm({ ...form, numeroBi: e.target.value })}
      />

      <label>Data de Nascimento</label>
      <input
        value={form.dataNascimento}
        onChange={e => setForm({ ...form, dataNascimento: e.target.value })}
      />

      <label>Sexo</label>
      <input
        value={form.sexo}
        onChange={e => setForm({ ...form, sexo: e.target.value })}
      />

      <label>Pai</label>
      <input
        value={form.pai}
        onChange={e => setForm({ ...form, pai: e.target.value })}
      />

      <label>Mãe</label>
      <input
        value={form.mae}
        onChange={e => setForm({ ...form, mae: e.target.value })}
      />

      <label>Emissão</label>
      <input
        value={form.emissao}
        onChange={e => setForm({ ...form, emissao: e.target.value })}
      />

      <label>Validade</label>
      <input
        value={form.validade}
        onChange={e => setForm({ ...form, validade: e.target.value })}
      />

      <br /><br />

      <button onClick={salvar}>
        Salvar Cadastro
      </button>

    </div>
  );
}
