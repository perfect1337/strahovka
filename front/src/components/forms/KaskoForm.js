import React, { useState } from 'react';
import { Form, Input, Button, InputNumber, Checkbox, message, Modal, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import InsuranceFormWrapper from '../InsuranceFormWrapper';
import api from '../../utils/api';

const { Option } = Select;

const KaskoFormContent = ({ isAuthenticated, onSubmit }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleFinish = async (valuesFromForm) => {
        try {
            setLoading(true);
            console.log('[KaskoFormContent] Raw form values:', JSON.stringify(valuesFromForm));

            // 1. Только трансформация и сбор данных, специфичных для КАСКО
            const kaskoData = {
                carMake: valuesFromForm.carMake?.trim(),
                carModel: valuesFromForm.carModel?.trim(),
                carYear: valuesFromForm.carYear?.toString(),
                vinNumber: valuesFromForm.vinNumber?.trim()?.toUpperCase(),
                licensePlate: valuesFromForm.licensePlate?.trim(),
                carValue: valuesFromForm.carValue?.toString(),
                driverLicenseNumber: valuesFromForm.driverLicenseNumber?.trim(),
                driverExperienceYears: valuesFromForm.driverExperienceYears?.toString(),
                hasAntiTheftSystem: valuesFromForm.hasAntiTheftSystem?.toString() || "false",
                garageParking: valuesFromForm.garageParking?.toString() || "false",
                previousInsuranceNumber: valuesFromForm.previousInsuranceNumber?.trim() || null,
                duration: valuesFromForm.insuranceDuration?.toString()
            };

            // 2. Если пользователь не аутентифицирован, добавляем "owner" поля как есть
            // InsuranceFormWrapper позаботится об их преобразовании в firstName, lastName, middleName
            if (!isAuthenticated) {
                kaskoData.ownerFirstName = valuesFromForm.ownerFirstName;
                kaskoData.ownerLastName = valuesFromForm.ownerLastName;
                kaskoData.ownerMiddleName = valuesFromForm.ownerMiddleName;
            }
            
            console.log('[KaskoFormContent] Prepared kaskoData (to be sent to wrapper):', JSON.stringify(kaskoData));

            // Вызываем onSubmit из InsuranceFormWrapper с собранными данными
            const response = await onSubmit(kaskoData);
            
            if (response?.data) {
            navigate('/applications/success', { 
                state: { 
                    applicationId: response.data.id,
                        calculatedAmount: response.data.calculatedAmount,
                        isNewUser: !isAuthenticated, // Это все еще актуально
                        email: response.data.email, // email из ответа сервера
                        password: response.data.password // password из ответа сервера
                } 
            });
            }
            
        } catch (error) {
            console.error('[KaskoFormContent] KASKO application error:', {
                sentData: valuesFromForm,
                transformedDataForWrapper: error.config?.data ? JSON.parse(error.config.data) : undefined,
                error: error.message,
                response: error.response?.data
            });
            message.error(
                error.response?.data?.error || 
                (Array.isArray(error.response?.data) ? error.response.data.join(', ') : 'Ошибка при создании заявки')
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            className="insurance-form"
            autoComplete="off"
            initialValues={{
                hasAntiTheftSystem: false,
                garageParking: false,
                insuranceDuration: 12
            }}
        >
            <h2>Страхование КАСКО</h2>

            {!isAuthenticated && (
                <>
                    <Form.Item
                        name="ownerLastName"
                        label="Фамилия"
                        rules={[
                            { required: true, message: 'Пожалуйста, введите фамилию' },
                            { whitespace: true, message: 'Фамилия не может быть пустой' }
                        ]}
                    >
                        <Input placeholder="Введите фамилию" autoComplete="off" />
                    </Form.Item>

                    <Form.Item
                        name="ownerFirstName"
                        label="Имя"
                        rules={[
                            { required: true, message: 'Пожалуйста, введите имя' },
                            { whitespace: true, message: 'Имя не может быть пустым' }
                        ]}
                    >
                        <Input placeholder="Введите имя" autoComplete="off" />
                    </Form.Item>

                    <Form.Item
                        name="ownerMiddleName"
                        label="Отчество"
                        rules={[
                            { whitespace: true, message: 'Отчество не может быть пустым' }
                        ]}
                    >
                        <Input placeholder="Введите отчество" autoComplete="off" />
                    </Form.Item>
                </>
            )}

            <Form.Item
                name="insuranceDuration"
                label="Срок страхования"
                rules={[
                    { required: true, message: 'Пожалуйста, выберите срок страхования' }
                ]}
            >
                <Select placeholder="Выберите срок страхования">
                    <Option value={3}>3 месяца</Option>
                    <Option value={6}>6 месяцев</Option>
                    <Option value={12}>1 год</Option>
                    <Option value={24}>2 года</Option>
                    <Option value={36}>3 года</Option>
                </Select>
            </Form.Item>

            <Form.Item
                name="carMake"
                label="Марка автомобиля"
                rules={[
                    { required: true, message: 'Пожалуйста, введите марку автомобиля' },
                    { whitespace: true, message: 'Марка автомобиля не может быть пустой' }
                ]}
            >
                <Input placeholder="например, Toyota, BMW, Mercedes" autoComplete="off" />
            </Form.Item>

            <Form.Item
                name="carModel"
                label="Модель автомобиля"
                rules={[
                    { required: true, message: 'Пожалуйста, введите модель автомобиля' },
                    { whitespace: true, message: 'Модель автомобиля не может быть пустой' }
                ]}
            >
                <Input placeholder="например, Camry, 3-Series, C-Class" autoComplete="off" />
            </Form.Item>

            <Form.Item
                name="carYear"
                label="Год выпуска"
                rules={[
                    { required: true, message: 'Пожалуйста, введите год выпуска' },
                    { type: 'number', min: 1900, max: new Date().getFullYear(), message: 'Пожалуйста, введите корректный год' }
                ]}
            >
                <InputNumber
                    min={1900}
                    max={new Date().getFullYear()}
                    style={{ width: '100%' }}
                    placeholder="Введите год выпуска"
                    autoComplete="off"
                />
            </Form.Item>

            <Form.Item
                name="vinNumber"
                label="VIN номер"
                rules={[
                    { required: true, message: 'Пожалуйста, введите VIN номер' },
                    { len: 17, message: 'VIN номер должен содержать ровно 17 символов' },
                    { pattern: /^[A-HJ-NPR-Z0-9]+$/, message: 'Пожалуйста, введите корректный VIN номер' }
                ]}
            >
                <Input 
                    placeholder="Введите 17-значный VIN номер"
                    maxLength={17}
                    showCount
                    autoComplete="off"
                />
            </Form.Item>

            <Form.Item
                name="licensePlate"
                label="Государственный номер"
                rules={[
                    { required: true, message: 'Пожалуйста, введите государственный номер' },
                    { whitespace: true, message: 'Государственный номер не может быть пустым' }
                ]}
            >
                <Input placeholder="Введите государственный номер" autoComplete="off" />
            </Form.Item>

            <Form.Item
                name="carValue"
                label="Стоимость автомобиля"
                rules={[
                    { required: true, message: 'Пожалуйста, введите стоимость автомобиля' },
                    { type: 'number', min: 0.01, message: 'Стоимость автомобиля должна быть больше 0' }
                ]}
            >
                <InputNumber
                    min={0.01}
                    step={1000}
                    style={{ width: '100%' }}
                    formatter={value => `₽ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/₽\s?|(,*)/g, '')}
                    placeholder="Введите стоимость автомобиля"
                    autoComplete="off"
                />
            </Form.Item>

            <Form.Item
                name="driverLicenseNumber"
                label="Номер водительского удостоверения"
                rules={[
                    { required: true, message: 'Пожалуйста, введите номер водительского удостоверения' },
                    { whitespace: true, message: 'Номер водительского удостоверения не может быть пустым' }
                ]}
            >
                <Input placeholder="Введите номер водительского удостоверения" autoComplete="off" />
            </Form.Item>

            <Form.Item
                name="driverExperienceYears"
                label="Стаж вождения (лет)"
                rules={[
                    { required: true, message: 'Пожалуйста, введите стаж вождения' },
                    { type: 'number', min: 0, message: 'Стаж вождения не может быть отрицательным' }
                ]}
            >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="Введите стаж вождения" autoComplete="off" />
            </Form.Item>

            <Form.Item
                name="hasAntiTheftSystem"
                valuePropName="checked"
            >
                <Checkbox>Установлена противоугонная система</Checkbox>
            </Form.Item>

            <Form.Item
                name="garageParking"
                valuePropName="checked"
            >
                <Checkbox>Автомобиль хранится в гараже</Checkbox>
            </Form.Item>

            <Form.Item
                name="previousInsuranceNumber"
                label="Номер предыдущего полиса (если есть)"
            >
                <Input placeholder="Введите номер предыдущего полиса" autoComplete="off" />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
                    Оформить полис
                </Button>
            </Form.Item>
        </Form>
    );
};

const KaskoForm = () => {
    const handleSubmit = async (data) => {
        // Этот handleSubmit вызывается из InsuranceFormWrapper
        // data здесь уже должна быть полностью готова для API
        const url = data.email // Проверяем наличие email для определения URL
            ? '/api/insurance/unauthorized/kasko'
            : '/api/insurance/applications/kasko';
            
        const response = await api.post(url, data);
        return response;
    };

    return (
        <InsuranceFormWrapper onSubmit={handleSubmit}>
            <KaskoFormContent />
        </InsuranceFormWrapper>
    );
};

export default KaskoForm; 