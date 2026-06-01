'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    ArrowLeft, Settings, MapPin, Star, Calendar,
    Camera, Bike, Trophy, MessageCircle, Grid3X3, Award,
    Share2, Medal, Clock
} from 'lucide-react'
import { authService } from '@/services/authService'
import api from '@/lib/api'

export default function PerfilPage() {
    const router = useRouter()
    const [tabAtiva, setTabAtiva] = useState<'produtos' | 'posts' | 'torneios' | 'avaliacoes'>('produtos')
    const [loading, setLoading] = useState(true)
    const [usuario, setUsuario] = useState<any>(null)
    const [produtos, setProdutos] = useState<any[]>([])
    const [torneios, setTorneios] = useState<any[]>([])
    const [avaliacoes, setAvaliacoes] = useState<any[]>([])

    const isOwnProfile = true // Sempre true por enquanto

    useEffect(() => {
        carregarDados()
    }, [])

    const carregarDados = async () => {
        setLoading(true)
        try {
            const token = authService.getToken()
            if (!token) {
                router.push('/login')
                return
            }

            // Busca dados do usuário logado
            const userResponse = await api.get('/users/me')
            const userData = userResponse.data
            setUsuario({
                name: userData.fullName,
                username: '@' + userData.fullName?.toLowerCase().replace(/\s/g, '_'),
                bio: userData.bio || 'Sem bio',
                avatar: userData.avatarUrl,
                city: userData.city || 'São Paulo',
                state: userData.state || 'SP',
                reputation: userData.reputationScore || 0,
                memberSince: userData.createdAt ? new Date(userData.createdAt).getFullYear().toString() : '2025',
                produtos: userData.totalSales || 0,
                posts: 0,
                seguidores: 0,
                seguindo: 0,
            })

            // Busca produtos do usuário
            const produtosResponse = await api.get('/products/my')
            setProdutos(produtosResponse.data.content || [])

            // Busca torneios
            const torneiosResponse = await api.get('/tournaments/my')
            setTorneios(torneiosResponse.data || [])

            // Busca avaliações
            const avaliacoesResponse = await api.get('/reviews/received')
            setAvaliacoes(avaliacoesResponse.data.content || [])

        } catch (error) {
            console.error('Erro ao carregar perfil:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#888' }}>Carregando...</p>
            </div>
        )
    }

    if (!usuario) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
                <p style={{ color: '#888' }}>Faça login para ver seu perfil</p>
                <button onClick={() => router.push('/login')} style={{ padding: '10px 24px', backgroundColor: '#DC2626', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                    Fazer login
                </button>
            </div>
        )
    }

    const nomeInicial = usuario.name?.charAt(0).toUpperCase() || '?'

    const formatarPreco = (valor: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '50px' }}>
            {/* Header */}
            <div style={{
                backgroundColor: '#fff', borderBottom: '1px solid #e5e5e5',
                padding: '10px 12px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', position: 'sticky', top: 0, zIndex: 40
            }}>
                <button onClick={() => router.back()} style={headerBtn}><ArrowLeft size={20} color="#1a1a1a" /></button>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a' }}>{usuario.username}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <button style={headerBtn}><Share2 size={18} color="#1a1a1a" /></button>
                    <button style={headerBtn}><Settings size={18} color="#1a1a1a" /></button>
                </div>
            </div>

            {/* Info Perfil */}
            <div style={{ backgroundColor: '#fff', padding: '20px 16px 16px', borderBottom: '1px solid #e5e5e5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '14px' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: usuario.avatar ? `url(${usuario.avatar})` : 'linear-gradient(135deg, #DC2626, #991b1b)',
                        backgroundSize: 'cover', backgroundPosition: 'center',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '32px', fontWeight: 'bold', color: '#fff', flexShrink: 0, position: 'relative'
                    }}>
                        {!usuario.avatar && nomeInicial}
                        <div style={{
                            position: 'absolute', bottom: '-2px', right: '-2px',
                            width: '26px', height: '26px', borderRadius: '50%',
                            backgroundColor: '#DC2626', border: '3px solid #fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                        }}><Camera size={13} color="#fff" /></div>
                    </div>
                    <div style={{ display: 'flex', gap: '18px', flex: 1, justifyContent: 'center' }}>
                        <Stat valor={usuario.produtos} label="Produtos" />
                        <Stat valor={usuario.posts} label="Posts" />
                        <Stat valor={usuario.seguidores} label="Seguidores" />
                    </div>
                </div>

                <h1 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a', marginBottom: '2px' }}>{usuario.name}</h1>
                <p style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>{usuario.username}</p>
                <p style={{ fontSize: '13px', color: '#444', lineHeight: '1.5', marginBottom: '10px', whiteSpace: 'pre-line' }}>
                    {usuario.bio}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                    <Tag icon={<MapPin size={12} />} text={`${usuario.city}, ${usuario.state}`} />
                    <Tag icon={<Star size={12} />} text={usuario.reputation?.toString() || '0'} destaque />
                    <Tag icon={<Calendar size={12} />} text={`Desde ${usuario.memberSince}`} />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={editBtnStyle}>Editar perfil</button>
                    <button style={msgBtnStyle}><MessageCircle size={16} /></button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex', backgroundColor: '#fff',
                borderBottom: '1px solid #e5e5e5', position: 'sticky', top: '45px', zIndex: 39
            }}>
                {[
                    { key: 'produtos' as const, icon: Bike, label: 'Produtos' },
                    { key: 'posts' as const, icon: Grid3X3, label: 'Posts' },
                    { key: 'torneios' as const, icon: Trophy, label: 'Torneios' },
                    { key: 'avaliacoes' as const, icon: Award, label: 'Avaliações' },
                ].map((tab) => {
                    const isActive = tabAtiva === tab.key
                    const Icon = tab.icon
                    return (
                        <button key={tab.key} onClick={() => setTabAtiva(tab.key)} style={{
                            flex: 1, padding: '11px 0', background: 'none', border: 'none',
                            borderBottom: isActive ? '2px solid #DC2626' : '2px solid transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: '5px', fontSize: '12px', fontWeight: isActive ? '600' : '400',
                            color: isActive ? '#DC2626' : '#888', cursor: 'pointer'
                        }}>
                            <Icon size={15} /><span>{tab.label}</span>
                        </button>
                    )
                })}
            </div>

            {/* Conteúdo */}
            <div style={{ padding: '12px 16px' }}>
                {tabAtiva === 'produtos' && (
                    produtos.length === 0 ? (
                        <Empty icon={<Bike size={36} />} title="Nenhum produto" desc="Produtos anunciados aparecem aqui" />
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                            {produtos.map((item: any) => (
                                <div key={item.id} onClick={() => router.push(`/produto/${item.id}`)} style={{ backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e5e5e5', cursor: 'pointer' }}>
                                    <div style={{ height: '140px', backgroundImage: item.images?.[0]?.url ? `url(${item.images[0].url})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#e5e5e5' }} />
                                    <div style={{ padding: '10px' }}>
                                        <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>{item.title}</h3>
                                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#DC2626', marginTop: '2px' }}>{formatarPreco(item.price)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {tabAtiva === 'torneios' && (
                    torneios.length === 0 ? (
                        <Empty icon={<Trophy size={36} />} title="Nenhum torneio" desc="Torneios disputados aparecem aqui" />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {torneios.map((t: any) => (
                                <div key={t.id} style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '14px', border: '1px solid #e5e5e5', borderLeft: t.podium ? '3px solid #DC2626' : '3px solid #e5e5e5' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', marginBottom: '4px' }}>{t.name || t.nome}</h3>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', color: '#888' }}>
                                                <Clock size={11} /> {t.date || t.data}
                                            </span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            {t.status === 'inscrito' || t.status === 'INSCRITO' ? (
                                                <span style={{ fontSize: '11px', fontWeight: '600', color: '#DC2626', backgroundColor: '#FEE2E2', padding: '3px 8px', borderRadius: '4px' }}>INSCRITO</span>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    {t.podium && <Medal size={14} color="#FFB800" />}
                                                    <span style={{ fontSize: '13px', fontWeight: '700', color: t.podium ? '#1a1a1a' : '#888' }}>{t.position || t.posicao}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {tabAtiva === 'avaliacoes' && (
                    avaliacoes.length === 0 ? (
                        <Empty icon={<Award size={36} />} title="Nenhuma avaliação" desc="Avaliações recebidas aparecem aqui" />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {avaliacoes.map((a: any) => (
                                <div key={a.id} style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '14px', border: '1px solid #e5e5e5' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>{a.reviewerName || a.nome}</span>
                                        <div style={{ display: 'flex', gap: '1px' }}>
                                            {[1,2,3,4,5].map((n) => (
                                                <Star key={n} size={11} color="#FFB800" fill={n <= (a.rating || a.nota) ? '#FFB800' : 'none'} />
                                            ))}
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '12px', color: '#666', lineHeight: '1.4' }}>{a.comment || a.comentario}</p>
                                    <p style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>{a.date || a.data}</p>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    )
}

function Stat({ valor, label }: { valor: number; label: string }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a' }}>{valor}</p>
            <p style={{ fontSize: '11px', color: '#888' }}>{label}</p>
        </div>
    )
}

function Tag({ icon, text, destaque = false }: { icon: React.ReactNode; text: string; destaque?: boolean }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: destaque ? '#DC2626' : '#888', fontWeight: destaque ? '600' : '400' }}>
            {icon}<span>{text}</span>
        </div>
    )
}

function Empty({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
    return (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ color: '#d1d5db', marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', marginBottom: '4px' }}>{title}</h3>
            <p style={{ fontSize: '12px', color: '#888' }}>{desc}</p>
        </div>
    )
}

const headerBtn: React.CSSProperties = {
    background: 'none', border: 'none', padding: '6px', cursor: 'pointer', display: 'flex', borderRadius: '50%'
}

const editBtnStyle: React.CSSProperties = {
    flex: 1, padding: '10px', backgroundColor: '#1a1a1a', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
}

const msgBtnStyle: React.CSSProperties = {
    padding: '10px 14px', backgroundColor: '#fff', border: '1px solid #e5e5e5',
    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#1a1a1a'
}