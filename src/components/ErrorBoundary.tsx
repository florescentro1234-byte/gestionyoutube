import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-5 text-center">
            <p className="text-sm font-semibold text-amber-300 mb-1">
              Esta seccion tuvo un problema
            </p>
            <p className="text-[11px] text-amber-200/70 leading-relaxed">
              El resto de la aplicacion sigue funcionando. Puedes cambiar de pestana y volver.
            </p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
