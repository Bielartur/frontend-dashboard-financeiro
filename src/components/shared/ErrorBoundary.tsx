
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-background">
          <div className="bg-destructive/10 p-4 rounded-full mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Algo deu errado</h1>
          <p className="text-muted-foreground max-w-md mb-6">
            Ocorreu um erro inesperado na aplicação. Tente recarregar a página.
          </p>
          <div className="bg-card p-4 rounded-md border border-border/50 max-w-xl w-full mb-6 overflow-auto text-left">
            <code className="text-xs text-muted-foreground font-mono">
              {this.state.error?.message}
            </code>
          </div>
          <Button
            onClick={() => window.location.reload()}
            className="gap-2"
            variant="default"
          >
            <RefreshCcw className="h-4 w-4" />
            Recarregar Página
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
