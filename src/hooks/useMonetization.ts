// hooks/useMonetization.ts
'use client'

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface MonetizationState {
    isEligible: boolean;
    currentTier: TierLevel;
    stats: CreatorStats;
    earnings: EarningsSummary;
    isEnabled: boolean;
    isLoading: boolean;
    error: string | null;
}

interface CreatorStats {
    followers: number;
    totalViews: number;
    totalVideos: number;
    watchHours: number;
    daysActive: number;
    nextTierProgress: number; // % para próximo tier
    nextTierRequirement: string;
}

interface EarningsSummary {
    total: number;
    available: number;
    pending: number;
    thisMonth: number;
    lastMonth: number;
    adRevenue: number;
    superChat: number;
    subscriptions: number;
    productSales: number;
}

interface PaymentConfig {
    method: 'PAYPAL' | 'PIX' | 'BANK_TRANSFER';
    email?: string;
    pixKey?: string;
}

export function useMonetization() {
    const { data: session } = useSession();
    const [state, setState] = useState<MonetizationState>({
        isEligible: false,
        currentTier: 'STARTER',
        stats: {
            followers: 0,
            totalViews: 0,
            totalVideos: 0,
            watchHours: 0,
            daysActive: 0,
            nextTierProgress: 0,
            nextTierRequirement: '',
        },
        earnings: {
            total: 0,
            available: 0,
            pending: 0,
            thisMonth: 0,
            lastMonth: 0,
            adRevenue: 0,
            superChat: 0,
            subscriptions: 0,
            productSales: 0,
        },
        isEnabled: false,
        isLoading: true,
        error: null,
    });

    const fetchMonetizationData = useCallback(async () => {
        if (!session?.user) return;

        try {
            const response = await fetch('/api/monetization/status');
            const data = await response.json();

            setState({
                isEligible: data.isEligible,
                currentTier: data.currentTier,
                stats: data.stats,
                earnings: data.earnings,
                isEnabled: data.isEnabled,
                isLoading: false,
                error: null,
            });
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Erro ao carregar dados de monetização',
            }));
        }
    }, [session]);

    useEffect(() => {
        fetchMonetizationData();
    }, [fetchMonetizationData]);

    const enableMonetization = async (config: PaymentConfig) => {
        try {
            const response = await fetch('/api/monetization/enable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });

            if (!response.ok) throw new Error('Failed to enable monetization');

            setState(prev => ({ ...prev, isEnabled: true }));
            toast.success('Monetização ativada com sucesso!');
        } catch (error) {
            toast.error('Erro ao ativar monetização');
            throw error;
        }
    };

    const updatePaymentConfig = async (config: PaymentConfig) => {
        try {
            await fetch('/api/monetization/payment-config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });
            toast.success('Configuração de pagamento atualizada');
        } catch (error) {
            toast.error('Erro ao atualizar configuração');
        }
    };

    const requestWithdrawal = async (amount: number) => {
        try {
            const response = await fetch('/api/monetization/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount }),
            });

            if (!response.ok) throw new Error('Withdrawal failed');

            toast.success('Saque solicitado com sucesso!');
            fetchMonetizationData(); // Atualiza dados
        } catch (error) {
            toast.error('Erro ao solicitar saque');
        }
    };

    const toggleAdSettings = async (settings: {
        midRoll?: boolean;
        preRoll?: boolean;
        postRoll?: boolean;
    }) => {
        try {
            await fetch('/api/monetization/ad-settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            toast.success('Configurações de anúncios atualizadas');
        } catch (error) {
            toast.error('Erro ao atualizar anúncios');
        }
    };

    const configureSuperChat = async (minAmount: number) => {
        try {
            await fetch('/api/monetization/super-chat', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ minAmount }),
            });
            toast.success('Super Chat configurado');
        } catch (error) {
            toast.error('Erro ao configurar Super Chat');
        }
    };

    const configureSubscriptions = async (price: number) => {
        try {
            await fetch('/api/monetization/subscriptions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ price }),
            });
            toast.success('Assinaturas configuradas');
        } catch (error) {
            toast.error('Erro ao configurar assinaturas');
        }
    };

    return {
        ...state,
        enableMonetization,
        updatePaymentConfig,
        requestWithdrawal,
        toggleAdSettings,
        configureSuperChat,
        configureSubscriptions,
        refreshData: fetchMonetizationData,
    };
}