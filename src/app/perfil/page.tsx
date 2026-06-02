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

interface UserData {
    name: string
    username: string
    bio: string
    avatar: string | null
    city: string
    state: string
    reputation: number
    memberSince: string
    produtos: number
    posts: number
    seguidores: number
    seguindo: number
}

interface Produto {
    id: string
    title: string
    price: number
    images?: { url: string }[]
}

interface Torneio {
    id: string
    name?: string
    nome?: string
    date?: string
    data?: string
    status?: string
    position?: string
    posicao?: string
    podium?: boolean
}

interface Avaliacao {
    id: string
    reviewerName?: string
    nome?: string
    rating?: number
    nota?: number
    comment?: string
    comentario?: string
    date?: string
    data?: string
}

type TabKey = 'produtos' | 'posts' | 'torneios' | 'avaliacoes'

export default function PerfilPage() {
    const router = useRouter()
    const [tabAtiva, setTabAtiva] = useState<TabKey>('produtos')
    const [loading, setLoading] = useState(true)
    const [usuario, setUsuario] = useState<UserData | null>(null)
    const [produtos, setProdutos] = useState<Produto[]>([])
    const [torneios, setTorneios] = useState<Torneio[]>([])
    const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])

    useEffect(() => {
        let cancelled = false

        async function load() {
            const token = authService.getToken()
            if (!token) {
                router.push('/login')
                return
            }

            setLoading(true)
            try {
                const userResponse = await api.get('/users/me')
                if (cancelled) return
                const userData = userResponse.data as Record<string, unknown>

                if (!cancelled) {
                    setUsuario({
                        name: (userData.fullName as string) || 'Usuário',
                        username: '@' + ((userData.fullName as string) || 'usuario').toLowerCase().replace(/\s/g, '_'),
                        bio: (userData.bio as string) || 'Sem bio',
                        avatar: (userData.avatarUrl as string) || null,
                        city: (userData.city as string) || 'São Paulo',
                        state: (userData.state as string) || 'SP',
                        reputation: (userData.reputationScore as number) || 0,
                        memberSince: userData.createdAt
                            ? new Date(userData.createdAt as string).getFullYear().toString()
                            : '2025',
                        produtos: (userData.totalSales as number) || 0,
                        posts: 0,
                        seguidores: 0,
                        seguindo: 0,
                    })
                }

                const [prodRes, tornRes, avalRes] = await Promise.all([
                    api.get('/products/my'),
                    api.get('/tournaments/my'),
                    api.get('/reviews/received'),
                ])
                if (cancelled) return

                const prodData = prodRes.data as { content?: Produto[] }
                const tornData = tornRes.data as Torneio[]
                const avalData = avalRes.data as { content?: Avaliacao[] }

                if (!cancelled) {
                    setProdutos(prodData.content || [])
                    setTorneios(Array.isArray(tornData) ? tornData : [])
                    setAvaliacoes(avalData.content || [])
                }
            } catch {
                // silencioso
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        load()
        return () => { cancelled = true }
    }, [router])

    if (loading) {
        return (
            <div style={centerStyle}>
                <p style={{ color: '#888' }}>Carregando...</p>
            </div>
        )
    }

    if (!usuario) {
        return (
            <div style={{ ...centerStyle, flexDirection: 'column', gap: '16px' }}>
                <p style={{ color: '#888' }}>Faça login para ver seu perfil</p>
                <button onClick={() => router.push('/login')} style={loginBtnStyle}>
                    Fazer login
                </button>
            </div>
        )
    }

    const nomeInicial = usuario.name.charAt(0).toUpperCase()
    const formatarPreco = (valor: number): string =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)

    return (
        <div style={pageStyle}>
            <div style={topBarStyle}>
                <button onClick={() => router.back()} style={headerBtn}><ArrowLeft size={20} color="#1a1a1a" /></button>
                <span style={topBarTitle}>{usuario.username}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <button style={headerBtn}><Share2 size={18} color="#1a1a1a" /></button>
                    <button style={headerBtn}><Settings size={18} color="#1a1a1a" /></button>
                </div>
            </div>

            <div style={profileSection}>
                <div style={profileRow}>
                    <div style={{
                        ...avatarStyle,
                        background: usuario.avatar
                            ? `url(${usuario.avatar}) center/cover no-repeat`
                            : 'linear-gradient(135deg, #DC2626, #991b1b)',
                    }}>
                        {!usuario.avatar && nomeInicial}
                        <div style={cameraBadge}><Camera size={13} color="#fff" /></div>
                    </div>
                    <div style={statsRow}>
                        <Stat valor={usuario.produtos} label="Produtos" />
                        <Stat valor={usuario.posts} label="Posts" />
                        <Stat valor={usuario.seguidores} label="Seguidores" />
                    </div>
                </div>

                <h1 style={nameStyle}>{usuario.name}</h1>
                <p style={usernameStyle}>{usuario.username}</p>
                <p style={bioStyle}>{usuario.bio}</p>

                <div style={tagsRow}>
                    <Tag icon={<MapPin size={12} />} text={`${usuario.city}, ${usuario.state}`} />
                    <Tag icon={<Star size={12} />} text={usuario.reputation.toString()} destaque />
                    <Tag icon={<Calendar size={12} />} text={`Desde ${usuario.memberSince}`} />
                </div>

                <div style={actionRow}>
                    <button style={editBtnStyle}>Editar perfil</button>
                    <button style={msgBtnStyle}><MessageCircle size={16} /></button>
                </div>
            </div>

            <div style={tabsContainer}>
                {TABS.map((tab) => {
                    const isActive = tabAtiva === tab.key
                    const Icon = tab.icon
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setTabAtiva(tab.key)}
                            style={{
                                ...tabBtnBase,
                                borderBottomColor: isActive ? '#DC2626' : 'transparent',
                                color: isActive ? '#DC2626' : '#888',
                                fontWeight: isActive ? '600' : '400',
                            }}
                        >
                            <Icon size={15} />
                            <span>{tab.label}</span>
                        </button>
                    )
                })}
            </div>

            <div style={contentStyle}>
                {tabAtiva === 'produtos' && (
                    produtos.length === 0 ? (
                        <Empty icon={<Bike size={36} />} title="Nenhum produto" desc="Produtos anunciados aparecem aqui" />
                    ) : (
                        <div style={grid2}>
                            {produtos.map((item) => (
                                <div key={item.id} onClick={() => router.push(`/produto/${item.id}`)} style={cardStyle}>
                                    <div style={{
                                        height: '140px',
                                        backgroundImage: item.images?.[0]?.url ? `url(${item.images[0].url})` : undefined,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundColor: '#e5e5e5',
                                    }} />
                                    <div style={{ padding: '10px' }}>
                                        <h3 style={cardTitle}>{item.title}</h3>
                                        <p style={cardPrice}>{formatarPreco(item.price)}</p>
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
                        <div style={listGap}>
                            {torneios.map((t) => (
                                <div key={t.id} style={{
                                    ...torneioCard,
                                    borderLeftColor: t.podium ? '#DC2626' : '#e5e5e5',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={torneioTitle}>{t.name || t.nome}</h3>
                                            <span style={torneioDate}><Clock size={11} /> {t.date || t.data}</span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            {t.status === 'inscrito' || t.status === 'INSCRITO' ? (
                                                <span style={inscritoBadge}>INSCRITO</span>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    {t.podium && <Medal size={14} color="#FFB800" />}
                                                    <span style={{
                                                        fontSize: '13px', fontWeight: '700',
                                                        color: t.podium ? '#1a1a1a' : '#888',
                                                    }}>
                                                        {t.position || t.posicao}
                                                    </span>
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
                        <div style={listGap}>
                            {avaliacoes.map((a) => (
                                <div key={a.id} style={reviewCard}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span style={reviewName}>{a.reviewerName || a.nome}</span>
                                        <div style={{ display: 'flex', gap: '1px' }}>
                                            {[1, 2, 3, 4, 5].map((n) => (
                                                <Star key={n} size={11} color="#FFB800"
                                                      fill={n <= (a.rating || a.nota || 0) ? '#FFB800' : 'none'} />
                                            ))}
                                        </div>
                                    </div>
                                    <p style={reviewComment}>{a.comment || a.comentario}</p>
                                    <p style={reviewDate}>{a.date || a.data}</p>
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
        <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '11px', color: destaque ? '#DC2626' : '#888',
            fontWeight: destaque ? '600' : '400',
        }}>
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

const TABS: { key: TabKey; icon: React.ElementType; label: string }[] = [
    { key: 'produtos', icon: Bike, label: 'Produtos' },
    { key: 'posts', icon: Grid3X3, label: 'Posts' },
    { key: 'torneios', icon: Trophy, label: 'Torneios' },
    { key: 'avaliacoes', icon: Award, label: 'Avaliações' },
]

const centerStyle: React.CSSProperties = {
    minHeight: '100vh', backgroundColor: '#f5f5f5',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const loginBtnStyle: React.CSSProperties = {
    padding: '10px 24px', backgroundColor: '#DC2626', color: '#fff',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
}

const pageStyle: React.CSSProperties = { minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '50px' }

const topBarStyle: React.CSSProperties = {
    backgroundColor: '#fff', borderBottom: '1px solid #e5e5e5',
    padding: '10px 12px', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', position: 'sticky', top: 0, zIndex: 40,
}

const topBarTitle: React.CSSProperties = { fontSize: '16px', fontWeight: '700', color: '#1a1a1a' }

const profileSection: React.CSSProperties = {
    backgroundColor: '#fff', padding: '20px 16px 16px', borderBottom: '1px solid #e5e5e5',
}

const profileRow: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '14px',
}

const avatarStyle: React.CSSProperties = {
    width: '80px', height: '80px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '32px', fontWeight: 'bold', color: '#fff',
    flexShrink: 0, position: 'relative',
}

const cameraBadge: React.CSSProperties = {
    position: 'absolute', bottom: '-2px', right: '-2px',
    width: '26px', height: '26px', borderRadius: '50%',
    backgroundColor: '#DC2626', border: '3px solid #fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
}

const statsRow: React.CSSProperties = { display: 'flex', gap: '18px', flex: 1, justifyContent: 'center' }
const nameStyle: React.CSSProperties = { fontSize: '16px', fontWeight: '700', color: '#1a1a1a', marginBottom: '2px' }
const usernameStyle: React.CSSProperties = { fontSize: '13px', color: '#888', marginBottom: '8px' }
const bioStyle: React.CSSProperties = { fontSize: '13px', color: '#444', lineHeight: '1.5', marginBottom: '10px', whiteSpace: 'pre-line' }
const tagsRow: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }
const actionRow: React.CSSProperties = { display: 'flex', gap: '8px' }

const tabsContainer: React.CSSProperties = {
    display: 'flex', backgroundColor: '#fff',
    borderBottom: '1px solid #e5e5e5', position: 'sticky', top: '45px', zIndex: 39,
}

const tabBtnBase: React.CSSProperties = {
    flex: 1, padding: '11px 0', background: 'none', border: 'none',
    borderBottom: '2px solid transparent', display: 'flex',
    alignItems: 'center', justifyContent: 'center', gap: '5px',
    fontSize: '12px', cursor: 'pointer',
}

const contentStyle: React.CSSProperties = { padding: '12px 16px' }
const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }
const cardStyle: React.CSSProperties = {
    backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden',
    border: '1px solid #e5e5e5', cursor: 'pointer',
}
const cardTitle: React.CSSProperties = { fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }
const cardPrice: React.CSSProperties = { fontSize: '14px', fontWeight: '700', color: '#DC2626', marginTop: '2px' }
const listGap: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '8px' }

const torneioCard: React.CSSProperties = {
    backgroundColor: '#fff', borderRadius: '10px', padding: '14px',
    border: '1px solid #e5e5e5', borderLeft: '3px solid #e5e5e5',
}
const torneioTitle: React.CSSProperties = { fontSize: '14px', fontWeight: '600', color: '#1a1a1a', marginBottom: '4px' }
const torneioDate: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', color: '#888' }
const inscritoBadge: React.CSSProperties = {
    fontSize: '11px', fontWeight: '600', color: '#DC2626',
    backgroundColor: '#FEE2E2', padding: '3px 8px', borderRadius: '4px',
}

const reviewCard: React.CSSProperties = {
    backgroundColor: '#fff', borderRadius: '10px', padding: '14px', border: '1px solid #e5e5e5',
}
const reviewName: React.CSSProperties = { fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }
const reviewComment: React.CSSProperties = { fontSize: '12px', color: '#666', lineHeight: '1.4' }
const reviewDate: React.CSSProperties = { fontSize: '11px', color: '#aaa', marginTop: '4px' }

const headerBtn: React.CSSProperties = {
    background: 'none', border: 'none', padding: '6px', cursor: 'pointer', display: 'flex', borderRadius: '50%',
}

const editBtnStyle: React.CSSProperties = {
    flex: 1, padding: '10px', backgroundColor: '#1a1a1a', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
}

const msgBtnStyle: React.CSSProperties = {
    padding: '10px 14px', backgroundColor: '#fff', border: '1px solid #e5e5e5',
    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#1a1a1a',
}