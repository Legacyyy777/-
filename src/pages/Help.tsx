// Страница помощи и FAQ

import { useEffect, useState } from 'react';
import Container from '@/components/layout/Container';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import { useTranslation } from '@/i18n';
import { useTelegram } from '@/hooks/useTelegram';
import { getFAQ, getLegalDocuments } from '@/api/faq';
import type { FAQ, LegalDocuments } from '@/types/api';

/**
 * Страница помощи
 */
const Help = () => {
    const { t, language } = useTranslation();
    const { hapticFeedback, openLink } = useTelegram();

    const [loading, setLoading] = useState(true);
    const [faq, setFaq] = useState<FAQ | null>(null);
    const [legal, setLegal] = useState<LegalDocuments | null>(null);
    const [openFaqId, setOpenFaqId] = useState<number | null>(null);

    useEffect(() => {
        loadData();
    }, [language]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [faqData, legalData] = await Promise.all([
                getFAQ(language),
                getLegalDocuments(language),
            ]);
            setFaq(faqData);
            setLegal(legalData);
        } catch (err) {
            console.error('Error loading help:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleFaq = (id: number) => {
        hapticFeedback('light');
        setOpenFaqId(openFaqId === id ? null : id);
    };

    if (loading) {
        return (
            <Container className="flex items-center justify-center min-h-[60vh]">
                <div className="loader"></div>
            </Container>
        );
    }

    return (
        <>
            <Header title={t('help.title')} showBack />

            <Container>
                {/* FAQ */}
                {faq && faq.items.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-3">{t('help.faq.title')}</h2>
                        <div className="space-y-2">
                            {faq.items.map((item) => (
                                <Card key={item.id} hover onClick={() => toggleFaq(item.id)}>
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium flex-1">{item.title}</h4>
                                        <span className={`text-xl transition-transform ${openFaqId === item.id ? 'rotate-180' : ''}`}>
                                            ▼
                                        </span>
                                    </div>
                                    {openFaqId === item.id && (
                                        <div
                                            className="mt-3 pt-3 border-t border-tg-hint/20 text-sm text-tg-hint"
                                            dangerouslySetInnerHTML={{ __html: item.content || '' }}
                                        />
                                    )}
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Юридические документы */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-3">{t('help.legal.title')}</h2>
                    <div className="space-y-2">
                        {legal?.public_offer && (
                            <Card hover onClick={() => hapticFeedback('light')}>
                                <p className="font-medium">{t('help.legal.publicOffer')}</p>
                            </Card>
                        )}
                        {legal?.service_rules && (
                            <Card hover onClick={() => hapticFeedback('light')}>
                                <p className="font-medium">{t('help.legal.serviceRules')}</p>
                            </Card>
                        )}
                        {legal?.privacy_policy && (
                            <Card hover onClick={() => hapticFeedback('light')}>
                                <p className="font-medium">{t('help.legal.privacyPolicy')}</p>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Поддержка */}
                <Card>
                    <h3 className="font-semibold mb-3">{t('help.support.title')}</h3>
                    <p className="text-tg-hint text-sm mb-3">
                        Если у вас возникли вопросы или проблемы, свяжитесь с нами
                    </p>
                    <button
                        onClick={() => openLink('https://t.me/support')}
                        className="w-full py-3 rounded-lg bg-tg-link text-white font-medium hover:opacity-90 transition-opacity"
                    >
                        {t('help.support.contact')}
                    </button>
                </Card>
            </Container>
        </>
    );
};

export default Help;

