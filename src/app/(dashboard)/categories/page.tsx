"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { CategoryBadge } from "@/components/finance/category-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCategories, useCreateCategory, useDeleteCategory } from "@/hooks/use-accounts";
import { categorySchema } from "@/schemas/category";
import { cn } from "@/lib/utils";
import type { Category, CategoryType } from "@/types";

interface FormValues {
  name: string;
  type: "income" | "needs" | "wants" | "savings";
  color: string;
  icon: string;
}

const colorOptions = [
  { value: "#10b981", label: "Emerald" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#8b5cf6", label: "Violet" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ef4444", label: "Red" },
  { value: "#ec4899", label: "Pink" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#6b7280", label: "Gray" },
];

const typeLabels: Record<CategoryType, string> = {
  income: "Income",
  needs: "Needs",
  wants: "Wants",
  savings: "Savings",
};

export default function CategoriesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<CategoryType>("income");
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(categorySchema) as never,
    defaultValues: {
      name: "",
      type: "needs",
      color: "#3b82f6",
      icon: "circle",
    },
  });

  const selectedColor = watch("color");
  const selectedType = watch("type");

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      await createCategory.mutateAsync(data);
      toast.success("Category created successfully");
      reset();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create category"
      );
    }
  };

  const handleDelete = async (category: Category) => {
    if (category.isSystem) {
      toast.error("Cannot delete system categories");
      return;
    }
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) return;
    
    try {
      await deleteCategory.mutateAsync(category.id);
      toast.success("Category deleted successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete category"
      );
    }
  };

  // Group categories by type
  const groupedCategories = categories?.reduce(
    (acc, cat) => {
      const type = cat.type as CategoryType;
      if (!acc[type]) acc[type] = [];
      acc[type].push(cat);
      return acc;
    },
    {} as Record<CategoryType, Category[]>
  );

  return (
    <div className="min-h-screen">
      <Header title="Categories" />

      <div className="px-4 py-6 md:px-6 space-y-6 max-w-4xl mx-auto">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Organize your transactions with categories
          </p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Coffee"
                    {...register("name")}
                    className={cn(errors.name && "border-destructive")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Category Type</Label>
                  <Select
                    value={selectedType}
                    onValueChange={(v) => setValue("type", v as CategoryType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="needs">Needs</SelectItem>
                      <SelectItem value="wants">Wants</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2 flex-wrap">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setValue("color", color.value)}
                        className={cn(
                          "w-8 h-8 rounded-full transition-transform",
                          selectedColor === color.value &&
                            "ring-2 ring-offset-2 ring-primary scale-110"
                        )}
                        style={{ backgroundColor: color.value }}
                        title={color.label}
                      />
                    ))}
                  </div>
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
        </div>

        {/* Categories by Type */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : (
          <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as CategoryType)}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="needs">Needs</TabsTrigger>
              <TabsTrigger value="wants">Wants</TabsTrigger>
              <TabsTrigger value="savings">Savings</TabsTrigger>
            </TabsList>

            {(["income", "needs", "wants", "savings"] as CategoryType[]).map((type) => (
              <TabsContent key={type} value={type}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <CategoryBadge type={type} />
                      <span className="text-muted-foreground font-normal">
                        {groupedCategories?.[type]?.length || 0} categories
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!groupedCategories?.[type]?.length ? (
                      <p className="text-center text-muted-foreground py-4">
                        No categories in this type
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {groupedCategories?.[type]?.map((category) => (
                          <div
                            key={category.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: category.color || "#6b7280" }}
                              />
                              <span className="font-medium">{category.name}</span>
                              {category.isSystem && (
                                <span className="text-xs text-muted-foreground">
                                  (System)
                                </span>
                              )}
                            </div>
                            {!category.isSystem && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive h-8"
                                onClick={() => handleDelete(category)}
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
}
