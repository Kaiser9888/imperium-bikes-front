'use client'

import { useState } from 'react'
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export function ForgotPasswordForm() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState('')
    const [enviado, setEnviado] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErro('')

        if (!email) {
            setErro('Informe seu email')
            return
        }

        if (!email.includes('@')) {
            setErro('Email inválido')
            return
        }

        setLoading(true)

        try {
            // Chamar API de recuperação (quando backend estiver pronto)
            // await authService.forgotPassword(email)

            // Simular envio por enquanto
            await new Promise(resolve => setTimeout(resolve, 1500))
            setEnviado(true)
        } catch (error: unknown) {
            setErro('Erro ao enviar. Tente novamente')
        } finally {
            setLoading(false)
        }
    }

    if (enviado) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                backgroundColor: '#000'
            }}>
                {/* Fundo */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: 'url(/auth-bg.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'brightness(0.3)'
                }} />
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.9))'
                }} />

                {/* Conteúdo */}
                <div style={{
                    position: 'relative',
                    zIndex: 1,
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px'
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '400px',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(22,163,74,0.2)',
                            border: '3px solid #16A34A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px'
                        }}>
                            <CheckCircle size={40} color="#16A34A" />
                        </div>

                        <h2 style={{
                            fontSize: '22px',
                            fontWeight: 'bold',
                            color: '#fff',
                            marginBottom: '12px'
                        }}>
                            Email enviado!
                        </h2>

                        <p style={{
                            fontSize: '14px',
                            color: 'rgba(255,255,255,0.7)',
                            marginBottom: '8px',
                            lineHeight: '1.5'
                        }}>
                            Enviamos um link de recuperação para
                        </p>
                        <p style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#CFB53B',
                            marginBottom: '24px'
                        }}>
                            {email}
                        </p>
                        <p style={{
                            fontSize: '13px',
                            color: 'rgba(255,255,255,0.5)',
                            marginBottom: '32px',
                            lineHeight: '1.5'
                        }}>
                            Verifique sua caixa de entrada e spam.
                            O link expira em 30 minutos.
                        </p>

                        <Link
                            href="/login"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '14px 32px',
                                backgroundColor: '#6C3082',
                                color: '#fff',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                fontSize: '15px',
                                fontWeight: 'bold'
                            }}
                        >
                            <ArrowLeft size={18} />
                            Voltar para o login
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            backgroundColor: '#000'
        }}>
            {/* Fundo */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: 'url(/header/logindownhill.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'brightness(0.3)'
            }} />
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.9))'
            }} />

            {/* Conteúdo */}
            <div style={{
                position: 'relative',
                zIndex: 1,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '24px'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '400px',
                    margin: '0 auto'
                }}>
                    {/* Logo */}
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#DC2626',
                letterSpacing: '4px'
            }}>
              IMPERIUM
            </span>
                        <p style={{
                            fontSize: '14px',
                            color: 'rgba(255,255,255,0.6)',
                            marginTop: '8px'
                        }}>
                            Recuperar senha
                        </p>
                    </div>

                    {/* Erro */}
                    {erro && (
                        <div style={{
                            backgroundColor: 'rgba(220,38,38,0.15)',
                            border: '1px solid rgba(220,38,38,0.3)',
                            borderRadius: '10px',
                            padding: '12px 16px',
                            marginBottom: '16px',
                            color: '#EF4444',
                            fontSize: '14px',
                            textAlign: 'center'
                        }}>
                            {erro}
                        </div>
                    )}

                    {/* Descrição */}
                    <p style={{
                        fontSize: '14px',
                        color: 'rgba(255,255,255,0.6)',
                        textAlign: 'center',
                        marginBottom: '24px',
                        lineHeight: '1.5'
                    }}>
                        Informe seu email cadastrado e enviaremos
                        um link para redefinir sua senha.
                    </p>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: 'rgba(255,255,255,0.8)',
                                marginBottom: '6px'
                            }}>
                                Email
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail
                                    size={18}
                                    color="#999"
                                    style={{ position: 'absolute', left: '14px', top: '14px' }}
                                />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    style={{
                                        width: '100%',
                                        padding: '14px 14px 14px 42px',
                                        backgroundColor: 'rgba(255,255,255,0.08)',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        borderRadius: '12px',
                                        fontSize: '15px',
                                        color: '#fff',
                                        outline: 'none',
                                        transition: 'border 0.2s'
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = '#6C3082')}
                                    onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '15px',
                                backgroundColor: loading ? '#991b1b' : '#DC2626',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                marginTop: '8px'
                            }}
                        >
                            {loading ? (
                                'Enviando...'
                            ) : (
                                <>
                                    <Send size={18} />
                                    Enviar link
                                </>
                            )}
                        </button>
                    </form>

                    {/* Voltar */}
                    <div style={{ textAlign: 'center', marginTop: '24px' }}>
                        <Link
                            href="/login"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                color: 'rgba(255,255,255,0.6)',
                                fontSize: '14px',
                                textDecoration: 'none'
                            }}
                        >
                            <ArrowLeft size={16} />
                            Voltar para o login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}