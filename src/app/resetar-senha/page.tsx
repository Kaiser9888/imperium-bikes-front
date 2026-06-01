'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle, Loader } from 'lucide-react'
import api from '@/lib/api'

function ResetarSenhaContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [mostrarSenha, setMostrarSenha] = useState(false)
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState('')
    const [sucesso, setSucesso] = useState(false)

    const validarSenha = (senha: string): string | null => {
        if (senha.length < 8) return 'A senha deve ter no mínimo 8 caracteres'
        if (!/[A-Z]/.test(senha)) return 'A senha deve conter pelo menos 1 letra maiúscula'
        if (!/[a-z]/.test(senha)) return 'A senha deve conter pelo menos 1 letra minúscula'
        if (!/[0-9]/.test(senha)) return 'A senha deve conter pelo menos 1 número'
        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErro('')

        // Validar token
        if (!token) {
            setErro('Link de recuperação inválido ou expirado')
            return
        }

        // Validar senha
        const erroSenha = validarSenha(password)
        if (erroSenha) {
            setErro(erroSenha)
            return
        }

        // Validar confirmação
        if (password !== confirmPassword) {
            setErro('As senhas não conferem')
            return
        }

        setLoading(true)

        try {
            await api.post('/auth/reset-password', {
                token,
                newPassword: password
            })
            setSucesso(true)
        } catch (error: any) {
            if (error?.response?.status === 400) {
                setErro('Link expirado ou inválido. Solicite uma nova recuperação.')
            } else {
                setErro('Erro ao redefinir senha. Tente novamente.')
            }
        } finally {
            setLoading(false)
        }
    }

    // Tela de sucesso
    if (sucesso) {
        return (
            <div className="reset-screen">
                <div className="reset-bg" />
                <div className="reset-container">
                    <div className="reset-card">
                        <div className="reset-icon success">
                            <CheckCircle size={48} />
                        </div>
                        <h2 className="reset-title">Senha alterada!</h2>
                        <p className="reset-message">
                            Sua senha foi redefinida com sucesso.
                        </p>
                        <button onClick={() => router.push('/login')} className="reset-btn">
                            Fazer login <ArrowRight size={18} />
                        </button>
                        <div className="reset-logo">IMPERIUM</div>
                    </div>
                </div>

                <style jsx>{`
                    .reset-screen {
                        min-height: 100vh;
                        display: flex;
                        position: relative;
                        background: #000;
                    }
                    .reset-bg {
                        position: absolute;
                        inset: 0;
                        background-image: url('/header/logindownhill.jpg');
                        background-size: cover;
                        background-position: center;
                        filter: brightness(0.25);
                    }
                    .reset-container {
                        position: relative;
                        z-index: 1;
                        flex: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 24px;
                    }
                    .reset-card {
                        text-align: center;
                        max-width: 420px;
                        width: 100%;
                    }
                    .reset-icon.success {
                        width: 80px;
                        height: 80px;
                        border-radius: 50%;
                        background: rgba(22, 163, 74, 0.15);
                        color: #16A34A;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 24px;
                    }
                    .reset-title {
                        font-size: 24px;
                        font-weight: bold;
                        color: #fff;
                        margin-bottom: 12px;
                    }
                    .reset-message {
                        font-size: 15px;
                        color: rgba(255,255,255,0.7);
                        margin-bottom: 32px;
                    }
                    .reset-btn {
                        width: 100%;
                        padding: 14px;
                        background: #DC2626;
                        color: #fff;
                        border: none;
                        border-radius: 12px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                    }
                    .reset-logo {
                        font-size: 20px;
                        font-weight: bold;
                        color: rgba(255,255,255,0.3);
                        letter-spacing: 6px;
                        margin-top: 40px;
                    }
                `}</style>
            </div>
        )
    }

    // Formulário de reset
    return (
        <div className="reset-screen">
            <div className="reset-bg" />
            <div className="reset-overlay" />

            <div className="reset-container">
                <div className="reset-card">
                    <div className="reset-header">
                        <span className="reset-logo-text">IMPERIUM</span>
                        <p className="reset-subtitle">Redefinir senha</p>
                    </div>

                    {erro && (
                        <div className="reset-error">
                            {erro}
                            {erro.includes('expirado') && (
                                <button onClick={() => router.push('/recuperar-senha')} className="reset-link-btn">
                                    Solicitar novo link
                                </button>
                            )}
                        </div>
                    )}

                    {!token && !erro && (
                        <div className="reset-error">
                            Link de recuperação não encontrado.
                            <button onClick={() => router.push('/recuperar-senha')} className="reset-link-btn">
                                Solicitar recuperação
                            </button>
                        </div>
                    )}

                    {token && (
                        <form onSubmit={handleSubmit} className="reset-form">
                            <div className="input-group">
                                <label className="input-label">Nova senha</label>
                                <div className="input-wrapper">
                                    <Lock size={18} color="#999" className="input-icon" />
                                    <input
                                        type={mostrarSenha ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value)
                                            setErro('')
                                        }}
                                        placeholder="Mínimo 8 caracteres"
                                        className="input-field"
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMostrarSenha(!mostrarSenha)}
                                        className="input-toggle"
                                    >
                                        {mostrarSenha ? <EyeOff size={18} color="#999" /> : <Eye size={18} color="#999" />}
                                    </button>
                                </div>
                                <div className="password-requirements">
                                    <span className={password.length >= 8 ? 'valid' : ''}>✓ 8 caracteres</span>
                                    <span className={/[A-Z]/.test(password) ? 'valid' : ''}>✓ 1 maiúscula</span>
                                    <span className={/[a-z]/.test(password) ? 'valid' : ''}>✓ 1 minúscula</span>
                                    <span className={/[0-9]/.test(password) ? 'valid' : ''}>✓ 1 número</span>
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="input-label">Confirmar nova senha</label>
                                <div className="input-wrapper">
                                    <Lock size={18} color="#999" className="input-icon" />
                                    <input
                                        type={mostrarSenha ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value)
                                            setErro('')
                                        }}
                                        placeholder="Repita a senha"
                                        className="input-field"
                                        autoComplete="new-password"
                                    />
                                </div>
                                {confirmPassword && password !== confirmPassword && (
                                    <p className="input-error">As senhas não conferem</p>
                                )}
                            </div>

                            <button type="submit" disabled={loading} className="reset-btn">
                                {loading ? (
                                    <>Redefinindo... <Loader size={18} className="spinner" /></>
                                ) : (
                                    <>Redefinir senha <ArrowRight size={18} /></>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <style jsx>{`
                .reset-screen {
                    min-height: 100vh;
                    display: flex;
                    position: relative;
                    background: #000;
                }
                .reset-bg {
                    position: absolute;
                    inset: 0;
                    background-image: url('/header/logindownhill.jpg');
                    background-size: cover;
                    background-position: center;
                    filter: brightness(0.3);
                }
                .reset-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.9));
                }
                .reset-container {
                    position: relative;
                    z-index: 1;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 24px;
                }
                .reset-card {
                    width: 100%;
                    max-width: 420px;
                    margin: 0 auto;
                }
                .reset-header {
                    text-align: center;
                    margin-bottom: 32px;
                }
                .reset-logo-text {
                    font-size: 28px;
                    font-weight: bold;
                    color: #DC2626;
                    letter-spacing: 4px;
                }
                .reset-subtitle {
                    font-size: 14px;
                    color: rgba(255,255,255,0.6);
                    margin-top: 8px;
                }
                .reset-error {
                    background: rgba(220,38,38,0.15);
                    border: 1px solid rgba(220,38,38,0.3);
                    border-radius: 10px;
                    padding: 16px;
                    margin-bottom: 16px;
                    color: #EF4444;
                    font-size: 14px;
                    text-align: center;
                }
                .reset-link-btn {
                    display: block;
                    margin-top: 8px;
                    background: none;
                    border: none;
                    color: #EF4444;
                    font-size: 13px;
                    cursor: pointer;
                    text-decoration: underline;
                    width: 100%;
                }
                .reset-form {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .input-group {
                    display: flex;
                    flex-direction: column;
                }
                .input-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: rgba(255,255,255,0.8);
                    margin-bottom: 6px;
                }
                .input-wrapper {
                    position: relative;
                }
                .input-icon {
                    position: absolute;
                    left: 14px;
                    top: 14px;
                }
                .input-field {
                    width: 100%;
                    padding: 14px 44px 14px 42px;
                    background: rgba(255,255,255,0.08);
                    border: 1px solid rgba(255,255,255,0.15);
                    border-radius: 12px;
                    font-size: 15px;
                    color: #fff;
                    outline: none;
                }
                .input-field:focus {
                    border-color: #DC2626;
                }
                .input-toggle {
                    position: absolute;
                    right: 14px;
                    top: 14px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                }
                .password-requirements {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 4px;
                    margin-top: 8px;
                    font-size: 12px;
                    color: rgba(255,255,255,0.4);
                }
                .password-requirements .valid {
                    color: #16A34A;
                }
                .input-error {
                    color: #EF4444;
                    font-size: 12px;
                    margin-top: 4px;
                }
                .reset-btn {
                    width: 100%;
                    padding: 15px;
                    background: #DC2626;
                    color: #fff;
                    border: none;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    margin-top: 8px;
                }
                .reset-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                .spinner {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}

export default function ResetarSenhaPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader size={48} color="#DC2626" className="spinner" />
            </div>
        }>
            <ResetarSenhaContent />
        </Suspense>
    )
}