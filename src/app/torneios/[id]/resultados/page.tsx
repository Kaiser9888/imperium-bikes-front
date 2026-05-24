'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import {
    ArrowLeft, Trophy, Medal, User, Clock,
    Star, Download, Share2
} from 'lucide-react'
import Link from 'next/link'

interface Resultado {
    posicao: number
    participante: {
        id: number
        usuario: {
            id: number
            nome: string
            avatar: string | null
            reputation: number
        }
    }
    tempo?: string
    pontuacao: number
}

interface TorneioResultado {
    torneio: {
        id: number
        titulo: string
        modalidade: string
        data: string
        local: string
        status: string
    }
    resultados: Resultado[]
    totalParticipantes: number
}

export default function ResultadosTorneioPage() {
    const params = useParams()
    const id = params.id

    const [dados, setDados] = useState<TorneioResultado | null>(null)
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState('')


    useEffect(() => {
        async function carregar() {
            setLoading(true)
            try {
                // const response = await api.get(`/api/tournaments/${id}/results`)
                // setDados(response.data)
                setDados(null)
            } catch (error) {
                console.error('Erro ao carregar resultados:', error)
                setErro('Erro ao carregar resultados.')
            } finally {
                setLoading(false)
            }
        }
        if (id) carregar()
    }, [id])

    const formatarData = (data: string) => {
        return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    }

    const getInicial = (nome: string) => nome.charAt(0).toUpperCase()

    const getMedalha = (posicao: number) => {
        switch (posicao) {
            case 1: return { cor: '#FFB800', bg: '#FFF8E1', texto: '1' }
            case 2: return { cor: '#9CA3AF', bg: '#F3F4F6', texto: '2' }
            case 3: return { cor: '#CD853F', bg: '#FFF3E0', texto: '3' }
            default: return { cor: '#888', bg: '#fff', texto: `${posicao}` }
        }
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}>
                <Header />
                <div style={{ padding: '16px' }}>
                    <div style={{ height: '120px', backgroundColor: '#eee', borderRadius: '12px', marginBottom: '16px' }} />
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} style={{ height: '60px', backgroundColor: '#eee', borderRadius: '10px', marginBottom: '6px' }} />
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
                    <button onClick={() => window.location.reload()} style={{
                        padding: '10px 24px', backgroundColor: '#DC2626', color: '#fff',
                        border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
                    }}>Tentar novamente</button>
                </div>
                <BottomNav />
            </div>
        )
    }

    if (!dados) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}>
                <Header />
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <Trophy size={40} color="#ccc" />
                    <p style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a', marginTop: '12px' }}>
                        Resultados nao disponiveis
                    </p>
                    <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
                        {dados && dados.torneio && dados.torneio.status === 'inscricoes' ? 'O torneio ainda nao comecou' : 'Os resultados ainda nao foram publicados'}
                    </p>
                    <Link href={`/torneios/${id}`} style={{
                        display: 'inline-block', marginTop: '16px', padding: '10px 24px',
                        backgroundColor: '#DC2626', color: '#fff', borderRadius: '8px',
                        fontSize: '14px', fontWeight: '600', textDecoration: 'none'
                    }}>Ver torneio</Link>
                </div>
                <BottomNav />
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}>
            <Header />

            {/* Header */}
            <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e5e5', padding: '10px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Link href={`/torneios/${id}`} style={{ display: 'flex', padding: '4px' }}>
                            <ArrowLeft size={20} color="#1a1a1a" />
                        </Link>
                        <h1 style={{ fontSize: '17px', fontWeight: '700', color: '#1a1a1a' }}>Resultados</h1>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button style={iconBtn}><Download size={17} color="#666" /></button>
                        <button style={iconBtn}><Share2 size={17} color="#666" /></button>
                    </div>
                </div>
            </div>

            {/* Info do torneio */}
            <div style={{ backgroundColor: '#fff', padding: '14px 16px', marginBottom: '4px', borderBottom: '1px solid #e5e5e5' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a', marginBottom: '4px' }}>
                    {dados.torneio.titulo}
                </h2>
                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#888' }}>
                    <span>{dados.torneio.modalidade}</span>
                    <span>•</span>
                    <span>{formatarData(dados.torneio.data)}</span>
                    <span>•</span>
                    <span>{dados.torneio.local}</span>
                </div>
                <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                    {dados.totalParticipantes} participantes
                </p>
            </div>

            {/* Podio - Top 3 */}
            {dados.resultados.length >= 3 && (
                <div style={{ padding: '16px' }}>
                    <div style={{
                        display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
                        gap: '6px', marginBottom: '20px'
                    }}>
                        {/* 2 lugar */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '50px', height: '50px', borderRadius: '50%',
                                backgroundColor: '#9CA3AF', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 6px', fontSize: '20px', fontWeight: 'bold', color: '#fff'
                            }}>2</div>
                            <div style={{
                                width: '70px', height: '80px', backgroundColor: '#F3F4F6',
                                borderRadius: '10px 10px 0 0', display: 'flex',
                                flexDirection: 'column', alignItems: 'center',
                                justifyContent: 'center', padding: '8px'
                            }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    backgroundColor: '#DC2626', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px'
                                }}>
                                    {getInicial(dados.resultados[1].participante.usuario.nome)}
                                </div>
                                <p style={{ fontSize: '10px', fontWeight: '600', color: '#1a1a1a', lineHeight: '1.2', textAlign: 'center' }}>
                                    {dados.resultados[1].participante.usuario.nome.split(' ')[0]}
                                </p>
                            </div>
                        </div>

                        {/* 1 lugar */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '60px', height: '60px', borderRadius: '50%',
                                backgroundColor: '#FFB800', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 6px', fontSize: '26px', fontWeight: 'bold', color: '#fff',
                                boxShadow: '0 4px 15px rgba(255,184,0,0.4)'
                            }}>
                                🏆
                            </div>
                            <div style={{
                                width: '80px', height: '100px', backgroundColor: '#FFF8E1',
                                borderRadius: '10px 10px 0 0', display: 'flex',
                                flexDirection: 'column', alignItems: 'center',
                                justifyContent: 'center', padding: '8px',
                                border: '2px solid #FFB800', borderBottom: 'none'
                            }}>
                                <div style={{
                                    width: '38px', height: '38px', borderRadius: '50%',
                                    backgroundColor: '#DC2626', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', fontSize: '15px', fontWeight: 'bold', marginBottom: '4px'
                                }}>
                                    {getInicial(dados.resultados[0].participante.usuario.nome)}
                                </div>
                                <p style={{ fontSize: '11px', fontWeight: '700', color: '#1a1a1a', lineHeight: '1.2', textAlign: 'center' }}>
                                    {dados.resultados[0].participante.usuario.nome.split(' ')[0]}
                                </p>
                                <p style={{ fontSize: '10px', color: '#FFB800', fontWeight: '600', marginTop: '2px' }}>
                                    {dados.resultados[0].pontuacao} pts
                                </p>
                            </div>
                        </div>

                        {/* 3 lugar */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '50px', height: '50px', borderRadius: '50%',
                                backgroundColor: '#CD853F', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 6px', fontSize: '20px', fontWeight: 'bold', color: '#fff'
                            }}>3</div>
                            <div style={{
                                width: '70px', height: '65px', backgroundColor: '#FFF3E0',
                                borderRadius: '10px 10px 0 0', display: 'flex',
                                flexDirection: 'column', alignItems: 'center',
                                justifyContent: 'center', padding: '8px'
                            }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    backgroundColor: '#DC2626', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px'
                                }}>
                                    {getInicial(dados.resultados[2].participante.usuario.nome)}
                                </div>
                                <p style={{ fontSize: '10px', fontWeight: '600', color: '#1a1a1a', lineHeight: '1.2', textAlign: 'center' }}>
                                    {dados.resultados[2].participante.usuario.nome.split(' ')[0]}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabela completa */}
            <div style={{ padding: '0 16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a', marginBottom: '10px' }}>
                    Classificacao completa
                </h3>

                <div style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e5e5' }}>
                    {/* Cabecalho */}
                    <div style={{
                        display: 'flex', padding: '10px 14px', backgroundColor: '#fafafa',
                        borderBottom: '1px solid #e5e5e5', fontSize: '11px',
                        fontWeight: '700', color: '#888', textTransform: 'uppercase'
                    }}>
                        <span style={{ width: '30px' }}>Pos</span>
                        <span style={{ flex: 1 }}>Participante</span>
                        <span style={{ width: '60px', textAlign: 'center' }}>Tempo</span>
                        <span style={{ width: '50px', textAlign: 'right' }}>Pts</span>
                    </div>

                    {/* Linhas */}
                    {dados.resultados.map((resultado) => {
                        const medalha = getMedalha(resultado.posicao)
                        return (
                            <div key={resultado.posicao} style={{
                                display: 'flex', alignItems: 'center', padding: '10px 14px',
                                borderBottom: '1px solid #f5f5f5',
                                backgroundColor: resultado.posicao <= 3 ? medalha.bg : '#fff'
                            }}>
                                <span style={{
                                    width: '30px', fontSize: '13px', fontWeight: '700',
                                    color: medalha.cor
                                }}>
                                    {resultado.posicao}º
                                </span>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        width: '30px', height: '30px', borderRadius: '50%',
                                        backgroundColor: '#DC2626', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontSize: '12px', fontWeight: 'bold', flexShrink: 0
                                    }}>
                                        {getInicial(resultado.participante.usuario.nome)}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>
                                            {resultado.participante.usuario.nome}
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                            <Star size={10} color="#FFB800" fill="#FFB800" />
                                            <span style={{ fontSize: '11px', color: '#888' }}>
                                                {resultado.participante.usuario.reputation}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <span style={{ width: '60px', textAlign: 'center', fontSize: '12px', color: '#888' }}>
                                    {resultado.tempo || '--:--'}
                                </span>
                                <span style={{ width: '50px', textAlign: 'right', fontSize: '13px', fontWeight: '700', color: '#DC2626' }}>
                                    {resultado.pontuacao}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            <BottomNav />
        </div>
    )
}

const iconBtn: React.CSSProperties = {
    background: 'none', border: 'none', padding: '6px', cursor: 'pointer', display: 'flex'
}