import React, { useState } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';
import { supabase } from '../../lib/supabase';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useLang } from '../../i18n';

const AuthPage = () => {
    const { t } = useLang();
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
                setErrorMsg(t.auth.invalidLogin);
            } else if (error.message.includes('already registered')) {
                setErrorMsg(t.auth.emailTaken);
                setIsLogin(true);
            } else {
                setErrorMsg(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}${window.location.pathname}`
                }
            });
            if (error) throw error;
        } catch (error) {
            console.error('Google Auth Error:', error);
            setErrorMsg(error.message);
            setLoading(false);
        }
    };

    // Success View
    if (successMode) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] p-5">
                <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl shadow-2xl p-12 max-w-md w-full text-center border border-[var(--border)]">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-bold mb-4 text-[var(--text-main)]">
                        {t.auth.successTitle}
                    </h2>
                    <p className="text-[var(--text-secondary)] mb-8 text-base">
                        {t.auth.successDesc}<br />
                        <strong>{email}</strong>
                    </p>
                    <button
                        onClick={() => { setIsLogin(true); setSuccessMode(false); }}
                        className="w-full py-3.5 bg-transparent text-[#667eea] border-2 border-[#667eea] rounded-lg text-base font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        {t.auth.backToLogin}
                    </button>
                </div>
            </div>
        );
    }

    // Main Login/Register Form
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] p-5">
            <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl shadow-2xl p-12 max-w-md w-full border border-[var(--border)]">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold bg-gradient-to-br from-[#667eea] to-[#764ba2] bg-clip-text text-transparent m-0">
                        {t.auth.title}
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-2 text-sm">
                        {t.auth.subtitle}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* Error Alert */}
                    {errorMsg && (
                        <div
                            role="alert"
                            aria-live="assertive"
                            className="p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm text-center flex items-center gap-2 justify-center"
                        >
                            <AlertCircle size={18} aria-hidden="true" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-[var(--text-main)] mb-2">
                            {t.auth.emailLabel}
                        </label>
                        <input
                            type="email"
                            id="email"
                            required
                            placeholder="your@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full px-4 py-3.5 border-2 border-[var(--border)] dark:bg-[var(--bg-page)] dark:text-[var(--text-main)] rounded-lg text-base outline-none transition-all placeholder-gray-400 focus:border-[#667eea] focus:ring-4 focus:ring-blue-500/10"
                        />
                    </div>

                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-[var(--text-main)] mb-2">
                            {t.auth.passwordLabel}
                        </label>
                        <input
                            type="password"
                            id="password"
                            required
                            minLength={6}
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full px-4 py-3.5 border-2 border-[var(--border)] dark:bg-[var(--bg-page)] dark:text-[var(--text-main)] rounded-lg text-base outline-none transition-all placeholder-gray-400 focus:border-[#667eea] focus:ring-4 focus:ring-blue-500/10"
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
                        {loading ? t.auth.processing : (isLogin ? t.auth.loginBtn : t.auth.registerBtn)}
                    </button>

                    {/* Toggle between Login/Register */}
                    <div className="text-center mt-2">
                        <p className="text-[var(--text-secondary)] text-sm m-0">
                            {isLogin ? t.auth.noAccount : t.auth.alreadyRegistered}
                            <button
                                type="button"
                                onClick={() => { setIsLogin(!isLogin); setErrorMsg(null); }}
                                className="ml-2 bg-transparent border-none text-[#667eea] font-semibold cursor-pointer underline text-sm hover:text-[#764ba2] focus:outline-none focus:text-[#764ba2]"
                            >
                                {isLogin ? t.auth.registerLink : t.auth.loginLink}
                            </button>
                        </p>
                    </div>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-[var(--border)]"></div>
                    <span className="text-[var(--text-secondary)] text-sm">{t.auth.orContinueWith}</span>
                    <div className="flex-1 h-px bg-[var(--border)]"></div>
                </div>

                {/* Google Sign-in Button */}
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full py-3.5 bg-white dark:bg-gray-800 border-2 border-[var(--border)] rounded-lg text-base font-semibold cursor-pointer transition-all flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="text-[var(--text-main)]">{t.auth.googleLogin}</span>
                </button>

                <p className="text-center text-[var(--text-light)] text-xs mt-8">
                    © 2026 SKLAD
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
