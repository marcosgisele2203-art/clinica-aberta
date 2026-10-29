import FormularioInstalacao from "./form";

export const dynamic = "force-dynamic";

export default function Configurar() {
  return (
    <div className="view">
      <div className="auth">
        <div>
          <h1 style={{ fontSize: 30 }}>Instalar o banco</h1>
          <p className="muted small" style={{ marginTop: 6 }}>
            Cria as tabelas e carrega os dados de exemplo. Use uma vez só, logo depois do primeiro
            deploy.
          </p>
        </div>
        <FormularioInstalacao />
        <div className="aviso">
          Precisa da variável <strong className="mono">SETUP_TOKEN</strong> configurada no ambiente.
          Depois que o sistema estiver no ar com os seus próprios dados, apague a pasta{" "}
          <span className="mono">src/app/configurar</span> do projeto.
        </div>
      </div>
    </div>
  );
}
