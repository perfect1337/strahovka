import React, { useState, useEffect } from 'react';
import { Steps, Button, message, Card, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import KaskoForm from '../pages/forms/KaskoForm';
import OsagoForm from '../pages/forms/OsagoForm';
import TravelForm from '../pages/forms/TravelForm';
import HealthForm from '../pages/forms/HealthForm';
import RealEstateForm from '../pages/forms/RealEstateForm';
import api from '../utils/api';

const { Step } = Steps;
const { Title } = Typography;

// Маппинг типов страховок на компоненты форм
const INSURANCE_FORMS = {
    'KASKO': KaskoForm,
    'OSAGO': OsagoForm,
    'TRAVEL': TravelForm,
    'HEALTH': HealthForm,
    'PROPERTY': RealEstateForm
};

// Маппинг типов страховок на их названия
const INSURANCE_NAMES = {
    'KASKO': 'КАСКО',
    'OSAGO': 'ОСАГО',
    'TRAVEL': 'Страхование путешествий',
    'HEALTH': 'Страхование здоровья',
    'PROPERTY': 'Страхование недвижимости'
};

const InsurancePackageManager = ({ packageId, initialCategories = [] }) => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [categories, setCategories] = useState(initialCategories);
    const [completedForms, setCompletedForms] = useState({});
    const [loading, setLoading] = useState(true);
    const [packageData, setPackageData] = useState(null);
    const [error, setError] = useState(null);

    // Преобразуем категории в правильные типы страхования
    const normalizeCategories = (cats) => {
        // Функция для определения типа по метке
        const getLabelType = (label) => {
            if (!label) return null;
            const upperLabel = label.toUpperCase();
            if (upperLabel === 'KASKO' || upperLabel === 'КАСКО') return 'KASKO';
            if (upperLabel === 'OSAGO' || upperLabel === 'ОСАГО') return 'OSAGO';
            if (upperLabel === 'НЕДВИЖИМОСТЬ' || upperLabel === 'PROPERTY' || upperLabel === 'REALESTATE') return 'PROPERTY';
            return null;
        };

        // Используем Set для уникальности с самого начала
        let normalizedTypes = new Set();
        let hasAuto = false;

        console.log('Normalizing categories:', cats);

        // Проверяем наличие явных типов и меток
        cats.forEach(cat => {
            const type = cat.type?.toUpperCase() || cat.toUpperCase();
            const labelType = getLabelType(cat.label);

            console.log('Processing category:', { type, labelType, originalCategory: cat });

            // Если это AUTO тип, отмечаем для последующей обработки
            if (type === 'AUTO') {
                hasAuto = true;
                return; // Пропускаем дальнейшую обработку для AUTO
            }

            // Добавляем тип из метки или явного типа
            if (labelType) {
                normalizedTypes.add(labelType);
                console.log('Added from label:', labelType);
            } else {
                // Добавляем другие типы страхования
                switch (type) {
                    case 'KASKO':
                        normalizedTypes.add('KASKO');
                        break;
                    case 'OSAGO':
                        normalizedTypes.add('OSAGO');
                        break;
                    case 'REALESTATE':
                    case 'PROPERTY':
                        normalizedTypes.add('PROPERTY');
                        break;
                    case 'TRAVEL':
                        normalizedTypes.add('TRAVEL');
                        break;
                    case 'HEALTH':
                        normalizedTypes.add('HEALTH');
                        break;
                }
                console.log('Added from type:', type);
            }
        });

        console.log('Before AUTO processing:', Array.from(normalizedTypes));

        // Обработка AUTO типа только если нет явных KASKO/OSAGO
        if (hasAuto && !normalizedTypes.has('KASKO') && !normalizedTypes.has('OSAGO')) {
            normalizedTypes.add('KASKO');
            normalizedTypes.add('OSAGO');
            console.log('Added KASKO and OSAGO from AUTO type');
        }

        // Преобразуем Set в массив и сортируем
        const result = Array.from(normalizedTypes).sort((a, b) => {
            if (a === 'KASKO' && b === 'OSAGO') return -1;
            if (a === 'OSAGO' && b === 'KASKO') return 1;
            return 0;
        });

        console.log('Final normalized categories:', result);
        return result;
    };

    useEffect(() => {
        const fetchPackageData = async () => {
            if (!packageId) {
                setError('ID пакета не указан');
                setLoading(false);
                return;
            }

            try {
                const response = await api.get(`/api/insurance/packages/${packageId}`);
                setPackageData(response.data);
                
                if (response.data.categories && Array.isArray(response.data.categories)) {
                    console.log('Категории с бэкенда:', JSON.parse(JSON.stringify(response.data.categories)));
                    const normalized = normalizeCategories(response.data.categories);
                    console.log('Нормализованные до Set:', normalized);
                    const uniqueNormalizedCategories = [...new Set(normalized)];
                    console.log('Нормализованные и уникальные категории:', uniqueNormalizedCategories);
                    
                    const sortedCategories = uniqueNormalizedCategories.sort((a, b) => {
                        if (a === 'KASKO' && b === 'OSAGO') return -1;
                        if (a === 'OSAGO' && b === 'KASKO') return 1;
                        // Для других типов можно добавить логику сортировки или оставить как есть
                        return 0;
                    });
                    
                    console.log('Отсортированные категории для установки:', sortedCategories);
                    setCategories(sortedCategories);
                }
            } catch (err) {
                console.error('Error fetching package data:', err);
                setError(err.response?.data?.message || 'Ошибка при загрузке данных пакета');
            } finally {
                setLoading(false);
            }
        };

        fetchPackageData();
    }, [packageId]);

    const handleFormSubmit = async (type, formData) => {
        try {
            setLoading(true);
            console.log('Отправка формы для типа:', type, 'с данными:', formData);
            
            // Ensure yearBuilt is properly set for property applications
            if (type === 'PROPERTY') {
                formData = {
                    ...formData,
                    yearBuilt: parseInt(formData.constructionYear)
                };
            }
            
            const applicationData = {
                type: type, 
                data: formData
            };

            console.log('Подготовленные данные для отправки:', applicationData);
            
            const response = await api.post(`/api/insurance/packages/${packageId}/apply`, {
                applications: [applicationData]
            });

            setCompletedForms(prev => ({
                ...prev,
                [type]: true
            }));

            message.success('Форма успешно отправлена');
            const isLastForm = currentStep === categories.length - 1;
            if (isLastForm) {
                // ПОКА КОММЕНТИРУЕМ АВТОМАТИЧЕСКУЮ ФИНАЛИЗАЦИЮ И ПЕРЕХОД
                // TODO: Реализовать логику оплаты и вызывать finalize после успешной оплаты
                message.info('Все формы пакета заполнены. Переход к оплате...'); // Сообщение пользователю
                // await api.post(`/api/insurance/packages/${packageId}/finalize`);
                // message.success('Пакет страхования успешно оформлен!');
                // setTimeout(() => navigate('/profile'), 2000);
                
                // Пример: Устанавливаем флаг, что можно переходить к оплате
                // setReadyForPayment(true); 
                // Или перенаправляем на страницу оплаты, если она есть:
                // navigate(`/payment/${packageId}`);
            } else {
                setCurrentStep(prev => prev + 1);
            }

            return response;
        } catch (error) {
            console.error('Error submitting form:', error);
            message.error(error.response?.data?.message || 'Ошибка при отправке формы');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const renderCurrentForm = () => {
        if (loading) {
            return <div>Загрузка...</div>;
        }

        if (error) {
            return <Typography.Text type="danger">{error}</Typography.Text>;
        }

        const currentCategory = categories[currentStep];
        console.log('Текущая категория:', currentCategory);
        
        let FormComponent = INSURANCE_FORMS[currentCategory];
        
        if (!FormComponent) {
            return <Typography.Text type="danger">
                Неподдерживаемый тип страхования: {currentCategory}
                <br />
                Доступные типы: {Object.keys(INSURANCE_FORMS).join(', ')}
            </Typography.Text>;
        }

        return (
            <FormComponent
                isPartOfPackage={true}
                packageId={packageId}
                onSubmit={(formData) => handleFormSubmit(currentCategory, formData)}
            />
        );
    };

    if (loading && !packageData) {
        return <Card style={{ margin: '24px' }}><div>Загрузка...</div></Card>;
    }

    if (error && !packageData) {
        return (
            <Card style={{ margin: '24px' }}>
                <Typography.Text type="danger">{error}</Typography.Text>
                <Button onClick={() => navigate(-1)} style={{ marginTop: '16px' }}>
                    Назад
                </Button>
            </Card>
        );
    }

    return (
        <Card style={{ margin: '24px' }}>
            <Title level={3}>Оформление пакета страхования: {packageData?.name}</Title>
            
            <Steps current={currentStep} style={{ marginBottom: '24px' }}>
                {categories.map((category, index) => (
                    <Step
                        key={category}
                        title={INSURANCE_NAMES[category]}
                        status={
                            completedForms[category]
                                ? 'finish'
                                : index === currentStep
                                    ? 'process'
                                    : 'wait'
                        }
                    />
                ))}
            </Steps>

            {renderCurrentForm()}

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={() => navigate(-1)}>
                    Назад
                </Button>
                
                {currentStep === categories.length && Object.keys(completedForms).length === categories.length && (
                    <Button
                        type="primary"
                        onClick={() => navigate('/profile')}
                    >
                        Перейти в личный кабинет
                    </Button>
                )}
            </div>
        </Card>
    );
};

export default InsurancePackageManager; 