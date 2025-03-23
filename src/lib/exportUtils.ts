
import { Book } from '@/types/book';

/**
 * Convert library data to a downloadable JSON file
 */
export function exportLibraryToJson(books: Book[], fileName: string = 'ma-bibliotheque.json') {
  try {
    if (!books || books.length === 0) {
      console.warn('Aucun livre à exporter');
      return { 
        success: false,
        error: 'Aucun livre à exporter'
      };
    }
    
    console.log(`Tentative d'export de ${books.length} livres`);
    
    // Create a blob with the formatted JSON data
    const booksJson = JSON.stringify(books, null, 2);
    const blob = new Blob([booksJson], { type: 'application/json' });
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    
    // Trigger the download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return { success: true, count: books.length };
  } catch (error) {
    console.error('Erreur lors de l\'export de la bibliothèque:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}
