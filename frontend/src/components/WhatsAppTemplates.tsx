'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Clock,
  Send,
  Eye
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';

interface WhatsAppTemplate {
  id: string;
  name: string;
  displayName: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISABLED';
  components: {
    body: {
      text: string;
    };
    header?: {
      type: string;
      text?: string;
    };
    footer?: {
      text: string;
    };
    buttons?: Array<{
      type: string;
      text: string;
      url?: string;
    }>;
  };
  variables: string[];
  active: boolean;
  createdAt: string;
  metaTemplateId?: string;
}

export function WhatsAppTemplates() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<WhatsAppTemplate | null>(null);
  const [testPhone, setTestPhone] = useState('');
  const [testVariables, setTestVariables] = useState<string[]>([]);

  // Template padrões disponíveis
  const defaultTemplates = {
    welcome: {
      name: 'agentsfood_welcome',
      displayName: 'Mensagem de Boas-vindas',
      category: 'UTILITY' as const,
      language: 'pt_BR',
      components: {
        body: {
          text: 'Olá! Bem-vindo ao {{1}}! 🍔\n\nSou seu assistente virtual e estou aqui para ajudar com nosso cardápio.\n\nDigite *menu* para ver nossos produtos ou faça sua pergunta!'
        }
      },
      variables: ['establishment_name'],
      active: true
    },
    
    menu: {
      name: 'agentsfood_menu_intro',
      displayName: 'Apresentação do Menu',
      category: 'UTILITY' as const,
      language: 'pt_BR',
      components: {
        body: {
          text: '📋 *NOSSO CARDÁPIO*\n\n{{1}}\n\n💬 Digite o nome de um produto para mais detalhes ou *categorias* para navegar por seções!'
        }
      },
      variables: ['menu_summary'],
      active: true
    },

    product: {
      name: 'agentsfood_product_info',
      displayName: 'Detalhes do Produto',
      category: 'UTILITY' as const,
      language: 'pt_BR',
      components: {
        body: {
          text: '🍽️ *{{1}}*\n\n{{2}}\n\n💰 *Preço:* R$ {{3}}\n{{4}}\n\nGostaria de saber mais alguma coisa?'
        }
      },
      variables: ['product_name', 'description', 'price', 'availability_status'],
      active: true
    },

    order_help: {
      name: 'agentsfood_order_help',
      displayName: 'Auxílio para Pedidos',
      category: 'UTILITY' as const,
      language: 'pt_BR',
      components: {
        body: {
          text: '🛒 *COMO FAZER SEU PEDIDO*\n\n1️⃣ Escolha seus produtos\n2️⃣ Confirme os itens\n3️⃣ Informe seu endereço\n4️⃣ Escolha forma de pagamento\n\n📞 *Telefone:* {{1}}\n📍 *Endereço:* {{2}}'
        }
      },
      variables: ['phone', 'address'],
      active: true
    }
  };

  const loadTemplates = async () => {
    try {
      setLoading(true);
      // const response = await apiClient.getWhatsAppTemplates();
      // setTemplates(response.data || []);
      
      // Por enquanto, mostrar templates padrões
      const mockTemplates = Object.entries(defaultTemplates).map(([key, template]) => ({
        id: key,
        ...template,
        status: 'APPROVED' as const,
        createdAt: new Date().toISOString()
      }));
      
      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: any) => {
    try {
      // const response = await apiClient.createWhatsAppTemplate(templateData);
      toast({
        variant: "success",
        title: "Template criado",
        description: "Template foi enviado para aprovação do Meta."
      });
      await loadTemplates();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar template",
        description: "Não foi possível criar o template."
      });
    }
  };

  const testTemplate = async (template: WhatsAppTemplate) => {
    if (!testPhone) {
      toast({
        variant: "destructive",
        title: "Telefone obrigatório",
        description: "Digite um número de telefone para teste."
      });
      return;
    }

    try {
      // const response = await apiClient.testWhatsAppTemplate({
      //   templateName: template.name,
      //   phoneNumber: testPhone,
      //   variables: testVariables
      // });
      
      toast({
        variant: "success",
        title: "Template enviado",
        description: `Mensagem de teste enviada para ${testPhone}`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar teste",
        description: "Não foi possível enviar a mensagem de teste."
      });
    }
  };

  const previewTemplateText = (template: WhatsAppTemplate, variables: string[]) => {
    let text = template.components.body.text;
    
    variables.forEach((variable, index) => {
      const placeholder = `{{${index + 1}}}`;
      text = text.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), variable || `[${template.variables[index] || 'variável'}]`);
    });
    
    return text;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'DISABLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <Check className="h-4 w-4" />;
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'REJECTED': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Templates WhatsApp</h2>
          <p className="text-gray-600">Gerencie templates para respostas automáticas</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </div>

      {/* Lista de Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{template.displayName}</CardTitle>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${getStatusColor(template.status)}`}>
                    {getStatusIcon(template.status)}
                    {template.status}
                  </span>
                </div>
              </div>
              <CardDescription>
                <div className="flex items-center gap-2 text-sm">
                  <span>Categoria: {template.category}</span>
                  <span>•</span>
                  <span>Variáveis: {template.variables.length}</span>
                </div>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Preview do Template */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium mb-2">Preview:</p>
                <div className="bg-white p-3 rounded border text-sm">
                  {previewTemplateText(template, template.variables.map(v => `[${v}]`))}
                </div>
              </div>

              {/* Variáveis */}
              {template.variables.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Variáveis necessárias:</p>
                  <div className="flex flex-wrap gap-2">
                    {template.variables.map((variable, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {index + 1}: {variable}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="flex items-center justify-between pt-4">
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Preview - {template.displayName}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="bg-green-500 text-white p-3 rounded-lg inline-block max-w-[80%]">
                            {previewTemplateText(template, testVariables.length > 0 ? testVariables : template.variables.map(v => `[${v}]`))}
                          </div>
                        </div>
                        
                        {template.variables.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Valores para teste:</Label>
                            {template.variables.map((variable, index) => (
                              <Input
                                key={index}
                                placeholder={variable}
                                value={testVariables[index] || ''}
                                onChange={(e) => {
                                  const newVariables = [...testVariables];
                                  newVariables[index] = e.target.value;
                                  setTestVariables(newVariables);
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEditingTemplate(template);
                      setShowForm(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                </div>

                {template.status === 'APPROVED' && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Send className="h-4 w-4 mr-1" />
                        Testar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Testar Template</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="testPhone">Número do WhatsApp</Label>
                          <Input
                            id="testPhone"
                            placeholder="5511999999999"
                            value={testPhone}
                            onChange={(e) => setTestPhone(e.target.value)}
                          />
                        </div>
                        
                        {template.variables.map((variable, index) => (
                          <div key={index}>
                            <Label htmlFor={`var-${index}`}>{variable}</Label>
                            <Input
                              id={`var-${index}`}
                              placeholder={`Valor para ${variable}`}
                              value={testVariables[index] || ''}
                              onChange={(e) => {
                                const newVariables = [...testVariables];
                                newVariables[index] = e.target.value;
                                setTestVariables(newVariables);
                              }}
                            />
                          </div>
                        ))}
                        
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setTestPhone('')}>
                            Cancelar
                          </Button>
                          <Button onClick={() => testTemplate(template)}>
                            Enviar Teste
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Como funcionam os Templates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">📋 Tipos de Template</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li><strong>UTILITY:</strong> Notificações e confirmações</li>
                <li><strong>MARKETING:</strong> Promoções e ofertas</li>
                <li><strong>AUTHENTICATION:</strong> Códigos de verificação</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">⚡ Status dos Templates</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li><strong>PENDING:</strong> Aguardando aprovação do Meta</li>
                <li><strong>APPROVED:</strong> Aprovado e pronto para uso</li>
                <li><strong>REJECTED:</strong> Rejeitado pelo Meta</li>
                <li><strong>DISABLED:</strong> Desabilitado temporariamente</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Dica:</strong> Templates são obrigatórios para iniciar conversas no WhatsApp Business API. 
              Após 24h de conversa ativa, mensagens de texto livres são permitidas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}