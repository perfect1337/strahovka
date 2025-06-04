import React, { useState, useEffect } from 'react';
import { Steps, Button, message, Card, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import KaskoForm from './forms/KaskoForm';
import OsagoForm from '../pages/forms/OsagoForm';
import TravelForm from '../pages/forms/TravelForm';
import HealthForm from '../pages/forms/HealthForm';
import RealEstateForm from '../pages/forms/RealEstateForm';
import api from '../utils/api';

const { Step } = Steps;
const { Title } = Typography;

// Маппинг типов страховок на компоненты форм
const INSURANCE_FORMS = {
    'AUTO': {
        'KASKO': KaskoForm,
        'OSAGO': OsagoForm
    },
    'KASKO': KaskoForm,
    'OSAGO': OsagoForm,
    'TRAVEL': TravelForm,
    'HEALTH': HealthForm,
    'REALESTATE': RealEstateForm,
    'PROPERTY': RealEstateForm
};

// Маппинг типов страховок на их названия
const INSURANCE_NAMES = {
    'AUTO': 'Автострахование',
    'KASKO': 'КАСКО',
    'OSAGO': 'ОСАГО',
    'TRAVEL': 'Страхование путешествий',
    'HEALTH': 'Страхование здоровья',
    'REALESTATE': 'Страхование недвижимости',
    'PROPERTY': 'Страхование имущества'
};

const InsurancePackageManager = ({ packageId, initialCategories = [] }) => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [categories, setCategories] = useState(initialCategories);
    const [completedForms, setCompletedForms] = useState({});
    const [loading, setLoading] = useState(true);
    const [packageData, setPackageData] = useState(null);
    const [error, setError] = useState(null);

    // Преобразуем категории AUTO в соответствующие подкатегории
    const expandAutoCategories = (cats) => {
        const expanded = cats.reduce((acc, cat) => {
            if (cat === 'AUTO') {
                // Для категории AUTO добавляем KASKO и OSAGO
                acc.push('KASKO', 'OSAGO');
            } else {
                acc.push(cat);
            }
            return acc;
        }, []);

        // Удаляем дубликаты
        return [...new Set(expanded)];
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
                
                // Устанавливаем категории из полученных данных
                if (response.data.categories && Array.isArray(response.data.categories)) {
                    // Преобразуем типы страхования в верхний регистр для единообразия
                    const categoryTypes = response.data.categories.map(cat => 
                        (cat.type || cat).toUpperCase()
                    );
                    console.log('Полученные типы страхования:', categoryTypes);
                    
                    // Разворачиваем категории AUTO в KASKO и OSAGO и удаляем дубликаты
                    const expandedCategories = expandAutoCategories(categoryTypes);
                    console.log('Развернутые категории (без дубликатов):', expandedCategories);
                    
                    setCategories(expandedCategories);
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
            
            // Подготавливаем данные в зависимости от типа страхования
            let processedData = formData;
            
            if (type === 'OSAGO') {
                // Для ОСАГО добавляем данные водителя
                if (formData.isUnlimitedDrivers) {
                    // Если выбрано неограниченное количество водителей,
                    // используем данные владельца как основного водителя
                    processedData = {
                        ...formData,
                        driver_license_number: formData.ownerPassportNumber,
                        driver_license_date: formData.ownerBirthDate,
                        driver_experience_years: 0
                    };
                } else if (formData.drivers && formData.drivers.length > 0) {
                    // Если есть список водителей, используем данные первого водителя
                    const mainDriver = formData.drivers[0];
                    processedData = {
                        ...formData,
                        driver_license_number: mainDriver.licenseNumber,
                        driver_license_date: mainDriver.licenseDate,
                        driver_experience_years: mainDriver.drivingExperience
                    };
                }
            }
            
            // Отправляем данные формы на сервер
            const response = await api.post(`/api/insurance/packages/${packageId}/apply`, {
                applications: [{
                    type: type,
                    label: INSURANCE_NAMES[type] || type,
                    data: processedData,
                    category: type // Добавляем поле category для совместимости с бэкендом
                }]
            });

            // Обновляем состояние завершенных форм
            setCompletedForms(prev => ({
                ...prev,
                [type]: true
            }));

            message.success('Форма успешно отправлена');

            // Если это последняя форма в пакете, финализируем пакет
            const isLastForm = currentStep === categories.length - 1;
            if (isLastForm) {
                await api.post(`/api/insurance/packages/${packageId}/finalize`);
                message.success('Пакет страхования успешно оформлен!');
                setTimeout(() => navigate('/profile'), 2000);
            } else {
                // Переходим к следующей форме
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
                Доступные типы: {Object.keys(INSURANCE_FORMS).filter(key => key !== 'AUTO').join(', ')}
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