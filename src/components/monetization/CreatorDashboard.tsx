// components/monetization/CreatorDashboard.tsx
'use client'

import { useState } from 'react';
import { useMonetization } from '@/hooks/useMonetization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DollarSign,
    TrendingUp,
    Users,
    Video,
    Clock,
    Award,
    Star,
    Zap,
    Gift,
    Settings,
    Download,
    AlertCircle,
    CheckCircle2,
    ArrowUpRight,
    Wallet,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function CreatorDashboard() {
    const {
        isEligible,
        currentTier,
        stats,
        earnings,
        isEnabled,
        isLoading,
        enableMonetization,
        requestWithdrawal,
        toggleAdSettings,
        configureSuperChat,
        configureSubscriptions,
        updatePaymentConfig,
    } = useMonetization();

    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [paymentConfig, setPaymentConfig] = useState({
        method: 'PIX' as const,
        pixKey: '',
    });
    const [superChatMin, setSuperChatMin] = useState('5');
    const [subscriptionPrice, setSubscriptionPrice] = useState('9.90');

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    const getTierColor = (tier: string) => {
        const colors = {
            STARTER: 'bg-gray-500',
            GROWING: 'bg-green-500',
            ESTABLISHED: 'bg-blue-500',
            PROFESSIONAL: 'bg-purple-500',
        };
        return colors[tier as keyof typeof colors] || 'bg-gray-500';
    };

    const getTierLabel = (tier: string) => {
        const labels = {
            STARTER: 'Iniciante',
            GROWING: 'Crescendo',
            ESTABLISHED: 'Estabelecido',
            PROFESSIONAL: 'Profissional',
        };
        return labels[tier as keyof typeof labels] || tier;
    };

    const getNextTier = (tier: string) => {
        const progression = {
            STARTER: 'GROWING',
            GROWING: 'ESTABLISHED',
            ESTABLISHED: 'PROFESSIONAL',
            PROFESSIONAL: null,
        };
        return progression[tier as keyof typeof progression];
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard do Criador</h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie sua monetização e acompanhe seus ganhos
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {isEnabled ? (
                        <Badge className="bg-green-500">
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Monetização Ativa
                        </Badge>
                    ) : (
                        <Button onClick={() => enableMonetization(paymentConfig)}>
                            <DollarSign className="w-4 h-4 mr-2" />
                            Ativar Monetização
                        </Button>
                    )}
                </div>
            </div>

            {/* Cards de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Ganhos Totais
                        </CardTitle>
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(earnings.total)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                +12.5%
              </span>
                            vs mês anterior
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Disponível para Saque
                        </CardTitle>
                        <Wallet className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(earnings.available)}
                        </div>
                        {earnings.available > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => requestWithdrawal(earnings.available)}
                            >
                                Sacar Agora
                            </Button>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Seguidores
                        </CardTitle>
                        <Users className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.followers.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Visualizações Totais
                        </CardTitle>
                        <Video className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {(stats.totalViews / 1000).toFixed(1)}K
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Progresso do Tier */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="w-5 h-5" />
                                Nível do Criador
                            </CardTitle>
                            <CardDescription>
                                Seu progresso para o próximo nível
                            </CardDescription>
                        </div>
                        <Badge className={getTierColor(currentTier)}>
                            {getTierLabel(currentTier)}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span>Progresso para {getTierLabel(getNextTier(currentTier) || '')}</span>
                                <span className="font-medium">{stats.nextTierProgress}%</span>
                            </div>
                            <Progress value={stats.nextTierProgress} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-2">
                                {stats.nextTierRequirement}
                            </p>
                        </div>

                        {/* Requisitos Detalhados */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div className="flex items-center gap-2 text-sm">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span>{stats.followers} / 2000 seguidores</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Video className="w-4 h-4 text-muted-foreground" />
                                <span>{stats.totalVideos} / 50 vídeos</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>{stats.watchHours}h / 200h assistidas</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                                <span>{(stats.totalViews / 1000).toFixed(1)}K views</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs de Configuração */}
            <Tabs defaultValue="earnings" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="earnings">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Ganhos
                    </TabsTrigger>
                    <TabsTrigger value="ads">
                        <Zap className="w-4 h-4 mr-2" />
                        Anúncios
                    </TabsTrigger>
                    <TabsTrigger value="superchat">
                        <Gift className="w-4 h-4 mr-2" />
                        Super Chat
                    </TabsTrigger>
                    <TabsTrigger value="subscriptions">
                        <Star className="w-4 h-4 mr-2" />
                        Assinaturas
                    </TabsTrigger>
                    <TabsTrigger value="settings">
                        <Settings className="w-4 h-4 mr-2" />
                        Configurações
                    </TabsTrigger>
                </TabsList>

                {/* Tab Ganhos */}
                <TabsContent value="earnings">
                    <Card>
                        <CardHeader>
                            <CardTitle>Resumo de Ganhos</CardTitle>
                            <CardDescription>Detalhamento dos últimos 30 dias</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 bg-muted rounded-lg">
                                        <p className="text-sm text-muted-foreground">Ads Revenue</p>
                                        <p className="text-2xl font-bold">{formatCurrency(earnings.adRevenue)}</p>
                                    </div>
                                    <div className="p-4 bg-muted rounded-lg">
                                        <p className="text-sm text-muted-foreground">Super Chat</p>
                                        <p className="text-2xl font-bold">{formatCurrency(earnings.superChat)}</p>
                                    </div>
                                    <div className="p-4 bg-muted rounded-lg">
                                        <p className="text-sm text-muted-foreground">Assinaturas</p>
                                        <p className="text-2xl font-bold">{formatCurrency(earnings.subscriptions)}</p>
                                    </div>
                                    <div className="p-4 bg-muted rounded-lg">
                                        <p className="text-sm text-muted-foreground">Vendas</p>
                                        <p className="text-2xl font-bold">{formatCurrency(earnings.productSales)}</p>
                                    </div>
                                </div>

                                {/* Revenue Share Info */}
                                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                                    <h4 className="font-semibold mb-2">Revenue Share Atual</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Ads:</span>
                                            <span className="font-medium">Você: 45% | Plataforma: 55%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Super Chat:</span>
                                            <span className="font-medium">Você: 70% | Plataforma: 30%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Assinaturas:</span>
                                            <span className="font-medium">Você: 80% | Plataforma: 20%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Botão de Saque */}
                                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                    <div>
                                        <p className="font-semibold">Saldo Disponível</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {formatCurrency(earnings.available)}
                                        </p>
                                    </div>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button>
                                                <Download className="w-4 h-4 mr-2" />
                                                Solicitar Saque
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Solicitar Saque</DialogTitle>
                                                <DialogDescription>
                                                    Valor mínimo: R$ 50,00
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <Input
                                                    type="number"
                                                    placeholder="Valor do saque"
                                                    value={withdrawAmount}
                                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                                />
                                                <Button
                                                    className="w-full"
                                                    onClick={() => requestWithdrawal(Number(withdrawAmount))}
                                                >
                                                    Confirmar Saque
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab Anúncios */}
                <TabsContent value="ads">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configurações de Anúncios</CardTitle>
                            <CardDescription>
                                Escolha onde os anúncios serão exibidos nos seus vídeos
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold">Pre-roll Ads</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Anúncios antes do vídeo começar
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => toggleAdSettings({ preRoll: true })}
                                    >
                                        Ativar
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold">Mid-roll Ads</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Anúncios durante o vídeo (mín. 8 min)
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => toggleAdSettings({ midRoll: true })}
                                    >
                                        Ativar
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold">Post-roll Ads</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Anúncios após o vídeo terminar
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => toggleAdSettings({ postRoll: true })}
                                    >
                                        Ativar
                                    </Button>
                                </div>

                                <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-yellow-800 dark:text-yellow-200">
                                                Dica de Ouro 💡
                                            </p>
                                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                                Vídeos com duração entre 8-15 minutos com 2 mid-rolls têm
                                                a melhor performance de receita sem prejudicar a retenção.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab Super Chat */}
                <TabsContent value="superchat">
                    <Card>
                        <CardHeader>
                            <CardTitle>Super Chat</CardTitle>
                            <CardDescription>
                                Permita que fãs paguem para destacar mensagens nos seus vídeos
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">
                                        Valor Mínimo (R$)
                                    </label>
                                    <Input
                                        type="number"
                                        value={superChatMin}
                                        onChange={(e) => setSuperChatMin(e.target.value)}
                                        className="mt-2"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Recomendado: R$ 2,00 a R$ 10,00
                                    </p>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span>Seu revenue share:</span>
                                    <Badge variant="secondary">70%</Badge>
                                </div>

                                <Button onClick={() => configureSuperChat(Number(superChatMin))}>
                                    Salvar Configurações
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab Assinaturas */}
                <TabsContent value="subscriptions">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assinaturas do Canal</CardTitle>
                            <CardDescription>
                                Ofereça conteúdo exclusivo para assinantes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">
                                        Preço da Assinatura Mensal (R$)
                                    </label>
                                    <Input
                                        type="number"
                                        value={subscriptionPrice}
                                        onChange={(e) => setSubscriptionPrice(e.target.value)}
                                        className="mt-2"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Recomendado: R$ 4,90 a R$ 24,90
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-semibold">Benefícios para Assinantes:</h4>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            Badge exclusivo de apoiador
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            Emojis personalizados nos comentários
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            Acesso antecipado a vídeos
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            Conteúdo exclusivo para membros
                                        </li>
                                    </ul>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span>Seu revenue share:</span>
                                    <Badge variant="secondary">80%</Badge>
                                </div>

                                <Button onClick={() => configureSubscriptions(Number(subscriptionPrice))}>
                                    Salvar Configurações
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab Configurações */}
                <TabsContent value="settings">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configurações de Pagamento</CardTitle>
                            <CardDescription>
                                Como você deseja receber seus ganhos
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Método de Pagamento</label>
                                    <Select
                                        value={paymentConfig.method}
                                        onValueChange={(value: any) =>
                                            setPaymentConfig(prev => ({ ...prev, method: value }))
                                        }
                                    >
                                        <SelectTrigger className="mt-2">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PIX">PIX</SelectItem>
                                            <SelectItem value="PAYPAL">PayPal</SelectItem>
                                            <SelectItem value="BANK_TRANSFER">
                                                Transferência Bancária
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {paymentConfig.method === 'PIX' && (
                                    <div>
                                        <label className="text-sm font-medium">Chave PIX</label>
                                        <Input
                                            placeholder="CPF, e-mail, telefone ou chave aleatória"
                                            value={paymentConfig.pixKey}
                                            onChange={(e) =>
                                                setPaymentConfig(prev => ({ ...prev, pixKey: e.target.value }))
                                            }
                                            className="mt-2"
                                        />
                                    </div>
                                )}

                                <Button onClick={() => updatePaymentConfig(paymentConfig)}>
                                    Salvar Configurações
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-8 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}