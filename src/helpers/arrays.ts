export function compareArraysByProperty<T>(
    array1: T[],
    array2: T[],
    property1: keyof T,
    property2: keyof T,
    property3: keyof T,
): T[] {
    const commonElements: T[] = [];
    for (const element1 of array1) {
        for (const element2 of array2) {
            if (element1[property1] === element2[property3] + "" + element2[property2]) {
                commonElements.push(element1);
                break;
            }
        }
    }
    return commonElements;
}