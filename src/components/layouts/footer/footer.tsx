'use client'

import { getSafeKeyFromStorage } from '@/utils/safe-token-storage';
import { PanelBottomCloseIcon, PanelTopCloseIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { COPYRIGHT, FULL_NAME, YEAR } from '../../../utils/constants';
import './footer.css';

const Footer = () => {
  const [isActive, setIsActive] = useState(false);
  const [home, setHome] = useState<any>();
  const [support, setSupport] = useState<any>();
  const [about, setAbout] = useState<any>();
  const [contact, setContact] = useState<any>();
  const [expandedFooter, setExpandedFooter] = useState(false);

  useEffect((): any => {
    setIsActive(!isActive);
    setHome('Inicio');
    setSupport('Soporte');
    setAbout('Acerca de');
    setContact('Contacto');
  }, []);

  useEffect(() => {
    const a = getSafeKeyFromStorage('expandedFooter');
    setExpandedFooter(Boolean(a));
    if (a === "true") {
      setIsActive(false);
    } else {
      setIsActive(true);
    }
  }, []);

  const toggleFooter = () => {
    setIsActive(!isActive);
    if (isActive) {
      setExpandedFooter(true);
      localStorage.setItem('expandedFooter', "true");
    } else {
      setExpandedFooter(false);
      localStorage.setItem('expandedFooter', "false");
    }
  };

  return (
    <footer className={isActive ? 'footer bg-gray-700' + ' ' + 'active' : 'footer inactive'}>
      <div className={'content'} >
        {!isActive && <PanelTopCloseIcon style={{ float: 'left' }} className="h-6 w-6 p-0 rounded-md text-white"
          onClick={toggleFooter} />}
        {isActive && <PanelBottomCloseIcon style={{ float: 'left' }} className="h-6 w-6 p-0 rounded-md text-white"
          onClick={toggleFooter} />}
        {isActive && <div><ul>
          <li>
            <Link href="/home-dashboard">{home}</Link>
          </li>
          <li>
            <Link href="/support">{support}</Link >
          </li>
          <li>
            <Link href="/about">{about}</Link >
          </li>
          <li>
            <Link href="/contact">{contact}</Link >
          </li>
        </ul>
          <p>{COPYRIGHT} &copy; {YEAR} - {FULL_NAME}</p>
        </div>}
      </div>
    </footer>
  );
};

export default Footer;