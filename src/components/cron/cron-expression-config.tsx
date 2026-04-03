import React, { useState } from 'react';

//FIX: TErminar de generar las validaciones para los campos basados en sus valores.
function CronExpressionConfig() {
    const [expression, setExpression] = useState({
        minute: '*',
        hour: '*',
        dayOfMonth: '*',
        month: '*',
        dayOfWeek: '*',
        year: '*',
    });

    /*
    * 
    Minuto y Hora: Deben ser números entre 0 y 59 o 23, respectivamente.
    Día del mes: Puede ser un número entre 1 y 31, un asterisco (), un incremento (/n), o el último día del mes (L).
    Mes: Puede ser un número entre 1 y 12, un asterisco, o un incremento.
    Día de la semana: Puede ser un número entre 0 (domingo) y 7 (domingo), un asterisco, un incremento, o el último día de la semana (L).
    Año: Puede ser un número de 4 dígitos o un asterisco.
    */

    const handleChangeCron = (field, value) => {
        const regex = {
            minute: /^[0-5]?\d$/,
            hour: /^[0-2]?\d$/,
            dayOfMonth: /^(?:[1-31]|[*][\/]\d+|L)$/,
            month: /^(?:1[0-2]|0?[1-9])|[*][\/]\d+$/,
            dayOfWeek: /^(?:[0-7]|[*][\/]\d+|L)$/,
            year: /^\d{4}|\*$/,
        };

        if (regex[field]?.test(value) || value === '*') {
            setExpression({ ...expression, [field]: value });
        } else {
            alert(`El valor ingresado para "${field}" no es válido. Debe cumplir con el formato: ${regex[field].source}`);
        }
    };

    // Función para actualizar un campo específico
    const handleChange = (field, value) => {
        setExpression({ ...expression, [field]: value });
    };

    // Función para generar la expresión completa
    const generateExpression = () => {
        const { minute, hour, dayOfMonth, month, dayOfWeek, year } = expression;
        return `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek} ${year}`;
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Configuración de Expresión Cron</h2>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="minute" className="block text-sm font-medium text-gray-700">
                        Minuto (0-59)
                    </label>
                    <input
                        type="text"
                        id="minute"
                        value={expression.minute}
                        onChange={(e) => handleChange('minute', e.target.value)}
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                        hora (opcional)
                    </label>
                    <input
                        type="text"
                        id="year"
                        value={expression.hour}
                        onChange={(e) => handleChange('hour', e.target.value)}
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                        dia (opcional)
                    </label>
                    <input
                        type="text"
                        id="year"
                        value={expression.dayOfWeek}
                        onChange={(e) => handleChange('dayOfWeek', e.target.value)}
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                        dia del mes (opcional)
                    </label>
                    <input
                        type="text"
                        id="year"
                        value={expression.dayOfMonth}
                        onChange={(e) => handleChange('dayOfMonth', e.target.value)}
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                        Año (opcional)
                    </label>
                    <input
                        type="text"
                        id="year"
                        value={expression.year}
                        onChange={(e) => handleChange('year', e.target.value)}
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>
            <div className="mt-4">
                <p>Expresión Cron Generada:</p>
                <code className="bg-gray-100 p-2 rounded">{generateExpression()}</code>
            </div>
        </div>
    );
}

export default CronExpressionConfig;