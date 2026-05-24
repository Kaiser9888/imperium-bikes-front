'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { authService } from '@/services/authService'
import Link from 'next/link'

export function LoginForm() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#fff' }}>Carregando...</p>
            </div>
        }>
            <LoginFormContent />
        </Suspense>
    )
}

function LoginFormContent() {
    const searchParams = useSearchParams()
    const redirect = searchParams.get('redirect')

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [mostrarSenha, setMostrarSenha] = useState(false)
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErro('')

        if (!email || !password) {
            setErro('Preencha todos os campos')
            return
        }

        setLoading(true)

        try {
            await authService.login({ email, password })

            const token = authService.getToken()
            if (token) {
                document.cookie = `@imperium:token=${token}; path=/; max-age=86400; SameSite=Lax`
            }

            window.location.href = redirect || '/'
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'response' in error) {
                const err = error as { response?: { status?: number } }
                if (err.response?.status === 401) {
                    setErro('Email ou senha incorretos')
                } else if (err.response?.status === 403) {
                    setErro('Conta nao verificada')
                } else {
                    setErro('Erro ao conectar. Tente novamente')
                }
            } else {
                setErro('Erro ao conectar. Tente novamente')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            backgroundColor: '#000'
        }}>
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: 'url(/header/logindownhill.jpg)',
                backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.3)'
            }} />
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.9))'
            }} />

            <div style={{
                position: 'relative', zIndex: 1, flex: 1,
                display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px'
            }}>
                <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#DC2626', letterSpacing: '4px' }}>
                            IMPERIUM
                        </span>
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginTop: '8px' }}>
                            Bem-vindo ao Mundo da Bike!
                        </p>
                    </div>

                    {erro && (
                        <div style={{
                            backgroundColor: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)',
                            borderRadius: '10px', padding: '12px 16px', marginBottom: '16px',
                            color: '#EF4444', fontSize: '14px', textAlign: 'center'
                        }}>
                            {erro}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: '6px' }}>Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} color="#999" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com"
                                       style={{
                                           width: '100%', padding: '14px 14px 14px 42px', backgroundColor: 'rgba(255,255,255,0.08)',
                                           border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', fontSize: '15px',
                                           color: '#fff', outline: 'none'
                                       }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: '6px' }}>Senha</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} color="#999" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                                <input type={mostrarSenha ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha"
                                       style={{
                                           width: '100%', padding: '14px 44px 14px 42px', backgroundColor: 'rgba(255,255,255,0.08)',
                                           border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', fontSize: '15px',
                                           color: '#fff', outline: 'none'
                                       }}
                                />
                                <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)}
                                        style={{ position: 'absolute', right: '14px', top: '14px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                    {mostrarSenha ? <EyeOff size={18} color="#999" /> : <Eye size={18} color="#999" />}
                                </button>
                            </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <Link href="/recuperar-senha" style={{ fontSize: '13px', color: '#EF4444', textDecoration: 'none', fontWeight: '500' }}>
                                Esqueceu a senha?
                            </Link>
                        </div>

                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '15px', backgroundColor: loading ? '#991b1b' : '#DC2626',
                            color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px',
                            fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px'
                        }}>
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>ou</span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                    </div>

                    <p style={{ textAlign: 'center', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                        Nao tem uma conta?{' '}
                        <Link href="/cadastro" style={{ color: '#EF4444', fontWeight: '600', textDecoration: 'none' }}>
                            Cadastre-se
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}