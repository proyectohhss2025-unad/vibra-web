import React, { useState, useEffect } from 'react';
//import { MongoClient } from 'mongodb';

interface DatabaseEntry {
    name: string;
    collections: string[];
}

const DatabaseList: React.FC = () => {
    const [databases, setDatabases] = useState<DatabaseEntry[]>([]);

    useEffect(() => {
        const fetchDatabases = async () => {
            /*try {
                const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017'); // Reemplaza con URI de conexión
                await client.connect();
                const adminDb = client.db('admin');
                const databaseList = await adminDb.admin().listDatabases();
                const formattedDatabases: DatabaseEntry[] = databaseList.databases.map(
                    (database) => ({
                        name: database.name,
                        collections: [],
                    })
                );
                // Obtén las colecciones de cada base de datos
                for (const database of formattedDatabases) {
                    const db = client.db(database.name);
                    database.collections = await db.listCollections().toArray();
                    database.collections = database.collections.map(
                        (collection) => collection
                    );
                }
                setDatabases(formattedDatabases);
                await client.close();
            } catch (error) {
                console.error('Error fetching databases:', error);
            }*/
        };

        fetchDatabases();
    }, []);

    return (
        <div className="container mx-auto mt-10">
            <h1 className="text-3xl font-bold mb-5">Lista de Bases de Datos</h1>
            <ul className="list-disc">
                {databases.map((database) => (
                    <li key={database.name} className="mb-2">
                        <div className="flex items-center">
                            <span className="font-bold text-lg">{database.name}</span>
                            <ul className="ml-5 list-disc">
                                {database.collections.map((collection) => (
                                    <li key={collection} className="ml-4">
                                        {collection}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DatabaseList;