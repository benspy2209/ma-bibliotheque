
import { Book, ReadingStatus } from '@/types/book';

export interface BookDetailsProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export interface BookMetadataProps {
  book: Book;
  isEditing: boolean;
  onInputChange: (field: keyof Book, value: string) => void;
}

export interface CompletionDateProps {
  book: Book;
  isEditing: boolean;
  onDateChange: (date: Date | undefined) => void;
}

export interface BookDescriptionProps {
  description?: string;
  isEditing: boolean;
  onDescriptionChange: (value: string) => void;
}
