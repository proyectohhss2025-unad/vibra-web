import React from 'react';

interface WhatsAppChatProps<T> {
    isIcon: boolean;
}

const WhatsAppChat: React.FC<WhatsAppChatProps<any>> = ({ isIcon }) => {
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

    if (!whatsappNumber) {
        return (
            <div className="bg-red-500 text-white p-4 rounded-md">
                Error: No hay un numero de WhatsApp configurado
            </div>
        );
    }

    if (isIcon) {
        return (
            <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-4 py-3 rounded-md bg-green-500 text-white hover:bg-green-600 mt-3 focus:outline-none focus-shadow-outline"
            >
                <img
                    src="/whatsapp.svg"
                    alt="Icono de WhatsApp"
                    className="w-6 h-6 mr-2"
                />
                Contactar por WhatsApp
            </a>
        );
    }

    return (
        <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 focus:outline-none focus-shadow-outline"
        >
            <i className="fab fa-whatsapp text-lg mr-2"></i>
            Contactar por WhatsApp
        </a>
    );
};

export default WhatsAppChat;