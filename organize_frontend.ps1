# Script de Reestruturação do Frontend - Stacked Branches
# Organiza as alterações em branches lógicas e commits semânticos.

$originalBranch = (git rev-parse --abbrev-ref HEAD).Trim()
Write-Host "Branch Base Detectada: $originalBranch" -ForegroundColor Cyan

# Função auxiliar para checkout, add e commit seguro
function Create-Commit {
    param (
        [string]$branchName,
        [string[]]$files,
        [string]$message
    )
    
    Write-Host "`n---------------------------------------------------"
    Write-Host "Processando: $branchName" -ForegroundColor Yellow
    
    git checkout -b $branchName
    
    foreach ($file in $files) {
        if (Test-Path $file) {
            git add $file
        } else {
            # Tenta adicionar mesmo se não existir (para arquivos deletados)
            git add $file 2>$null
        }
    }
    
    # Tratamento especial para diretórios
    foreach ($file in $files) {
         if ($file -match "/$") { 
             git add $file 2>$null
         }
    }
    
    $status = git status --porcelain
    if ($status) {
        git commit -m "$message"
        Write-Host "Commit realizado em $branchName." -ForegroundColor Green
    } else {
        Write-Host "Nenhuma alteração pendente para $branchName." -ForegroundColor Gray
    }
}

# ---------------------------------------------------
# 1. Refatoração: Shared Components
# ---------------------------------------------------
$filesShared = @(
    "src/components/shared/",
    "src/components/BankCombobox.tsx",
    "src/components/BankLogo.tsx",
    "src/components/CategoryBadge.tsx",
    "src/components/CategoryCombobox.tsx",
    "src/components/ClearFilterButton.tsx",
    "src/components/DebouncedSearchInput.tsx",
    "src/components/MonthCombobox.tsx",
    "src/components/NavLink.tsx",
    "src/components/PaginationControl.tsx",
    "src/components/PaymentMethodCombobox.tsx"
)
Create-Commit -branchName "refactor/shared-components" -files $filesShared -message "refactor(components): extract shared components to dedicated directory"

# ---------------------------------------------------
# 2. Refatoração Core: Payment -> Transaction
# ---------------------------------------------------
$filesCore = @(
    "src/models/Payment.ts",
    "src/models/schemas/PaymentSchema.ts",
    "src/utils/payment-icons.tsx",
    "src/components/dashboard/PaymentTable.tsx",
    "src/components/dashboard/CreatePaymentModal.tsx",
    "src/components/dashboard/EditPaymentModal.tsx",
    "src/pages/ImportPayments.tsx",
    "src/pages/SearchPayments.tsx",
    "src/models/Transaction.ts",
    "src/models/schemas/TransactionSchema.ts",
    "src/utils/transaction-icons.tsx",
    "src/components/dashboard/TransactionTable.tsx",
    "src/components/dashboard/CreateTransactionModal.tsx",
    "src/components/dashboard/EditTransactionModal.tsx",
    "src/pages/ImportTransactions.tsx",
    "src/pages/SearchTransactions.tsx",
    "src/hooks/use-requests.tsx",
    "src/utils/apiRequests.tsx",
    "src/utils/streamingResponse.ts",
    "src/components/import/ImportPaymentTable.tsx",
    "src/components/import/ImportTransactionTable.tsx"
)
Create-Commit -branchName "refactor/core-transactions" -files $filesCore -message "refactor(core): rename Payment to Transaction and update core models"

# ---------------------------------------------------
# 3. Feature: Auth System
# ---------------------------------------------------
$filesAuth = @(
    "src/components/auth/",
    "src/context/",
    "src/pages/Login.tsx",
    "src/pages/Signup.tsx",
    "src/App.tsx",
    "src/AppRouter.tsx"
)
Create-Commit -branchName "feat/frontend-auth" -files $filesAuth -message "feat(auth): implement authentication flow and protected routes"

# ---------------------------------------------------
# 4. Feature: Layout & Dashboard
# ---------------------------------------------------
$filesLayout = @(
    "src/layouts/DashboardLayout.tsx",
    "src/components/dashboard/Sidebar.tsx",
    "src/components/dashboard/SidebarMenuItem.tsx",
    "src/components/dashboard/SidebarUserProfile.tsx",
    "src/components/dashboard/DashboardHeader.tsx",
    "src/components/dashboard/SummaryCard.tsx",
    "src/components/dashboard/CategoryTable.tsx",
    "src/components/dashboard/MonthlyCategoryChart.tsx",
    "src/pages/Index.tsx",
    "src/components/theme/",
    "src/components/icons/"
)
Create-Commit -branchName "feat/layout-dashboard" -files $filesLayout -message "feat(layout): implement sidebar navigation and dashboard layout"

# ---------------------------------------------------
# 5. Feature: Open Finance
# ---------------------------------------------------
$filesOpenFinance = @(
    "src/components/open-finance/OpenFinanceModal.tsx",
    "src/pages/OpenFinanceDemo.tsx",
    "src/models/OpenFinanceItem.ts"
)
Create-Commit -branchName "feat/open-finance" -files $filesOpenFinance -message "feat(open-finance): update open finance integration components"

# ---------------------------------------------------
# 6. Chore: Cleanup & Admin
# ---------------------------------------------------
$filesCleanup = @(
    "src/index.css",
    "index.html",
    "public/",
    "src/components/admin/",
    "src/components/profile/",
    "src/layouts/ProfileLayout.tsx",
    "src/layouts/AdminLayout.tsx",
    "src/pages/ProfilePage.tsx",
    "src/pages/profile/",
    "." # Catch-all
)
Create-Commit -branchName "chore/frontend-cleanup" -files $filesCleanup -message "chore: formatting, icons, admin components and final cleanup"

Write-Host "`n---------------------------------------------------"
Write-Host "Reestruturação do Frontend concluída!" -ForegroundColor Green
Write-Host "Branches criadas:"
Write-Host "1. refactor/shared-components"
Write-Host "2. refactor/core-transactions"
Write-Host "3. feat/frontend-auth"
Write-Host "4. feat/layout-dashboard"
Write-Host "5. feat/open-finance"
Write-Host "6. chore/frontend-cleanup"
Write-Host "---------------------------------------------------"
Write-Host "Você está agora na branch 'chore/frontend-cleanup'."
