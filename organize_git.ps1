# Script para organizar mudanças em branches semânticas
# Executar no PowerShell na raiz do projeto

Write-Host "Iniciando organização das mudanças..." -ForegroundColor Cyan

# 1. Branch de Serviços API
# Extrai a lógica de serviços e hooks, que é a base para o resto
git checkout -b feat/api-services
git add src/services/ src/hooks/use-requests.tsx src/models/
# Adiciona modificações e novos arquivos nessas pastas
git commit -m "feat(api): implementação da camada de serviços e hooks de requisição"
Write-Host "Branch 'feat/api-services' criada e commitada." -ForegroundColor Green

# 2. Branch do Módulo Admin
# Foca na reestruturação e achatamento das pastas do admin
git checkout -b refactor/admin-module
# Adiciona novos arquivos e modificações
git add src/components/admin/ src/pages/admin/
# Adiciona deleções (arquivos movidos/apagados)
git add -u src/components/admin/ src/pages/admin/
git commit -m "refactor(admin): simplificação da estrutura de componentes administrativos"
Write-Host "Branch 'refactor/admin-module' criada e commitada." -ForegroundColor Green

# 3. Branch de UI e Componentes Gerais
# Pega todo o resto (Dashboard, Transações, Shared, Cleanups gerais)
git checkout -b refactor/ui-components
git add .
git commit -m "refactor(ui): reorganização dos componentes de transações e dashboard"
Write-Host "Branch 'refactor/ui-components' criada e commitada com todo o restante." -ForegroundColor Green

Write-Host "Processo concluído! Você agora está na branch 'refactor/ui-components' com todas as mudanças aplicadas em ordem." -ForegroundColor Cyan
