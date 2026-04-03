// components/DatePicker.tsx
import React from 'react';
import DatePicker from 'react-datepicker';
import { useForm } from 'react-hook-form';

import "./datePicker.css";

/* interface CustomDatePickerProps extends DatePickerProps {
    renderCustomInput: (props: any) => JSX.Element;
} */
// registerLocale('es', es);

const DatePickerComponent: React.FC/*<CustomDatePickerProps>*/ = () => {
    let selectedDate: Date | null = null;
    const { register, handleSubmit, formState: { errors } } = useForm();

    const handleFechaChange = (fecha: Date | null) => {
        selectedDate = fecha;
    };

    return (
        <form onSubmit={handleSubmit(() => console.log('Fecha seleccionada:', selectedDate))}>
            <div className="mb-4">
                <label className="block font-medium text-sm text-gray-700">Fecha:</label>
                <DatePicker
                    selected={selectedDate}
                    dateFormat="dd/MM/yyyy"
                    locale="es"
                    onChange={handleFechaChange}
                    /*renderCustomInput={(props) => (
                        <input
                            {...props}
                            className={'border rounded-md p-2'}
                        />
                    )}*/
                />
            </div>
            <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">Seleccionar</button>
        </form>
    );
};

export default DatePickerComponent;