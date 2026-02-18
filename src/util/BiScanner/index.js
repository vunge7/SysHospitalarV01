import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";

/* ===============================
   CONFIGURAÇÃO
================================ */
const videoConstraints = {
  width: 480,
  height: 320,
  facingMode: "environment"
};

/* ===============================
   PRÉ-PROCESSAMENTO (GRAYSCALE)
================================ */
function preprocessarImagem(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imageData.data;

      for (let i = 0; i < d.length; i += 4) {
        const g = (d[i] + d[i + 1] + d[i + 2]) / 3;
        d[i] = d[i + 1] = d[i + 2] = g;
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/jpeg", 0.95));
    };
  });
}

/* ===============================
   NORMALIZA TEXTO OCR
================================ */
function normalizarTexto(texto) {
  return texto
    .replace(/\r/g, "")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

/* ===============================
   EXTRAÇÃO POR BLOCOS
================================ */
function extrairNome(texto) {
  const linhas = texto.split("\n").map(l => l.trim());
  const i = linhas.findIndex(l => l.toUpperCase().includes("NOME"));

  if (i === -1) return "";

  const nome = [];
  for (let x = i + 1; x < linhas.length; x++) {
    const l = linhas[x];
    if (/FILIA|BILHETE|IDENTIDADE/i.test(l)) break;
    if (/^[A-ZÀ-Ú\s]+$/.test(l)) nome.push(l);
  }

  return nome.join(" ");
}

function extrairFiliacao(texto) {
  const linhas = texto.split("\n").map(l => l.trim());
  const i = linhas.findIndex(l => l.toUpperCase().includes("FILIA"));

  if (i === -1) return "";

  const pais = [];
  for (let x = i + 1; x < linhas.length; x++) {
    const l = linhas[x];
    if (/BILHETE|IDENTIDADE/i.test(l)) break;
    if (/^[A-ZÀ-Ú\s]+$/.test(l) && l !== "E") pais.push(l);
  }

  return pais.join(" / ");
}

function extrairBI(texto) {
  const m = texto.match(/([0-9]{6,9}[A-Z]{2}[0-9]{3})/);
  return m ? m[1] : "";
}

function extrairDadosBI(textoOCR) {
  const texto = normalizarTexto(textoOCR);

  return {
    nome: extrairNome(texto),
    bi: extrairBI(texto),
    filiacao: extrairFiliacao(texto),
    nascimento: texto.match(/\d{2}\/\d{2}\/\d{4}/)?.[0] || "",
    sexo: texto.match(/\b(MASCULINO|FEMININO|M|F)\b/i)?.[0] || "",
    provincia: texto.match(/PROVINCIA DE:\s*([A-Z\s]+)/i)?.[1] || "",
    validade: texto.match(/V[ÁA]LIDO AT[ÉE]:\s*(\d{2}\/\d{2}\/\d{4})/i)?.[1] || ""
  };
}

/* ===============================
   COMPONENTE
================================ */
export default function BiScanner() {
  const webcamRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [imagem, setImagem] = useState(null);
  const [ocrText, setOcrText] = useState("");

  const [dados, setDados] = useState({
    nome: "",
    bi: "",
    filiacao: "",
    nascimento: "",
    sexo: "",
    provincia: "",
    validade: ""
  });

  const executarOCR = async (src) => {
    setLoading(true);
    const img = await preprocessarImagem(src);

    const { data } = await Tesseract.recognize(img, "por", {
      preserve_interword_spaces: 1
    });

    setOcrText(data.text);
    setDados(extrairDadosBI(data.text));
    setLoading(false);
  };

  const capturar = () => {
    const img = webcamRef.current.getScreenshot();
    if (!img) return;
    setImagem(img);
    executarOCR(img);
  };

  const upload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagem(url);
    executarOCR(url);
  };

  const onChange = (e) => {
    setDados({ ...dados, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", fontFamily: "Arial" }}>
      <h2>📄 Leitor de BI (Angola)</h2>

      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        style={{ width: "100%", borderRadius: 6 }}
      />

      <button onClick={capturar} disabled={loading}>
        📸 Capturar
      </button>

      <input type="file" accept="image/*" onChange={upload} />

      {loading && <p>🔍 A ler o BI...</p>}

      <div style={{ display: "grid", gap: 6 }}>
        <input name="nome" value={dados.nome} onChange={onChange} placeholder="Nome Completo" />
        <input name="bi" value={dados.bi} onChange={onChange} placeholder="Nº do BI" />
        <input name="filiacao" value={dados.filiacao} onChange={onChange} placeholder="Filiação" />
        <input name="nascimento" value={dados.nascimento} onChange={onChange} placeholder="Nascimento" />
        <input name="sexo" value={dados.sexo} onChange={onChange} placeholder="Sexo" />
        <input name="provincia" value={dados.provincia} onChange={onChange} placeholder="Província" />
        <input name="validade" value={dados.validade} onChange={onChange} placeholder="Válido até" />
      </div>

      <details style={{ marginTop: 10 }}>
        <summary>Texto OCR (debug)</summary>
        <pre style={{ maxHeight: 200, overflow: "auto" }}>{ocrText}</pre>
      </details>
    </div>
  );
}
