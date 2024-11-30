// supabase/supabase.js
import { createClient } from '@supabase/supabase-js';

// Reemplaza con tus propias credenciales de Supabase
const supabaseUrl = 'https://efoerjjzamedrddxdgnh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmb2Vyamp6YW1lZHJkZHhkZ25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgzNjE5OTEsImV4cCI6MjA0MzkzNzk5MX0.NKwLIeylp5f3oyODSKwlNjKbTaZ-fd2HvQLI2vW9zkY';

// Inicializa el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);


