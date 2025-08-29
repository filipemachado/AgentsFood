'use client'

import { useState } from 'react';
import * as React from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Settings, 
  Store, 
  MessageCircle, 
  BarChart3, 
  Plus,
  Bot,
  Menu,
  Home,
  Grid3x3,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  MessageSquare
} from 'lucide-react';
import ProductForm from '@/components/ProductForm';
import CategoryForm from '@/components/CategoryForm';
import { SimpleChart, ProgressBar } from '@/components/ui/progress-bar';
import { apiClient, Product, Category, AgentConfig } from '@/lib/api-client';
import { Header } from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import { WhatsAppConfig } from '@/components/WhatsAppConfig';
import { WhatsAppTemplates } from '@/components/WhatsAppTemplates';

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Carregando...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Não autorizado</div>
      </div>
    )
  }

  const menuItems = [
    { id: 'overview', label: 'Visão Geral', icon: Home },
    { id: 'products', label: 'Produtos', icon: Store },
    { id: 'categories', label: 'Categorias', icon: Store },
    { id: 'agent', label: 'Configurar Agente', icon: Bot },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { id: 'templates', label: 'Templates', icon: MessageCircle },
    { id: 'conversations', label: 'Conversas', icon: MessageCircle },
    { id: 'analytics', label: 'Relatórios', icon: BarChart3 },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewContent setActiveTab={setActiveTab} />;
      case 'products':
        return <ProductsContent />;
      case 'categories':
        return <CategoriesContent />;
      case 'agent':
        return <AgentConfigContent />;
      case 'whatsapp':
        return <WhatsAppConfig />;
      case 'templates':
        return <WhatsAppTemplates />;
      case 'conversations':
        return <ConversationsContent />;
      case 'analytics':
        return <AnalyticsContent />;
      case 'settings':
        return <SettingsContent />;
      default:
        return <OverviewContent setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300`}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h1 className={`font-bold text-xl text-green-600 ${!sidebarOpen && 'hidden'}`}>
              🍔 AgentsFood
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <nav className="mt-8">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-100 ${
                  activeTab === item.id ? 'bg-green-50 border-r-2 border-green-600 text-green-600' : 'text-gray-600'
                }`}
              >
                <Icon className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewContent({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState({
    products: { total: 0, active: 0, inactive: 0 },
    categories: { total: 0, active: 0 },
    agentConfig: null as any,
    recentProducts: [] as Product[],
    allProducts: [] as Product[] // Todos os produtos para análise de preços
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadDashboardData = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [productsResponse, categoriesResponse, agentResponse] = await Promise.all([
        apiClient.getProducts(),
        apiClient.getCategories(),
        apiClient.getAgentConfig()
      ]);

      let products: Product[] = [];
      let categories: Category[] = [];
      let agentConfig = null;

      if (productsResponse.data) {
        products = productsResponse.data;
      }

      if (categoriesResponse.data) {
        categories = categoriesResponse.data;
      }

      if (agentResponse.data) {
        agentConfig = agentResponse.data;
      }

      setDashboardData({
        products: {
          total: products.length,
          active: products.filter(p => p.available).length,
          inactive: products.filter(p => !p.available).length
        },
        categories: {
          total: categories.length,
          active: categories.filter(c => c.active).length
        },
        agentConfig,
        recentProducts: products.slice(0, 5), // Últimos 5 produtos para listagem
        allProducts: products // TODOS os produtos para análise de preços
      });

      // Atualizar timestamp da última atualização
      setLastUpdated(new Date());

      if (showRefreshToast) {
        toast({
          variant: "success",
          title: "Dashboard atualizado",
          description: "Dados atualizados com sucesso."
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      if (showRefreshToast) {
        toast({
          variant: "destructive",
          title: "Erro ao atualizar",
          description: "Não foi possível atualizar os dados."
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    loadDashboardData();
  }, []);

  // Auto-refresh removido - dashboard atualiza apenas quando necessário

  const getAgentStatus = () => {
    if (!dashboardData.agentConfig) return { status: 'Não configurado', color: 'bg-red-100 text-red-800' };
    if (dashboardData.agentConfig.active) return { status: 'Ativo', color: 'bg-green-100 text-green-800' };
    return { status: 'Inativo', color: 'bg-yellow-100 text-yellow-800' };
  };

  const getToneLabel = (tone: string) => {
    const tones = {
      'friendly': 'Amigável',
      'professional': 'Profissional', 
      'casual': 'Descontraído'
    };
    return tones[tone as keyof typeof tones] || tone;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Visão geral do seu estabelecimento</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => loadDashboardData(true)} 
            variant="outline" 
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <BarChart3 className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
          <span className="text-sm text-gray-500">
            Última atualização: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.products.total}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.products.active} ativos • {dashboardData.products.inactive} inativos
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dashboardData.products.active}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.products.total > 0 ? Math.round((dashboardData.products.active / dashboardData.products.total) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <Grid3x3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.categories.total}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.categories.active} ativas
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status do Agente</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={`px-2 py-1 text-sm rounded-full ${getAgentStatus().color}`}>
                {getAgentStatus().status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {dashboardData.agentConfig ? getToneLabel(dashboardData.agentConfig.tone) : 'Não configurado'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Seções Detalhadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Produtos Recentes
            </CardTitle>
            <CardDescription>Últimos produtos adicionados ao cardápio</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.recentProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Store className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Nenhum produto cadastrado ainda.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setActiveTab('products')}
                >
                  Adicionar Primeiro Produto
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData.recentProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-10 h-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                          <Store className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          R$ {product.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      product.available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.available ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Configuração do Agente
            </CardTitle>
            <CardDescription>Status atual do assistente virtual</CardDescription>
          </CardHeader>
          <CardContent>
            {!dashboardData.agentConfig ? (
              <div className="text-center py-8 text-gray-500">
                <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Agente ainda não configurado.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setActiveTab('agent')}
                >
                  Configurar Agente
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getAgentStatus().color}`}>
                    {getAgentStatus().status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tom de voz</span>
                  <span className="text-sm text-muted-foreground">
                    {getToneLabel(dashboardData.agentConfig.tone)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tamanho máx. resposta</span>
                  <span className="text-sm text-muted-foreground">
                    {dashboardData.agentConfig.maxResponseLength} caracteres
                  </span>
                </div>
                {dashboardData.agentConfig.welcomeMessage && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium mb-1">Mensagem de boas-vindas:</p>
                    <p className="text-sm text-gray-600 italic">
                      "{dashboardData.agentConfig.welcomeMessage}"
                    </p>
                  </div>
                )}
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setActiveTab('agent')}
                  >
                    Configurar Agente
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Análises e Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Visão Geral dos Produtos
            </CardTitle>
            <CardDescription>Distribuição por status e preços</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <SimpleChart
              data={[
                { label: 'Produtos Ativos', value: dashboardData.products.active, color: 'green' },
                { label: 'Produtos Inativos', value: dashboardData.products.inactive, color: 'red' },
                { label: 'Total de Categorias', value: dashboardData.categories.total, color: 'blue' }
              ]}
            />
            
            {dashboardData.allProducts.length > 0 && dashboardData.allProducts.some(p => p.price > 0) && (
              <div className="pt-4 border-t">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-1">Análise de Preços do Cardápio</h4>
                  <p className="text-xs text-gray-500">
                    Baseado em {dashboardData.allProducts.length} produto{dashboardData.allProducts.length !== 1 ? 's' : ''} do seu cardápio
                  </p>
                </div>
                {(() => {
                  // Usar TODOS os produtos para o cálculo, não apenas os recentes
                  const prices = dashboardData.allProducts
                    .map(p => p.price)
                    .filter(price => price > 0) // Filtrar preços inválidos
                    .sort((a, b) => a - b);
                  
                  if (prices.length === 0) {
                    return (
                      <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-sm text-gray-500">
                          Nenhum produto com preço definido encontrado.
                        </p>
                      </div>
                    );
                  }
                  
                  const minPrice = Math.min(...prices);
                  const maxPrice = Math.max(...prices);
                  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
                  const medianPrice = prices.length % 2 === 0
                    ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
                    : prices[Math.floor(prices.length / 2)];
                  
                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                          <p className="text-sm text-gray-600 mb-1">Menor Preço</p>
                          <p className="text-lg font-bold text-blue-600">R$ {minPrice.toFixed(2)}</p>
                          <p className="text-xs text-blue-500 mt-1">Produto mais barato</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                          <p className="text-sm text-gray-600 mb-1">Preço Médio</p>
                          <p className="text-lg font-bold text-green-600">R$ {avgPrice.toFixed(2)}</p>
                          <p className="text-xs text-green-500 mt-1">Média do cardápio</p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                          <p className="text-sm text-gray-600 mb-1">Maior Preço</p>
                          <p className="text-lg font-bold text-orange-600">R$ {maxPrice.toFixed(2)}</p>
                          <p className="text-xs text-orange-500 mt-1">Produto mais caro</p>
                        </div>
                      </div>
                      
                      {/* Estatísticas adicionais */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Preço Mediano</p>
                          <p className="text-base font-semibold text-purple-600">R$ {medianPrice.toFixed(2)}</p>
                          <p className="text-xs text-purple-500">50% dos produtos</p>
                        </div>
                        <div className="p-3 bg-indigo-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Amplitude</p>
                          <p className="text-base font-semibold text-indigo-600">R$ {(maxPrice - minPrice).toFixed(2)}</p>
                          <p className="text-xs text-indigo-500">Diferença máx-mín</p>
                        </div>
                      </div>
                      
                      {/* Indicador visual da distribuição */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Distribuição de Preços</p>
                        <div className="flex items-center gap-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{width: '20%'}}></div>
                          <div className="h-full bg-green-500" style={{width: '60%'}}></div>
                          <div className="h-full bg-orange-500" style={{width: '20%'}}></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Econômicos</span>
                          <span>Intermediários</span>
                          <span>Premium</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Insights do Negócio
            </CardTitle>
            <CardDescription>Recomendações baseadas nos seus dados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Insights dinâmicos baseados nos dados */}
              {dashboardData.products.total === 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-yellow-800">Comece adicionando produtos</p>
                      <p className="text-sm text-yellow-700">
                        Seu cardápio está vazio. Adicione alguns produtos para começar a usar o sistema.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {dashboardData.categories.total === 0 && dashboardData.products.total > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-blue-800">Organize com categorias</p>
                      <p className="text-sm text-blue-700">
                        Crie categorias para organizar melhor seus {dashboardData.products.total} produtos.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!dashboardData.agentConfig && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-purple-800">Configure seu agente</p>
                      <p className="text-sm text-purple-700">
                        Configure o assistente virtual para automatizar o atendimento via WhatsApp.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {dashboardData.products.inactive > 0 && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-orange-800">Produtos inativos</p>
                      <p className="text-sm text-orange-700">
                        Você tem {dashboardData.products.inactive} produtos inativos. 
                        Considere ativá-los ou removê-los para manter o cardápio organizado.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {dashboardData.products.total > 0 && dashboardData.categories.total > 0 && dashboardData.agentConfig && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-green-800">Sistema completo!</p>
                      <p className="text-sm text-green-700">
                        Seu AgentsFood está totalmente configurado com {dashboardData.products.total} produtos e {dashboardData.categories.total} categorias. 
                        O agente pode responder consultas automaticamente.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Acesse as principais funcionalidades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => setActiveTab('products')}
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm">Novo Produto</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => setActiveTab('categories')}
            >
              <Grid3x3 className="h-6 w-6" />
              <span className="text-sm">Nova Categoria</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => setActiveTab('agent')}
            >
              <Bot className="h-6 w-6" />
              <span className="text-sm">Config. Agente</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => loadDashboardData(true)}
              disabled={refreshing}
            >
              <BarChart3 className={`h-6 w-6 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm">{refreshing ? 'Atualizando' : 'Atualizar'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductsContent() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load products and categories
  const loadData = async () => {
    try {
      setLoading(true);
      const [productsResponse, categoriesResponse] = await Promise.all([
        apiClient.getProducts(),
        apiClient.getCategories()
      ]);
      
      if (productsResponse.data) {
        setProducts(productsResponse.data);
      } else if (productsResponse.error) {
        console.error('Erro ao carregar produtos:', productsResponse.error);
        setProducts([]);
      }
      
      if (categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      } else if (categoriesResponse.error) {
        console.error('Erro ao carregar categorias:', categoriesResponse.error);
        setCategories([]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (productData: any) => {
    try {
      setSubmitting(true);
      
      // Clean up empty categoryId
      const cleanedData = {
        ...productData,
        categoryId: productData.categoryId || undefined
      };
      
      if (editingProduct) {
        const response = await apiClient.updateProduct(editingProduct.id, cleanedData);
        if (response.error) {
          toast({
            variant: "destructive",
            title: "Erro ao atualizar produto",
            description: response.error
          });
          return;
        }
        toast({
          variant: "success",
          title: "Produto atualizado",
          description: "O produto foi atualizado com sucesso."
        });
      } else {
        const response = await apiClient.createProduct(cleanedData);
        if (response.error) {
          toast({
            variant: "destructive",
            title: "Erro ao criar produto",
            description: response.error
          });
          return;
        }
        toast({
          variant: "success",
          title: "Produto criado",
          description: "O produto foi criado com sucesso."
        });
      }
      
      await loadData();
      setShowForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro ao salvar o produto. Tente novamente."
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (productId: string) => {
    if (!confirm('Tem certeza que deseja deletar este produto?')) return;
    
    try {
      const response = await apiClient.deleteProduct(productId);
      if (response.error) {
        toast({
          variant: "destructive",
          title: "Erro ao deletar produto",
          description: response.error
        });
        return;
      }
      toast({
        variant: "success",
        title: "Produto deletado",
        description: "O produto foi removido com sucesso."
      });
      await loadData();
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro ao deletar o produto. Tente novamente."
      });
    }
  };

  // Handle toggle availability
  const handleToggleAvailability = async (productId: string) => {
    try {
      const response = await apiClient.toggleProductAvailability(productId);
      if (response.error) {
        toast({
          variant: "destructive",
          title: "Erro ao alterar disponibilidade",
          description: response.error
        });
        return;
      }
      toast({
        variant: "success",
        title: "Disponibilidade alterada",
        description: "A disponibilidade do produto foi alterada com sucesso."
      });
      await loadData();
    } catch (error) {
      console.error('Erro ao alterar disponibilidade:', error);
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro ao alterar a disponibilidade. Tente novamente."
      });
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  // Filter products by category
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.categoryId === selectedCategory || (selectedCategory === 'none' && !product.categoryId));

  // Get category name
  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'Sem categoria';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Categoria não encontrada';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Produtos</h2>
          <p className="text-gray-600">Gerencie seu cardápio</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Produto
        </Button>
      </div>

      {/* Filter by category */}
      <div className="flex items-center gap-4 mb-4">
        <Label htmlFor="categoryFilter" className="text-sm font-medium">
          Filtrar por categoria:
        </Label>
        <select
          id="categoryFilter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todas as categorias ({products.length})</option>
          <option value="none">Sem categoria ({products.filter(p => !p.categoryId).length})</option>
          {categories.map((category) => {
            const productCount = products.filter(p => p.categoryId === category.id).length;
            return (
              <option key={category.id} value={category.id}>
                {category.name} ({productCount})
              </option>
            );
          })}
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Lista de Produtos 
            {selectedCategory !== 'all' && (
              <span className="text-sm font-normal text-gray-500">
                - {selectedCategory === 'none' ? 'Sem categoria' : getCategoryName(selectedCategory)} 
                ({filteredProducts.length} de {products.length})
              </span>
            )}
          </CardTitle>
          <CardDescription>Produtos disponíveis no seu cardápio</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Carregando produtos...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            selectedCategory !== 'all' ? (
              <div className="text-center py-8 text-gray-500">
                <Store className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Nenhum produto nesta categoria.</p>
                <p className="text-sm">Selecione "Todas as categorias" ou adicione produtos a esta categoria.</p>
              </div>
            ) :
            <div className="text-center py-8 text-gray-500">
              <Store className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhum produto cadastrado ainda.</p>
              <p className="text-sm">Clique em "Adicionar Produto" para começar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-12 h-12 rounded-md object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                        <Store className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{product.name}</h4>
                        {product.categoryId && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {getCategoryName(product.categoryId)}
                          </span>
                        )}
                      </div>
                      {product.description && (
                        <p className="text-sm text-gray-600">{product.description}</p>
                      )}
                      <p className="font-semibold text-green-600">
                        R$ {product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      product.available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.available ? 'Disponível' : 'Indisponível'}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleAvailability(product.id)}
                    >
                      {product.available ? 'Desativar' : 'Ativar'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingProduct(product);
                        setShowForm(true);
                      }}
                    >
                      Editar
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Deletar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ProductForm
        product={editingProduct}
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSubmit}
        isLoading={submitting}
      />
    </div>
  );
}

function AgentConfigContent() {
  const { toast } = useToast();
  const [config, setConfig] = useState<any>({
    welcomeMessage: '',
    tone: 'friendly',
    language: 'pt-BR',
    maxResponseLength: 300,
    enabledFeatures: {
      menu: true,
      prices: true,
      availability: true,
      suggestions: true
    },
    customPrompt: '',
    fallbackMessage: '',
    active: true
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testMessages, setTestMessages] = useState<Array<{type: 'user' | 'agent', content: string}>>([]);
  const [testMessage, setTestMessage] = useState('');
  const [testing, setTesting] = useState(false);

  // Load configuration
  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAgentConfig();
      if (response.data) {
        setConfig({
          welcomeMessage: response.data.welcomeMessage || '',
          tone: response.data.tone || 'friendly',
          language: response.data.language || 'pt-BR',
          maxResponseLength: response.data.maxResponseLength || 300,
          enabledFeatures: response.data.enabledFeatures || {
            menu: true,
            prices: true,
            availability: true,
            suggestions: true
          },
          customPrompt: response.data.customPrompt || '',
          fallbackMessage: response.data.fallbackMessage || '',
          active: response.data.active ?? true
        });
      }
    } catch (error) {
      console.log('No config found, using defaults');
    } finally {
      setLoading(false);
    }
  };

  // Save configuration
  const saveConfig = async () => {
    try {
      setSaving(true);
      
      // Try to update first
      const updateResponse = await apiClient.updateAgentConfig(config);
      
      if (updateResponse.error && updateResponse.error.includes('não encontrada')) {
        // If config doesn't exist, create it
        const createResponse = await apiClient.createAgentConfig(config);
        if (createResponse.error) {
          toast({
            variant: "destructive",
            title: "Erro ao criar configuração",
            description: createResponse.error
          });
          return;
        }
      } else if (updateResponse.error) {
        toast({
          variant: "destructive",
          title: "Erro ao salvar configuração",
          description: updateResponse.error
        });
        return;
      }
      
      toast({
        variant: "success",
        title: "Configuração salva",
        description: "A configuração do agente foi salva com sucesso."
      });
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro ao salvar a configuração. Tente novamente."
      });
    } finally {
      setSaving(false);
    }
  };

  // Test agent
  const testAgent = async () => {
    if (!testMessage.trim()) return;
    
    try {
      setTesting(true);
              setTestMessages((prev: any[]) => [...prev, { type: 'user', content: testMessage }]);
      
      const response = await apiClient.testAgentResponse(testMessage);
      if (response.data) {
        setTestMessages((prev: any[]) => [...prev, { type: 'agent', content: response.data?.agentResponse || 'Resposta vazia' }]);
      } else if (response.error) {
        setTestMessages((prev: any[]) => [...prev, { type: 'agent', content: 'Erro: ' + response.error }]);
      }
      
      setTestMessage('');
    } catch (error) {
      console.error('Erro ao testar agente:', error);
              setTestMessages((prev: any[]) => [...prev, { type: 'agent', content: 'Erro interno do servidor' }]);
    } finally {
      setTesting(false);
    }
  };

  React.useEffect(() => {
    loadConfig();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div>Carregando configuração...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Configurar Agente</h2>
        <p className="text-gray-600">Personalize o comportamento do seu chatbot</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configurações Básicas</CardTitle>
            <CardDescription>Defina o comportamento principal do agente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Mensagem de Boas-vindas</label>
              <Input 
                value={config.welcomeMessage}
                onChange={(e) => setConfig((prev: any) => ({ ...prev, welcomeMessage: e.target.value }))}
                placeholder="Olá! Bem-vindo ao nosso cardápio! Como posso ajudá-lo hoje?"
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Tom de Voz</label>
              <select 
                value={config.tone}
                onChange={(e) => setConfig((prev: any) => ({ ...prev, tone: e.target.value }))}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="friendly">Amigável</option>
                <option value="professional">Profissional</option>
                <option value="casual">Descontraído</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Tamanho Máximo da Resposta</label>
              <Input 
                type="number"
                value={config.maxResponseLength}
                onChange={(e) => setConfig((prev: any) => ({ ...prev, maxResponseLength: parseInt(e.target.value) || 300 }))}
                min="100"
                max="1000"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Prompt Personalizado</label>
              <Input 
                value={config.customPrompt}
                onChange={(e) => setConfig((prev: any) => ({ ...prev, customPrompt: e.target.value }))}
                placeholder="Ex: Você é um atendente especializado..."
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Mensagem de Fallback</label>
              <Input 
                value={config.fallbackMessage}
                onChange={(e) => setConfig((prev: any) => ({ ...prev, fallbackMessage: e.target.value }))}
                placeholder="Mensagem quando o agente não entende"
                className="mt-1"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Funcionalidades Habilitadas</label>
              <div className="space-y-2">
                {Object.entries(config.enabledFeatures).map(([key, enabled]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={enabled as boolean}
                      onChange={(e) => setConfig((prev: any) => ({
                        ...prev,
                        enabledFeatures: {
                          ...prev.enabledFeatures,
                          [key]: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300"
                    />
                    <label className="text-sm capitalize">{key === 'menu' ? 'Cardápio' : key === 'prices' ? 'Preços' : key === 'availability' ? 'Disponibilidade' : 'Sugestões'}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.active}
                onChange={(e) => setConfig((prev: any) => ({ ...prev, active: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <label className="text-sm font-medium">Agente ativo</label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teste o Agente</CardTitle>
            <CardDescription>Simule uma conversa com o chatbot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg min-h-[200px] max-h-[300px] overflow-y-auto">
              <div className="space-y-3">
                {testMessages.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm">
                    Digite uma mensagem para testar o agente
                  </div>
                ) : (
                  testMessages.map((msg, index) => (
                    <div key={index} className={msg.type === 'user' ? 'text-right' : 'text-left'}>
                      <span className={`px-3 py-2 rounded-lg text-sm inline-block max-w-[80%] ${
                        msg.type === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-800'
                      }`}>
                        {msg.content}
                      </span>
                    </div>
                  ))
                )}
                {testing && (
                  <div className="text-left">
                    <span className="bg-gray-200 px-3 py-2 rounded-lg text-sm inline-block">
                      Digitando...
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Input 
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && testAgent()}
                placeholder="Digite sua mensagem de teste..." 
                className="flex-1" 
                disabled={testing}
              />
              <Button onClick={testAgent} disabled={testing || !testMessage.trim()}>
                Enviar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setTestMessages([])}>
          Limpar Teste
        </Button>
        <Button onClick={saveConfig} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
}

function ConversationsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Conversas</h2>
        <p className="text-gray-600">Acompanhe as interações do WhatsApp</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversas Recentes</CardTitle>
          <CardDescription>Últimas interações com clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Nenhuma conversa ainda.</p>
            <p className="text-sm">As conversas aparecerão aqui quando os clientes entrarem em contato.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AnalyticsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Relatórios</h2>
        <p className="text-gray-600">Métricas e análises do seu agente</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Métricas</CardTitle>
          <CardDescription>Dados dos últimos 30 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Relatórios em desenvolvimento.</p>
            <p className="text-sm">Em breve você terá acesso a métricas detalhadas.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CategoriesContent() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reordering, setReordering] = useState(false);

  // Load categories
  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCategories();
      if (response.data) {
        setCategories(response.data);
      } else if (response.error) {
        console.error('Erro ao carregar categorias:', response.error);
        setCategories([]);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (categoryData: any) => {
    try {
      setSubmitting(true);
      
      if (editingCategory) {
        const response = await apiClient.updateCategory(editingCategory.id, categoryData);
        if (response.error) {
          toast({
            variant: "destructive",
            title: "Erro ao atualizar categoria",
            description: response.error
          });
          return;
        }
        toast({
          variant: "success",
          title: "Categoria atualizada",
          description: "A categoria foi atualizada com sucesso."
        });
      } else {
        const response = await apiClient.createCategory(categoryData);
        if (response.error) {
          toast({
            variant: "destructive",
            title: "Erro ao criar categoria",
            description: response.error
          });
          return;
        }
        toast({
          variant: "success",
          title: "Categoria criada",
          description: "A categoria foi criada com sucesso."
        });
      }
      
      await loadCategories();
      setShowForm(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro ao salvar a categoria. Tente novamente."
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const hasProducts = category._count?.products && category._count.products > 0;
    
    if (hasProducts) {
      toast({
        variant: "destructive",
        title: "Categoria possui produtos",
        description: `A categoria "${category.name}" possui ${category._count?.products} produto(s) vinculado(s). Remova os produtos primeiro.`
      });
      return;
    }

    if (!confirm(`Tem certeza que deseja deletar a categoria "${category.name}"?`)) return;
    
    try {
      const response = await apiClient.deleteCategory(categoryId);
      if (response.error) {
        toast({
          variant: "destructive",
          title: "Erro ao deletar categoria",
          description: response.error
        });
        return;
      }
      toast({
        variant: "success",
        title: "Categoria deletada",
        description: "A categoria foi removida com sucesso."
      });
      await loadCategories();
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro ao deletar a categoria. Tente novamente."
      });
    }
  };

  // Handle toggle active
  const handleToggleActive = async (categoryId: string) => {
    try {
      const response = await apiClient.toggleCategoryActive(categoryId);
      if (response.error) {
        toast({
          variant: "destructive",
          title: "Erro ao alterar status",
          description: response.error
        });
        return;
      }
      toast({
        variant: "success",
        title: "Status alterado",
        description: "O status da categoria foi alterado com sucesso."
      });
      await loadCategories();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro ao alterar o status. Tente novamente."
      });
    }
  };

  // Handle reorder
  const handleReorder = async (categoryId: string, direction: 'up' | 'down') => {
    const currentIndex = categories.findIndex(c => c.id === categoryId);
    if (currentIndex === -1) return;

    const newCategories = [...categories];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= newCategories.length) return;

    // Swap positions
    [newCategories[currentIndex], newCategories[targetIndex]] = 
    [newCategories[targetIndex], newCategories[currentIndex]];

    // Update display orders
    const reorderData = newCategories.map((cat, index) => ({
      id: cat.id,
      displayOrder: index + 1
    }));

    try {
      setReordering(true);
      setCategories(newCategories); // Optimistic update
      
      const response = await apiClient.reorderCategories(reorderData);
      if (response.error) {
        toast({
          variant: "destructive",
          title: "Erro ao reordenar categorias",
          description: response.error
        });
        await loadCategories(); // Revert on error
        return;
      }
      
      toast({
        variant: "success",
        title: "Categorias reordenadas",
        description: "A ordem das categorias foi atualizada com sucesso."
      });
      await loadCategories(); // Reload to get final state
    } catch (error) {
      console.error('Erro ao reordenar categorias:', error);
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro ao reordenar as categorias. Tente novamente."
      });
      await loadCategories(); // Revert on error
    } finally {
      setReordering(false);
    }
  };

  React.useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Categorias</h2>
          <p className="text-gray-600">Organize seu cardápio em categorias</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Categorias</CardTitle>
          <CardDescription>
            Organize seus produtos em categorias. Use as setas para reordenar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Carregando categorias...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Grid3x3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhuma categoria cadastrada ainda.</p>
              <p className="text-sm">Clique em "Nova Categoria" para começar a organizar seu cardápio.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((category, index) => (
                <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReorder(category.id, 'up')}
                        disabled={index === 0 || reordering}
                        className="p-1 h-6 w-6"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReorder(category.id, 'down')}
                        disabled={index === categories.length - 1 || reordering}
                        className="p-1 h-6 w-6"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-md text-sm font-medium">
                      {category.displayOrder}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{category.name}</h4>
                        <span className="text-sm text-gray-500">
                          ({category._count?.products || 0} produto{(category._count?.products || 0) !== 1 ? 's' : ''})
                        </span>
                      </div>
                      {category.description && (
                        <p className="text-sm text-gray-600">{category.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      category.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {category.active ? 'Ativa' : 'Inativa'}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(category.id)}
                    >
                      {category.active ? 'Desativar' : 'Ativar'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingCategory(category);
                        setShowForm(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-700"
                      disabled={Boolean(category._count?.products && category._count.products > 0)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CategoryForm
        category={editingCategory}
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingCategory(null);
        }}
        onSubmit={handleSubmit}
        isLoading={submitting}
      />
    </div>
  );
}

function SettingsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Configurações</h2>
        <p className="text-gray-600">Configurações gerais do sistema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurações do Estabelecimento</CardTitle>
          <CardDescription>Informações básicas do seu negócio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nome do Estabelecimento</label>
            <Input placeholder="Ex: Lanchonete do João" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Descrição</label>
            <Input placeholder="Breve descrição do seu negócio" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Telefone</label>
            <Input placeholder="(11) 99999-9999" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Endereço</label>
            <Input placeholder="Rua, Número, Bairro, Cidade" className="mt-1" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurações do WhatsApp</CardTitle>
          <CardDescription>Conecte seu WhatsApp Business</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Token do WhatsApp</label>
            <Input placeholder="Seu token do WhatsApp Business API" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Phone Number ID</label>
            <Input placeholder="ID do número de telefone" className="mt-1" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            <span className="text-sm text-gray-600">WhatsApp não conectado</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Salvar Configurações</Button>
      </div>
    </div>
  );
}
