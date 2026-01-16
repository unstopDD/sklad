
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
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-red-50 p-6 text-red-900">
                    <div className="max-w-2xl w-full bg-white p-8 rounded-xl shadow-xl border border-red-200">
                        <h1 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <span className="text-4xl">💥</span>
                            Что-то пошло не так
                        </h1>
                        <p className="mb-4 text-red-700">Произошла ошибка при отрисовке приложения.</p>

                        <details className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-xs font-mono mb-6 border border-gray-200">
                            <summary className="cursor-pointer font-bold mb-2">Подробности ошибки</summary>
                            <div className="whitespace-pre-wrap text-red-600 font-bold mb-2">
                                {this.state.error && this.state.error.toString()}
                            </div>
                            <div className="whitespace-pre-wrap text-gray-600">
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </div>
                        </details>

                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.href = '/';
                            }}
                            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors w-full sm:w-auto"
                        >
                            Сбросить данные и перезагрузить
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
