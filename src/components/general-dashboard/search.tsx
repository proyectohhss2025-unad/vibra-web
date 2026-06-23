import '@/components/search/search.css';
import { XCircleIcon } from '@heroicons/react/solid';
import React, { useEffect, useMemo, useState } from 'react';
import "../../../app/globals.css";
import { items as sidebarItems } from '../layouts/sidebar/sidebar-option';

interface SearchProps {
  isOpen: boolean;
  onClose: () => void;
  setData: (data: any[]) => void;
  disabled: boolean;
  val: string;
  resolvedPermissions: { isSuperAdmin: boolean; serials: string[] } | null;
  children: React.ReactNode;
}

const SearchInAllPage: React.FC<SearchProps> = ({ isOpen, onClose, setData, disabled, val, resolvedPermissions, children }) => {
  const [show, setShow] = useState(isOpen);
  const [query, setQuery] = useState('');
  const [disabled_, setDisabled_] = useState(disabled);

  // Construir lista plana de funcionalidades accesibles según permisos
  const accessibleItems = useMemo(() => {
    const flat: { id: string; title: string; label: string; description: string; component: any; icon: string; }[] = [];

    // Si no hay permisos resueltos, mostrar todos los items activos
    const hasAccess = (item: any): boolean => {
      if (!resolvedPermissions) return true;
      if (resolvedPermissions.isSuperAdmin) return true;
      if (!item.sidebarSerial) return true;
      return resolvedPermissions.serials.includes(item.sidebarSerial);
    };

    sidebarItems.forEach((item: any) => {
      if (!item.isActive) return;

      if (item.children && item.children.length > 0) {
        // Items padre no se agregan a la búsqueda, solo sus hijos
        item.children.forEach((child: any) => {
          if (child.isActive && hasAccess(child)) {
            flat.push({
              id: child._id,
              title: child.label,
              label: child.label,
              description: child.description || item.label,
              component: child.component,
              icon: child.icon || '',
            });
          }
        });
      } else if (hasAccess(item)) {
        flat.push({
          id: item._id,
          title: item.label,
          label: item.label,
          description: item.description || '',
          component: item.component,
          icon: item.icon || '',
        });
      }
    });

    return flat;
  }, [resolvedPermissions]);

  useEffect(() => {
    if (val) {
      setQuery(val);
    }
  }, [val]);

  useEffect(() => {
    setShow(isOpen);
    if (disabled) {
      setQuery(val);
    }
  }, [isOpen, disabled, val]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const query = e.target.value.trim();

    if (query.length > 1) {

      const response = accessibleItems?.filter((item: any) => {
        const labelUpper = (item.label + "").toUpperCase();
        const descUpper = (item.description + "").toUpperCase();
        return labelUpper.includes(query.toUpperCase()) || descUpper.includes(query.toUpperCase());
      });

      if (response && response.length > 0) {
        setData(response);
      } else {
        setData([]);
      }
    } else {
      setData([]);
    }
  };

  const handleSearchClean = async () => {
    onClose();
    setQuery('');
    setData([]);
  };

  return (
    <div className="w-full">
      <div className="mt-0 w-full">
        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-400 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600 sm:max-w-md w-full bg-transparent">
          <span className="flex justify-start select-none items-center pl-3 pr-2 text-gray-500 sm:text-sm">Buscar: </span>
          <input
            type="text"
            name="query"
            id="query"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              handleSearch(e);
            }}
            disabled={disabled_}
            style={{ float: 'right', border: 'none' }}
            className="w-full py-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 my-1 mr-0 bg-transparent"
            placeholder="Buscar funcionalidad..."
            size={20}
          />
          {!disabled_ && <span className="flex select-none items-center pl-1 pr-2 text-gray-500 sm:text-sm" style={{ width: '60px' }}>
            {query && <XCircleIcon onClick={handleSearchClean} name="clean" className="h-6 w-6 text-blue-500" color="#EAEAEA" />}
          </span>}
          {disabled_ && <span className="flex select-none items-center pl-1 pr-2 text-gray-500 sm:text-sm" style={{ width: '40px' }}>
          </span>}
        </div>
        {children}
      </div>
    </div>
  );
};

export default SearchInAllPage;
