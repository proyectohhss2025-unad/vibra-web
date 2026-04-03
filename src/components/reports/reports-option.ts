import { getSafeKeyFromStorage } from '@/utils/safe-token-storage';

export const items = [{
    "_id": "1",
    "name": "Home",
    "href": "/home-dashboard",
    "label": getSafeKeyFromStorage('Home'),
    "color": "#EAEAEA",
    "icon": "PrinterIcon",
    "description": getSafeKeyFromStorage("More info..."),
    "type": "general",
    "children": [
        {
            "_id": "9",
            "name": "partitions",
            "href": "#",
            "label": 'Participaciones',
            "color": "#EAEAEA",
            "icon": "PrinterIcon",
            "description": 'Todas las participaciones de la comunidad',
            "detailsIncluded": 'Columnas: id_participacion, id_comunidad, id_usuario, fecha_participacion, estado, observaciones, updated.',
            "type": "activity",
            "viewInFastMenu": true,
            "isActive": true
        }
    ]
}
];