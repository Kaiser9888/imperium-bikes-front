'use client'

import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Phone, FileText } from 'lucide-react'
import { authService } from '@/services/authService'
import Link from 'next/link'

export function RegisterForm() {
    const [form, setForm] = useState({ name: '', email: '', phone: '', cpf: '', password: '', confirmPassword: '' })
    const [mostrarSenha, setMostrarSenha] = useState(false)
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState('')
    const [sucesso, setSucesso] = useState(false)

    const formatarTelefone = (valor: string) => {
        let numero = valor.replace(/\D/g, '')
        if (numero.length > 11) numero = numero.slice(0, 11)
        if (numero.length > 7) numero = `(${numero.slice(0, 2)}) ${numero.slice(2, 7)}-${numero.slice(7)}`
        else if (numero.length > 2) numero = `(${numero.slice(0, 2)}) ${numero.slice(2)}`
        return numero
    }

    const formatarCPF = (valor: string) => {
        let numero = valor.replace(/\D/g, '')
        if (numero.length > 11) numero = numero.slice(0, 11)
        if (numero.length > 9) numero = `${numero.slice(0, 3)}.${numero.slice(3, 6)}.${numero.slice(6, 9)}-${numero.slice(9)}`
        else if (numero.length > 6) numero = `${numero.slice(0, 3)}.${numero.slice(3, 6)}.${numero.slice(6)}`
        else if (numero.length > 3) numero = `${numero.slice(0, 3)}.${numero.slice(3)}`
        return numero
    }

    const handleChange = (field: string, value: string) => {
        if (field === 'phone') setForm(prev => ({ ...prev, phone: formatarTelefone(value) }))
        else if (field === 'cpf') setForm(prev => ({ ...prev, cpf: formatarCPF(value) }))
        else setForm(prev => ({ ...prev, [field]: value }))
    }

    const validar = () => {
        if (!form.name || !form.email || !form.phone || !form.cpf || !form.password) {
            setErro('Preencha todos os campos obrigatorios'); return false
        }
        if (form.password.length < 6) { setErro('A senha deve ter no minimo 6 caracteres'); return false }
        if (form.password !== form.confirmPassword) { setErro('As senhas nao conferem'); return false }
        if (!form.email.includes('@')) { setErro('Email invalido'); return false }
        if (form.phone.replace(/\D/g, '').length < 10) { setErro('Telefone incompleto'); return false }
        if (form.cpf.replace(/\D/g, '').length < 11) { setErro('CPF incompleto'); return false }
        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErro('')
        if (!validar()) return
        setLoading(true)

        try {
            await authService.register({
                name: form.name, email: form.email,
                phone: form.phone.replace(/\D/g, ''), cpf: form.cpf.replace(/\D/g, ''),
                password: form.password,
            })

            const token = authService.getToken()
            if (token) {
                document.cookie = `@imperium:token=${token}; path=/; max-age=86400; SameSite=Lax`
            }

            setSucesso(true)
            setTimeout(() => { window.location.href = '/' }, 2000)
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'response' in error) {
                const err = error as { response?: { status?: number } }
                if (err.response?.status === 409) setErro('Email ja cadastrado')
                else setErro('Erro ao cadastrar. Tente novamente')
            } else {
                setErro('Erro ao conectar. Tente novamente')
            }
        } finally {
            setLoading(false)
        }
    }

    if (sucesso) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'url(/header/cadastrodownhill.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.3)' }} />
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '24px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <span style={{ fontSize: '40px', color: '#fff' }}>OK</span>
                    </div>
                    <h2 style={{ color: '#fff', fontSize: '22px', marginBottom: '8px' }}>Conta criada!</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Redirecionando...</p>
                </div>
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', backgroundColor: '#000' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'url(/header/cadastrodownhill.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.3)' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.9))' }} />

            <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px' }}>
                <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#DC2626', letterSpacing: '4px' }}>IMPERIUM</span>
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginTop: '8px' }}>Crie sua conta</p>
                    </div>

                    {erro && (
                        <div style={{ backgroundColor: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', color: '#EF4444', fontSize: '14px', textAlign: 'center' }}>{erro}</div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <InputField icon={<User size={18} color="#999" />} label="Nome completo" placeholder="Seu nome" value={form.name} onChange={(v) => handleChange('name', v)} />
                        <InputField icon={<Mail size={18} color="#999" />} label="Email" placeholder="seu@email.com" type="email" value={form.email} onChange={(v) => handleChange('email', v)} />
                        <InputField icon={<Phone size={18} color="#999" />} label="Telefone" placeholder="(11) 99999-9999" type="tel" value={form.phone} onChange={(v) => handleChange('phone', v)} />
                        <InputField icon={<FileText size={18} color="#999" />} label="CPF" placeholder="000.000.000-00" value={form.cpf} onChange={(v) => handleChange('cpf', v)} />

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: '6px' }}>Senha</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} color="#999" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                                <input type={mostrarSenha ? 'text' : 'password'} value={form.password} onChange={(e) => handleChange('password', e.target.value)} placeholder="Minimo 6 caracteres"
                                       style={{ width: '100%', padding: '14px 14px 14px 42px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', fontSize: '15px', color: '#fff', outline: 'none' }} />
                                <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} style={{ position: 'absolute', right: '14px', top: '14px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                    {mostrarSenha ? <EyeOff size={18} color="#999" /> : <Eye size={18} color="#999" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: '6px' }}>Confirmar senha</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} color="#999" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                                <input type={mostrarSenha ? 'text' : 'password'} value={form.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} placeholder="Repita a senha"
                                       style={{ width: '100%', padding: '14px 14px 14px 42px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', fontSize: '15px', color: '#fff', outline: 'none' }} />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '15px', backgroundColor: loading ? '#991b1b' : '#DC2626',
                            color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px',
                            fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px'
                        }}>{loading ? 'Criando conta...' : 'Criar conta'}</button>
                    </form>

                    <p style={{ textAlign: 'center', fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginTop: '24px' }}>
                        Ja tem uma conta?{' '}
                        <Link href="/login" style={{ color: '#EF4444', fontWeight: '600', textDecoration: 'none' }}>Entrar</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

function InputField({ icon, label, placeholder, type = 'text', value, onChange }: {
    icon: React.ReactNode; label: string; placeholder: string; type?: string; value: string; onChange: (value: string) => void
}) {
    return (
        <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: '6px' }}>{label}</label>
            <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '14px', top: '14px' }}>{icon}</div>
                <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
                       style={{ width: '100%', padding: '14px 14px 14px 42px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', fontSize: '15px', color: '#fff', outline: 'none' }} />
            </div>
        </div>
    )
}