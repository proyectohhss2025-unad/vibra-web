import { CurrencyDollarIcon } from '@heroicons/react/outline';
import React from 'react';

interface NumberToTextProps {
    number: string | number;
    className?: string;
}

const NumberToText: React.FC<NumberToTextProps> = ({ number, className }) => {
    const units = [
        "",
        "un",
        "dos",
        "tres",
        "cuatro",
        "cinco",
        "seis",
        "siete",
        "ocho",
        "nueve",
        "diez",
        "once",
        "doce",
        "trece",
        "catorce",
        "quince",
        "dieciséis",
        "diecisiete",
        "dieciocho",
        "diecinueve",
    ];
    const tens = [
        "",
        "",
        "veinte",
        "treinta",
        "cuarenta",
        "cincuenta",
        "sesenta",
        "setenta",
        "ochenta",
        "noventa",
    ];
    const hundreds = [
        "",
        "ciento",
        "doscientos",
        "trescientos",
        "cuatrocientos",
        "quinientos",
        "seiscientos",
        "setecientos",
        "ochocientos",
        "novecientos",
    ];

    const convertUnit = (n: number) => {
        if (n === 0) return "";
        if (n > 19) {
            return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " y " + units[n % 10] : "");
        } else {
            return units[n];
        }
    };

    const convertRecursiveNumber = (n: number): string => {
        if (n === 0) return "Cero";

        if (n < 20) {
            return convertUnit(n);
        } else if (n < 100) {
            return convertUnit(n);
        } else if (n < 1000) {
            return hundreds[Math.floor(n / 100)] + (n % 100 !== 0 ? " " + convertUnit(n % 100) : "");
        } else if (n < 1000000) {
            const miles = Math.floor(n / 1000);
            const remainder = n % 1000;

            if (miles > 0) {
                return convertRecursiveNumber(miles) + " mil" + (remainder !== 0 ? " " + convertRecursiveNumber(remainder) : "");
            } else {
                return convertRecursiveNumber(remainder);
            }
        } else if (n < 1000000000) {
            const millions = Math.floor(n / 1000000);
            const remainder = n % 1000000;

            if (millions > 1) {
                return convertRecursiveNumber(millions) + " millones" + (remainder !== 0 ? " " + convertRecursiveNumber(remainder) : "");
            } else if (millions > 0) {
                return convertRecursiveNumber(millions) + " millón" + (remainder !== 0 ? " " + convertRecursiveNumber(remainder) : "");
            } else {
                return convertRecursiveNumber(remainder);
            }
        } else if (n < 1000000000000) {
            return convertUnit(Math.floor(n / 1000000000)) + " mil millones" + (n % 1000000000 !== 0 ? " " + convertRecursiveNumber(n % 1000000000) : "");
        } else {
            return "Número fuera de rango";
        }
    };

    const num = typeof number === 'string' ? parseInt(number, 10) : number;

    return <div style={{ textTransform: 'capitalize' }} className={`${num == 0 ? 'text-white bg-red-600 rounded-md py-2.5' : 'rounded-md py-2.5'} ${className} relative flex items-center w-auto px-1 py-0 mt-0 mb-0 rounded-md capitalize`}>
        <CurrencyDollarIcon style={{ float: 'left' }} name="info" className="h-6 w-6 mr-2" />
        {convertRecursiveNumber(num)} pesos colombianos</div>;
};

export default NumberToText;