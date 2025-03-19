
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Book } from '@/types/book'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function removeDuplicateBooks(books: Book[]): Book[] {
  const seen = new Set();
  
  return books.filter(book => {
    // Créer une clé unique basée sur le titre et le premier auteur
    const key = `${book.title.toLowerCase()}_${Array.isArray(book.author) ? book.author[0].toLowerCase() : book.author.toLowerCase()}`;
    
    if (seen.has(key)) {
      return false;
    }
    
    seen.add(key);
    return true;
  });
}

// Liste de mots-clés techniques pour le post-filtrage
const TECHNICAL_KEYWORDS = [
  'manuel', 'guide', 'prospection', 'minier', 'minière', 'géologie', 'scientifique',
  'technique', 'rapport', 'étude', 'ingénierie', 'document', 'actes', 'conférence',
  'colloque', 'symposium', 'proceedings', 'thèse', 'mémoire', 'doctorat'
];

export function filterNonBookResults(books: Book[]): Book[] {
  return books.filter(book => {
    // Vérifier si le titre contient des mots-clés techniques
    if (!book.title) return false;
    
    const titleLower = book.title.toLowerCase();
    const authorString = Array.isArray(book.author) 
      ? book.author.join(' ').toLowerCase() 
      : book.author.toLowerCase();
    const subjectsString = (book.subjects || []).join(' ').toLowerCase();
    const descriptionLower = (book.description || '').toLowerCase();
    
    const allText = `${titleLower} ${authorString} ${subjectsString} ${descriptionLower}`;
    
    // Exclure les livres qui contiennent des mots-clés techniques
    return !TECHNICAL_KEYWORDS.some(keyword => allText.includes(keyword.toLowerCase()));
  });
}

// Vérifie si un livre correspond à l'auteur recherché
export function isAuthorMatch(book: Book, searchQuery: string): boolean {
  if (!book.author || (Array.isArray(book.author) && book.author.length === 0)) {
    return false;
  }
  
  const searchTerms = searchQuery.toLowerCase().split(' ');
  const authors = Array.isArray(book.author) ? book.author : [book.author];
  
  return authors.some(author => {
    if (!author) return false;
    const authorLower = author.toLowerCase();
    
    // Vérifie si le nom de l'auteur contient tous les termes de la recherche
    return searchTerms.every(term => authorLower.includes(term));
  });
}
