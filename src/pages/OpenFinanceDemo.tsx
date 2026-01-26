
import { useState, useEffect } from "react";
import { PluggyConnect } from "react-pluggy-connect";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/utils/apiRequests";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  currency_code: string;
  account_name?: string;
}

interface ItemResponse {
  id: string;
  pluggy_item_id: string;
  bankName: string;
  status: string;
}

export default function OpenFinanceDemo() {
  const [connectToken, setConnectToken] = useState<string | null>(null);
  const [isPluggyOpen, setIsPluggyOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [existingItems, setExistingItems] = useState<ItemResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Fetch connect token from backend
    const fetchToken = async () => {
      try {
        const response = await apiRequest<{ accessToken: string }>("/open-finance/connect-token");
        if (response && response.accessToken) {
          setConnectToken(response.accessToken);
        } else {
          console.error("Token format unknown", response);
        }
      } catch (err) {
        console.error("Failed to fetch connect token", err);
        setError("Failed to initialize Open Finance connection.");
      }
    };

    // Fetch existing items
    const fetchItems = async () => {
      try {
        const items = await apiRequest<ItemResponse[]>("/open-finance/items");
        setExistingItems(items);
      } catch (err) {
        console.error("Failed to fetch existing items", err);
      }
    };

    fetchToken();
    fetchItems();
  }, []);

  const handleOpenPluggy = () => {
    if (!connectToken) {
      setError("Connect token not ready yet.");
      return;
    };
    setIsPluggyOpen(true);
  };

  const onSuccess = async (itemData: any) => {
    setIsPluggyOpen(false);
    console.log("Pluggy Success:", itemData);

    const pluggyItemId = itemData.item.id;
    const connectorId = itemData.item.connector.id;

    setLoading(true);
    setError(null);
    setSuccessMessage(`Connection successful! Saving Item ID: ${pluggyItemId}...`);

    try {
      // 1. Save Item in Backend
      const saveResponse = await apiRequest<{ id: string }>("/open-finance/items", "POST", {
        itemId: pluggyItemId,
        connectorId: connectorId
      });

      const localItemId = saveResponse.id;
      setSuccessMessage("Item saved. Starting transaction sync...");

      // 2. Trigger Sync
      await apiRequest(`/open-finance/items/${localItemId}/sync`, "POST");

      setSuccessMessage("Synchronization complete! Transactions have been imported to your Dashboard.");

    } catch (err: any) {
      console.error("Failed to sync", err);
      // apiRequest throws normalized error with 'message'
      if (err.message) {
        setError(`Error: ${err.message}`);
      } else {
        setError("Failed to complete synchronization.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onError = (error: any) => {
    setIsPluggyOpen(false);
    console.error("Pluggy Error:", error);
    setError("Failed to connect via Open Finance.");
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Conectar Open Finance</CardTitle>
          <CardDescription>
            Conecte sua conta bancária (ex: Nubank) para importar suas transações automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          <div className="flex flex-col items-center gap-4">
            {!connectToken && <Loader2 className="animate-spin" />}

            {connectToken && (
              <div className="w-full text-center">
                <p className="mb-4 text-muted-foreground">Clique abaixo para iniciar a conexão segura.</p>

                {existingItems.length > 0 && (
                  <div className="mb-6 grid gap-4">
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertTitle>Contas Conectadas</AlertTitle>
                      <AlertDescription>
                        Você já possui {existingItems.length} conta(s) conectada(s).
                      </AlertDescription>
                    </Alert>

                    {existingItems.map((item) => (
                      <Card key={item.id} className="p-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{item.bankName}</h4>
                          <p className="text-sm text-gray-500">Status: {item.status}</p>
                        </div>
                        <Button
                          onClick={async () => {
                            setLoading(true);
                            setSuccessMessage(`Sincronizando ${item.bankName}...`);
                            try {
                              await apiRequest(`/open-finance/items/${item.id}/sync`, "POST");
                              setSuccessMessage(`Sucesso! Transações de ${item.bankName} sincronizadas.`);
                            } catch (e: any) {
                              setError(`Erro ao sincronizar: ${e.message}`);
                            } finally {
                              setLoading(false);
                            }
                          }}
                          variant="outline"
                          disabled={loading}
                        >
                          Sincronizar Agora
                        </Button>
                      </Card>
                    ))}
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Ou conecte nova conta</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-center gap-4">
                  <Button onClick={handleOpenPluggy} size="lg" className="bg-purple-600 hover:bg-purple-700">
                    {existingItems.length > 0 ? "Conectar Outra Conta" : "Conectar Conta"}
                  </Button>
                </div>

                {/* Pluggy Widget */}
                {isPluggyOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white p-4 rounded-lg relative w-full h-full md:w-[500px] md:h-[700px]">
                      <Button
                        className="absolute top-2 right-2 z-10"
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
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {loading && (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {transactions.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell>{tx.account_name}</TableCell>
                      <TableCell className="text-right">
                        {tx.currency_code} {tx.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
