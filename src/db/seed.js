import bcrypt from 'bcrypt'
import { db } from './db.js'
import { user, collection, flashcard, study } from './schema.js'

async function seed() {
    const [adminPassword, userPassword] = await Promise.all([
        bcrypt.hash('admin123', 10),
        bcrypt.hash('user123', 10),
    ])

    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000

    const users = [
        {
            id: 1,
            first_name: 'Alice',
            last_name: 'Durand',
            email: 'alice@example.com',
            password: adminPassword,
            is_admin: true,
        },
        {
            id: 2,
            first_name: 'Bruno',
            last_name: 'Lefevre',
            email: 'bruno@example.com',
            password: userPassword,
            is_admin: false,
        },
        {
            id: 3,
            first_name: 'Claire',
            last_name: 'Nguyen',
            email: 'claire@example.com',
            password: userPassword,
            is_admin: false,
        },
    ]

    const collections = [
        {
            id: 1,
            owner_id: 1,
            title: 'JavaScript pour debutants',
            description: 'Cartes sur les bases JS (types, scope, async)',
            is_public: true,
        },
        {
            id: 2,
            owner_id: 2,
            title: 'API REST',
            description: 'Principes et bonnes pratiques pour une API HTTP',
            is_public: true,
        },
        {
            id: 3,
            owner_id: 3,
            title: 'Vocabulaire anglais',
            description: 'Phrases courantes pour voyager',
            is_public: false,
        },
    ]

    const flashcards = [
        {
            id: 1,
            collection_id: 1,
            front_side: 'A quoi sert la methode Array.map ?',
            back_side: 'A transformer un tableau en appliquant une fonction a chaque element.',
            front_url: null,
            back_url: null,
        },
        {
            id: 2,
            collection_id: 1,
            front_side: 'Quelle difference entre let et const ?',
            back_side: 'let permet la reassignment, const fige la reference. Les deux sont blocs-scopes.',
            front_url: null,
            back_url: null,
        },
        {
            id: 3,
            collection_id: 2,
            front_side: 'Code HTTP pour une ressource creee ?',
            back_side: '201 Created, avec un header Location vers la ressource.',
            front_url: null,
            back_url: null,
        },
        {
            id: 4,
            collection_id: 2,
            front_side: 'Difference entre PUT et PATCH ?',
            back_side: 'PUT remplace la ressource, PATCH applique des modifications partielles.',
            front_url: null,
            back_url: null,
        },
        {
            id: 5,
            collection_id: 3,
            front_side: 'How much is it?',
            back_side: 'Combien cela coute ?',
            front_url: null,
            back_url: null,
        },
        {
            id: 6,
            collection_id: 3,
            front_side: 'I would like to check in, please.',
            back_side: 'Je voudrais faire le check-in, s il vous plait.',
            front_url: null,
            back_url: null,
        },
    ]

    const studies = [
        {
            id: 1,
            user_id: 1,
            level: 2,
            flashcard_id: 1,
            created_at: now - 5 * oneDay,
            last_study: now - oneDay,
            next_study: now + oneDay,
        },
        {
            id: 2,
            user_id: 1,
            level: 1,
            flashcard_id: 2,
            created_at: now - 2 * oneDay,
            last_study: now - 12 * 60 * 60 * 1000,
            next_study: now + 2 * oneDay,
        },
        {
            id: 3,
            user_id: 2,
            level: 3,
            flashcard_id: 3,
            created_at: now - 10 * oneDay,
            last_study: now - 2 * oneDay,
            next_study: now + 4 * oneDay,
        },
        {
            id: 4,
            user_id: 2,
            level: 2,
            flashcard_id: 4,
            created_at: now - 6 * oneDay,
            last_study: now - 2 * oneDay,
            next_study: now + 3 * oneDay,
        },
        {
            id: 5,
            user_id: 3,
            level: 1,
            flashcard_id: 5,
            created_at: now - oneDay,
            last_study: now - 6 * 60 * 60 * 1000,
            next_study: now + oneDay,
        },
    ]

    await db.transaction(async (tx) => {
        // await tx.delete(study)
        // await tx.delete(flashcard)
        // await tx.delete(collection)
        // await tx.delete(user)

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
