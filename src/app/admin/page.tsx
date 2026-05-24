'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import {
    ArrowLeft, Users, ShoppingBag, Trophy, DollarSign,
    Package, Flag, MessageCircle,
    Play, ChevronRight, AlertTriangle, TrendingUp
} from 'lucide-react'
import Link from 'next/link'

interface DashboardData {
    totalUsuarios: number
    totalProdutos: number
    totalTorneios: number
    totalVendas: number
    faturamento: number
    usuariosNovos: number
    produtosNovos: number
    vendasHoje: number
    denunciasPendentes: number
}

export default function AdminDashboardPage() {
    const [dados, setDados] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState('')

    const carregarDashboard = async () => {
        setLoading(true)
        setErro('')
        try {
            // const response = await api.get('/api/admin/dashboard')
            // setDados(response.data)
            setDados(null)
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error)
            setErro('Erro ao carregar dados.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        carregarDashboard()
    }, [])

    const formatarMoeda = (valor: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
    }

    const formatarNumero = (valor: number) => {
        if (valor >= 1000) return `${(valor / 1000).toFixed(1)}K`
        return valor.toString()
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}>
                <Header />
                <div style={{ padding: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{ height: '100px', backgroundColor: '#eee', borderRadius: '12px' }} />
                        ))}
                    </div>
                    <div style={{ height: '100px', backgroundColor: '#eee', borderRadius: '12px', marginBottom: '12px' }} />
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} style={{ height: '50px', backgroundColor: '#eee', borderRadius: '8px', marginBottom: '6px' }} />
                    ))}
                </div>
                <BottomNav />
            </div>
        )
    }

    if (erro) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}>
                <Header />
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <p style={{ fontSize: '15px', color: '#DC2626', marginBottom: '16px' }}>{erro}</p>
                    <button onClick={carregarDashboard} style={{
                        padding: '10px 24px', backgroundColor: '#DC2626', color: '#fff',
                        border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
                    }}>Tentar novamente</button>
                </div>
                <BottomNav />
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}>
            <Header />

            <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e5e5', padding: '10px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link href="/" style={{ display: 'flex', padding: '4px' }}>
                        <ArrowLeft size={20} color="#1a1a1a" />
                    </Link>
                    <h1 style={{ fontSize: '17px', fontWeight: '700', color: '#1a1a1a' }}>Dashboard</h1>
                </div>
            </div>

            <div style={{ padding: '16px' }}>
                {/* Cards principais */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
                    <StatCard icon={<Users size={22} />} valor={dados ? formatarNumero(dados.totalUsuarios) : '0'} label="Usuarios" cor="#3B82F6" bg="#EFF6FF" />
                    <StatCard icon={<Package size={22} />} valor={dados ? formatarNumero(dados.totalProdutos) : '0'} label="Produtos" cor="#DC2626" bg="#FEE2E2" />
                    <StatCard icon={<Trophy size={22} />} valor={dados ? formatarNumero(dados.totalTorneios) : '0'} label="Torneios" cor="#FFB800" bg="#FFF8E1" />
                    <StatCard icon={<DollarSign size={22} />} valor={dados ? formatarMoeda(dados.faturamento) : 'R$ 0'} label="Faturamento" cor="#16A34A" bg="#DCFCE7" />
                </div>

                {/* Atividade do dia */}
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e5e5e5', marginBottom: '12px' }}>
                    <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a', marginBottom: '14px' }}>
                        Atividade de hoje
                    </h2>
                    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                        <ActivityItem icon={<Users size={16} />} valor={dados?.usuariosNovos || 0} label="Novos usuarios" cor="#3B82F6" />
                        <ActivityItem icon={<Package size={16} />} valor={dados?.produtosNovos || 0} label="Novos anuncios" cor="#DC2626" />
                        <ActivityItem icon={<ShoppingBag size={16} />} valor={dados?.vendasHoje || 0} label="Vendas" cor="#16A34A" />
                    </div>
                </div>

                {/* Alerta de denuncias */}
                {dados && dados.denunciasPendentes > 0 && (
                    <Link href="/admin/moderacao" style={{ textDecoration: 'none' }}>
                        <div style={{
                            backgroundColor: '#FEF3C7', borderRadius: '12px', padding: '14px 16px',
                            border: '1px solid #FDE68A', display: 'flex', alignItems: 'center',
                            gap: '12px', marginBottom: '12px'
                        }}>
                            <AlertTriangle size={20} color="#D97706" />
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '14px', fontWeight: '600', color: '#92400E' }}>
                                    {dados.denunciasPendentes} denuncias pendentes
                                </p>
                                <p style={{ fontSize: '12px', color: '#B45309' }}>Revisar moderacao</p>
                            </div>
                            <ChevronRight size={16} color="#D97706" />
                        </div>
                    </Link>
                )}

                {/* Menu rapido */}
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e5e5' }}>
                    <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a', padding: '14px 16px 8px' }}>
                        Gerenciar
                    </h2>
                    <AdminMenuItem icon={<Flag size={17} />} label="Moderacao" desc={`${dados?.denunciasPendentes || 0} denuncias`} href="/admin/moderacao" destaque={!!dados?.denunciasPendentes} />
                    <AdminMenuItem icon={<Package size={17} />} label="Produtos" desc="Gerenciar anuncios" href="/admin/produtos" />
                    <AdminMenuItem icon={<Users size={17} />} label="Usuarios" desc="Gerenciar usuarios" href="/admin/usuarios" />
                    <AdminMenuItem icon={<Trophy size={17} />} label="Torneios" desc="Gerenciar torneios" href="/admin/torneios" />
                    <AdminMenuItem icon={<Play size={17} />} label="Videos" desc="Gerenciar videos" href="/admin/videos" />
                    <AdminMenuItem icon={<MessageCircle size={17} />} label="Forum" desc="Gerenciar topicos" href="/admin/forum" />
                </div>
            </div>

            <BottomNav />
        </div>
    )
}

function StatCard({ icon, valor, label, cor, bg }: {
    icon: React.ReactNode; valor: string; label: string; cor: string; bg: string
}) {
    return (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '14px', border: '1px solid #e5e5e5' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cor, marginBottom: '10px' }}>
                {icon}
            </div>
            <p style={{ fontSize: '20px', fontWeight: '800', color: '#1a1a1a', marginBottom: '2px' }}>{valor}</p>
            <p style={{ fontSize: '12px', color: '#888' }}>{label}</p>
        </div>
    )
}

function ActivityItem({ icon, valor, label, cor }: {
    icon: React.ReactNode; valor: number; label: string; cor: string
}) {
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ color: cor, marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
            <p style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a' }}>+{valor}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', marginTop: '2px' }}>
                <TrendingUp size={11} color="#16A34A" />
                <p style={{ fontSize: '11px', color: '#888' }}>{label}</p>
            </div>
        </div>
    )
}

function AdminMenuItem({ icon, label, desc, href, destaque = false }: {
    icon: React.ReactNode; label: string; desc: string; href: string; destaque?: boolean
}) {
    return (
        <Link href={href} style={{ textDecoration: 'none' }}>
            <div style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                borderBottom: '1px solid #f5f5f5', backgroundColor: destaque ? '#FFF5F5' : '#fff'
            }}>
                <span style={{ color: destaque ? '#DC2626' : '#888' }}>{icon}</span>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: destaque ? '#DC2626' : '#1a1a1a' }}>{label}</p>
                    <p style={{ fontSize: '11px', color: '#888' }}>{desc}</p>
                </div>
                <ChevronRight size={15} color="#ccc" />
            </div>
        </Link>
    )
}