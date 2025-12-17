import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'
import { db } from './db.js'
import { user, collection, flashcard, study } from './schema.js'

async function seed() {
    const [adminPassword, userPassword] = await Promise.all([
        bcrypt.hash('admin123', 10),
        bcrypt.hash('user123', 10),
    ])

    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000

    const userIds = {
        alice : randomUUID(),
        bruno: randomUUID(),                        
        claire: randomUUID(),
    }

    const collectionIds = {
        js: randomUUID(),
        api: randomUUID(),
        en: randomUUID(),
    }

    const flashcardIds = {
        map: randomUUID(),
        letConst: randomUUID(),
        http201: randomUUID(),
        putPatch: randomUUID(),
        price: randomUUID(),
        checkin: randomUUID(),
    }

    const users = [
        {
            id: userIds.alice,
            first_name: 'Alice',
            last_name: 'Durand',
            email: 'alice@example.com',
            password: adminPassword,
            is_admin: true,
        },
        {
            id: userIds.bruno,
            first_name: 'Bruno',
            last_name: 'Lefevre',
            email: 'bruno@example.com',
            password: userPassword,
            is_admin: false,
        },
        {
            id: userIds.claire,
            first_name: 'Claire',
            last_name: 'Nguyen',
            email: 'claire@example.com',
            password: userPassword,
            is_admin: false,
        },
    ]

    const collections = [
        {
            id: collectionIds.js,
            owner_id: userIds.alice,
            title: 'JavaScript pour debutants',
            description: 'Cartes sur les bases JS (types, scope, async)',
            is_public: true,
        },
        {
            id: collectionIds.api,
            owner_id: userIds.bruno,
            title: 'API REST',
            description: 'Principes et bonnes pratiques pour une API HTTP',
            is_public: true,
        },
        {
            id: collectionIds.en,
            owner_id: userIds.claire,
            title: 'Vocabulaire anglais',
            description: 'Phrases courantes pour voyager',
            is_public: false,
        },
    ]

    const flashcards = [
        {
            id: flashcardIds.map,
            collection_id: collectionIds.js,
            front_side: 'A quoi sert la methode Array.map ?',
            back_side: 'A transformer un tableau en appliquant une fonction a chaque element.',
            front_url: null,
            back_url: null,
        },
        {
            id: flashcardIds.letConst,
            collection_id: collectionIds.js,
            front_side: 'Quelle difference entre let et const ?',
            back_side: 'let permet la reassignment, const fige la reference. Les deux sont blocs-scopes.',
            front_url: null,
            back_url: null,
        },
        {
            id: flashcardIds.http201,
            collection_id: collectionIds.api,
            front_side: 'Code HTTP pour une ressource creee ?',
            back_side: '201 Created, avec un header Location vers la ressource.',
            front_url: null,
            back_url: null,
        },
        {
            id: flashcardIds.putPatch,
            collection_id: collectionIds.api,
            front_side: 'Difference entre PUT et PATCH ?',
            back_side: 'PUT remplace la ressource, PATCH applique des modifications partielles.',
            front_url: null,
            back_url: null,
        },
        {
            id: flashcardIds.price,
            collection_id: collectionIds.en,
            front_side: 'How much is it?',
            back_side: 'Combien cela coute ?',
            front_url: null,
            back_url: null,
        },
        {
            id: flashcardIds.checkin,
            collection_id: collectionIds.en,
            front_side: 'I would like to check in, please.',
            back_side: 'Je voudrais faire le check-in, s il vous plait.',
            front_url: null,
            back_url: null,
        },
    ]

    const studies = [
        {
            id: randomUUID(),
            user_id: userIds.alice,
            level: 2,
            flashcard_id: flashcardIds.map,
            created_at: now - 5 * oneDay,
            last_study: now - oneDay,
            next_study: now + oneDay,
        },
        {
            id: randomUUID(),
            user_id: userIds.alice,
            level: 1,
            flashcard_id: flashcardIds.letConst,
            created_at: now - 2 * oneDay,
            last_study: now - 12 * 60 * 60 * 1000,
            next_study: now + 2 * oneDay,
        },
        {
            id: randomUUID(),
            user_id: userIds.bruno,
            level: 3,
            flashcard_id: flashcardIds.http201,
            created_at: now - 10 * oneDay,
            last_study: now - 2 * oneDay,
            next_study: now + 4 * oneDay,
        },
        {
            id: randomUUID(),
            user_id: userIds.bruno,
            level: 2,
            flashcard_id: flashcardIds.putPatch,
            created_at: now - 6 * oneDay,
            last_study: now - 2 * oneDay,
            next_study: now + 3 * oneDay,
        },
        {
            id: randomUUID(),
            user_id: userIds.claire,
            level: 1,
            flashcard_id: flashcardIds.price,
            created_at: now - oneDay,
            last_study: now - 6 * 60 * 60 * 1000,
            next_study: now + oneDay,
        },
    ]

    await db.transaction(async (tx) => {
        await tx.delete(study)
        await tx.delete(flashcard)
        await tx.delete(collection)
        await tx.delete(user)

        await tx.insert(user).values(users)
        await tx.insert(collection).values(collections)
        await tx.insert(flashcard).values(flashcards)
        await tx.insert(study).values(studies)
    })

    console.log('Seeding completed.')
}

seed().catch((error) => {
    console.error('Error during seeding:', error)
})
