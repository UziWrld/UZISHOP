import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Podríamos enviar el error a un servicio como Sentry aquí
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    background: '#fff',
                    borderRadius: '10px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    margin: '20px'
                }}>
                    <h2 style={{ color: '#000', fontWeight: '900' }}>¡Algo salió mal!</h2>
                    <p style={{ color: '#666', marginBottom: '20px' }}>
                        Lo sentimos, hubo un error inesperado al cargar esta sección.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '10px 20px',
                            background: '#000',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: '700'
                        }}
                    >
                        RECARGAR PÁGINA
                    </button>
                    {import.meta.env.DEV && (
                        <pre style={{
                            marginTop: '20px',
                            padding: '10px',
                            background: '#f8f8f8',
                            fontSize: '0.8rem',
                            textAlign: 'left',
                            overflow: 'auto'
                        }}>
                            {this.state.error && this.state.error.toString()}
                        </pre>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
