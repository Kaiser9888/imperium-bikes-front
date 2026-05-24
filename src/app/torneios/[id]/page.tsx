'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import {
    ArrowLeft, MapPin, Calendar, Users, Clock,
    Trophy, Medal, Share2, Check, User, Star,
    ChevronRight
} from 'lucide-react'
import Link from 'next/link'

interface Participante {
    id: number
    usuario: {
        id: number
        nome: string
        avatar: string | null
        reputation: number
    }
    dataInscricao: string
    posicao?: number
    pontuacao?: number
}

interface TorneioDetalhe {
    id: number
    titulo: string
    descricao: string
    modalidade: string
    data: string
    horario: string
    local: string
    participantes: number
    maxParticipantes: number
    status: 'inscricoes' | 'andamento' | 'finalizado'
    premio?: string
    regras?: string
    banner?: string
    organizador: {
        id: number
        nome: string
        avatar: string | null
    }
    listaParticipantes: Participante[]
}

export default function TorneioDetalhePage() {
    const params = useParams()
    const id = params.id

    const [torneio, setTorneio] = useState<TorneioDetalhe | null>(null)
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState('')
    const [inscrito, setInscrito] = useState(false)
    const [tabAtiva, setTabAtiva] = useState<'info' | 'participantes'>('info')

    useEffect(() => {
        async function carregar() {
            setLoading(true)
            try {
                // const response = await tournamentService.buscarPorId(Number(id))
                // setTorneio(response.data)
                setTorneio(null)
            } catch (error) {
                console.error('Erro ao carregar torneio:', error)
                setErro('Erro ao carregar torneio.')
            } finally {
                setLoading(false)
            }
        }
        if (id) carregar()
    }, [id])

    const handleInscricao = async () => {
        if (inscrito) return
        try {
            // await tournamentService.inscrever(Number(id))
            setInscrito(true)
        } catch (error) {
            console.error('Erro ao inscrever:', error)
        }
    }

    const formatarData = (data: string) => {
        return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    }

    const getInicial = (nome: string) => nome.charAt(0).toUpperCase()

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'inscricoes': return { bg: '#dcfce7', color: '#16A34A', text: 'Inscricoes abertas' }
            case 'andamento': return { bg: '#dbeafe', color: '#3B82F6', text: 'Em andamento' }
            case 'finalizado': return { bg: '#f3f4f6', color: '#6B7280', text: 'Finalizado' }
            default: return { bg: '#f3f4f6', color: '#888', text: status }
        }
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}>
                <Header />
                <div style={{ padding: '16px' }}>
                    <div style={{ height: '200px', backgroundColor: '#eee', borderRadius: '12px', marginBottom: '16px' }} />
                    <div style={{ height: '20px', backgroundColor: '#eee', borderRadius: '6px', width: '60%', marginBottom: '8px' }} />
                    <div style={{ height: '20px', backgroundColor: '#eee', borderRadius: '6px', width: '40%' }} />
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
                    <button onClick={() => window.location.reload()} style={{
                        padding: '10px 24px', backgroundColor: '#DC2626', color: '#fff',
                        border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
                    }}>Tentar novamente</button>
                </div>
                <BottomNav />
            </div>
        )
    }

    if (!torneio) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}>
                <Header />
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <Trophy size={40} color="#ccc" />
                    <p style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a', marginTop: '12px' }}>Torneio nao encontrado</p>
                    <Link href="/torneios" style={{ display: 'inline-block', marginTop: '16px', padding: '10px 24px', backgroundColor: '#DC2626', color: '#fff', borderRadius: '8px', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>Ver torneios</Link>
                </div>
                <BottomNav />
            </div>
        )
    }

    const statusInfo = getStatusInfo(torneio.status)
    const vagasRestantes = torneio.maxParticipantes - torneio.participantes

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '80px' }}>
            <Header />

            {/* Banner */}
            <div style={{
                height: '200px', backgroundColor: torneio.banner ? undefined : '#1a1a1a',
                backgroundImage: torneio.banner ? `url(${torneio.banner})` : undefined,
                backgroundSize: 'cover', backgroundPosition: 'center',
                position: 'relative'
            }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)'
                }} />

                {/* Header actions */}
                <div style={{ position: 'absolute', top: '10px', left: '12px', right: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <Link href="/torneios" style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center'
                    }}>
                        <ArrowLeft size={18} color="#fff" />
                    </Link>
                    <button style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        backgroundColor: 'rgba(0,0,0,0.5)', border: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer'
                    }}>
                        <Share2 size={16} color="#fff" />
                    </button>
                </div>

                {/* Status no banner */}
                <div style={{ position: 'absolute', bottom: '14px', left: '16px' }}>
                    <span style={{
                        fontSize: '11px', fontWeight: '600', padding: '5px 10px', borderRadius: '6px',
                        backgroundColor: statusInfo.bg, color: statusInfo.color
                    }}>
                        {statusInfo.text}
                    </span>
                </div>
            </div>

            {/* Info principal */}
            <div style={{ backgroundColor: '#fff', padding: '16px', marginBottom: '4px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a', marginBottom: '12px', lineHeight: '1.3' }}>
                    {torneio.titulo}
                </h1>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                    <InfoRow icon={<Calendar size={15} />} text={formatarData(torneio.data)} sub={torneio.horario} />
                    <InfoRow icon={<MapPin size={15} />} text={torneio.local} />
                    <InfoRow icon={<Users size={15} />} text={`${torneio.participantes} de ${torneio.maxParticipantes} participantes`} sub={vagasRestantes > 0 ? `${vagasRestantes} vagas restantes` : 'Esgotado'} />
                    {torneio.premio && <InfoRow icon={<Trophy size={15} />} text={`Premiacao: ${torneio.premio}`} destaque />}
                </div>

                {/* Organizador */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '12px', borderTop: '1px solid #f0f0f0' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        backgroundColor: '#DC2626', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '15px', fontWeight: 'bold'
                    }}>
                        {getInicial(torneio.organizador.nome)}
                    </div>
                    <div>
                        <p style={{ fontSize: '12px', color: '#888' }}>Organizado por</p>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>{torneio.organizador.nome}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', backgroundColor: '#fff', marginBottom: '4px', borderBottom: '1px solid #e5e5e5' }}>
                {[
                    { key: 'info' as const, label: 'Informacoes' },
                    { key: 'participantes' as const, label: `Participantes (${torneio.listaParticipantes.length})` },
                ].map(tab => (
                    <button key={tab.key} onClick={() => setTabAtiva(tab.key)} style={{
                        flex: 1, padding: '12px', background: 'none', border: 'none',
                        borderBottom: tabAtiva === tab.key ? '2px solid #DC2626' : '2px solid transparent',
                        color: tabAtiva === tab.key ? '#DC2626' : '#888',
                        fontSize: '13px', fontWeight: tabAtiva === tab.key ? '600' : '400',
                        cursor: 'pointer', transition: 'all 0.15s'
                    }}>{tab.label}</button>
                ))}
            </div>

            {/* Conteudo da tab */}
            <div style={{ padding: '16px' }}>
                {tabAtiva === 'info' && (
                    <>
                        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e5e5e5', marginBottom: '12px' }}>
                            <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a', marginBottom: '10px' }}>Descricao</h2>
                            <p style={{ fontSize: '14px', color: '#444', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                                {torneio.descricao || 'Sem descricao.'}
                            </p>
                        </div>

                        {torneio.regras && (
                            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e5e5e5' }}>
                                <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a1a', marginBottom: '10px' }}>Regras</h2>
                                <p style={{ fontSize: '14px', color: '#444', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                                    {torneio.regras}
                                </p>
                            </div>
                        )}
                    </>
                )}

                {tabAtiva === 'participantes' && (
                    <div>
                        {torneio.listaParticipantes.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e5e5' }}>
                                <Users size={32} color="#ccc" />
                                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', marginTop: '10px' }}>Nenhum participante ainda</p>
                                <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>Seja o primeiro a se inscrever!</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {torneio.listaParticipantes
                                    .sort((a, b) => (a.posicao || 999) - (b.posicao || 999))
                                    .map((participante, index) => (
                                        <div key={participante.id} style={{
                                            backgroundColor: '#fff', borderRadius: '10px', padding: '12px',
                                            border: '1px solid #e5e5e5', display: 'flex', alignItems: 'center',
                                            gap: '10px'
                                        }}>
                                            {/* Posicao/Podio */}
                                            {torneio.status === 'finalizado' && participante.posicao && participante.posicao <= 3 ? (
                                                <div style={{
                                                    width: '28px', height: '28px', borderRadius: '50%',
                                                    backgroundColor: participante.posicao === 1 ? '#FFB800' : participante.posicao === 2 ? '#9CA3AF' : '#CD853F',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '13px', fontWeight: '700', color: '#fff', flexShrink: 0
                                                }}>
                                                    {participante.posicao}
                                                </div>
                                            ) : (
                                                <span style={{ width: '28px', textAlign: 'center', fontSize: '13px', color: '#aaa', flexShrink: 0 }}>
                                                    {index + 1}
                                                </span>
                                            )}

                                            {/* Avatar */}
                                            <div style={{
                                                width: '36px', height: '36px', borderRadius: '50%',
                                                backgroundColor: '#DC2626', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center',
                                                color: '#fff', fontSize: '14px', fontWeight: 'bold', flexShrink: 0
                                            }}>
                                                {getInicial(participante.usuario.nome)}
                                            </div>

                                            {/* Info */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>{participante.usuario.nome}</p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '1px' }}>
                                                    <Star size={10} color="#FFB800" fill="#FFB800" />
                                                    <span style={{ fontSize: '11px', color: '#888' }}>{participante.usuario.reputation}</span>
                                                </div>
                                            </div>

                                            {/* Pontuacao */}
                                            {participante.pontuacao && (
                                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#DC2626' }}>
                                                    {participante.pontuacao} pts
                                                </span>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Botao de inscricao (fixo) */}
            {torneio.status === 'inscricoes' && (
                <div style={{
                    position: 'fixed', bottom: '60px', left: 0, right: 0,
                    backgroundColor: '#fff', borderTop: '1px solid #e5e5e5',
                    padding: '12px 16px', zIndex: 30
                }}>
                    <button
                        onClick={handleInscricao}
                        disabled={inscrito}
                        style={{
                            width: '100%', padding: '14px',
                            backgroundColor: inscrito ? '#16A34A' : '#DC2626',
                            color: '#fff', border: 'none', borderRadius: '10px',
                            fontSize: '16px', fontWeight: 'bold', cursor: inscrito ? 'default' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                    >
                        {inscrito ? (
                            <><Check size={20} /> Inscrito</>
                        ) : (
                            <>Inscrever-se</>
                        )}
                    </button>
                </div>
            )}

            <BottomNav />
        </div>
    )
}

function InfoRow({ icon, text, sub, destaque = false }: {
    icon: React.ReactNode
    text: string
    sub?: string
    destaque?: boolean
}) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: destaque ? '#FFB800' : '#888' }}>{icon}</span>
            <div>
                <span style={{ fontSize: '13px', color: destaque ? '#FFB800' : '#444', fontWeight: destaque ? '600' : '400' }}>
                    {text}
                </span>
                {sub && (
                    <span style={{ fontSize: '12px', color: '#aaa', marginLeft: '6px' }}>{sub}</span>
                )}
            </div>
        </div>
    )
}