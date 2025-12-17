import { db } from '../db/db.js';
import { collection, flashcard, study } from '../db/schema.js';
import { eq, and, lt } from 'drizzle-orm';

const DAY_MS = 24 * 60 * 60 * 1000;

const computeNextStudy = (level) => {
    const now = Date.now();
    return now + Math.pow(2, Math.max(0, level - 1)) * DAY_MS;
};

export const createFlashCard = async (req, res) => {
    try {
        const { textFront, textBack, URLFront, URLBack, collectionID } = req.validatedBody || req.body;
        const userId = req.auth?.sub;
        console.log(textFront, textBack, URLFront, URLBack, collectionID,userId);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        
        // vérifier que la collection existe et que l'utilisateur en est le propriétaire
        const cols = await db.select().from(collection).where(eq(collection.id, collectionID));
        if (cols.length === 0) return res.status(404).json({ error: 'Collection not found' });
        const col = cols[0];
        if (col.owner_id !== userId) return res.status(403).json({ error: 'Not owner of the collection' });

        const inserted = await db.insert(flashcard).values({
            collection_id: collectionID,
            front_side: textFront,
            back_side: textBack,
            front_url: URLFront || null,
            back_url: URLBack || null,
        }).returning();

        res.status(201).json({ message: 'Flashcard created', flashcard: inserted[0] });
    } catch (error) {
        console.error('createFlashCard error', error);
        res.status(500).json({ error: 'Server error while creating flashcard' });
    }
};

export const getFlashCardById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.auth?.sub;
        const isAdmin = req.auth?.is_admin;

        const results = await db.select().from(flashcard).where(eq(flashcard.id, id));
        if (results.length === 0) return res.status(404).json({ error: 'Flashcard not found' });
        const fc = results[0];

        // load collection to check visibility/ownership
        const cols = await db.select().from(collection).where(eq(collection.id, fc.collection_id));
        const col = cols[0];
        if (!col.is_public && col.owner_id !== userId && !isAdmin) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.status(200).json({ flashcard: fc });
    } catch (error) {
        console.error('getFlashCardById error', error);
        res.status(500).json({ error: 'Server error while retrieving flashcard' });
    }
};

export const listFlashCardsByCollection = async (req, res) => {
    try {
        const { collectionId } = req.params;
        const userId = req.auth?.sub;
        const isAdmin = req.auth?.is_admin;

        const cols = await db.select().from(collection).where(eq(collection.id, collectionId));
        if (cols.length === 0) return res.status(404).json({ error: 'Collection not found' });
        const col = cols[0];
        if (!col.is_public && col.owner_id !== userId && !isAdmin) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const cards = await db.select().from(flashcard).where(eq(flashcard.collection_id, collectionId));
        res.status(200).json({ count: cards.length, flashcards: cards });
    } catch (error) {
        console.error('listFlashCardsByCollection error', error);
        res.status(500).json({ error: 'Server error while listing flashcards' });
    }
};

export const getDueFlashCards = async (req, res) => {
    try {
        const { collectionId } = req.params;
        const userId = req.auth?.sub;
        const isAdmin = req.auth?.is_admin;

        const cols = await db.select().from(collection).where(eq(collection.id, collectionId));
        if (cols.length === 0) return res.status(404).json({ error: 'Collection not found' });
        const col = cols[0];
        if (col.owner_id !== userId && !isAdmin) return res.status(403).json({ error: 'Access denied' });

        const now = Date.now();

        // join study and flashcard for this user where next_study <= now
        const q = await db.select({ f: flashcard, s: study })
            .from(flashcard)
            .leftJoin(study, eq(study.flashcard_id, flashcard.id))
            .where(and(eq(flashcard.collection_id, collectionId), eq(study.user_id, userId), lt(study.next_study, now)));

        // q will be array of joined rows; map to flashcard objects
        const due = q.map(row => row.f);
        res.status(200).json({ count: due.length, flashcards: due });
    } catch (error) {
        console.error('getDueFlashCards error', error);
        res.status(500).json({ error: 'Server error while retrieving due flashcards' });
    }
};

export const updateFlashCard = async (req, res) => {
    try {
        const { id } = req.params;
        const { textFront, textBack, URLFront, URLBack } = req.validatedBody || req.body;
        const userId = req.auth?.sub;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const cards = await db.select().from(flashcard).where(eq(flashcard.id, id));
        if (cards.length === 0) return res.status(404).json({ error: 'Flashcard not found' });
        const card = cards[0];

        const cols = await db.select().from(collection).where(eq(collection.id, card.collection_id));
        const col = cols[0];
        if (col.owner_id !== userId) return res.status(403).json({ error: 'Not owner of the collection' });

        const updateData = {};
        if (textFront !== undefined) updateData.front_side = textFront;
        if (textBack !== undefined) updateData.back_side = textBack;
        if (URLFront !== undefined) updateData.front_url = URLFront;
        if (URLBack !== undefined) updateData.back_url = URLBack;

        const updated = await db.update(flashcard).set(updateData).where(eq(flashcard.id, id)).returning();
        res.status(200).json({ message: 'Flashcard updated', flashcard: updated[0] });
    } catch (error) {
        console.error('updateFlashCard error', error);
        res.status(500).json({ error: 'Server error while updating flashcard' });
    }
};

export const deleteFlashCard = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.auth?.sub;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const cards = await db.select().from(flashcard).where(eq(flashcard.id, id));
        if (cards.length === 0) return res.status(404).json({ error: 'Flashcard not found' });
        const card = cards[0];

        const cols = await db.select().from(collection).where(eq(collection.id, card.collection_id));
        const col = cols[0];
        if (col.owner_id !== userId) return res.status(403).json({ error: 'Not owner of the collection' });

        await db.delete(flashcard).where(eq(flashcard.id, id));
        res.status(200).json({ message: 'Flashcard deleted' });
    } catch (error) {
        console.error('deleteFlashCard error', error);
        res.status(500).json({ error: 'Server error while deleting flashcard' });
    }
};

export const reviewFlashCard = async (req, res) => {
    try {
        const { id } = req.params; // flashcard id
        const { correct } = req.validatedBody || req.body;
        const userId = req.auth?.sub;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const cards = await db.select().from(flashcard).where(eq(flashcard.id, id));
        if (cards.length === 0) return res.status(404).json({ error: 'Flashcard not found' });

        // find or create study row for this user and flashcard
        const studies = await db.select().from(study).where(and(eq(study.flashcard_id, id), eq(study.user_id, userId)));
        let s;
        if (studies.length === 0) {
            // create initial
            const initial = await db.insert(study).values({
                user_id: userId,
                flashcard_id: id,
                level: 1,
                created_at: Date.now(),
                last_study: Date.now(),
                next_study: computeNextStudy(1),
            }).returning();
            s = initial[0];
        } else {
            s = studies[0];
        }

        // update level depending on correctness
        let newLevel = s.level || 1;
        if (correct) {
            newLevel = Math.min(newLevel + 1, 20);
        } else {
            newLevel = 1;
        }

        const now = Date.now();
        const next = computeNextStudy(newLevel);

        const updated = await db.update(study).set({ level: newLevel, last_study: now, next_study: next }).where(eq(study.id, s.id)).returning();

        res.status(200).json({ message: 'Review recorded', study: updated[0] });
    } catch (error) {
        console.error('reviewFlashCard error', error);
        res.status(500).json({ error: 'Server error while reviewing flashcard' });
    }
};