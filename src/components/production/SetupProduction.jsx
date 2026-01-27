import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useInventoryStore } from '../../store/inventoryStore';
import { useLang } from '../../i18n';
import { Factory, ArrowRight } from 'lucide-react';

const SetupProduction = () => {
    const { user, setProfile } = useInventoryStore();
    const { t } = useLang();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSetup = async (e) => {
        e.preventDefault();
        if (!user || !name.trim()) return;

        setLoading(true);
        try {
            const newProfile = {
                id: user.id,
                production_name: name.trim()
            };

            const { error } = await supabase
                .from('profiles')
                .insert([newProfile]);

            if (error) throw error;

            // Создаем стандартные единицы измерения с привязкой к пользователю
            const defaultUnits = [
                { name: 'кг', user_id: user.id },
                { name: 'г', user_id: user.id },
                { name: 'л', user_id: user.id },
                { name: 'мл', user_id: user.id },
                { name: 'шт', user_id: user.id },
                { name: 'м', user_id: user.id },
                { name: 'см', user_id: user.id },
                { name: 'м²', user_id: user.id },
                { name: 'упак', user_id: user.id },
                { name: 'пара', user_id: user.id }
            ];

            await supabase.from('units').insert(defaultUnits);

            setProfile(newProfile);
        } catch (error) {
            console.error('Setup error:', error);
            alert(t.setup.error + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                padding: '48px',
                maxWidth: '500px',
                width: '100%'
            }}>
                {/* Icon */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        opacity: 0.1,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)'
                        }}>
                            <Factory size={32} style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }} />
                        </div>
                    </div>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        color: '#2d3748',
                        marginBottom: '8px'
                    }}>
                        {t.setup.title}
                    </h1>
                    <p style={{
                        color: '#718096',
                        fontSize: '14px',
                        lineHeight: '1.5'
                    }}>
                        {t.setup.desc}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSetup} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px'
                }}>
                    <div>
                        <label htmlFor="production-name" style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#2d3748',
                            marginBottom: '8px'
                        }}>
                            {t.setup.nameLabel}
                        </label>
                        <input
                            type="text"
                            id="production-name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onInvalid={e => e.target.setCustomValidity(t.setup.nameRequired)}
                            onInput={e => e.target.setCustomValidity('')}
                            placeholder={t.setup.placeholder}
                            autoFocus
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                border: '2px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '16px',
                                outline: 'none',
                                transition: 'all 0.2s',
                                boxSizing: 'border-box'
                            }}
                            onFocus={e => e.target.style.borderColor = '#667eea'}
                            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                            opacity: loading ? 0.7 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                        onMouseOver={e => {
                            if (!loading) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                            }
                        }}
                        onMouseOut={e => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                        }}
                    >
                        {loading ? t.setup.loading : t.setup.submit}
                        {!loading && <ArrowRight size={20} />}
                    </button>
                </form>

                <p style={{
                    textAlign: 'center',
                    color: '#a0aec0',
                    fontSize: '12px',
                    marginTop: '32px'
                }}>
                    © 2026 SKLAD
                </p>
            </div>
        </div>
    );
};

export default SetupProduction;
