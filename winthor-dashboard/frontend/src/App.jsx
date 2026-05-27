import { useState, useEffect } from 'react';
import { 
  Search, Home, BarChart2, Bell, FileText, 
  CheckSquare, Users, Settings, TrendingUp, 
  DollarSign, Package, ArrowUpRight, AlertTriangle 
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, 
  XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import './App.css';

function App() {
  // Estados para dados e conexao
  const [produtos, setProdutos] = useState([]);
  const [kpis, setKpis] = useState({ faturamento: 0, vendasHoje: 0, clientesAtivos: 0 });
  const [faturamentoMensal, setFaturamentoMensal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMock, setIsMock] = useState(true); // Inicializa no modo simulado para rodar de primeira

  // Estados locais
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dispara a busca quando muda o modo de conexao
  useEffect(() => {
    carregarDadosDashboard();
  }, [isMock]);

  const carregarDadosDashboard = async () => {
    setLoading(true);
    setError(null);

    const prefix = isMock ? 'http://localhost:3001/api' : 'http://localhost:3001/api';
    const suffix = isMock ? '/mock' : '';

    try {
      // Executa as 3 chamadas em paralelo
      const [resProdutos, resKpis, resFaturamento] = await Promise.all([
        fetch(`${prefix}/produtos${suffix}`),
        fetch(`${prefix}/kpis${suffix}`),
        fetch(`${prefix}/faturamento${suffix}`)
      ]);

      if (!resProdutos.ok || !resKpis.ok || !resFaturamento.ok) {
        throw new Error('Falha ao obter dados de um ou mais endpoints.');
      }

      const dadosProdutos = await resProdutos.json();
      const dadosKpis = await resKpis.json();
      const dadosFaturamento = await resFaturamento.json();

      setProdutos(dadosProdutos);
      setKpis(dadosKpis);
      setFaturamentoMensal(dadosFaturamento);
    } catch (err) {
      console.error(err);
      setError(
        isMock 
          ? "Erro de conexao com o servidor. O backend Node.js esta rodando?" 
          : "Erro ao conectar com o Oracle do WinThor. Verifique as credenciais no backend/.env"
      );
      // Se der erro no Oracle real, nao quebra a tela, deixa os dados zerados
      setProdutos([]);
      setKpis({ faturamento: 0, vendasHoje: 0, clientesAtivos: 0 });
      setFaturamentoMensal([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtra produtos na tabela em tempo real pelo termo digitado
  const produtosFiltrados = produtos.filter(prod => 
    prod.DESCRICAO.toLowerCase().includes(searchQuery.toLowerCase()) || 
    prod.CODPROD.toString().includes(searchQuery)
  );

  // Formata moeda brasileira
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  // Funcao para gerar status ficticio de estoque baseado no codigo
  const obterStatusEstoque = (cod) => {
    if (cod % 3 === 0) return { label: 'Falta', class: 'status-danger' };
    if (cod % 5 === 0) return { label: 'Estoque Baixo', class: 'status-warning' };
    return { label: 'Em Estoque', class: 'status-active' };
  };

  return (
    <div className="app-layout">
      {/* ==================== 1. SIDEBAR ==================== */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">W</div>
          <span className="logo-text">WinThor UI</span>
        </div>

        {/* Caixa de Pesquisa do Menu */}
        <div className="search-box-container">
          <Search size={18} className="search-icon-inside" />
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="sidebar-search-input"
            disabled
          />
          <span className="search-shortcut">⌘K</span>
        </div>

        {/* Menu de Navegacao */}
        <nav className="nav-menu">
          <span className="nav-section-title">Geral</span>
          <div 
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <Home size={18} />
            <span>Home</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <BarChart2 size={18} />
            <span>Dashboard</span>
            <span className="nav-badge">Novo</span>
          </div>

          <span className="nav-section-title">WinThor ERP</span>
          <div className="nav-item">
            <Package size={18} />
            <span>Produtos (PCPRODUT)</span>
          </div>
          <div className="nav-item">
            <FileText size={18} />
            <span>Vendas (PCNFSAID)</span>
          </div>
          <div className="nav-item">
            <CheckSquare size={18} />
            <span>Tarefas</span>
          </div>
          <div className="nav-item">
            <Users size={18} />
            <span>Clientes</span>
          </div>
        </nav>

        {/* Usuario na Base da Sidebar */}
        <div className="sidebar-user">
          <div className="user-avatar"></div>
          <div className="user-details">
            <span className="user-name">Olivia Rhye</span>
            <span className="user-role">Diretoria Comercial</span>
          </div>
        </div>
      </aside>

      {/* ==================== 2. CONTEÚDO PRINCIPAL ==================== */}
      <main className="main-content">
        
        {/* Cabeçalho da Area de Trabalho */}
        <header className="main-header">
          <div className="main-title">
            <div className="breadcrumbs">
              <span>Olivia Rhye</span>
              <span className="separator">&gt;</span>
              <span>Dashboard</span>
            </div>
            <h2>Painel Comercial</h2>
          </div>

          {/* Acoes no topo direito (Alternancia de Fonte de Dados) */}
          <div className="header-actions">
            <button 
              className={`btn-outline ${isMock ? 'active' : ''}`}
              onClick={() => setIsMock(true)}
            >
              Modo Simulado (Mock)
            </button>
            <button 
              className={`btn-primary ${!isMock ? 'active' : ''}`}
              onClick={() => setIsMock(false)}
            >
              Conectar Oracle Real
            </button>
          </div>
        </header>

        {/* Alerta de erro de conexao com banco real */}
        {error && !isMock && (
          <div className="main-alert">
            <span>
              <AlertTriangle size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              <strong>Erro de Conexão:</strong> {error}
            </span>
            <button onClick={() => setIsMock(true)}>Voltar para Simulado</button>
          </div>
        )}

        {/* ==================== 3. KPIS / STAT CARDS ==================== */}
        <section className="kpi-grid">
          {/* Card 1: Faturamento */}
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">Faturamento Total (Cancelados Desc.)</span>
              <div className="kpi-icon-wrapper">
                <DollarSign size={20} />
              </div>
            </div>
            <span className="kpi-value">
              {loading ? '...' : formatarMoeda(kpis.faturamento)}
            </span>
            <div className="kpi-trend">
              <span className="trend-positive">↗ 2.4%</span>
              <span style={{ color: '#667085', marginLeft: '6px' }}>vs mês anterior</span>
            </div>
          </div>

          {/* Card 2: Vendas Hoje */}
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">Vendas Hoje</span>
              <div className="kpi-icon-wrapper">
                <TrendingUp size={20} />
              </div>
            </div>
            <span className="kpi-value">
              {loading ? '...' : formatarMoeda(kpis.vendasHoje)}
            </span>
            <div className="kpi-trend">
              <span className="trend-positive">↗ 6.2%</span>
              <span style={{ color: '#667085', marginLeft: '6px' }}>vs ontem</span>
            </div>
          </div>

          {/* Card 3: Clientes Ativos */}
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-title">Clientes Ativos</span>
              <div className="kpi-icon-wrapper">
                <Users size={20} />
              </div>
            </div>
            <span className="kpi-value">
              {loading ? '...' : kpis.clientesAtivos}
            </span>
            <div className="kpi-trend">
              <span className="trend-neutral">→ 0.8%</span>
              <span style={{ color: '#667085', marginLeft: '6px' }}>estável</span>
            </div>
          </div>
        </section>

        {/* ==================== 4. GRÁFICO DE FATURAMENTO MENSAL ==================== */}
        <section className="chart-section">
          <div className="chart-header">
            <div className="chart-title-value">
              <span className="chart-label">Faturamento Total do Ano</span>
              <div className="chart-value-container">
                <span className="chart-value">
                  {loading ? '...' : formatarMoeda(kpis.faturamento)}
                </span>
                <span className="trend-positive" style={{ fontSize: '14px' }}>↗ 2.4%</span>
              </div>
            </div>

            {/* Filtros de tempo (apenas visual, imitando a referencia) */}
            <div className="chart-filters">
              <button className="chart-filter-btn active">12 meses</button>
              <button className="chart-filter-btn">30 dias</button>
              <button className="chart-filter-btn">7 dias</button>
              <button className="chart-filter-btn">Filtros</button>
            </div>
          </div>

          {/* Renderiza o grafico real do Recharts */}
          <div className="chart-wrapper">
            {loading ? (
              <div style={{ textAlign: 'center', paddingTop: '100px', color: '#667085' }}>Carregando gráfico...</div>
            ) : faturamentoMensal.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={faturamentoMensal} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f2f2f2" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#667085', fontSize: 12 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#667085', fontSize: 12 }}
                    tickFormatter={(val) => `R$ ${val / 1000}k`} 
                  />
                  <Tooltip 
                    formatter={(value) => [formatarMoeda(value), "Faturamento"]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #eaecf0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="faturamento" 
                    stroke="#7f56d9" 
                    strokeWidth={3} 
                    dot={false}
                    activeDot={{ r: 6, stroke: '#7f56d9', strokeWidth: 2, fill: '#ffffff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', paddingTop: '100px', color: '#667085' }}>Sem dados de faturamento.</div>
            )}
          </div>
        </section>

        {/* ==================== 5. TABELA DE PRODUTOS ==================== */}
        <section className="table-section">
          <div className="table-section-header">
            <div className="table-section-title">
              <h3>Produtos Cadastrados (PCPRODUT)</h3>
              <p>Lista dos últimos produtos inseridos ou filtrados do WinThor.</p>
            </div>

            {/* Barra de Pesquisa na Tabela */}
            <div className="table-search-container">
              <Search size={18} className="search-icon-inside" />
              <input 
                type="text" 
                placeholder="Pesquisar produto por descrição ou código..." 
                className="table-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="modern-table-container">
            {loading ? (
              <div className="empty-state">Carregando lista de produtos...</div>
            ) : produtosFiltrados.length > 0 ? (
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Produto / Código</th>
                    <th>Embalagem</th>
                    <th>Unidade</th>
                    <th>Status de Venda</th>
                  </tr>
                </thead>
                <tbody>
                  {produtosFiltrados.map((prod) => {
                    const status = obterStatusEstoque(prod.CODPROD);
                    return (
                      <tr key={prod.CODPROD}>
                        <td>
                          <div className="product-cell">
                            <div className="product-icon">
                              {prod.UNIDADE || 'UN'}
                            </div>
                            <div className="product-info">
                              <span className="product-name">{prod.DESCRICAO}</span>
                              <span className="product-code">Código: {prod.CODPROD}</span>
                            </div>
                          </div>
                        </td>
                        <td>{prod.EMBALAGEM || 'N/A'}</td>
                        <td>{prod.UNIDADE || 'UN'}</td>
                        <td>
                          <span className={`status-badge ${status.class}`}>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                Nenhum produto encontrado para a busca "{searchQuery}"
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}

export default App;
