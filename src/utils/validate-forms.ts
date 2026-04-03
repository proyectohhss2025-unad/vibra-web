export function isValidEmail(email: string): boolean {
    let validEmail = false;
    ("use strict");

    var EMAIL_REGEX =
        /^[a - zA - Z0-9. ! #$ %& ’ *  +/=?^_` { | }~ - ] + @[a - zA - Z0-9 - ] + (?:\.[a - zA - Z0-9 - ] + ) * $/;

    if (email.match(EMAIL_REGEX)) {
        validEmail = true;
    }
    return validEmail;
}

export function isValidDate(date: Date): boolean {
    try {
        if (Number.isNaN(date.getTime())) {
            return false;
        }

        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        if (year < 1900 || year > 2100) {
            return false;
        }

        if (month < 1 || month > 12) {
            return false;
        }

        const daysInMonth = GetDayOnMonth(month, year);
        if (day < 1 || day > daysInMonth) {
            return false;
        }
        console.log('isValidDate:', date)

        return true;
    } catch (e) {
        return false;
    }
}

export function GetDayOnMonth(month: number, year: number): number {
    if ([4, 6, 9, 11].includes(month)) {
        return 30;
    } else if (month === 2) {
        if (isLeap(year)) {
            return 29;
        } else {
            return 28;
        }
    } else {
        return 31;
    }
}

export function isLeap(year: number): boolean {
    if (year % 4 !== 0) {
        return false;
    }
    if (year % 100 === 0 && year % 400 !== 0) {
        return false;
    }
    return true;
}