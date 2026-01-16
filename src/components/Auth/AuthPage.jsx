import React, { useState } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';
import { Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [successMode, setSuccessMode] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { login, register } = useInventoryStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        try {
            if (isLogin) {
                await login(email, password);
                // Let App.jsx handle routing via onAuthStateChange
            } else {
                const data = await register(email, password);
                if (data.user && !data.session) {
                    setSuccessMode(true);
                }
            }
        } catch (error) {
            console.error('Auth Error:', error);
            if (error.message.includes('Invalid login')) {
                setErrorMsg('Неверный логин или пароль');
            } else if (error.message.includes('already registered')) {
                setErrorMsg('Этот Email уже занят. Попробуйте войти.');
                setIsLogin(true);
            } else {
                setErrorMsg(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    // Success View
    if (successMode) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] p-5">
                <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">
                        Почти готово!
                    </h2>
                    <p className="text-gray-600 mb-8 text-base">
                        Мы отправили письмо на <strong>{email}</strong>.<br />
                        Перейдите по ссылке в письме, чтобы подтвердить аккаунт.
                    </p>
                    <button
                        onClick={() => { setIsLogin(true); setSuccessMode(false); }}
                        className="w-full py-3.5 bg-transparent text-[#667eea] border-2 border-[#667eea] rounded-lg text-base font-semibold hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Вернуться ко входу
                    </button>
                </div>
            </div>
        );
    }

    // Main Login/Register Form
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] p-5">
            <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold bg-gradient-to-br from-[#667eea] to-[#764ba2] bg-clip-text text-transparent m-0">
                        Sklad
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm">
                        Складской учёт
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* Error Alert */}
                    {errorMsg && (
                        <div
                            role="alert"
                            aria-live="assertive"
                            className="p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center flex items-center gap-2 justify-center"
                        >
                            <AlertCircle size={18} aria-hidden="true" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            required
                            placeholder="your@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-lg text-base outline-none transition-all placeholder-gray-400 focus:border-[#667eea] focus:ring-4 focus:ring-blue-500/10"
                        />
                    </div>

                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
                            Пароль
                        </label>
                        <input
                            type="password"
                            id="password"
                            required
                            minLength={6}
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-lg text-base outline-none transition-all placeholder-gray-400 focus:border-[#667eea] focus:ring-4 focus:ring-blue-500/10"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        aria-busy={loading}
                        aria-disabled={loading}
                        className="w-full py-4 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-0 rounded-lg text-base font-semibold cursor-pointer transition-all shadow-lg shadow-blue-500/40 mt-2 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/50 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        {loading ? 'Обработка...' : (isLogin ? 'Войти' : 'Создать аккаунт')}
                    </button>

                    {/* Toggle between Login/Register */}
                    <div className="text-center mt-2">
                        <p className="text-gray-500 text-sm m-0">
                            {isLogin ? 'Нет аккаунта?' : 'Уже зарегистрированы?'}
                            <button
                                type="button"
                                onClick={() => { setIsLogin(!isLogin); setErrorMsg(null); }}
                                className="ml-2 bg-transparent border-none text-[#667eea] font-semibold cursor-pointer underline text-sm hover:text-[#764ba2] focus:outline-none focus:text-[#764ba2]"
                            >
                                {isLogin ? 'Регистрация' : 'Войти'}
                            </button>
                        </p>
                    </div>
                </form>

                <p className="text-center text-gray-400 text-xs mt-8">
                    © 2026 SKLAD
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
