
import { useState, useEffect } from "react";
import { PluggyConnect } from "react-pluggy-connect";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, RefreshCw, Plus, CheckCircle2, AlertTriangle } from "lucide-react";
import { useRequests, OpenFinanceItem } from "@/hooks/use-requests";
import { useToast } from "@/components/ui/use-toast";

interface OpenFinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

export const OpenFinanceModal = ({ isOpen, onClose, onPaymentSuccess }: OpenFinanceModalProps) => {
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

  const handleSync = async (item: OpenFinanceItem) => {
    setSyncingItemId(item.id);
    try {
      await api.syncOpenFinanceItem(item.id, (status, message) => {
        if (status === "processing") {
          toast({
            title: "Sincronização Iniciada",
            description: message,
          });
        } else if (status === "completed") {
          toast({
            title: "Concluído",
            description: message,
          });
          if (onPaymentSuccess) onPaymentSuccess();
        } else if (status === "error") {
          toast({
            title: "Erro",
            description: message,
            variant: "destructive"
          });
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
      if (onPaymentSuccess) onPaymentSuccess();

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
      <Dialog open={isOpen} onOpenChange={onClose}>
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
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-card border rounded-lg shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {item.bankName.substring(0, 1)}
                        </div>
                        <div>
                          <h4 className="font-semibold">{item.bankName}</h4>
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className={`h-2 w-2 rounded-full ${item.status === 'UPDATED' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                            <span className="text-muted-foreground">{item.status}</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSync(item)}
                        disabled={syncingItemId === item.id}
                        className="gap-2"
                      >
                        {syncingItemId === item.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3.5 w-3.5" />
                        )}
                        <span className="hidden sm:inline">Sincronizar</span>
                      </Button>
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

      {/* Pluggy Widget Overlay */}
      {isPluggyOpen && connectToken && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl relative w-full h-full md:w-[500px] md:h-[700px] overflow-hidden">
            <Button
              className="absolute top-3 right-3 z-10 rounded-full h-8 w-8 p-0 bg-white/80 hover:bg-white text-gray-800"
              variant="ghost"
              onClick={() => setIsPluggyOpen(false)}
            >
              X
            </Button>
            <PluggyConnect
              connectToken={connectToken}
              includeSandbox={true}
              onSuccess={onSuccess}
              onError={onError}
            />
          </div>
        </div>
      )}
    </>
  );
};
