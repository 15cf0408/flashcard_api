import { db } from '../db/db.js';
import { user } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';

/**
 * List all users (admin only)
 * Sorted by creation date (most recent first)
 * @param {*} req 
 * @param {*} res 
 */
export const listUsers = async (req, res) => {
    try {
        // Note: The schema doesn't have a created_at field on user table
        // We'll list all users, but ideally you should add a created_at field
        const allUsers = await db
            .select({
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                is_admin: user.is_admin
            })
            .from(user);

        res.status(200).json({
            count: allUsers.length,
            users: allUsers
        });
    } catch (error) {
        console.error('Error during listing users:', error);
        res.status(500).json({ error: 'Server error during users retrieval' });
    }
};

/**
 * Get a specific user by ID (admin only)
 * @param {*} req 
 * @param {*} res 
 */
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db
            .select({
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                is_admin: user.is_admin
            })
            .from(user)
            .where(eq(user.id, id));

        if (result.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ user: result[0] });
    } catch (error) {
        console.error('Error during retrieving user:', error);
        res.status(500).json({ error: 'Server error during user retrieval' });
    }
};

/**
 * Delete a user by ID (admin only)
 * This will cascade delete all their collections and flashcards (onDelete: 'cascade')
 * @param {*} req 
 * @param {*} res 
 */
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const result = await db
            .select()
            .from(user)
            .where(eq(user.id, id));

        if (result.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete the user (cascade will delete collections, flashcards, and study records)
        await db.delete(user).where(eq(user.id, id));

        res.status(200).json({
            message: 'User deleted successfully (including all their collections, flashcards, and study records)'
        });
    } catch (error) {
        console.error('Error during deleting user:', error);
        res.status(500).json({ error: 'Server error during user deletion' });
    }
};
