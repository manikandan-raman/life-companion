"use client";

import { useState } from "react";
import { Plus, Loader2, ChevronDown, Folder, Tag, Trash2, MoreHorizontal } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useCategories, useCreateCategory, useCreateSubCategory, useDeleteCategory, useDeleteSubCategory } from "@/hooks/use-accounts";
import { categorySchema, subCategorySchema } from "@/schemas/category";
import { cn } from "@/lib/utils";
import { getIcon } from "@/lib/icons";
import type { CategoryWithSubCategories, SubCategory } from "@/types";

interface CategoryFormValues {
  name: string;
  icon: string;
}

interface SubCategoryFormValues {
  categoryId: string;
  name: string;
  icon: string;
}

export default function CategoriesPage() {
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isSubCategoryDialogOpen, setIsSubCategoryDialogOpen] = useState(false);
  const [selectedParentCategory, setSelectedParentCategory] = useState<string>("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const createSubCategory = useCreateSubCategory();
  const deleteCategory = useDeleteCategory();
  const deleteSubCategory = useDeleteSubCategory();

  const categoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema) as never,
    defaultValues: {
      name: "",
      icon: "circle",
    },
  });

  const subCategoryForm = useForm<SubCategoryFormValues>({
    resolver: zodResolver(subCategorySchema) as never,
    defaultValues: {
      categoryId: "",
      name: "",
      icon: "circle",
    },
  });

  const onCategorySubmit: SubmitHandler<CategoryFormValues> = async (data) => {
    try {
      await createCategory.mutateAsync(data);
      toast.success("Category created successfully");
      categoryForm.reset();
      setIsCategoryDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create category"
      );
    }
  };

  const onSubCategorySubmit: SubmitHandler<SubCategoryFormValues> = async (data) => {
    try {
      await createSubCategory.mutateAsync(data);
      toast.success("Sub-category created successfully");
      subCategoryForm.reset();
      setIsSubCategoryDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create sub-category"
      );
    }
  };

  const handleDeleteCategory = async (category: CategoryWithSubCategories) => {
    if (category.isSystem) {
      toast.error("Cannot delete system categories");
      return;
    }
    if (!confirm(`Are you sure you want to delete "${category.name}" and all its sub-categories?`)) return;
    
    try {
      await deleteCategory.mutateAsync(category.id);
      toast.success("Category deleted successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete category"
      );
    }
  };

  const handleDeleteSubCategory = async (subCategory: SubCategory) => {
    if (subCategory.isSystem) {
      toast.error("Cannot delete system sub-categories");
      return;
    }
    if (!confirm(`Are you sure you want to delete "${subCategory.name}"?`)) return;
    
    try {
      await deleteSubCategory.mutateAsync(subCategory.id);
      toast.success("Sub-category deleted successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete sub-category"
      );
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const openSubCategoryDialog = (categoryId: string) => {
    setSelectedParentCategory(categoryId);
    subCategoryForm.setValue("categoryId", categoryId);
    setIsSubCategoryDialogOpen(true);
  };

  const totalSubCategories = categories?.reduce((acc, cat) => acc + (cat.subCategories?.length || 0), 0) || 0;

  return (
    <div className="min-h-screen">
      <Header title="Categories" />

      <div className="px-4 py-6 md:px-6 space-y-6 max-w-4xl mx-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card-modern rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <Folder className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{categories?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Categories</p>
              </div>
            </div>
          </div>
          <div className="card-modern rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-wants/15 flex items-center justify-center">
                <Tag className="h-5 w-5 text-wants" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalSubCategories}</p>
                <p className="text-xs text-muted-foreground">Sub-categories</p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 rounded-2xl" />
            ))}
          </div>
        ) : !categories?.length ? (
          <div className="card-modern rounded-2xl border-dashed border-2 border-border/50">
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Folder className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="font-medium mb-1">No categories yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                Create categories to organize your transactions
              </p>
              <Button onClick={() => setIsCategoryDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((category, index) => {
              const isExpanded = expandedCategories.has(category.id);
              const subCount = category.subCategories?.length || 0;
              const CategoryIcon = getIcon(category.icon);
              
              return (
                <Collapsible
                  key={category.id}
                  open={isExpanded}
                  onOpenChange={() => toggleCategory(category.id)}
                >
                  <div 
                    className="card-modern rounded-2xl overflow-hidden transition-all duration-200"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    {/* Category Header */}
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                        {/* Icon */}
                        <div className={cn(
                          "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                          isExpanded ? "bg-primary/15" : "bg-muted/50"
                        )}>
                          <CategoryIcon className={cn(
                            "h-5 w-5",
                            isExpanded ? "text-primary" : "text-muted-foreground"
                          )} />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold truncate">{category.name}</span>
                            {category.isSystem && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                                System
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {subCount} sub-categor{subCount === 1 ? 'y' : 'ies'}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => openSubCategoryDialog(category.id)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          
                          {!category.isSystem && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleDeleteCategory(category)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Category
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                          
                          <ChevronDown className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0",
                            isExpanded && "rotate-180"
                          )} />
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    {/* Sub-categories */}
                    <CollapsibleContent>
                      <div className="border-t border-border/50 bg-muted/20">
                        {subCount === 0 ? (
                          <div className="px-4 py-6 text-center">
                            <p className="text-sm text-muted-foreground mb-3">No sub-categories</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openSubCategoryDialog(category.id)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Sub-category
                            </Button>
                          </div>
                        ) : (
                          <div className="p-2">
                            {category.subCategories?.map((subCategory) => {
                              const SubCategoryIcon = getIcon(subCategory.icon);
                              return (
                                <div
                                  key={subCategory.id}
                                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors group"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                                      <SubCategoryIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                    </div>
                                    <span className="text-sm truncate">{subCategory.name}</span>
                                    {subCategory.isSystem && (
                                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 opacity-60">
                                        System
                                      </Badge>
                                    )}
                                  </div>
                                  {!subCategory.isSystem && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                      onClick={() => handleDeleteSubCategory(subCategory)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        )}

        {/* Floating Action Button */}
        <Button
          size="lg"
          onClick={() => setIsCategoryDialogOpen(true)}
          className="md:hidden fixed right-4 bottom-24 h-14 w-14 rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-105"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Add Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                placeholder="e.g., Coffee"
                {...categoryForm.register("name")}
                className={cn(categoryForm.formState.errors.name && "border-destructive")}
              />
              {categoryForm.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {categoryForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Icon Name (Lucide icon)</Label>
              <Input
                id="icon"
                placeholder="e.g., Coffee, ShoppingCart"
                {...categoryForm.register("icon")}
              />
              <p className="text-xs text-muted-foreground">
                Find icons at lucide.dev/icons
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createCategory.isPending}
            >
              {createCategory.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Category"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Sub-category Dialog */}
      <Dialog open={isSubCategoryDialogOpen} onOpenChange={setIsSubCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Sub-category</DialogTitle>
          </DialogHeader>
          <form onSubmit={subCategoryForm.handleSubmit(onSubCategorySubmit)} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Parent Category</Label>
              <Select
                value={selectedParentCategory}
                onValueChange={(value) => {
                  setSelectedParentCategory(value);
                  subCategoryForm.setValue("categoryId", value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subName">Sub-category Name</Label>
              <Input
                id="subName"
                placeholder="e.g., Cappuccino"
                {...subCategoryForm.register("name")}
                className={cn(subCategoryForm.formState.errors.name && "border-destructive")}
              />
              {subCategoryForm.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {subCategoryForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subIcon">Icon Name (Lucide icon)</Label>
              <Input
                id="subIcon"
                placeholder="e.g., Coffee"
                {...subCategoryForm.register("icon")}
              />
              <p className="text-xs text-muted-foreground">
                Find icons at lucide.dev/icons
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createSubCategory.isPending}
            >
              {createSubCategory.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Sub-category"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
