export interface OpenFinanceItem {
  id: string;
  pluggy_item_id: string;
  bankName: string;
  status: string;
  logoUrl?: string;
  colorHex?: string;
  accounts: {
    id: string;
    name: string;
    number?: string;
    type: string;
    balance: number;
  }[];
}

export const getStatusLabel = (status: string) => {
  switch (status) {
    case 'UPDATING': return 'Atualizando';
    case 'UPDATED': return 'Atualizado';
    case 'LOGIN_ERROR': return 'Erro de Login';
    case 'OUTDATED': return 'Desatualizado';
    case 'WAITING_USER_INPUT': return 'Aguardando Ação';
    default: return status;
  }
};
