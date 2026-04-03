import React, { useState } from 'react';

const PhoneNumberMask: React.FC = () => {
    const [phoneNumber, setPhoneNumber] = useState('');

    const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();

        const { value } = event.target;
        const formattedValue = formatPhoneNumber_(value);
        setPhoneNumber(formattedValue);
    };


    // Define a function to format the phone number
    const formatPhoneNumber_ = (phoneNumber: string): string => {
        // Remove all non-digit characters
        const cleanedNumber = phoneNumber.replaceAll(/\D/g, '');

        // Format the number with parentheses and hyphens
        const formattedNumber = `(${cleanedNumber.slice(0, 3)})-${cleanedNumber.slice(3, 6)}-${cleanedNumber.slice(6, 10)}`;

        return formattedNumber;
    }

    return (
        <input
            type="tel"
            placeholder="(310)-247-7988"
            value={phoneNumber}
            onChange={(e) => handlePhoneChange(e)}
        />
    );
};

export default PhoneNumberMask;