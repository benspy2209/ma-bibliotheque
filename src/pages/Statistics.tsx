
import { useState, useMemo } from 'react';
import { Book } from '@/types/book';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Book as BookIcon, BookOpen, Library } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Statistics() {
  const [books] = useState<Book[]>(() => {
    return Object.entries(localStorage)
      .filter(([key]) => key.startsWith('book_'))
      .map(([_, value]) => JSON.parse(value))
      .filter((book): book is Book => book !== null && book.status === 'completed' && book.completionDate);
  });

  const stats = useMemo(() => {
    const totalBooks = books.length;
    // Ne compter que les pages des livres qui ont un nombre de pages défini
    const totalPages = books.reduce((sum, book) => {
      const pages = book.numberOfPages;
      if (typeof pages === 'number' && !isNaN(pages) && pages > 0) {
        return sum + pages;
      }
      return sum;
    }, 0);
    
    const avgPagesPerBook = totalBooks > 0 ? Math.round(totalPages / totalBooks) : 0;

    // Grouper les livres par mois
    const booksByMonth = books.reduce((acc, book) => {
      const monthKey = format(new Date(book.completionDate!), 'MMMM yyyy', { locale: fr });
      if (!acc[monthKey]) {
        acc[monthKey] = {
          name: monthKey,
          books: 0,
          pages: 0
        };
      }
      acc[monthKey].books += 1;
      // Ne compter que les pages valides
      if (typeof book.numberOfPages === 'number' && !isNaN(book.numberOfPages) && book.numberOfPages > 0) {
        acc[monthKey].pages += book.numberOfPages;
      }
      return acc;
    }, {} as Record<string, { name: string; books: number; pages: number }>);

    return {
      totalBooks,
      totalPages,
      avgPagesPerBook,
      monthlyData: Object.values(booksByMonth).reverse().slice(0, 6)
    };
  }, [books]);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Statistiques de lecture</h1>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total des livres lus</CardTitle>
              <BookIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBooks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pages lues</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPages}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Moyenne de pages par livre</CardTitle>
              <Library className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgPagesPerBook}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="p-4">
          <CardHeader>
            <CardTitle>Livres lus par mois</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [value, 'Livres']}
                  labelStyle={{ color: 'black' }}
                />
                <Bar 
                  dataKey="books"
                  fill="#8884d8"
                  name="Livres lus"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader>
            <CardTitle>Pages lues par mois</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [value, 'Pages']}
                  labelStyle={{ color: 'black' }}
                />
                <Bar 
                  dataKey="pages"
                  fill="#82ca9d"
                  name="Pages lues"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
