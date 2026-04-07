import { useState, useRef, useEffect } from 'react'
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';
import { Toast } from 'primereact/toast';

const token = import.meta.env.VITE_TOKEN_TINYURL;

async function encurtarUrl(urlOriginal) {
  const response = await fetch("https://api.tinyurl.com/create", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      url: urlOriginal
    })
  });

  const data = await response.json();

  if (!data || !data.data || !data.data.tiny_url) {
    throw new Error("Resposta inválida da API");
  }

  return data.data.tiny_url;
}

function App() {
  const [url, setUrl] = useState("");
  const [urlResultado, setUrlResultado] = useState("");
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const [height, setHeight] = useState("auto");

  useEffect(() => {
    if (containerRef.current) {
      let alturaMedida = 80 + containerRef.current.scrollHeight
        setHeight(alturaMedida);
    }
  }, [urlResultado]);

  function urlValido(string) {
    try {
      const url = new URL(string)
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }

  function vibrar() {
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
  }

  function copiarUrl() {
    if (!urlResultado) return;
    navigator.clipboard.writeText(urlResultado);
    vibrar()
  }

  function jaEhEncurtada(string) {
    try {
      const url = new URL(string);
      const dominiosEncurtadores = [
        "tinyurl.com",
        "bit.ly",
        "t.co",
        "goo.gl"
      ];
      return dominiosEncurtadores.includes(url.hostname);
    } catch {
      return false;
    }
  }

  async function headlerEncurtarUrl() {
    setLoading(true);

    let finalUrl = url.trim();

    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl;
    }

    if (!urlValido(finalUrl)) {
      showError("Digite uma URL válida");
      setLoading(false);
      return;
    }

    if (finalUrl === urlResultado) {
      showError("Essa URL já foi gerada");
      setLoading(false);
      return;
    }

    if (jaEhEncurtada(finalUrl)) {
      showError("Essa URL já é encurtada");
      setLoading(false);
      return;
    }

    try {
      const resultado = await encurtarUrl(finalUrl);
      vibrar()
      setUrlResultado(resultado);
    }
    catch (error) {
      console.error(error);
      showError("Erro ao encurtar URL");
    }
    finally {
      setLoading(false);
    }
  }

  const toastBottomCenter = useRef(null);
  const toastError = useRef(null);

  const showMessage = (event, ref, severity) => {
    ref.current.show({
      severity: severity,
      summary: 'Link Copiado',
      detail: 'Link copiado na sua área de transferência.',
      life: 3000
    });
  };

  const showError = (msg) => {
    toastError.current.show({
      severity: 'error',
      summary: 'Erro',
      detail: msg,
      life: 3000
    });
  };

  return (
    <div className='flex flex-col justify-center items-center h-screen w-screen bg-radial-[at_25%_25%] from-zinc-900 to-gray-950'>

      <Toast ref={toastBottomCenter} position="bottom-center" />
      <Toast ref={toastError} />

      <div
        style={{
          height: height,
          transition: 'height 0.35s ease',
          overflow: 'hidden'
        }}
        className='border border-indigo-300/25 rounded-xl p-8 flex flex-col justify-center items-center '
      >
        <div ref={containerRef}>

          <h3 className='text-xl font-semibold text-center text-white mb-10'>
            Encurtador de URL
          </h3>

          <FloatLabel className='mb-5 w-full'>
            <InputText
              id="digiteAUrl"
              className='w-full'
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  headlerEncurtarUrl();
                }
              }}
            />
            <label htmlFor="digiteAUrl">Digite sua URL longaaa...</label>
          </FloatLabel>

          <Button
            className='w-full'
            label="Encurtar URL"
            size='small'
            severity="success"
            loading={loading}
            onClick={headlerEncurtarUrl}
          />

          {urlResultado && (
            <div className='border border-green-200/25 rounded-xl bg-green-800/10 mt-5 p-5'>
              <h3 className='text-center mb-3'>URL Encurtada</h3>

              <div className="p-inputgroup flex-1">
                <InputText value={urlResultado} />
                <Button
                  icon="pi pi-copy"
                  severity="success"
                  onClick={(e) => {
                    showMessage(e, toastBottomCenter, 'success')
                    copiarUrl()
                  }}
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default App;