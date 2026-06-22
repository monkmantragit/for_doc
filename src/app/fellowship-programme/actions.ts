'use server';

import { createFellowshipApplicationItem } from '@/lib/directus';

export async function createFellowshipApplication(prevState: any, formData: FormData) {
    try {
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const phone = formData.get('phone') as string;
        const qualification = formData.get('qualification') as string;
        const message = formData.get('message') as string;

        // specific validation can be improved with zod
        if (!name || !email || !phone || !qualification) {
            return {
                success: false,
                message: 'Missing required fields',
            };
        }

        // Stored in Directus (collection: fellowship_applications) so the admin
        // can review applications there, rather than in the team-wide admin.
        await createFellowshipApplicationItem({
            name,
            email,
            phone,
            qualification,
            message,
        });

        return {
            success: true,
            message: 'Application submitted successfully',
        };
    } catch (error) {
        console.error('Error creating fellowship application:', error);
        return {
            success: false,
            message: 'Failed to submit application. Please try again later.',
        };
    }
}
