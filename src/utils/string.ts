/**
 * Copies the given text to the user's clipboard.
 * 
 * @param {string} text The text to copy.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the copy operation was successful, `false` otherwise.
 */
export const copyContent = async (text: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(text);
        console.log('Content copied to clipboard');
        return true
    } catch (err) {
        console.error('Error copying: ', err);
        return false;
    }
}

/**
 * Splits an alphanumeric string into its text and number parts.
 *
 * @param {string} chain - The alphanumeric string to be decomposed.
 * @returns {{string: string; number: number}} - An object containing the text and number parts of the string.
 *
 * @example
 * decomposeAlphanumeric('12A123'); // { string: '12A', number: 123 }
 * decomposeAlphanumeric('A123B456'); // { string: 'A123B', number: 456 }
 */
export function decomposeAlphanumeric(chain: string): { string: string; number: number } {
    let indexFirstNonDigit = 0;
    try {
        indexFirstNonDigit = chain.search(/\D/g);
    } catch (e) {
        return { string: '', number: Number(chain) };
    }

    if (indexFirstNonDigit === -1) {
        return { string: '', number: Number(chain) };
    }

    const aux = countNonNumericCharacters(chain);

    const lettersPart = chain.slice(0, indexFirstNonDigit + aux);
    const numericalPart = Number(chain.slice(indexFirstNonDigit + aux));

    return { string: lettersPart, number: numericalPart };
}

/**
 * Counts the number of non-numeric characters in a given string.
 *
 * @param {string} chain - The string to count non-numeric characters in.
 * @returns {number} - The number of non-numeric characters in the string.
 *
 * @example
 * countNonNumericCharacters('A123B'); // returns 2
 * countNonNumericCharacters('123'); // returns 0
 * countNonNumericCharacters('ABC'); // returns 3
 */
function countNonNumericCharacters(chain: string): number {
    const regexNonNumeric = /\D/g;
    const coincidences = chain.match(regexNonNumeric);
    if (!coincidences) {
        return 0;
    }

    return coincidences.length;
}