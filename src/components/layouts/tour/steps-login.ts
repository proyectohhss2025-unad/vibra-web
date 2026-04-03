const steps = [
    {
        selector: '[data-tour="step-1"]',
        //content: "Enter the email with which you were registered in the system"
        content: "Ingresa el correo electrónico con el que te registraste en el sistema"
    },
    {
        selector: '[data-tour="step-2"]',
        content: "Ingrese el usuario asignado por el administrador del sistema"
        //content: "Enter the user assigned by the system administrator"
    },
    {
        selector: '[data-tour="step-3"]',
        content: "Ingrese la contraseña generada y enviada al correo electrónico registrado"
        //content: "Enter the password generated and sent to the registered email"
    },
    {
        selector: '[data-tour="step-4"]',
        content: "Fuerce una nueva contraseña si por alguna razón la pierde"
        //content: "Force a new password if for some reason you lose it"
    },
    {
        selector: '[data-tour="step-5"]',
        content: "Iniciar sesión en el sistema"
        //content: "Log in to the system"
    }
];

export default steps;
