import React, { useState } from 'react';
import { Form, Input, Button, InputNumber, Checkbox, message, Modal, Select } from 'antd';
import { createKaskoApplication, processKaskoPayment } from '../../api/insurance';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const KaskoForm = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [currentApplication, setCurrentApplication] = useState(null);
    const navigate = useNavigate();

    const handlePayment = async () => {
        try {
            setLoading(true);
            await processKaskoPayment(currentApplication.id);
            message.success('Оплата прошла успешно');
            setShowPaymentModal(false);
            navigate('/profile'); // Redirect to profile page after payment
        } catch (error) {
            message.error('Ошибка при оплате: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

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
                insuranceDuration: Number(values.insuranceDuration)
            };

            // Create application
            const application = await createKaskoApplication(transformedValues);
            setCurrentApplication(application);
            
            // Show success message and redirect to profile
            message.success('Заявка успешно создана. Перейдите в личный кабинет для оплаты полиса.');
            navigate('/profile');
            
        } catch (error) {
            message.error('Ошибка при создании заявки: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                className="insurance-form"
                initialValues={{
                    hasAntiTheftSystem: false,
                    garageParking: false,
                    insuranceDuration: 12
                }}
                onValuesChange={(changedValues, allValues) => {
                    console.log('Form values changed:', changedValues, allValues);
                }}
            >
                <h2>Страхование КАСКО</h2>

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

            <Modal
                title="Оплата страхового полиса"
                open={showPaymentModal}
                onCancel={() => setShowPaymentModal(false)}
                footer={[
                    <Button key="back" onClick={() => setShowPaymentModal(false)}>
                        Отмена
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={loading}
                        onClick={handlePayment}
                    >
                        Оплатить
                    </Button>,
                ]}
            >
                <p>Ваша заявка успешно создана. Для активации полиса необходимо произвести оплату.</p>
                <p>Сумма к оплате: {currentApplication?.calculatedAmount} ₽</p>
            </Modal>
        </>
    );
};

export default KaskoForm; 