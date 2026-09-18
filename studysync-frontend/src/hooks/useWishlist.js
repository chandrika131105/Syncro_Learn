import { useState, useEffect, useCallback } from 'react';
import { addToWishlist, removeFromWishlist } from '../services/api';

/**
 * Custom hook to manage Wishlist logic with Optimistic UI updates.
 * @param {string|number} courseId - The ID of the course.
 * @param {boolean} initialStatus - Initial wishlist status (e.g. from props or parent).
 * @param {Function} [onStatusChange] - Optional callback to notify parent of changes.
 * @returns {Object} { isWishlisted, toggleWishlist, loading }
 */
export const useWishlist = (courseId, initialStatus = false, onStatusChange) => {
    const [isWishlisted, setIsWishlisted] = useState(initialStatus);
    const [loading, setLoading] = useState(false);

    // Sync local state if initialStatus changes (e.g. parent fetches fresh data)
    useEffect(() => {
        setIsWishlisted(initialStatus);
    }, [initialStatus]);

    const toggleWishlist = useCallback(async (e) => {
        if (e) e.stopPropagation();
        if (loading) return;

        // 1. Optimistic Update
        const previousState = isWishlisted;
        const newState = !previousState;
        setIsWishlisted(newState);

        // Notify parent immediately for UI responsiveness
        if (onStatusChange) {
            onStatusChange(courseId, newState);
        }

        try {
            setLoading(true);
            // 2. Perform API Call
            if (newState) {
                await addToWishlist(courseId);
            } else {
                await removeFromWishlist(courseId);
            }
            // Success: State is already correct.
        } catch (error) {
            console.error("Wishlist toggle failed:", error);
            // 3. Revert on Error
            setIsWishlisted(previousState);
            if (onStatusChange) {
                onStatusChange(courseId, previousState);
            }
        } finally {
            setLoading(false);
        }
    }, [courseId, isWishlisted, loading, onStatusChange]);

    return { isWishlisted, toggleWishlist, loading };
};
