import React, { useState } from 'react';
import { Form, Input, Button, InputNumber, Checkbox, message } from 'antd';
import { createKaskoApplication } from '../../api/insurance';

const KaskoForm = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

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
                previousInsuranceNumber: values.previousInsuranceNumber?.trim() || null
            };

            // Validate required fields before sending
            const requiredFields = {
                carMake: 'Марка автомобиля',
                carModel: 'Модель автомобиля',
                carYear: 'Год выпуска',
                vinNumber: 'VIN номер',
                licensePlate: 'Государственный номер',
                carValue: 'Стоимость автомобиля',
                driverLicenseNumber: 'Номер водительского удостоверения',
                driverExperienceYears: 'Стаж вождения (лет)'
            };

            const missingFields = Object.entries(requiredFields)
                .filter(([key, label]) => {
                    const value = transformedValues[key];
                    return value === null || value === undefined || value === '' || 
                           (typeof value === 'number' && isNaN(value));
                })
                .map(([_, label]) => label);

            if (missingFields.length > 0) {
                throw new Error(`Пожалуйста, заполните все обязательные поля: ${missingFields.join(', ')}`);
            }

            console.log('Sending transformed values:', transformedValues);

            // Send the data
            const response = await createKaskoApplication(transformedValues);
            console.log('Application submitted successfully:', response);
            message.success('Заявка на КАСКО отправлена успешно');
            form.resetFields();
        } catch (error) {
            console.error('Form submission error:', error);
            if (error.response?.data) {
                if (Array.isArray(error.response.data)) {
                    error.response.data.forEach(errorMsg => {
                        message.error(errorMsg);
                    });
                } else if (typeof error.response.data === 'string') {
                    message.error(error.response.data);
                } else if (error.response.status === 401) {
                    message.error('Пожалуйста, войдите в систему для отправки заявки');
                } else {
                    message.error('Не удалось отправить заявку на КАСКО. Пожалуйста, проверьте все обязательные поля.');
                }
            } else if (error.message) {
                message.error(error.message);
            } else {
                message.error('Не удалось отправить заявку на КАСКО. Пожалуйста, проверьте все обязательные поля.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="insurance-form"
            initialValues={{
                hasAntiTheftSystem: false,
                garageParking: false
            }}
            onValuesChange={(changedValues, allValues) => {
                console.log('Form values changed:', changedValues, allValues);
            }}
        >
            <h2>Страхование КАСКО</h2>

            <Form.Item
                name="carMake"
                label="Марка автомобиля"
                rules={[
                    { required: true, message: 'Пожалуйста, введите марку автомобиля' },
                    { whitespace: true, message: 'Марка автомобиля не может быть пустой' },
                    { transform: value => value?.trim() }
                ]}
                normalize={value => value?.trim()}
            >
                <Input placeholder="например, Toyota, BMW, Mercedes" />
            </Form.Item>

            <Form.Item
                name="carModel"
                label="Модель автомобиля"
                rules={[
                    { required: true, message: 'Пожалуйста, введите модель автомобиля' },
                    { whitespace: true, message: 'Модель автомобиля не может быть пустой' },
                    { transform: value => value?.trim() }
                ]}
                normalize={value => value?.trim()}
            >
                <Input placeholder="например, Camry, 3-Series, C-Class" />
            </Form.Item>

            <Form.Item
                name="carYear"
                label="Год выпуска"
                rules={[
                    { required: true, message: 'Пожалуйста, введите год выпуска' },
                    { type: 'number', min: 1900, max: new Date().getFullYear() + 1, message: 'Пожалуйста, введите корректный год' }
                ]}
                normalize={value => value ? parseInt(value) : null}
            >
                <InputNumber
                    min={1900}
                    max={new Date().getFullYear() + 1}
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
                normalize={value => value?.trim()?.toUpperCase()}
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
                normalize={value => value?.trim()}
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
                normalize={value => value ? parseFloat(value) : null}
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
                normalize={value => value?.trim()}
            >
                <Input placeholder="Введите номер водительского удостоверения" />
            </Form.Item>

            <Form.Item
                name="driverExperienceYears"
                label="Стаж вождения (лет)"
                rules={[
                    { required: true, message: 'Пожалуйста, введите стаж вождения' },
                    { type: 'number', min: 0, max: 70, message: 'Пожалуйста, введите корректное количество лет (0-70)' }
                ]}
                normalize={value => value ? parseInt(value) : null}
            >
                <InputNumber
                    min={0}
                    max={70}
                    style={{ width: '100%' }}
                    placeholder="Введите стаж вождения"
                />
            </Form.Item>

            <Form.Item
                name="hasAntiTheftSystem"
                valuePropName="checked"
                normalize={value => Boolean(value)}
            >
                <Checkbox>Установлена противоугонная система</Checkbox>
            </Form.Item>

            <Form.Item
                name="garageParking"
                valuePropName="checked"
                normalize={value => Boolean(value)}
            >
                <Checkbox>Автомобиль хранится в гараже</Checkbox>
            </Form.Item>

            <Form.Item
                name="previousInsuranceNumber"
                label="Номер предыдущего полиса (если есть)"
                normalize={value => value?.trim() || null}
            >
                <Input placeholder="Введите номер предыдущего полиса страхования" />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
                    Отправить заявку на КАСКО
                </Button>
            </Form.Item>
        </Form>
    );
};

export default KaskoForm; 