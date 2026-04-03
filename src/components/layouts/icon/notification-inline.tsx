import { BellIcon } from '@heroicons/react/outline';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface NotificationProps {
  message: string;
  onClose: () => void;
}

const Notification = ({ message, onClose }: NotificationProps) => (
  <motion.div
    initial={{ opacity: 0, x: '-100%' }}
    animate={{ opacity: 1, x: '0%' }}
    exit={{ opacity: 0, x: '-100%' }}
    transition={{ duration: 0.5 }}
    className="bg-green-500 text-white px-4 py-1 mb-2 rounded shadow flex items-center justify-between"
  >
    <BellIcon name="drowndown" className="justify-start h-5 w-8 text-white-500 leading-6" color="#FFFFFF" />
    <span className='justify-start'>{message}</span>
    <button type='button' onClick={onClose} className="justify-end text-white hover:text-gray-600">
      X
    </button>
  </motion.div>
);

interface TransactionProps {
  id: string;
  userId: string;
  amount: number;
  createdAt: Date;
}

interface ItemActivityProps {
  openTransaction?: () => void;
  message: string;
  className?: string;
}

const NotificationInline: React.FC<ItemActivityProps> = ({ message, className }) => {
  const [transactions, setTransactions] = useState<TransactionProps[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    if (message != '') {
      setNotifications((prevNotifications) => [...prevNotifications, `${message}`]);
    }
  }, [message]);

  const addTransaction = (userId: string) => {
    const newTransaction: TransactionProps = {
      id: uuidv4(),
      userId,
      amount: Math.floor(Math.random() * 1000),
      createdAt: new Date(),
    };

    setTransactions([...transactions, newTransaction]);
    setNotifications((prevNotifications) => [
      ...prevNotifications,
      `Nuevo actividad del usuario ${userId}`,
    ]);
  };

  const closeNotification = (index: number) => {
    setNotifications(notifications.filter((_, i) => i !== index));
  };

  setTimeout(() => {
    setNotifications([]);
    // setMessage
  }, 24000);

  return (
    <div className={`container mx-auto ${className}`}>
      {/*<button
      type='button'
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => addTransaction('user1')}
      >
        Add Transaction for User 1
      </button>
      <button
      type='button'
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-4"
        onClick={() => addTransaction('user2')}
      >
        Add Transaction for User 2
      </button>*/}
      <div className="mt-2">
        {notifications.map((notification, index) => (
          <Notification key={`notification_${index+1}`} message={notification} onClose={() => closeNotification(index)} />
        ))}
      </div>
    </div>
  );
};

export default NotificationInline;
