import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
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
    console.error('Uncaught error in component:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md bg-white p-8 rounded-2xl shadow-lg border border-black/10 space-y-4">
            <div className="w-12 h-12 bg-[#C82626]/10 text-[#C82626] rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h2 className="text-xl font-bold text-[#141211]">Kin Media Production</h2>
            <p className="text-sm text-[#141211]/70">
              حدث خطأ غير متوقع أثناء تحميل الصفحة. يرجى إعادة تحديث الصفحة.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="px-6 py-2.5 bg-[#C82626] text-white text-xs font-bold rounded-lg hover:bg-[#a31d1d] transition-colors cursor-pointer"
            >
              إعادة تحميل الموقع / Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
