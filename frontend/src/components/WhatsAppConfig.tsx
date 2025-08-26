'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { 
  Phone, 
  MessageSquare, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Send,
  Loader2,
  Eye,
  EyeOff,
  TestTube2
} from 'lucide-react'
import { 
  WhatsAppConfig as WhatsAppConfigType, 
  WhatsAppConfigData, 
  WhatsAppTestConnectionData,
  WhatsAppTestMessageData,
  apiClient 
} from '@/lib/api-client'

export function WhatsAppConfig() {
  const { toast } = useToast()
  
  // State para configuração
  const [config, setConfig] = useState<WhatsAppConfigType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // State para formulário de configuração
  const [configForm, setConfigForm] = useState<WhatsAppConfigData>({
    whatsappPhoneNumberId: '',
    whatsappBusinessAccountId: '',
    whatsappToken: '',
  })
  
  // State para teste de conexão
  const [testConnectionLoading, setTestConnectionLoading] = useState(false)
  const [testConnectionForm, setTestConnectionForm] = useState<WhatsAppTestConnectionData>({
    phoneNumberId: '',
    accessToken: '',
    businessAccountId: '',
  })
  
  // State para mensagem de teste
  const [testMessageLoading, setTestMessageLoading] = useState(false)
  const [testMessageForm, setTestMessageForm] = useState<WhatsAppTestMessageData>({
    phoneNumber: '',
    message: 'Esta é uma mensagem de teste do AgentsFood! 🍔',
  })
  
  // Controle de visibilidade de token
  const [showToken, setShowToken] = useState(false)
  const [showTestToken, setShowTestToken] = useState(false)

  // Carregar configuração atual
  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getWhatsAppConfig()
      
      if (response.error) {
        toast({
          title: 'Erro ao carregar configuração',
          description: response.error,
          variant: 'destructive',
        })
        return
      }

      if (response.data) {
        setConfig(response.data)
        setConfigForm({
          whatsappPhoneNumberId: response.data.whatsappPhoneNumberId,
          whatsappBusinessAccountId: response.data.whatsappBusinessAccountId,
          whatsappToken: response.data.whatsappToken || '', // Manter token salvo
        })
        // Preencher automaticamente os campos de teste se já configurado
        if (response.data.isConfigured) {
          setTestConnectionForm(prev => ({
            ...prev,
            phoneNumberId: response.data!.whatsappPhoneNumberId,
            businessAccountId: response.data!.whatsappBusinessAccountId,
          }))
        }
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar configuração do WhatsApp',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    if (!configForm.whatsappPhoneNumberId || !configForm.whatsappToken) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Phone Number ID e Token são obrigatórios',
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)
      const response = await apiClient.saveWhatsAppConfig(configForm)
      
      if (response.error) {
        toast({
          title: 'Erro ao salvar configuração',
          description: response.error,
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Configuração salva',
        description: response.data?.message || 'Configurações salvas com sucesso!',
      })
      
      // Atualizar estado local sem recarregar (para manter token)
      setConfig(prev => prev ? {
        ...prev,
        whatsappPhoneNumberId: configForm.whatsappPhoneNumberId || '',
        whatsappBusinessAccountId: configForm.whatsappBusinessAccountId || '',
        whatsappToken: configForm.whatsappToken || '',
        isConfigured: true
      } : null)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar configuração do WhatsApp',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const testConnection = async () => {
    if (!testConnectionForm.phoneNumberId || !testConnectionForm.accessToken) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Phone Number ID e Access Token são obrigatórios',
        variant: 'destructive',
      })
      return
    }

    try {
      setTestConnectionLoading(true)
      const response = await apiClient.testWhatsAppConnection(testConnectionForm)
      
      if (response.error) {
        toast({
          title: 'Erro no teste de conexão',
          description: response.error,
          variant: 'destructive',
        })
        return
      }

      if (response.data?.success) {
        toast({
          title: 'Conexão bem-sucedida! ✅',
          description: `Conectado ao número: ${response.data.displayPhoneNumber || 'N/A'}`,
        })
      } else {
        toast({
          title: 'Falha na conexão ❌',
          description: response.data?.message || 'Erro desconhecido',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao testar conexão com WhatsApp',
        variant: 'destructive',
      })
    } finally {
      setTestConnectionLoading(false)
    }
  }

  const sendTestMessage = async () => {
    if (!testMessageForm.phoneNumber || !testMessageForm.message) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Número de telefone e mensagem são obrigatórios',
        variant: 'destructive',
      })
      return
    }

    try {
      setTestMessageLoading(true)
      const response = await apiClient.sendWhatsAppTestMessage(testMessageForm)
      
      if (response.error) {
        toast({
          title: 'Erro ao enviar mensagem',
          description: response.error,
          variant: 'destructive',
        })
        return
      }

      if (response.data?.success) {
        toast({
          title: 'Mensagem enviada! 🚀',
          description: `Enviada para: ${response.data.to}`,
        })
      } else {
        toast({
          title: 'Falha no envio ❌',
          description: response.data?.message || 'Erro desconhecido',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao enviar mensagem de teste',
        variant: 'destructive',
      })
    } finally {
      setTestMessageLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configuração WhatsApp Business</h2>
          <p className="text-muted-foreground">
            Configure sua integração com WhatsApp Business API
          </p>
        </div>
        <div className="flex items-center gap-2">
          {config?.isConfigured ? (
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Configurado
            </span>
          ) : (
            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full flex items-center gap-1">
              <XCircle className="h-4 w-4" />
              Não Configurado
            </span>
          )}
        </div>
      </div>

      {/* Formulário de Configuração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações da API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="phoneNumberId">Phone Number ID *</Label>
            <Input
              id="phoneNumberId"
              value={configForm.whatsappPhoneNumberId}
              onChange={(e) => setConfigForm(prev => ({ ...prev, whatsappPhoneNumberId: e.target.value }))}
              placeholder="Exemplo: 1234567890"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="businessAccountId">Business Account ID (Opcional)</Label>
            <Input
              id="businessAccountId"
              value={configForm.whatsappBusinessAccountId}
              onChange={(e) => setConfigForm(prev => ({ ...prev, whatsappBusinessAccountId: e.target.value }))}
              placeholder="Exemplo: 987654321"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="token">Access Token *</Label>
            <div className="relative mt-1">
              <Input
                id="token"
                type={showToken ? "text" : "password"}
                value={configForm.whatsappToken}
                onChange={(e) => setConfigForm(prev => ({ ...prev, whatsappToken: e.target.value }))}
                placeholder="EAAxxxxxxxxxxxxxxxxxxxxxx"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button onClick={saveConfig} disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Salvar Configuração
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="border-t border-gray-200 my-6" />

      {/* Teste de Conexão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube2 className="h-5 w-5" />
            Teste de Conexão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Teste se suas credenciais estão funcionando corretamente
          </p>

          <div>
            <Label htmlFor="testPhoneNumberId">Phone Number ID</Label>
            <Input
              id="testPhoneNumberId"
              value={testConnectionForm.phoneNumberId}
              onChange={(e) => setTestConnectionForm(prev => ({ ...prev, phoneNumberId: e.target.value }))}
              placeholder="Exemplo: 1234567890"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="testAccessToken">Access Token</Label>
            <div className="relative mt-1">
              <Input
                id="testAccessToken"
                type={showTestToken ? "text" : "password"}
                value={testConnectionForm.accessToken}
                onChange={(e) => setTestConnectionForm(prev => ({ ...prev, accessToken: e.target.value }))}
                placeholder="EAAxxxxxxxxxxxxxxxxxxxxxx"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowTestToken(!showTestToken)}
              >
                {showTestToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="testBusinessAccountId">Business Account ID (Opcional)</Label>
            <Input
              id="testBusinessAccountId"
              value={testConnectionForm.businessAccountId}
              onChange={(e) => setTestConnectionForm(prev => ({ ...prev, businessAccountId: e.target.value }))}
              placeholder="Exemplo: 987654321"
              className="mt-1"
            />
          </div>

          <Button onClick={testConnection} disabled={testConnectionLoading} className="w-full" variant="outline">
            {testConnectionLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <Phone className="h-4 w-4 mr-2" />
                Testar Conexão
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Envio de Mensagem Teste */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Mensagem de Teste
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Envie uma mensagem de teste para verificar se tudo está funcionando
          </p>

          <div>
            <Label htmlFor="testPhoneNumber">Número de Telefone</Label>
            <Input
              id="testPhoneNumber"
              value={testMessageForm.phoneNumber}
              onChange={(e) => setTestMessageForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
              placeholder="5511999999999 (sem espaços ou símbolos)"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="testMessage">Mensagem</Label>
            <Textarea
              id="testMessage"
              value={testMessageForm.message}
              onChange={(e) => setTestMessageForm(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Digite sua mensagem de teste..."
              rows={3}
              className="mt-1"
            />
          </div>

          <Button 
            onClick={sendTestMessage} 
            disabled={testMessageLoading || !config?.isConfigured} 
            className="w-full"
          >
            {testMessageLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4 mr-2" />
                Enviar Mensagem de Teste
              </>
            )}
          </Button>
          
          {!config?.isConfigured && (
            <p className="text-sm text-muted-foreground text-center">
              Configure e salve suas credenciais primeiro
            </p>
          )}
        </CardContent>
      </Card>

      {/* Informações de Webhook */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração do Webhook</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Configure o webhook no seu app WhatsApp Business com as seguintes informações:
            </p>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              <p><strong>Webhook URL:</strong> {typeof window !== 'undefined' ? window.location.origin.replace(':3002', ':3001') : 'http://localhost:3001'}/webhook/whatsapp</p>
              <p><strong>Verify Token:</strong> verify-token</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}