'use client'

import { useState } from 'react'
import {
    ArrowLeft, Settings, MapPin, Star, Calendar,
    Camera, Bike, Trophy,
    MessageCircle, Grid3X3, Award,
    Share2, Medal, Clock, Link2
} from 'lucide-react'

export default function PerfilPage() {
    const [tabAtiva, setTabAtiva] = useState<'produtos' | 'posts' | 'torneios' | 'avaliacoes'>('produtos')
    const [isOwnProfile] = useState(true)

    const usuario = {
        name: 'Carlos Silva',
        username: '@carlos_silva',
        bio: 'Atleta amador de MTB.\nTrek | Scott | Specialized.\nCompetindo pelo Brasil.\n\nInstagram: @carlosmtb\nYouTube: @carlosmtb',
        avatar: null,
        city: 'Sao Paulo',
        state: 'SP',
        reputation: 4.8,
        memberSince: '2024',
        produtos: 5,
        posts: 12,
        seguidores: 234,
        seguindo: 156,
    }

    const produtos = [
        { id: 1, imagem: '/header/mtb.jpg', titulo: 'Trek Marlin 7', preco: 'R$ 4.500' },
        { id: 2, imagem: '/header/speed.jpg', titulo: 'Specialized', preco: 'R$ 8.900' },
        { id: 3, imagem: '/header/bmx.jpg', titulo: 'BMX Pro', preco: 'R$ 2.300' },
    ]

    const posts = [
        { id: 1, imagem: '/header/downhill1.jpg' },
        { id: 2, imagem: '/header/downhill2.jpg' },
        { id: 3, imagem: '/header/mtb2.jpg' },
        { id: 4, imagem: '/header/speed1.jpg' },
        { id: 5, imagem: '/header/speed2.jpg' },
        { id: 6, imagem: '/header/bmx2.jpg' },
    ]

    const torneios = [
        {
            id: 1, nome: 'Campeonato Paulista de MTB 2024',
            status: 'concluido', posicao: '1 lugar', data: '15/03/2024', podium: true
        },
        {
            id: 2, nome: 'Copa Brasil de Downhill',
            status: 'concluido', posicao: '3 lugar', data: '02/06/2024', podium: true
        },
        {
            id: 3, nome: 'Festival Imperium de Ciclismo',
            status: 'concluido', posicao: '5 lugar', data: '20/08/2024', podium: false
        },
        {
            id: 4, nome: 'Desafio Serra da Canastra 2025',
            status: 'inscrito', posicao: null, data: '10/07/2025', podium: false
        },
    ]

    const avaliacoes = [
        { id: 1, nome: 'Maria Silva', nota: 5, comentario: 'Vendedor excelente! Bike em perfeito estado.', data: '12/01/2024' },
        { id: 2, nome: 'Pedro Costa', nota: 5, comentario: 'Entrega rapida e produto como descrito.', data: '03/02/2024' },
        { id: 3, nome: 'Ana Santos', nota: 4, comentario: 'Boa comunicacao, bike bem conservada.', data: '18/03/2024' },
    ]

    const nomeInicial = usuario.name.charAt(0).toUpperCase()

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '50px' }}>

            {/* Header */}
            <div style={{
                backgroundColor: '#fff', borderBottom: '1px solid #e5e5e5',
                padding: '10px 12px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', position: 'sticky', top: 0, zIndex: 40
            }}>
                <button style={headerBtn}><ArrowLeft size={20} color="#1a1a1a" /></button>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a' }}>{usuario.username}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <button style={headerBtn}><Share2 size={18} color="#1a1a1a" /></button>
                    {isOwnProfile && <button style={headerBtn}><Settings size={18} color="#1a1a1a" /></button>}
                </div>
            </div>

            {/* Info Perfil */}
            <div style={{ backgroundColor: '#fff', padding: '20px 16px 16px', borderBottom: '1px solid #e5e5e5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '14px' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #DC2626, #991b1b)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '32px', fontWeight: 'bold', color: '#fff', flexShrink: 0, position: 'relative'
                    }}>
                        {nomeInicial}
                        {isOwnProfile && (
                            <div style={{
                                position: 'absolute', bottom: '-2px', right: '-2px',
                                width: '26px', height: '26px', borderRadius: '50%',
                                backgroundColor: '#DC2626', border: '3px solid #fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                            }}><Camera size={13} color="#fff" /></div>
                        )}
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
                    <Tag icon={<Star size={12} />} text={usuario.reputation.toString()} destaque />
                    <Tag icon={<Calendar size={12} />} text={`Desde ${usuario.memberSince}`} />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    {isOwnProfile ? (
                        <button style={editBtnStyle}>Editar perfil</button>
                    ) : (
                        <button style={followBtnStyle}>Seguir</button>
                    )}
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
                    { key: 'avaliacoes' as const, icon: Award, label: 'Avaliacoes' },
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

            {/* Conteudo */}
            <div style={{ padding: '12px 16px' }}>
                {tabAtiva === 'produtos' && (
                    <Grid2 dados={produtos} tipo="produto" />
                )}
                {tabAtiva === 'posts' && (
                    <Grid3 dados={posts} tipo="post" />
                )}
                {tabAtiva === 'torneios' && (
                    <ListaTorneios torneios={torneios} />
                )}
                {tabAtiva === 'avaliacoes' && (
                    <ListaAvaliacoes avaliacoes={avaliacoes} />
                )}
            </div>
        </div>
    )
}

/* Componentes */
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
            fontSize: '11px', color: destaque ? '#DC2626' : '#888', fontWeight: destaque ? '600' : '400'
        }}>
            {icon}<span>{text}</span>
        </div>
    )
}

function Grid2({ dados, tipo }: { dados: any[]; tipo: string }) {
    if (dados.length === 0) return <Empty icon={<Bike size={36} />} title="Nenhum produto" desc="Produtos anunciados aparecem aqui" />
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {dados.map((item) => (
                <div key={item.id} style={{ backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e5e5e5' }}>
                    <div style={{ height: '140px', backgroundImage: `url(${item.imagem})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    <div style={{ padding: '10px' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>{item.titulo}</h3>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#DC2626', marginTop: '2px' }}>{item.preco}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

function Grid3({ dados, tipo }: { dados: any[]; tipo: string }) {
    if (dados.length === 0) return <Empty icon={<Grid3X3 size={36} />} title="Nenhum post" desc="Fotos postadas aparecem aqui" />
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
            {dados.map((item) => (
                <div key={item.id} style={{
                    aspectRatio: '1', backgroundImage: `url(${item.imagem})`,
                    backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '4px', cursor: 'pointer'
                }} />
            ))}
        </div>
    )
}

function ListaTorneios({ torneios }: { torneios: any[] }) {
    if (torneios.length === 0) return <Empty icon={<Trophy size={36} />} title="Nenhum torneio" desc="Torneios disputados aparecem aqui" />
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {torneios.map((t) => (
                <div key={t.id} style={{
                    backgroundColor: '#fff', borderRadius: '10px', padding: '14px',
                    border: '1px solid #e5e5e5', borderLeft: t.podium ? '3px solid #DC2626' : '3px solid #e5e5e5'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', marginBottom: '4px' }}>{t.nome}</h3>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', color: '#888' }}>
                <Clock size={11} /> {t.data}
              </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            {t.status === 'inscrito' ? (
                                <span style={{ fontSize: '11px', fontWeight: '600', color: '#DC2626', backgroundColor: '#FEE2E2', padding: '3px 8px', borderRadius: '4px' }}>
                  INSCRITO
                </span>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {t.podium && <Medal size={14} color="#FFB800" />}
                                    <span style={{ fontSize: '13px', fontWeight: '700', color: t.podium ? '#1a1a1a' : '#888' }}>{t.posicao}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

function ListaAvaliacoes({ avaliacoes }: { avaliacoes: any[] }) {
    if (avaliacoes.length === 0) return <Empty icon={<Award size={36} />} title="Nenhuma avaliacao" desc="Avaliacoes recebidas aparecem aqui" />
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {avaliacoes.map((a) => (
                <div key={a.id} style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '14px', border: '1px solid #e5e5e5' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>{a.nome}</span>
                        <div style={{ display: 'flex', gap: '1px' }}>
                            {[1,2,3,4,5].map((n) => (
                                <Star key={n} size={11} color="#FFB800" fill={n <= a.nota ? '#FFB800' : 'none'} />
                            ))}
                        </div>
                    </div>
                    <p style={{ fontSize: '12px', color: '#666', lineHeight: '1.4' }}>{a.comentario}</p>
                    <p style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>{a.data}</p>
                </div>
            ))}
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

const followBtnStyle: React.CSSProperties = {
    flex: 1, padding: '10px', backgroundColor: '#DC2626', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
}

const msgBtnStyle: React.CSSProperties = {
    padding: '10px 14px', backgroundColor: '#fff', border: '1px solid #e5e5e5',
    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#1a1a1a'
}