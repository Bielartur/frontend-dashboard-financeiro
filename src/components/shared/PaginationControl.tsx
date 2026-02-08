import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function PaginationControl({
  currentPage,
  totalPages,
  onPageChange,
  className
}: PaginationControlProps) {
  if (totalPages <= 1) return null;

  return (
    <Pagination className={className}>
      <PaginationContent className='w-full flex justify-between items-center'>
        <PaginationItem>
          <PaginationPrevious
            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            onClick={() => onPageChange(currentPage - 1)}
          />
        </PaginationItem>

        <PaginationItem>
          <span className="text-sm text-muted-foreground mx-4">
            Página {currentPage} de {totalPages}
          </span>
        </PaginationItem>

        <PaginationItem>
          <PaginationNext
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            onClick={() => onPageChange(currentPage + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
