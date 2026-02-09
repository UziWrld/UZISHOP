import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
                    <h1>Algo salió mal.</h1>
                    <p>Por favor, comparte este error con el soporte:</p>
                    <div style={{
                        background: '#f8d7da',
                        color: '#721c24',
                        padding: '15px',
                        borderRadius: '5px',
                        textAlign: 'left',
                        whiteSpace: 'pre-wrap',
                        margin: '20px auto',
                        maxWidth: '800px',
                        overflow: 'auto'
                    }}>
                        <h3>{this.state.error && this.state.error.toString()}</h3>
                        <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
