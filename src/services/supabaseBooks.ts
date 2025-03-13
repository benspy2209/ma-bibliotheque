
import { createClient } from '@supabase/supabase-js';
import { Book } from '@/types/book';

const supabaseUrl = 'https://ckeptymeczykfnbfcfuq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrZXB0eW1lY3p5a2ZuYmZjZnVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4MDM2MzEsImV4cCI6MjA1NzM3OTYzMX0.bwd0xD497DJmS5TN7UtNXVav-tB_5j0g6k2mgGENczo';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Les variables d\'environnement Supabase ne sont pas configurées.');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    storage: window.localStorage
  }
});

export async function saveBook(book: Book) {
  const { error } = await supabase
    .from('books')
    .upsert({
      id: book.id,
      book_data: book,
      status: book.status,
      completion_date: book.completionDate,
    });

  if (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    throw error;
  }
}

export async function loadBooks() {
  const { data, error } = await supabase
    .from('books')
    .select('book_data')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur lors du chargement des livres:', error);
    throw error;
  }

  return data?.map(row => row.book_data as Book) ?? [];
}

export async function deleteBook(bookId: string) {
  if (!bookId) {
    throw new Error('ID du livre non fourni');
  }

  const { error } = await supabase
    .from('books')
    .delete()
    .match({ id: bookId });

  if (error) {
    console.error('Erreur Supabase:', error);
    throw new Error(`Erreur lors de la suppression : ${error.message}`);
  }
}
