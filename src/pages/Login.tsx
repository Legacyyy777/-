import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

declare global {
    interface Window {
        onTelegramAuth?: (user: any) => void;
    }
}

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Проверяем, уже авторизован ли пользователь
        const token = localStorage.getItem('auth_token');
        if (token) {
            // Проверяем валидность токена
            fetch('/api/miniapp/auth/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token,
                },
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        navigate('/');
                    } else {
                        localStorage.removeItem('auth_token');
                        localStorage.removeItem('user_id');
                    }
                })
                .catch(() => {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user_id');
                });
        }

        // Обработчик авторизации Telegram
        window.onTelegramAuth = (user: any) => {
            console.log('Telegram Auth:', user);

            setLoading(true);
            setError('');

            fetch('/api/miniapp/auth/telegram-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    username: user.username,
                    photo_url: user.photo_url,
                    auth_date: user.auth_date,
                    hash: user.hash,
                }),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        localStorage.setItem('auth_token', data.token);
                        localStorage.setItem('user_id', user.id);
                        navigate('/');
                    } else {
                        throw new Error(data.error || 'Ошибка авторизации');
                    }
                })
                .catch(err => {
                    console.error('Auth error:', err);
                    setError(err.message);
                    setLoading(false);
                });
        };

        // Загружаем Telegram Widget SDK
        const script = document.createElement('script');
        script.src = 'https://telegram.org/js/telegram-widget.js?22';
        script.async = true;
        script.setAttribute('data-telegram-login', 'testlegacy777_bot');
        script.setAttribute('data-size', 'large');
        script.setAttribute('data-radius', '10');
        script.setAttribute('data-onauth', 'onTelegramAuth(user)');
        script.setAttribute('data-request-access', 'write');

        const container = document.getElementById('telegram-login-container');
        if (container) {
            container.appendChild(script);
        }

        return () => {
            // Cleanup
            if (container && script.parentNode) {
                container.removeChild(script);
            }
        };
    }, [navigate]);

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.logo}>🚀</div>
                <h1 style={styles.title}>VPN Subscription</h1>
                <p style={styles.subtitle}>
                    Войдите через Telegram чтобы управлять своей подпиской
                </p>

                <div id="telegram-login-container" style={styles.loginContainer}></div>

                {loading && (
                    <div style={styles.loading}>
                        <div style={styles.spinner}></div>
                        <p style={styles.loadingText}>Авторизация...</p>
                    </div>
                )}

                {error && (
                    <div style={styles.error}>
                        <strong>Ошибка авторизации</strong>
                        <p>{error}</p>
                    </div>
                )}

                <div style={styles.features}>
                    <Feature icon="⚡" text="Быстрый доступ к подписке" />
                    <Feature icon="💳" text="Пополнение баланса" />
                    <Feature icon="📊" text="Статистика использования" />
                    <Feature icon="🎁" text="Реферальная программа" />
                </div>
            </div>
        </div>
    );
};

const Feature = ({ icon, text }: { icon: string; text: string }) => (
    <div style={styles.feature}>
        <span style={styles.featureIcon}>{icon}</span>
        <span>{text}</span>
    </div>
);

const styles: Record<string, React.CSSProperties> = {
    container: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
    },
    card: {
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
    },
    logo: {
        fontSize: '60px',
        marginBottom: '20px',
    },
    title: {
        color: '#333',
        marginBottom: '10px',
        fontSize: '28px',
    },
    subtitle: {
        color: '#666',
        marginBottom: '30px',
        lineHeight: '1.6',
    },
    loginContainer: {
        display: 'flex',
        justifyContent: 'center',
        margin: '30px 0',
        minHeight: '50px',
    },
    loading: {
        marginTop: '20px',
    },
    spinner: {
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #667eea',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite',
        margin: '0 auto',
    },
    loadingText: {
        marginTop: '15px',
        color: '#666',
    },
    error: {
        background: '#fee',
        color: '#c33',
        padding: '15px',
        borderRadius: '10px',
        marginTop: '20px',
    },
    features: {
        textAlign: 'left',
        marginTop: '40px',
        paddingTop: '30px',
        borderTop: '1px solid #eee',
    },
    feature: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '15px',
        color: '#555',
    },
    featureIcon: {
        fontSize: '24px',
        marginRight: '15px',
    },
};

export default Login;

