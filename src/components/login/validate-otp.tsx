import React, { useState, useEffect } from 'react';

interface OTPInputProps {
    onValidOTP: (otp: string) => void;
}

const OTPInput: React.FC<OTPInputProps> = ({ onValidOTP }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);

    useEffect(() => {
        // Focus on the first input field when the component mounts
        const firstInput = document.getElementById('otp-input-0');
        if (firstInput) {
            firstInput.focus();
        }
    }, []);

    const handleInputChange = (index: number, value: string) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move focus to the next input field if a valid digit is entered
        if (value.length === 1 && index < 5) {
            const nextInput = document.getElementById(`otp-input-${index + 1}`);
            if (nextInput) {
                nextInput.focus();
            }
        }

        // Handle backspace/delete to move focus to the previous input field
        if (value.length === 0 && index > 0) {
            const previousInput = document.getElementById(`otp-input-${index - 1}`);
            if (previousInput) {
                previousInput.focus();
            }
        }
    };

    const handleOTPSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const enteredOTP = otp.join('');
        onValidOTP(enteredOTP);
    };

    return (
        <form onSubmit={handleOTPSubmit}>
            <div className="otp-input-container">
                {otp.map((value, index) => (
                    <input
                        key={index+1}
                        id={`otp-input-${index}`}
                        type="tel"
                        inputMode="numeric"
                        maxLength={1}
                        value={value}
                        onChange={(event) => handleInputChange(index, event.target.value)}
                    />
                ))}
            </div>

            <button className='flex w-full justify-center rounded-md' type="submit">Validate OTP</button>
        </form>
    );
};

export default OTPInput;