import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useInventoryStore } from '../../store/inventoryStore';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    // Access store actions - we only need the actions, we don't subscribe to state here to avoid loops
    const setStoreUser = useInventoryStore.getState().setUser;
    const checkProfile = useInventoryStore.getState().checkProfile;
    const fetchInitialData = useInventoryStore.getState().fetchInitialData;
    const setProfile = useInventoryStore.getState().setProfile;

    // We can also just use the hook for actions, which is safer for React reactivity
    const storeActions = useInventoryStore(state => ({
        setUser: state.setUser,
        checkProfile: state.checkProfile,
        fetchInitialData: state.fetchInitialData,
        setProfile: state.setProfile,
        addToast: state.addToast
    }));

    useEffect(() => {
        let mounted = true;

        const loadUserData = async (currentUser) => {
            try {
                // 1. Set user in store
                storeActions.setUser(currentUser);

                // 2. Check profile
                const hasProfile = await storeActions.checkProfile(currentUser.id);

                // 3. If profile exists, fetch data
                if (hasProfile) {
                    await storeActions.fetchInitialData();
                }

                if (mounted) setIsDataLoaded(true);
            } catch (e) {
                console.error('[Auth] Data load error:', e);
                if (mounted) {
                    setAuthError(e.message);
                    storeActions.addToast('Ошибка загрузки данных', 'error');
                }
            }
        };

        const handleSession = async (currentSession) => {
            if (!mounted) return;

            setSession(currentSession);
            const currentUser = currentSession?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                await loadUserData(currentUser);
            } else {
                // Cleanup logic
                storeActions.setUser(null);
                storeActions.setProfile(null);
                setIsDataLoaded(false);
            }

            if (mounted) setLoading(false);
        };

        const initAuth = async () => {
            try {
                // getUser() verifies the session with the server, ensuring the user still exists
                const { data: { user }, error: userError } = await supabase.auth.getUser();

                if (userError || !user) {
                    console.log('[Auth] User not found or session invalid, clearing local state');
                    await supabase.auth.signOut();
                    await handleSession(null);
                    return;
                }

                // If user exists, get the session to initialize the app
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) throw sessionError;

                await handleSession(session);
            } catch (e) {
                console.error('[Auth] Init error:', e);
                if (mounted) {
                    setUser(null);
                    setAuthError(e.message);
                    setLoading(false);
                }
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
            console.log('[Auth] Event:', event);
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                // Only reload if user changed or we weren't loaded
                if (newSession?.user?.id !== user?.id) {
                    setLoading(true); // Show loader while switching
                    handleSession(newSession);
                }
            } else if (event === 'SIGNED_OUT') {
                handleSession(null);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []); // Run once on mount

    const value = {
        user,
        session,
        loading,
        authError,
        isDataLoaded,
        signOut: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            // State updates handled by subscription
        }
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
