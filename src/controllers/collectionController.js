import { db } from '../db/db.js';
import { collection, user } from '../db/schema.js';
import { eq, and, like } from 'drizzle-orm';

/**
 * Créer une collection
 * @param {*} req 
 * @param {*} res  
 */
export const createCollection = async (req, res) => {
    try {
        const { title, description, is_public } = req.validatedBody || req.body;
        const userId = req.auth?.sub;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const newCollection = await db.insert(collection).values({
            owner_id: userId,
            title: title.trim(),
            description: description ? description.trim() : '',
            is_public: is_public !== undefined ? is_public : false
        }).returning();

        res.status(201).json({
            message: 'Collection created successfully',
            collection: newCollection[0]
        });
    } catch (error) {
        console.error('Error during creating collection:', error);
        res.status(500).json({ error: 'Server error during collection creation' });
    }
};

/**
 * Consulter une collection par ID
 * @param {*} req 
 * @param {*} res  
 */
export const getCollectionById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.auth?.sub;
        const isAdmin = req.auth?.is_admin;

        const result = await db
            .select()
            .from(collection)
            .where(eq(collection.id, id));

        if (result.length === 0) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        const collectionData = result[0];

        // Vérifier les permissions
        // Collection privée : accessible uniquement au propriétaire ou admin
        if (!collectionData.is_public) {
            if (collectionData.owner_id !== userId && !isAdmin) {
                return res.status(403).json({ error: 'Access denied: this collection is private' });
            }
        }

        res.status(200).json({ collection: collectionData });
    } catch (error) {
        console.error('Error during retrieving collection:', error);
        res.status(500).json({ error: 'Server error during collection retrieval' });
    }
};

/**
 * Lister ses propres collections
 * @param {*} req 
 * @param {*} res 
 */
export const getMyCollections = async (req, res) => {
    try {
        const userId = req.auth?.sub;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const myCollections = await db
            .select()
            .from(collection)
            .where(eq(collection.owner_id, userId));

        res.status(200).json({
            count: myCollections.length,
            collections: myCollections
        });
    } catch (error) {
        console.error('Error during retrieving collections:', error);
        res.status(500).json({ error: 'Server error during collections retrieval' });
    }
};

/**
 * Rechercher des collections publiques par titre
 * @param {*} req 
 * @param {*} res 
 */
export const searchPublicCollections = async (req, res) => {
    try {
        const { q } = req.query; // ?q=terme_recherche

        if (!q || q.trim() === '') {
            return res.status(400).json({ error: 'Missing search parameter' });
        }

        const results = await db
            .select()
            .from(collection)
            .where(
                and(
                    eq(collection.is_public, true),
                    like(collection.title, `%${q.trim()}%`)
                )
            );

        res.status(200).json({
            count: results.length,
            collections: results
        });
    } catch (error) {
        console.error('Error during searching collections:', error);
        res.status(500).json({ error: 'Server error during search' });
    }
};

/**
 * Modifier une collection par ID si l'utilisateur est le propriétaire
 * @param {*} req 
 * @param {*} res 
 */
export const updateCollection = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, is_public } = req.validatedBody || req.body;
        const userId = req.auth?.sub;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // Vérifier que la collection existe et appartient à l'utilisateur
        const result = await db
            .select()
            .from(collection)
            .where(eq(collection.id, id));

        if (result.length === 0) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        const collectionData = result[0];

        if (collectionData.owner_id !== userId) {
            return res.status(403).json({ error: 'Access denied: you are not the owner of this collection' });
        }

        // Préparer les données de mise à jour
        const updateData = {};
        if (title !== undefined) updateData.title = title.trim();
        if (description !== undefined) updateData.description = description.trim();
        if (is_public !== undefined) updateData.is_public = is_public;

        const updated = await db
            .update(collection)
            .set(updateData)
            .where(eq(collection.id, id))
            .returning();

        res.status(200).json({
            message: 'Collection updated successfully',
            collection: updated[0]
        });
    } catch (error) {
        console.error('Error during updating collection:', error);
        res.status(500).json({ error: 'Server error during collection update' });
    }
};

/**
 * Supprimer une collection par ID si l'utilisateur est le propriétaire
 * @param {*} req
 * @param {*} res
 * /
 */
export const deleteCollection = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.auth?.sub;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // Vérifier que la collection existe et appartient à l'utilisateur
        const result = await db
            .select()
            .from(collection)
            .where(eq(collection.id, id));

        if (result.length === 0) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        const collectionData = result[0];

        if (collectionData.owner_id !== userId) {
            return res.status(403).json({ error: 'Access denied: you are not the owner of this collection' });
        }

        // Supprimer la collection (les flashcards seront supprimées en cascade)
        await db.delete(collection).where(eq(collection.id, id));

        res.status(200).json({
            message: 'Collection deleted successfully'
        });
    } catch (error) {
        console.error('Error during deleting collection:', error);
        res.status(500).json({ error: 'Server error during collection deletion' });
    }
};
