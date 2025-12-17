import { timeStamp } from 'console';
import { db } from '../db/database.js'


import { collection } from '../db/schema.js'
import { flashcard } from '../db/schema.js'
import { eq } from 'drizzle-orm'

export const createFlashCard = async (req, res) => {
    try {
        const { textFront, textBack, URLFront, URLBack, collectionID, userID } = req.body;
        
        const flashcardToInsert = {
            "textFront": textFront,
            "textBack": textBack,
            "URLFront": URLFront,
            "URLBack": URLBack,
            "collectionID":collectionID 
        }
        collectionOfFC = db.select().from(collection).where(eq(collection.id, collectionID))
        if(collection && collectionOfFC.owner_id == userID){
            await db.insert(flashcard).values(flashcardToInsert);
        }
        res.status(201).json({
            message: "Question insérée avec succès.",
            data: question
        })
    } catch (err) {
        res.status(500).json({
            error: 'Failed to create questions'
        })
    }
    //res.status(201).send({ message: 'Question insérée' });
};