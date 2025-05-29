import React, { useState } from 'react';
import { Form, Input, Button, InputNumber, Checkbox, message, Modal, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import InsuranceFormWrapper from '../InsuranceFormWrapper';
import api from '../../utils/api';

const { Option } = Select;

const KaskoForm = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            setLoading(true);
            console.log('Raw form values:', values);

            // Transform the values with proper validation
            const transformedValues = {
                carMake: values.carMake?.trim(),
                carModel: values.carModel?.trim(),
                carYear: Number(values.carYear),
                vinNumber: values.vinNumber?.trim()?.toUpperCase(),
                licensePlate: values.licensePlate?.trim(),
                carValue: Number(values.carValue),
                driverLicenseNumber: values.driverLicenseNumber?.trim(),
                driverExperienceYears: Number(values.driverExperienceYears),
                hasAntiTheftSystem: Boolean(values.hasAntiTheftSystem),
                garageParking: Boolean(values.garageParking),
                previousInsuranceNumber: values.previousInsuranceNumber?.trim() || null,
                duration: Number(values.insuranceDuration)
            };

            // Определяем URL в зависимости от статуса аутентификации
            const url = values.isAuthenticated 
                ? '/api/insurance/applications/kasko'
                : '/api/insurance/unauthorized/kasko';

            // Если пользователь не аутентифицирован, добавляем данные пользователя
            if (!values.isAuthenticated) {
                transformedValues.email = values.email?.trim();
                transformedValues.firstName = values.ownerFirstName?.trim();
                transformedValues.lastName = values.ownerLastName?.trim();
                transformedValues.middleName = values.ownerMiddleName?.trim() || '';
            }

            // Отправляем данные на сервер
            const response = await api.post(url, transformedValues);
            
            // Если пользователь не авторизован, сохраняем токены
            if (!values.isAuthenticated && response.data.accessToken) {
                localStorage.setItem('token', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);
            }
            
            // Перенаправляем на страницу успешной подачи заявки
            navigate('/applications/success', { 
                state: { 
                    applicationId: response.data.id,
                    calculatedAmount: response.data.calculatedAmount,
                    isNewUser: !values.isAuthenticated,
                    email: response.data.email,
                    password: response.data.password // Используем пароль из ответа сервера
                } 
            });
            
        } catch (error) {
            message.error(error.response?.data?.error || 'Ошибка при создании заявки');
        } finally {
            setLoading(false);
        }
    };

    const FormContent = ({ onSubmit, isAuthenticated }) => (
        <Form
            form={form}
            layout="vertical"
            onFinish={(values) => onSubmit({ ...values, isAuthenticated })}
            className="insurance-form"
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
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Пожалуйста, введите email' },
                            { type: 'email', message: 'Пожалуйста, введите корректный email' }
                        ]}
                    >
                        <Input placeholder="Введите email" />
                    </Form.Item>

                    <Form.Item
                        name="ownerLastName"
                        label="Фамилия"
                        rules={[
                            { required: true, message: 'Пожалуйста, введите фамилию' },
                            { whitespace: true, message: 'Фамилия не может быть пустой' }
                        ]}
                    >
                        <Input placeholder="Введите фамилию" />
                    </Form.Item>

                    <Form.Item
                        name="ownerFirstName"
                        label="Имя"
                        rules={[
                            { required: true, message: 'Пожалуйста, введите имя' },
                            { whitespace: true, message: 'Имя не может быть пустым' }
                        ]}
                    >
                        <Input placeholder="Введите имя" />
                    </Form.Item>

                    <Form.Item
                        name="ownerMiddleName"
                        label="Отчество"
                    >
                        <Input placeholder="Введите отчество" />
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
                <Input placeholder="например, Toyota, BMW, Mercedes" />
            </Form.Item>

            <Form.Item
                name="carModel"
                label="Модель автомобиля"
                rules={[
                    { required: true, message: 'Пожалуйста, введите модель автомобиля' },
                    { whitespace: true, message: 'Модель автомобиля не может быть пустой' }
                ]}
            >
                <Input placeholder="например, Camry, 3-Series, C-Class" />
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
                <Input placeholder="Введите государственный номер" />
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
                <Input placeholder="Введите номер водительского удостоверения" />
            </Form.Item>

            <Form.Item
                name="driverExperienceYears"
                label="Стаж вождения (лет)"
                rules={[
                    { required: true, message: 'Пожалуйста, введите стаж вождения' },
                    { type: 'number', min: 0, message: 'Стаж вождения не может быть отрицательным' }
                ]}
            >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="Введите стаж вождения" />
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
                <Input placeholder="Введите номер предыдущего полиса" />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
                    Оформить полис
                </Button>
            </Form.Item>
        </Form>
    );

    return (
        <InsuranceFormWrapper onSubmit={onFinish}>
            <FormContent />
        </InsuranceFormWrapper>
    );
};

export default KaskoForm; 