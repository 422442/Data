
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Key is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_KEY in .env');
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
);

// --- Auth Functions ---
export const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    return { data, error };
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
};

export const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

// --- Data Functions ---
/**
 * Search for students by roll number or name.
 * Uses a full text search or ILIKE query on the 'students' table.
 */
export const searchStudents = async (query) => {
    if (!query) return { data: [], error: null };

    const { data, error } = await supabase
        .from('students')
        .select('id, name, roll_no')
        .or(`name.ilike.%${query}%,roll_no.ilike.%${query}%`)
        .limit(20);

    return { data, error };
};
