export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <div className="fixed left-0 top-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-green-600 mb-4">
              🍔 AgentsFood
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Sistema de atendimento automatizado via WhatsApp
            </p>
            
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
                <h2 className="text-xl font-semibold mb-3">Funcionalidades MVP</h2>
                <ul className="text-left space-y-2 text-sm text-gray-600">
                  <li>✅ Estrutura do projeto criada</li>
                  <li>✅ Backend NestJS + Prisma configurado</li>
                  <li>✅ Frontend Next.js + Tailwind iniciado</li>
                  <li>✅ Schema do banco de dados definido</li>
                  <li>✅ Sistema de autenticação JWT</li>
                  <li>⏳ CRUD de produtos (em desenvolvimento)</li>
                  <li>⏳ Integração WhatsApp Business API</li>
                  <li>⏳ Agente IA para respostas automáticas</li>
                  <li>⏳ Painel de configuração do agente</li>
                </ul>
              </div>
              
              <div className="flex gap-4 justify-center">
                <a 
                  href="/api/docs" 
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  target="_blank"
                >
                  📚 API Docs
                </a>
                <a 
                  href="/dashboard" 
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🏪 Painel Admin
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}