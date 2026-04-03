import { InformationCircleIcon } from '@heroicons/react/solid';
import { motion } from 'framer-motion';
import React from 'react';
import './notification.css';

interface NotificationProps {
    type: 'success' | 'info' | 'warning' | 'error'; // Define notification types
    message: string;
    setMessage: (value: any) => void;
    onClose: () => void; // Optional callback for closing the notification
}

const Notification: React.FC<NotificationProps> = ({ type, message, setMessage, onClose }) => {
    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };

    const setTime = setTimeout(() => {
        setMessage('');
        clearTimeout(setTime)
        onClose();
    }, 8000);

    return (
        <motion.div
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: '0%' }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ duration: 0.5 }}
            className={`notification ${type}`}
        >
            <InformationCircleIcon className='h-8 w-8 pr-2' />
            <p>{message}</p>
            <span className="closeButton p-2" onClick={handleClose}>
                &times;
            </span>
        </motion.div >
    );
};

export default Notification;