'use client'

import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Check } from 'lucide-react'
import { authService } from '@/services/authService'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Constantes
const STEPS = {
    FORM: 1,
    VERIFY_EMAIL: 2,
    SUCCESS: 3
}

export function RegisterForm() {
    const router = useRouter()
    const [step, setStep] = useState(STEPS.FORM)
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    })
    const [mostrarSenha, setMostrarSenha] = useState(false)
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState('')
    const [userEmail, setUserEmail] = useState('')

    // Máscara de telefone
    const formatarTelefone = (valor: string) => {
        let numero = valor.replace(/\D/g, '')
        if (numero.length > 11) numero = numero.slice(0, 11)
        if (numero.length > 7) numero = `(${numero.slice(0, 2)}) ${numero.slice(2, 7)}-${numero.slice(7)}`
        else if (numero.length > 2) numero = `(${numero.slice(0, 2)}) ${numero.slice(2)}`
        return numero
    }

    const handleChange = (field: string, value: string) => {
        if (field === 'phone') {
            setForm(prev => ({ ...prev, phone: formatarTelefone(value) }))
        } else {
            setForm(prev => ({ ...prev, [field]: value }))
        }
        setErro('')
    }

    // Validação profissional
    const validar = (): string | null => {
        const { fullName, email, phone, password, confirmPassword } = form

        if (!fullName.trim() || fullName.trim().length < 3) {
            return 'Nome completo deve ter pelo menos 3 caracteres'
        }
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return 'Email inválido'
        }
        if (!phone || phone.replace(/\D/g, '').length < 10) {
            return 'Telefone incompleto'
        }
        if (password.length < 8) {
            return 'A senha deve ter no mínimo 8 caracteres'
        }
        if (password !== confirmPassword) {
            return 'As senhas não conferem'
        }
        return null
    }

    // Submit do formulário
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErro('')

        const erroValidacao = validar()
        if (erroValidacao) {
            setErro(erroValidacao)
            return
        }

        setLoading(true)

        try {
            const payload = {
                fullName: form.fullName.trim(),
                email: form.email.trim().toLowerCase(),
                phone: '+55' + form.phone.replace(/\D/g, ''),
                password: form.password,
            }

            const response = await authService.register(payload)

            // Salva o email para mostrar na tela de verificação
            setUserEmail(form.email)

            // Salva token e redireciona
            const token = authService.getToken()
            if (token) {
                document.cookie = `@imperium:token=${token}; path=/; max-age=86400; SameSite=Lax`
            }

            // Mostra tela de sucesso com instruções
            setStep(STEPS.VERIFY_EMAIL)

        } catch (error: any) {
            console.error('Erro no cadastro:', error)

            if (error?.response?.status === 409) {
                setErro('Este email já está cadastrado')
            } else if (error?.response?.status === 400) {
                const mensagem = error?.response?.data?.message || 'Dados inválidos'
                setErro(mensagem)
            } else if (error?.message?.includes('Network Error')) {
                setErro('Erro de conexão. Verifique sua internet.')
            } else {
                setErro('Erro ao criar conta. Tente novamente.')
            }
        } finally {
            setLoading(false)
        }
    }

    // ============ RENDERIZAÇÃO ============

    // STEP 2: Tela de verificação de email
    if (step === STEPS.VERIFY_EMAIL) {
        return (
            <div className="verification-screen">
                <div className="verification-bg" />
                <div className="verification-content">
                    <div className="verification-icon">
                        <Mail size={48} color="#DC2626" />
                    </div>
                    <h2 className="verification-title">Verifique seu email</h2>
                    <p className="verification-text">
                        Enviamos um link de confirmação para <strong>{userEmail}</strong>
                    </p>
                    <p className="verification-subtext">
                        Clique no link recebido para ativar sua conta.
                        Verifique também a pasta de spam.
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="verification-btn"
                    >
                        Ir para Home <ArrowRight size={18} />
                    </button>
                    <p className="verification-skip" onClick={() => router.push('/login')}>
                        Já verificou? Fazer login
                    </p>
                </div>

                <style jsx>{`
                    .verification-screen {
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #000;
                        position: relative;
                    }
                    .verification-bg {
                        position: absolute;
                        inset: 0;
                        background-image: url('/header/cadastrodownhill.jpg');
                        background-size: cover;
                        background-position: center;
                        filter: brightness(0.25);
                    }
                    .verification-content {
                        position: relative;
                        z-index: 1;
                        text-align: center;
                        padding: 40px 24px;
                        max-width: 420px;
                    }
                    .verification-icon {
                        width: 80px;
                        height: 80px;
                        border-radius: 50%;
                        background: rgba(220, 38, 38, 0.15);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 24px;
                    }
                    .verification-title {
                        color: #fff;
                        font-size: 24px;
                        font-weight: bold;
                        margin-bottom: 12px;
                    }
                    .verification-text {
                        color: rgba(255,255,255,0.8);
                        font-size: 15px;
                        margin-bottom: 8px;
                    }
                    .verification-subtext {
                        color: rgba(255,255,255,0.5);
                        font-size: 13px;
                        margin-bottom: 32px;
                    }
                    .verification-btn {
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
                    .verification-btn:hover {
                        background: #b91c1c;
                    }
                    .verification-skip {
                        color: rgba(255,255,255,0.5);
                        font-size: 13px;
                        margin-top: 20px;
                        cursor: pointer;
                    }
                    .verification-skip:hover {
                        color: #DC2626;
                    }
                `}</style>
            </div>
        )
    }

    // STEP 1: Formulário de cadastro
    return (
        <div className="register-screen">
            <div className="register-bg" />
            <div className="register-overlay" />

            <div className="register-container">
                <div className="register-card">
                    {/* Header */}
                    <div className="register-header">
                        <span className="register-logo">IMPERIUM</span>
                        <p className="register-subtitle">Crie sua conta</p>
                    </div>

                    {/* Erro */}
                    {erro && (
                        <div className="register-error">
                            {erro}
                        </div>
                    )}

                    {/* Formulário */}
                    <form onSubmit={handleSubmit} className="register-form">
                        <InputField
                            icon={<User size={18} color="#999" />}
                            label="Nome completo"
                            placeholder="Seu nome completo"
                            value={form.fullName}
                            onChange={(v) => handleChange('fullName', v)}
                            autoComplete="name"
                        />

                        <InputField
                            icon={<Mail size={18} color="#999" />}
                            label="Email"
                            placeholder="seu@email.com"
                            type="email"
                            value={form.email}
                            onChange={(v) => handleChange('email', v)}
                            autoComplete="email"
                        />

                        <InputField
                            icon={<Phone size={18} color="#999" />}
                            label="Telefone"
                            placeholder="(11) 99999-9999"
                            type="tel"
                            value={form.phone}
                            onChange={(v) => handleChange('phone', v)}
                            autoComplete="tel"
                        />

                        {/* Senha */}
                        <div className="input-group">
                            <label className="input-label">Senha (mínimo 8 caracteres)</label>
                            <div className="input-wrapper">
                                <Lock size={18} color="#999" className="input-icon" />
                                <input
                                    type={mostrarSenha ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    placeholder="Mínimo 8 caracteres"
                                    className="input-field"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setMostrarSenha(!mostrarSenha)}
                                    className="input-toggle"
                                    aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                                >
                                    {mostrarSenha ? <EyeOff size={18} color="#999" /> : <Eye size={18} color="#999" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirmar Senha */}
                        <div className="input-group">
                            <label className="input-label">Confirmar senha</label>
                            <div className="input-wrapper">
                                <Lock size={18} color="#999" className="input-icon" />
                                <input
                                    type={mostrarSenha ? 'text' : 'password'}
                                    value={form.confirmPassword}
                                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                    placeholder="Repita a senha"
                                    className="input-field"
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>

                        {/* Botão */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="register-submit"
                        >
                            {loading ? (
                                <>Criando conta...</>
                            ) : (
                                <>Criar conta <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    {/* Link para login */}
                    <p className="register-login-link">
                        Já tem uma conta?{' '}
                        <Link href="/login">Entrar</Link>
                    </p>
                </div>
            </div>

            <style jsx>{`
                .register-screen {
                    min-height: 100vh;
                    display: flex;
                    position: relative;
                    background: #000;
                }
                .register-bg {
                    position: absolute;
                    inset: 0;
                    background-image: url('/header/cadastrodownhill.jpg');
                    background-size: cover;
                    background-position: center;
                    filter: brightness(0.3);
                }
                .register-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.9));
                }
                .register-container {
                    position: relative;
                    z-index: 1;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 24px;
                }
                .register-card {
                    width: 100%;
                    max-width: 420px;
                    margin: 0 auto;
                }
                .register-header {
                    text-align: center;
                    margin-bottom: 32px;
                }
                .register-logo {
                    font-size: 28px;
                    font-weight: bold;
                    color: #DC2626;
                    letter-spacing: 4px;
                }
                .register-subtitle {
                    font-size: 14px;
                    color: rgba(255,255,255,0.6);
                    margin-top: 8px;
                }
                .register-error {
                    background: rgba(220,38,38,0.15);
                    border: 1px solid rgba(220,38,38,0.3);
                    border-radius: 10px;
                    padding: 12px 16px;
                    margin-bottom: 16px;
                    color: #EF4444;
                    font-size: 14px;
                    text-align: center;
                }
                .register-form {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }
                .register-submit {
                    width: 100%;
                    padding: 15px;
                    background: #DC2626;
                    color: #fff;
                    border: none;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    margin-top: 8px;
                    transition: background 0.2s;
                }
                .register-submit:hover:not(:disabled) {
                    background: #b91c1c;
                }
                .register-submit:disabled {
                    background: #991b1b;
                    cursor: not-allowed;
                    opacity: 0.7;
                }
                .register-login-link {
                    text-align: center;
                    font-size: 14px;
                    color: rgba(255,255,255,0.6);
                    margin-top: 24px;
                }
                .register-login-link a {
                    color: #EF4444;
                    font-weight: 600;
                    text-decoration: none;
                }
                .register-login-link a:hover {
                    text-decoration: underline;
                }

                /* Input styles */
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
                    pointer-events: none;
                }
                .input-field {
                    width: 100%;
                    padding: 14px 14px 14px 42px;
                    background: rgba(255,255,255,0.08);
                    border: 1px solid rgba(255,255,255,0.15);
                    border-radius: 12px;
                    font-size: 15px;
                    color: #fff;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .input-field:focus {
                    border-color: #DC2626;
                }
                .input-field::placeholder {
                    color: rgba(255,255,255,0.3);
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
            `}</style>
        </div>
    )
}

// Componente Input reutilizável
function InputField({
                        icon,
                        label,
                        placeholder,
                        type = 'text',
                        value,
                        onChange,
                        autoComplete
                    }: {
    icon: React.ReactNode
    label: string
    placeholder: string
    type?: string
    value: string
    onChange: (value: string) => void
    autoComplete?: string
}) {
    return (
        <div className="input-group">
            <label className="input-label">{label}</label>
            <div className="input-wrapper">
                <span className="input-icon">{icon}</span>
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="input-field"
                    autoComplete={autoComplete}
                />
            </div>
        </div>
    )
}