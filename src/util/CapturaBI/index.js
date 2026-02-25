import Webcam from "react-webcam";
import { useRef, useState } from "react";
import {api} from "../../service/api";

export default function CapturaBI({ onResultado }) {
  const webcamRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const capturar = async () => {
    try {
      setErro("");
      setLoading(true);

      const imageBase64 = webcamRef.current.getScreenshot();

      const response = await api.post("/bi/ocr", {
        imagem: imageBase64
      });

      console.log(response.data);

      onResultado(response.data);

    } catch (e) {
      setErro("Erro ao ler o BI");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={320}
      />

      <button onClick={capturar} disabled={loading}>
        {loading ? "A ler BI..." : "Capturar BI"}
      </button>

      {erro && <p style={{ color: "red" }}>{erro}</p>}
    </div>
  );
}
