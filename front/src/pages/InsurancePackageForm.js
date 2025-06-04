import React from 'react';
import { useParams } from 'react-router-dom';
import InsurancePackageManager from '../components/InsurancePackageManager';

const InsurancePackageForm = () => {
    const { id } = useParams();

    if (!id) {
        return <div>Ошибка: ID пакета не указан</div>;
    }

    return (
        <InsurancePackageManager packageId={id} />
    );
};

export default InsurancePackageForm; 