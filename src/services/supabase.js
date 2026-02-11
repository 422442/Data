
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

    // We assume a 'students' table exists with a JSONB column 'data' or flat columns.
    // Given the schema complexity (406 fields), we likely stored the main searchable fields
    // as columns and the rest as JSONB, or everything in JSONB.
    // Method A: Everything is columns (ideal for performance but huge schema).
    // Method B: Main fields (name, roll_no, email) are columns.

    // Let's assume 'roll_no' and 'name' are columns in the 'students' table.

    const { data, error } = await supabase
        .from('students')
        .select('*')
        .or(`name.ilike.%${query}%,roll_no.ilike.%${query}%`)
        .limit(20);

    return { data, error };
};

export const getStudentById = async (id) => {
    const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', id)
        .single();

    return { data, error };
};
