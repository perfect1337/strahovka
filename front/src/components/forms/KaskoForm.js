import React, { useState } from 'react';
import { Form, Input, Button, InputNumber, Checkbox, message, Modal, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import InsuranceFormWrapper from '../InsuranceFormWrapper';
import api from '../../utils/api';

const { Option } = Select;

const KaskoFormContent = ({ isAuthenticated, onSubmit, isPartOfPackage }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleFinish = async (valuesFromForm) => {
        try {
            // Проверяем валидность формы
            await form.validateFields();
            
            console.log('[KaskoFormContent] handleFinish triggered. isPartOfPackage:', isPartOfPackage, 'Values:', valuesFromForm);
            setLoading(true);

            // Трансформация и сбор данных для КАСКО
            const kaskoData = {
                carMake: valuesFromForm.carMake?.trim(),
                carModel: valuesFromForm.carModel?.trim(),
                carYear: valuesFromForm.carYear,
                vinNumber: valuesFromForm.vinNumber?.trim()?.toUpperCase(),
                licensePlate: valuesFromForm.licensePlate?.trim(),
                carValue: valuesFromForm.carValue,
                driverLicenseNumber: valuesFromForm.driverLicenseNumber?.trim(),
                driverExperienceYears: valuesFromForm.driverExperienceYears,
                hasAntiTheftSystem: Boolean(valuesFromForm.hasAntiTheftSystem),
                garageParking: Boolean(valuesFromForm.garageParking),
                previousInsuranceNumber: valuesFromForm.previousInsuranceNumber?.trim() || null,
                duration: valuesFromForm.insuranceDuration
            };

            // Если форма является частью пакета, используем onSubmit из props
            if (isPartOfPackage) {
                await onSubmit(kaskoData);
                return;
            }

            // Стандартная логика для отдельной формы КАСКО
            const response = await api.post('/api/insurance/applications/kasko', kaskoData);
            
            if (response.data) {
                message.success('Заявка на КАСКО успешно отправлена');
                navigate('/profile');
            }
        } catch (error) {
            console.error('Error in handleFinish:', error);
            message.error(error.response?.data?.message || 'Ошибка при отправке формы');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            initialValues={{
                insuranceDuration: 12,
                hasAntiTheftSystem: false,
                garageParking: false
            }}
        >
            <Form.Item
                label="Марка автомобиля"
                name="carMake"
                rules={[{ required: true, message: 'Введите марку автомобиля' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Модель автомобиля"
                name="carModel"
                rules={[{ required: true, message: 'Введите модель автомобиля' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Год выпуска"
                name="carYear"
                rules={[{ required: true, message: 'Введите год выпуска' }]}
            >
                <InputNumber min={1900} max={new Date().getFullYear()} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
                label="VIN номер"
                name="vinNumber"
                rules={[
                    { required: true, message: 'Введите VIN номер' },
                    { pattern: /^[A-HJ-NPR-Z0-9]{17}$/i, message: 'Неверный формат VIN номера' }
                ]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Гос. номер"
                name="licensePlate"
                rules={[{ required: true, message: 'Введите гос. номер' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Стоимость автомобиля"
                name="carValue"
                rules={[{ required: true, message: 'Введите стоимость автомобиля' }]}
            >
                <InputNumber
                    min={1}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    style={{ width: '100%' }}
                />
            </Form.Item>

            <Form.Item
                label="Номер водительского удостоверения"
                name="driverLicenseNumber"
                rules={[{ required: true, message: 'Введите номер водительского удостоверения' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Стаж вождения (лет)"
                name="driverExperienceYears"
                rules={[{ required: true, message: 'Введите стаж вождения' }]}
            >
                <InputNumber min={0} max={99} style={{ width: '100%' }} />
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
                <Checkbox>Гаражное хранение</Checkbox>
            </Form.Item>

            <Form.Item
                label="Номер предыдущего полиса КАСКО (если есть)"
                name="previousInsuranceNumber"
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Срок страхования (месяцев)"
                name="insuranceDuration"
                rules={[{ required: true, message: 'Выберите срок страхования' }]}
            >
                <Select>
                    <Option value={3}>3 месяца</Option>
                    <Option value={6}>6 месяцев</Option>
                    <Option value={12}>1 год</Option>
                </Select>
            </Form.Item>

            <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    style={{ width: '100%' }}
                >
                    {isPartOfPackage ? 'Далее' : 'Оформить полис'}
                </Button>
            </Form.Item>
        </Form>
    );
};

const KaskoForm = ({ isPartOfPackage, packageId, onSubmit: parentOnSubmit }) => {
    const handleSubmit = async (data) => {
        try {
            if (isPartOfPackage && packageId) {
                // Если форма является частью пакета, используем parentOnSubmit
                return await parentOnSubmit(data);
            }

            // Стандартная логика для отдельной формы КАСКО
            const response = await api.post('/api/insurance/applications/kasko', data);
            return response;
        } catch (error) {
            console.error('Error in KaskoForm handleSubmit:', error);
            throw error;
        }
    };

    return (
        <InsuranceFormWrapper onSubmit={handleSubmit}>
            <KaskoFormContent isPartOfPackage={isPartOfPackage} />
        </InsuranceFormWrapper>
    );
};

export default KaskoForm; 