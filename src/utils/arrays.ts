
export const mapArrayToString = (obj: any): string => {
    if (!obj.myArray || obj.myArray.length === 0) {
        return "";
    }

    const mappedString = obj.myArray.map((item, index) => {
        if (index === obj.myArray.length - 1) {
            return item;
        }

        return `${item}, `;
    }).join('');

    return mappedString;
};

export const updateArrayFromString = (obj: any, inputValue: string): any => {
    if (!inputValue || inputValue.trim() === "") {
        return obj;
    }

    const newValues = inputValue.split(",").map(value => value.trim());

    if (obj.myArray) {
        obj.myArray = [...obj.myArray, ...newValues];
    } else {
        obj.myArray = newValues;
    }

    return obj;
};

export function searchReportsByName(reports?: any[], searchTerm?: string): any[] | undefined {
    const searchTermUpper = searchTerm?.toUpperCase();

    return reports?.filter(report => {
        const activityNameUpper = (report?.name + "").toUpperCase();
        return activityNameUpper.includes(searchTermUpper ?? '');
    });
}