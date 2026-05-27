'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Error Boundary que captura el error inofensivo "Cancel rendering route"
 * de Next.js 14.2.3 para que no muestre el overlay de error al usuario.
 * El error ocurre por la interacción entre el sistema de tabs y el router.
 */
class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: false }; // No mostrar fallback UI, solo prevenir el overlay
  }

  componentDidCatch(error: any) {
    // Suprimir silenciosamente el error conocido
    if (
      error?.message?.includes?.('Cancel rendering route') ||
      error?.message?.includes?.('cancel rendering')
    ) {
      return;
    }
    // Para otros errores, registrar en consola
    console.error('Error no manejado:', error);
  }

  render() {
    return this.props.children;
  }
}

export default RouteErrorBoundary;
