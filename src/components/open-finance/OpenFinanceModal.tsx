import { useState, useEffect } from "react";
import { PluggyConnect } from "react-pluggy-connect";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Loader2, RefreshCw, Plus } from "lucide-react";
import { useRequests } from "@/hooks/use-requests";
import { OpenFinanceItem, getStatusLabel } from "@/models/OpenFinanceItem";
import { BankLogo } from "@/components/shared/BankLogo";
import { useToast } from "@/components/ui/use-toast";

interface OpenFinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const OpenFinanceModal = ({ isOpen, onClose, onSuccess: onSyncSuccess }: OpenFinanceModalProps) => {
  const api = useRequests();
  const { toast } = useToast();

  const [connectToken, setConnectToken] = useState<string | null>(null);
  const [items, setItems] = useState<OpenFinanceItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [isPluggyOpen, setIsPluggyOpen] = useState(false);

  // Sync states
  const [syncingItemId, setSyncingItemId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchToken();
      fetchItems();
    }
  }, [isOpen]);

  const fetchToken = async () => {
    try {
      const token = await api.getConnectToken();
      setConnectToken(token);
    } catch (err) {
      console.error("Failed to fetch connect token", err);
      toast({
        title: "Erro",
        description: "Falha ao iniciar conexão com Open Finance.",
        variant: "destructive",
      });
    }
  };

  const fetchItems = async () => {
    setLoadingItems(true);
    try {
      const data = await api.getOpenFinanceItems();
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch items", err);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleSyncAccount = async (itemId: string, account: any) => {
    // Unique ID for the specific account sync button state
    const syncId = `${itemId}-${account.number || account.name}`;
    setSyncingItemId(syncId);

    try {
      if (!account.id) {
        // Fallback if we don't have account ID (should not happen if backend populated it)
        // But wait, account object from ItemResponse.accounts might not have the UUID if we just mapped AccountSummary?
        // Let's check model.py. ItemResponse.accounts is List[AccountSummary].
        // AccountSummary has name, number, type, balance. It DOES NOT have ID yet.
        // ALERT: I need to update AccountSummary in backend to include ID!
        // HOLD ON. 

        // Let's assume for a moment I will fix backend. I'll write the frontend code assuming I have the ID.
        // If I don't have it, I'll need to use item sync or add ID to backend model.
        // I should add ID to backend model.

        throw new Error("ID da conta não disponível para sincronização individual.");
      }

      await api.syncOpenFinanceAccount({
        accountId: account.id,
        onProgress: (status, message) => {
          if (status === "processing") {
            toast({
              title: "Sincronizando Conta",
              description: message,
            });
          } else if (status === "completed") {
            toast({
              title: "Concluído",
              description: message,
            });
            if (onSyncSuccess) onSyncSuccess();
          } else if (status === "error") {
            toast({
              title: "Erro",
              description: message,
              variant: "destructive"
            });
          }
        }
      });
    } catch (err: any) {
      toast({
        title: "Erro na Sincronização",
        description: err.message || "Não foi possível sincronizar.",
        variant: "destructive",
      });
    } finally {
      setSyncingItemId(null);
    }
  };

  const handleSyncItem = async (item: OpenFinanceItem) => {
    setSyncingItemId(item.id);
    try {
      await api.syncOpenFinanceItem(item.id, (status, message) => {
        if (status === "processing") {
          toast({ title: "Sincronizando Item", description: message });
        } else if (status === "completed") {
          toast({ title: "Concluído", description: message });
          if (onSyncSuccess) onSyncSuccess();
        } else if (status === "error") {
          toast({ title: "Erro", description: message, variant: "destructive" });
        }
      });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setSyncingItemId(null);
    }
  };

  const onSuccess = async (itemData: any) => {
    setIsPluggyOpen(false);

    const pluggyItemId = itemData.item.id;
    const connectorId = itemData.item.connector.id;

    toast({
      title: "Conexão Realizada",
      description: "Salvando dados da conta...",
    });

    try {
      const saveResponse = await api.createOpenFinanceItem(pluggyItemId, connectorId);

      toast({
        title: "Conta Salva",
        description: "Iniciando importação de transações...",
      });

      // Trigger initial sync
      await api.syncOpenFinanceItem(saveResponse.id);

      toast({
        title: "Sucesso!",
        description: "Suas transações foram importadas.",
      });

      fetchItems(); // Refresh list
      if (onSyncSuccess) onSyncSuccess();

    } catch (err: any) {
      console.error("Failed to save/sync item", err);
      toast({
        title: "Erro ao Finalizar",
        description: "A conta foi conectada mas houve erro ao salvar no sistema.",
        variant: "destructive",
      });
    }
  };

  const onError = (error: any) => {
    setIsPluggyOpen(false);
    console.error("Pluggy Error:", error);
    toast({
      title: "Erro na Conexão",
      description: "Houve um problema ao conectar com o banco.",
      variant: "destructive",
    });
  };

  return (
    <>
      {/* 1. Account List Modal */}
      <Dialog open={isOpen && !isPluggyOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Open Finance</DialogTitle>
            <DialogDescription>
              Conecte suas contas bancárias para importar transações automaticamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Connected Accounts List */}
            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wider">Contas Conectadas</h3>

              {loadingItems ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : items.length === 0 ? (
                <div className="text-center p-6 border-2 border-dashed rounded-xl bg-muted/30">
                  <p className="text-muted-foreground text-sm">Nenhuma conta conectada ainda.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="space-y-2">
                      {/* Display each account as a card */}
                      {item.accounts?.map((acc: any, idx) => (
                        <div key={`${item.id}-${idx}`} className="flex items-center justify-between p-4 bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3">
                            <BankLogo
                              name={item.bankName}
                              logoUrl={item.logoUrl}
                              colorHex={item.colorHex}
                              className="h-10 w-10 shadow-none"
                            />
                            <div>
                              <h4 className="font-semibold flex items-center gap-2">
                                {item.bankName}
                                <span className="text-xs font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                  {acc.type === 'CREDIT' ? 'Cartão' : 'Conta'}
                                </span>
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-sm text-gray-600 font-mono">
                                  {acc.number ? `**** ${acc.number.slice(-4)}` : acc.name}
                                </span>

                                {/* Status Badge (Item level status) */}
                                <span className={cn(
                                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider",
                                  item.status === 'UPDATED' ? "bg-green-100 text-green-700" :
                                    item.status === 'LOGIN_ERROR' ? "bg-red-100 text-red-700" :
                                      "bg-yellow-100 text-yellow-700"
                                )}>
                                  {getStatusLabel(item.status)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Individual Account Sync Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSyncAccount(item.id, acc)}
                              disabled={syncingItemId === `${item.id}-${acc.number || acc.name}`}
                              className="h-8 w-8 p-0"
                              title="Sincronizar esta conta"
                            >
                              {syncingItemId === `${item.id}-${acc.number || acc.name}` ? (
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              ) : (
                                <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-primary" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}

                      {/* Fallback if no accounts (shouldn't happen for valid items but safe to have) */}
                      {(!item.accounts || item.accounts.length === 0) && (
                        <div className="flex items-center justify-between p-4 bg-card border rounded-lg shadow-sm opacity-70">
                          <div className="flex items-center gap-3">
                            <BankLogo name={item.bankName} logoUrl={item.logoUrl} colorHex={item.colorHex} className="h-10 w-10" />
                            <div>
                              <h4 className="font-semibold">{item.bankName}</h4>
                              <span className="text-xs text-muted-foreground">Sem contas visíveis</span>
                            </div>
                          </div>
                          {/* Item level sync fallback */}
                          <Button size="sm" variant="outline" onClick={() => handleSyncItem(item)} disabled={!!syncingItemId}>
                            <RefreshCw className={cn("h-3.5 w-3.5 mr-2", syncingItemId === item.id && "animate-spin")} />
                            Sync
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Connect New Button */}
            <div className="pt-4 border-t">
              {!connectToken ? (
                <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando token de conexão...
                </div>
              ) : (
                <Button
                  onClick={() => setIsPluggyOpen(true)}
                  className="w-full h-12 text-base gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
                >
                  <Plus className="h-5 w-5" />
                  Conectar Nova Conta
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 2. Pluggy Widget Modal */}
      {/* We use a separate Dialog to ensure z-index correctness via Portal, but style it to be minimal */}
      <Dialog open={isPluggyOpen && !!connectToken} onOpenChange={() => setIsPluggyOpen(false)}>
        <DialogContent
          className="bg-transparent border-none shadow-none max-w-none w-auto h-auto p-0 overflow-visible [&>button]:hidden"
        >
          {/* We assume PluggyConnect renders its own internal modal/card. 
              The container here is just to position it centrally via Dialog primitives if needed,
              but since we made the content transparent/auto, it effectively just wraps whatever Pluggy renders.
          */}
          <div className="relative w-full h-full min-w-[350px] min-h-[500px]">
            {/* 
                 Note: We do NOT need to add our own close button if Pluggy has one. 
                 But usually Pluggy's widget is embedded.
                 If it is embedded, we might want a container.
                 The user said: "Pluggy opens a small mobile-sized modal".
                 We will render PluggyConnect purely here.
             */}
            <PluggyConnect
              connectToken={connectToken!}
              includeSandbox={true}
              onSuccess={onSuccess}
              onError={onError}
              onClose={() => setIsPluggyOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
