export const generateUsername = (fullName: string): string => {
    const name = fullName.toLowerCase();
    const parts = name.split(' ');
    const initials = parts.slice(0, 2).map(part => part[0]).join('');
    const username = initials;
    return username + '' + parts[1]?.toString();
};