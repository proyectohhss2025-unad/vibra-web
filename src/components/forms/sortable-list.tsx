import React, { useState, useRef, useEffect } from 'react';

interface Item {
    id: string;
    name: string;
    order: number;
}

interface SortableListProps<T> {
    items: T[];
    onUpdate: (items: T[]) => Promise<void>;
}

const SortableList: React.FC<SortableListProps<any>> = ({ items, onUpdate }) => {

    const [listItems, setListItems] = useState<any[]>(items);
    const listRef = useRef<HTMLUListElement>(null);

    const handleDragStart = (e: React.DragEvent, itemId: string) => {
        e.dataTransfer.setData('text/plain', itemId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        const draggedItemId = e.dataTransfer.getData('text/plain');

        // Encuentra los índices del elemento arrastrado y el destino.
        const draggedItemIndex = listItems.findIndex((item) => item._id === draggedItemId);
        const targetIndex = Array.from(listRef.current?.children || []).indexOf(e.target as HTMLElement);

        if (draggedItemIndex !== -1 && targetIndex !== -1) {
            // Reordena la lista y actualiza la propiedad 'order'.
            const updatedItems = [...listItems];
            const [draggedItem] = updatedItems.splice(draggedItemIndex, 1);
            updatedItems.splice(targetIndex, 0, draggedItem);
            updatedItems.forEach((item, index) => {
                item.flowPositionInProcess = index; // Actualiza el orden del item
            });
            setListItems(updatedItems);

            // Actualiza la API.
            await onUpdate(updatedItems);
        }
    };

    useEffect(() => {
        setListItems(items);
    }, [items]);

    return (
        <ul
            ref={listRef}
            className="list-none p-0"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {listItems.map((item) => (
                <li
                    key={item._id}
                    className="cursor-move py-1 px-3 bg-gray-100 rounded-md m-1"
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, item._id)}
                >
                    [{item.flowPositionInProcess}] <strong>{item.name}</strong> - {item.description}  -
                </li>
            ))}
        </ul>
    );
};

export default SortableList;