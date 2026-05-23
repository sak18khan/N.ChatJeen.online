import { supabase } from './src/lib/supabaseClient';

async function diagnose() {
  console.log('--- Supabase Diagnosis ---');
  
  // 1. Check if social_rooms exists
  const { data, error } = await supabase.from('social_rooms').select('id').limit(1);
  if (error) {
    console.error('social_rooms error:', JSON.stringify(error, null, 2));
    if (error.code === '42P01') {
      console.error('CRITICAL: Table "social_rooms" does not exist. Please run the SQL in supabase_schema.sql.');
    }
  } else {
    console.log('social_rooms table found.');
  }

  // 2. Check users_temp modification
  const { data: utData, error: utError } = await supabase.from('users_temp').select('social_room_id').limit(1);
  if (utError) {
    console.error('users_temp error:', JSON.stringify(utError, null, 2));
    if (utError.message.includes('social_room_id')) {
      console.error('CRITICAL: Column "social_room_id" is missing from "users_temp". Please run the SQL migration.');
    }
  } else {
    console.log('users_temp table and column found.');
  }
}

diagnose();
