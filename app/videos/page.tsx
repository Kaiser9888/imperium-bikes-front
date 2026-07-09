// src/app/videos/page.tsx
export default function VideosPage() {
    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '16px' }}>
                🚴‍♂️ Vídeos de Bike
            </h1>
            <p style={{ color: '#666', marginBottom: '32px' }}>
                Em breve: tutoriais, reviews, trilhas e muito mais!
            </p>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '24px'
            }}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                        key={i}
                        style={{
                            border: '1px solid #e5e5e5',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            background: '#fff'
                        }}
                    >
                        <div style={{
                            aspectRatio: '16/9',
                            background: '#f0f0f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem'
                        }}>
                            🎬
                        </div>
                        <div style={{ padding: '16px' }}>
                            <h3 style={{ fontWeight: '600', marginBottom: '8px' }}>
                                Vídeo de Bike #{i}
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: '#666' }}>
                                Carregando conteúdo...
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}