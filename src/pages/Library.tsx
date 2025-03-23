
import { useState } from 'react';
import { Book } from '@/types/book';
import { BookDetails } from '@/components/BookDetails';
import { useToast } from "@/hooks/use-toast";
import { SortMenu, SortOption } from '@/components/library/SortMenu';
import { ViewToggle } from '@/components/library/ViewToggle';
import { useBookSort } from '@/hooks/use-book-sort';
import { useViewPreference } from '@/hooks/use-view-preference';
import NavBar from '@/components/NavBar';
import { loadBooks } from '@/services/supabaseBooks';
import { useQuery } from '@tanstack/react-query';
import { BookSections } from '@/components/library/BookSections';
import { AuthorFilter } from '@/components/library/AuthorFilter';
import { Input } from "@/components/ui/input";
import { Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportLibraryToJson } from '@/lib/exportUtils';

export default function Library() {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toBuyFilter, setToBuyFilter] = useState<boolean | null>(null);
  const { toast } = useToast();
  const { sortBooks } = useBookSort();
  const { viewMode, toggleView } = useViewPreference();

  const { data: books = [], refetch } = useQuery({
    queryKey: ['books'],
    queryFn: loadBooks,
    meta: {
      onError: (error: Error) => {
        console.error("Erreur lors du chargement des livres:", error);
        toast({
          variant: "destructive",
          description: "Une erreur est survenue lors du chargement de votre bibliothèque.",
        });
      }
    }
  });

  // Filter books by search query
  const searchFilter = (book: Book) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    
    // Search by title
    const titleMatch = book.title.toLowerCase().includes(query);
    
    // Search by author
    let authorMatch = false;
    if (Array.isArray(book.author)) {
      authorMatch = book.author.some(author => 
        author && author.toLowerCase().includes(query)
      );
    } else if (book.author) {
      authorMatch = book.author.toLowerCase().includes(query);
    }
    
    return titleMatch || authorMatch;
  };

  // Apply all filters: author filter, search query filter, and to-buy filter
  const filteredBooks = books
    .filter(book => {
      // First apply the author filter
      if (selectedAuthor) {
        if (Array.isArray(book.author)) {
          return book.author.includes(selectedAuthor);
        }
        return book.author === selectedAuthor;
      }
      return true;
    })
    .filter(searchFilter) // Then apply the search query filter
    .filter(book => {
      // Apply the "to buy" filter if active
      if (toBuyFilter === true) {
        return !book.purchased && (!book.status || book.status === 'to-read');
      } else if (toBuyFilter === false) {
        return book.purchased || !((!book.status || book.status === 'to-read'));
      }
      return true;
    });

  const sortedBooks = sortBooks(filteredBooks, sortBy);

  const handleBookUpdate = () => {
    refetch();
  };

  const handleToBuyFilterChange = (value: boolean | null) => {
    setToBuyFilter(value);
  };

  const handleExportLibrary = () => {
    // Modifié pour exporter TOUS les livres, pas seulement les livres filtrés
    const result = exportLibraryToJson(books);
    
    if (result.success) {
      toast({
        description: `Export réussi de ${books.length} livres!`,
      });
    } else {
      toast({
        variant: "destructive",
        description: `Erreur lors de l'export: ${result.error || 'Problème inconnu'}`,
      });
    }
  };

  return (
    <div className="min-h-screen fade-in">
      <NavBar />
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Ma Bibliothèque</h1>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
                onClick={handleExportLibrary}
                title="Exporter ma bibliothèque"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Exporter ({books.length})</span>
              </Button>
              <SortMenu sortBy={sortBy} onSortChange={setSortBy} />
              <ViewToggle viewMode={viewMode} onToggle={toggleView} />
            </div>
          </div>

          <div className="mb-6 flex flex-col md:flex-row items-start gap-4">
            <div className="w-full md:w-64">
              <AuthorFilter 
                books={books}
                selectedAuthor={selectedAuthor}
                onAuthorSelect={setSelectedAuthor}
              />
            </div>
            <div className="w-full md:w-96 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Rechercher par titre ou auteur..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {sortedBooks.length === 0 ? (
            <p className="text-center text-gray-600 mt-8">
              {selectedAuthor 
                ? `Aucun livre de ${selectedAuthor} dans votre bibliothèque.`
                : searchQuery 
                  ? `Aucun livre ne correspond à votre recherche "${searchQuery}".`
                  : toBuyFilter === true
                    ? "Aucun livre à acheter dans votre bibliothèque."
                    : "Votre bibliothèque est vide. Ajoutez des livres depuis la recherche !"}
            </p>
          ) : (
            <BookSections 
              books={sortedBooks}
              viewMode={viewMode}
              onBookClick={setSelectedBook}
              toBuyFilter={toBuyFilter}
              onToBuyFilterChange={handleToBuyFilterChange}
            />
          )}

          {selectedBook && (
            <BookDetails
              book={selectedBook}
              isOpen={!!selectedBook}
              onClose={() => setSelectedBook(null)}
              onUpdate={handleBookUpdate}
            />
          )}
        </div>
      </div>
    </div>
  );
}
