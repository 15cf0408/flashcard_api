import { db } from '../db/db.js';
import { collection, flashcard, study } from '../db/schema.js';
import { eq, and, sql, count } from 'drizzle-orm';

/**
 * Get user dashboard statistics
 * @param {*} req 
 * @param {*} res 
 */
export const getDashboardStats = async (req, res) => {
    try {
        const userId = req.auth.sub;

        // Count user's collections
        const userCollections = await db
            .select({ count: count() })
            .from(collection)
            .where(eq(collection.owner_id, userId));

        // Count total flashcards in user's collections
        const totalFlashcards = await db
            .select({ count: count() })
            .from(flashcard)
            .innerJoin(collection, eq(flashcard.collection_id, collection.id))
            .where(eq(collection.owner_id, userId));

        // Count flashcards reviewed by user
        const reviewedFlashcards = await db
            .select({ count: count() })
            .from(study)
            .where(eq(study.user_id, userId));

        // Count flashcards due today
        const now = Date.now();
        const dueFlashcards = await db
            .select({ count: count() })
            .from(study)
            .where(and(
                eq(study.user_id, userId),
                sql`${study.next_study} <= ${now}`
            ));

        // Calculate average level
        const avgLevel = await db
            .select({ avg: sql`AVG(${study.level})` })
            .from(study)
            .where(eq(study.user_id, userId));

        res.status(200).json({
            collections: userCollections[0].count,
            totalFlashcards: totalFlashcards[0].count,
            reviewedFlashcards: reviewedFlashcards[0].count,
            dueFlashcards: dueFlashcards[0].count,
            averageLevel: avgLevel[0].avg ? parseFloat(avgLevel[0].avg).toFixed(2) : 0
        });
    } catch (error) {
        console.error('Error during dashboard stats:', error);
        res.status(500).json({ error: 'Server error during stats retrieval' });
    }
};

/**
 * Get statistics for a specific collection
 * @param {*} req 
 * @param {*} res 
 */
export const getCollectionStats = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.auth.sub;
        const isAdmin = req.auth.is_admin;

        // Check collection access
        const cols = await db.select().from(collection).where(eq(collection.id, id));
        if (cols.length === 0) return res.status(404).json({ error: 'Collection not found' });
        
        const col = cols[0];
        if (!col.is_public && col.owner_id !== userId && !isAdmin) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Count total flashcards
        const totalFlashcards = await db
            .select({ count: count() })
            .from(flashcard)
            .where(eq(flashcard.collection_id, id));

        // Count reviewed flashcards by user
        const reviewedFlashcards = await db
            .select({ count: count() })
            .from(flashcard)
            .innerJoin(study, eq(study.flashcard_id, flashcard.id))
            .where(and(
                eq(flashcard.collection_id, id),
                eq(study.user_id, userId)
            ));

        // Count flashcards due
        const now = Date.now();
        const dueFlashcards = await db
            .select({ count: count() })
            .from(flashcard)
            .innerJoin(study, eq(study.flashcard_id, flashcard.id))
            .where(and(
                eq(flashcard.collection_id, id),
                eq(study.user_id, userId),
                sql`${study.next_study} <= ${now}`
            ));

        // Count never reviewed
        const neverReviewed = totalFlashcards[0].count - reviewedFlashcards[0].count;

        // Calculate average level for this collection
        const avgLevel = await db
            .select({ avg: sql`AVG(${study.level})` })
            .from(study)
            .innerJoin(flashcard, eq(study.flashcard_id, flashcard.id))
            .where(and(
                eq(flashcard.collection_id, id),
                eq(study.user_id, userId)
            ));

        // Level distribution
        const levelDist = await db
            .select({ 
                level: study.level, 
                count: count() 
            })
            .from(study)
            .innerJoin(flashcard, eq(study.flashcard_id, flashcard.id))
            .where(and(
                eq(flashcard.collection_id, id),
                eq(study.user_id, userId)
            ))
            .groupBy(study.level);

        res.status(200).json({
            collection: {
                id: col.id,
                title: col.title,
                is_public: col.is_public
            },
            stats: {
                totalFlashcards: totalFlashcards[0].count,
                reviewedFlashcards: reviewedFlashcards[0].count,
                neverReviewed: neverReviewed,
                dueFlashcards: dueFlashcards[0].count + neverReviewed, // Due = never reviewed + expired
                averageLevel: avgLevel[0].avg ? parseFloat(avgLevel[0].avg).toFixed(2) : 0,
                levelDistribution: levelDist
            }
        });
    } catch (error) {
        console.error('Error during collection stats:', error);
        res.status(500).json({ error: 'Server error during stats retrieval' });
    }
};
