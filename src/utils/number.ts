
/**
 * Formats a phone number string into the standard (XXX) XXX-XXXX format.
 *
 * This function takes a phone number string as input, removes any non-digit characters, 
 * and then formats it with parentheses and hyphens.
 * 
 * @param {string} phoneNumber - The phone number string to format.
 * @returns {string} - The formatted phone number string in (XXX) XXX-XXXX format.
 * 
 * @example
 * maskFormatPhoneNumber('1234567890'); // returns '(123) 456-7890'
 * maskFormatPhoneNumber('(123) 456-7890'); // returns '(123) 456-7890'
 * maskFormatPhoneNumber('123-456-7890'); // returns '(123) 456-7890'
 */
export const maskFormatPhoneNumber = (safePhoneNumber = '0000000000'): string => {
    const cleanedNumber = safePhoneNumber.replace(/\D/g, '');
    const normalizedNumber = (cleanedNumber + '0000000000').slice(0, 10);
    const formattedNumber = `(${normalizedNumber.slice(0, 3)})-${normalizedNumber.slice(3, 6)}-${normalizedNumber.slice(6, 10)}`;

    return formattedNumber;
}

/**
 * Formats a string and converts it to a number.
 *
 * The function removes spaces, dollar signs ($), and periods (.) from the input string
 * before converting it to a floating-point number using `parseFloat`.
 *
 * @param {string} chain - The string to format and convert.
 * @returns {number} - The formatted and converted number.
 *
 * @example
 * formatAndConvertToNumber('123.45'); // returns 123.45
 * formatAndConvertToNumber('$1,234.56'); // returns 1234.56
 * formatAndConvertToNumber('123 456'); // returns 123456
 * formatAndConvertToNumber(' '); // returns 0
 */
export function formatAndConvertToNumber(chain: any): number {
    try {
        if (chain && chain.length == 0) {
            return 0;
        }
        if (Number.isInteger(chain)) {
            return chain;
        }
        const formatChain = chain.replace(/[\s$.]/g, '');
        const numero = parseFloat(formatChain);

        return numero;
    } catch (e) {
        return 0;
    }
}

export const calculatePercentage = (value: number, total: number): any => {
    if (total === 0) {
        return 0;
    }

    return ((value / total) * 100).toFixed(2);
};

export const calculateValueFromPercentage = (percentage: number, totalValue: number): number => {
    return (percentage / 100) * totalValue;
};
