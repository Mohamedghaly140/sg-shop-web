"use client";

import { useState } from "react";
import { LucideLayoutList, LucidePencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UpsertSubcategoryDialog } from "./upsert-subcategory-dialog";
import { DeleteSubcategoryButton } from "./delete-subcategory-button";
import type { SubCategory } from "@/generated/prisma/client";

type ManageSubcategoriesDialogProps = {
  categoryId: string;
  categoryName: string;
  subCategories: Pick<SubCategory, "id" | "name" | "slug">[];
};

export function ManageSubcategoriesDialog({
  categoryId,
  categoryName,
  subCategories,
}: ManageSubcategoriesDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Manage subcategories">
          <LucideLayoutList className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {categoryName}
            <Badge variant="secondary" className="text-xs font-normal">
              {subCategories.length} subcategor{subCategories.length !== 1 ? "ies" : "y"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {subCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No subcategories yet.
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subCategories.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono">
                        {sub.slug}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <UpsertSubcategoryDialog
                            mode="edit"
                            subcategory={sub}
                            trigger={
                              <Button variant="ghost" size="icon">
                                <LucidePencil className="w-4 h-4" />
                              </Button>
                            }
                          />
                          <DeleteSubcategoryButton
                            subcategoryId={sub.id}
                            subcategoryName={sub.name}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex justify-end">
            <UpsertSubcategoryDialog mode="create" categoryId={categoryId} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
