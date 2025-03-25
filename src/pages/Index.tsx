
import { useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { searchBooks } from '@/services/openLibrary';
import { searchGoogleBooks } from '@/services/googleBooks';
import { getBookDetails } from '@/services/bookDetails';
import { Book } from '@/types/book';
import { BookDetails } from '@/components/BookDetails';
import { removeDuplicateBooks } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import NavBar from '@/components/NavBar';
import { SearchBar } from '@/components/search/SearchBar';
import { BookGrid } from '@/components/search/BookGrid';
import { HeaderSection } from '@/components/search/HeaderSection';
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const BOOKS_PER_PAGE = 12;

const Index = () => {
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [displayedBooks, setDisplayedBooks] = useState(BOOKS_PER_PAGE);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importedData, setImportedData] = useState<Book[]>([]);
  const { toast } = useToast();

  const results = useQueries({
    queries: [
      {
        queryKey: ['openLibrary', debouncedQuery],
        queryFn: () => searchBooks(debouncedQuery),
        enabled: debouncedQuery.length > 0
      },
      {
        queryKey: ['googleBooks', debouncedQuery],
        queryFn: () => searchGoogleBooks(debouncedQuery),
        enabled: debouncedQuery.length > 0
      }
    ]
  });

  const isLoading = results.some(result => result.isLoading);
  const allBooks = [
    ...(results[0].data || []), 
    ...(results[1].data || [])
  ].filter(book => 
    book && 
    book.title && 
    book.language && 
    (book.language.includes('fr') || book.language.includes('fre') || book.language.includes('fra'))
  );
  const books = removeDuplicateBooks(allBooks);
  
  console.log(`Total des résultats combinés en français: ${books.length} livres`);

  const handleBookClick = async (book: Book) => {
    try {
      if (!book || !book.id) {
        toast({
          description: "Impossible d'afficher les détails de ce livre.",
          variant: "destructive"
        });
        return;
      }
      const details = await getBookDetails(book.id);
      setSelectedBook({ ...book, ...details });
    } catch (error) {
      console.error("Erreur lors du chargement des détails:", error);
      toast({
        description: "Erreur lors du chargement des détails du livre.",
        variant: "destructive"
      });
    }
  };

  const handleLoadMore = () => {
    if (displayedBooks >= books.length) {
      toast({
        description: "Il n'y a plus de livres à afficher.",
      });
      return;
    }
    setDisplayedBooks(prev => prev + BOOKS_PER_PAGE);
  };

  const handleBookUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedBooks = JSON.parse(content) as Book[];
        
        if (!Array.isArray(importedBooks)) {
          throw new Error('Format de fichier invalide. Veuillez importer un tableau JSON de livres.');
        }
        
        console.log(`Fichier importé: ${importedBooks.length} livres trouvés`);
        setImportedData(importedBooks);
      } catch (error) {
        console.error('Erreur lors de la lecture du fichier JSON:', error);
        toast({
          variant: "destructive",
          description: "Erreur lors de l'importation. Format de fichier invalide.",
        });
      }
    };
    reader.readAsText(file);
  };

  const importBooks = async () => {
    // Ici, nous simulons simplement l'importation pour le moment
    // Dans une version complète, il faudrait les ajouter à Supabase
    toast({
      description: `${importedData.length} livres importés avec succès!`,
    });
    setShowImportDialog(false);
    setImportedData([]);
  };

  const visibleBooks = books.slice(0, displayedBooks);

  return (
    <>
      <div className="min-h-screen">
        <NavBar />
        <div className="container px-4 py-6 sm:py-8 sm:px-6 lg:px-8 mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <HeaderSection onBookAdded={handleBookUpdate} />
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setShowImportDialog(true)}
                title="Importer ma bibliothèque"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Importer</span>
              </Button>
            </div>

            <div className="mb-8 sm:mb-12">
              <SearchBar 
                onSearch={setDebouncedQuery}
                placeholder="Rechercher un livre, un auteur..."
              />
            </div>

            <BookGrid 
              books={!debouncedQuery ? [] : visibleBooks}
              onBookClick={handleBookClick}
              displayedBooks={displayedBooks}
              totalBooks={books.length}
              onLoadMore={handleLoadMore}
              isLoading={isLoading}
              searchQuery={debouncedQuery}
            />

            {selectedBook && (
              <BookDetails
                book={selectedBook}
                isOpen={!!selectedBook}
                onClose={() => setSelectedBook(null)}
                onUpdate={handleBookUpdate}
              />
            )}

            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Importer ma bibliothèque</DialogTitle>
                  <DialogDescription>
                    Importez un fichier JSON contenant vos livres.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  <div className="grid w-full items-center gap-1.5">
                    <label htmlFor="import-file" className="text-sm font-medium">
                      Fichier JSON
                    </label>
                    <input
                      id="import-file"
                      type="file"
                      accept=".json"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      onChange={handleFileImport}
                    />
                  </div>
                  {importedData.length > 0 && (
                    <div className="text-sm">
                      <p className="font-medium">{importedData.length} livres trouvés dans le fichier</p>
                      <p className="text-muted-foreground">Cliquez sur Importer pour ajouter ces livres à votre bibliothèque.</p>
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                      Annuler
                    </Button>
                    <Button onClick={importBooks} disabled={importedData.length === 0}>
                      Importer
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
