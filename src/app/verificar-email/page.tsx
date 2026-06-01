'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Loader, Mail, ArrowRight } from 'lucide-react'
import api from '@/lib/api'

function VerificarEmailContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get('token')

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [mensagem, setMensagem] = useState('Verificando seu email...')

    useEffect(() => {
        if (!token) {
            setStatus('error')
            setMensagem('Token de verificação não encontrado')
            return
        }

        const verificarEmail = async () => {
            try {
                await api.post('/auth/verify-email', { token })
                setStatus('success')
                setMensagem('Email verificado com sucesso!')
            } catch (error: any) {
                setStatus('error')
                if (error?.response?.status === 400) {
                    setMensagem('Token inválido ou já utilizado')
                } else {
                    setMensagem('Erro ao verificar email. Tente novamente.')
                }
            }
        }

        verificarEmail()
    }, [token])

    return (
        <div className="verify-screen">
            <div className="verify-bg" />
            <div className="verify-overlay" />

            <div className="verify-container">
                <div className="verify-card">
                    {/* Ícone */}
                    <div className={`verify-icon ${status === 'loading' ? 'loading' : status}`}>
                        {status === 'loading' && <Loader size={48} className="spinner" />}
                        {status === 'success' && <CheckCircle size={48} />}
                        {status === 'error' && <XCircle size={48} />}
                    </div>

                    {/* Título */}
                    <h2 className="verify-title">
                        {status === 'loading' && 'Verificando...'}
                        {status === 'success' && 'Tudo pronto!'}
                        {status === 'error' && 'Ops!'}
                    </h2>

                    {/* Mensagem */}
                    <p className="verify-message">{mensagem}</p>

                    {/* Submensagem */}
                    {status === 'success' && (
                        <p className="verify-submessage">
                            Sua conta foi ativada. Agora você pode acessar todas as funcionalidades.
                        </p>
                    )}
                    {status === 'error' && (
                        <p className="verify-submessage">
                            Se o problema persistir, entre em contato com o suporte.
                        </p>
                    )}

                    {/* Botões */}
                    <div className="verify-actions">
                        {status === 'success' && (
                            <button onClick={() => router.push('/login')} className="verify-btn primary">
                                Fazer login <ArrowRight size={18} />
                            </button>
                        )}
                        {status === 'error' && (
                            <>
                                <button onClick={() => router.push('/login')} className="verify-btn primary">
                                    Ir para login
                                </button>
                                <button onClick={() => router.push('/')} className="verify-btn secondary">
                                    Voltar para Home
                                </button>
                            </>
                        )}
                    </div>

                    {/* Logo */}
                    <div className="verify-logo">IMPERIUM</div>
                </div>
            </div>

            <style jsx>{`
                .verify-screen {
                    min-height: 100vh;
                    display: flex;
                    position: relative;
                    background: #000;
                }
                .verify-bg {
                    position: absolute;
                    inset: 0;
                    background-image: url('/header/verificardownhill.jpg');
                    background-size: cover;
                    background-position: center;
                    filter: brightness(0.25);
                }
                .verify-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.9));
                }
                .verify-container {
                    position: relative;
                    z-index: 1;
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                }
                .verify-card {
                    text-align: center;
                    max-width: 420px;
                    width: 100%;
                }
                .verify-icon {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 24px;
                    transition: all 0.5s;
                }
                .verify-icon.loading {
                    background: rgba(220, 38, 38, 0.15);
                    color: #DC2626;
                }
                .verify-icon.success {
                    background: rgba(22, 163, 74, 0.15);
                    color: #16A34A;
                }
                .verify-icon.error {
                    background: rgba(220, 38, 38, 0.15);
                    color: #DC2626;
                }
                .spinner {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .verify-title {
                    font-size: 24px;
                    font-weight: bold;
                    color: #fff;
                    margin-bottom: 12px;
                }
                .verify-message {
                    font-size: 15px;
                    color: rgba(255,255,255,0.8);
                    margin-bottom: 8px;
                }
                .verify-submessage {
                    font-size: 13px;
                    color: rgba(255,255,255,0.5);
                    margin-bottom: 32px;
                }
                .verify-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 40px;
                }
                .verify-btn {
                    width: 100%;
                    padding: 14px;
                    border: none;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.2s;
                }
                .verify-btn.primary {
                    background: #DC2626;
                    color: #fff;
                }
                .verify-btn.primary:hover {
                    background: #b91c1c;
                }
                .verify-btn.secondary {
                    background: rgba(255,255,255,0.1);
                    color: #fff;
                    border: 1px solid rgba(255,255,255,0.2);
                }
                .verify-btn.secondary:hover {
                    background: rgba(255,255,255,0.15);
                }
                .verify-logo {
                    font-size: 20px;
                    font-weight: bold;
                    color: rgba(255,255,255,0.3);
                    letter-spacing: 6px;
                }
            `}</style>
        </div>
    )
}

export default function VerificarEmailPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader size={48} color="#DC2626" className="spinner" />
            </div>
        }>
            <VerificarEmailContent />
        </Suspense>
    )
}