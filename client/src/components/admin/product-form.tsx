import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertProductSchema, Product, Category } from "@shared/schema";
import { useNavigate } from "wouter";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { generateSlug } from "@/lib/utils";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const validationSchema = insertProductSchema.extend({
  price: z.preprocess(
    (val) => parseFloat(val as string),
    z.number().min(0.01, "Price must be greater than 0")
  ),
  comparePrice: z.preprocess(
    (val) => (val === "" ? undefined : parseFloat(val as string)),
    z.number().min(0).optional()
  ),
  stock: z.preprocess(
    (val) => parseInt(val as string),
    z.number().min(0, "Stock cannot be negative")
  ),
});

type FormValues = z.infer<typeof validationSchema>;

interface ProductFormProps {
  product?: Product;
  isEdit?: boolean;
}

export default function ProductForm({ product, isEdit = false }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useNavigate();
  
  // Get categories for dropdown
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Initialize form with product data if editing
  const form = useForm<FormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: isEdit && product
      ? {
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          comparePrice: product.comparePrice,
          imageUrls: product.imageUrls.join('\n'),
          videoUrl: product.videoUrl || "",
          stock: product.stock,
          isFeatured: product.isFeatured,
          isBestSeller: product.isBestSeller,
          categoryId: product.categoryId,
        }
      : {
          name: "",
          slug: "",
          description: "",
          price: 0,
          comparePrice: undefined,
          imageUrls: "",
          videoUrl: "",
          stock: 0,
          isFeatured: false,
          isBestSeller: false,
          categoryId: 0,
        }
  });
  
  // Generate slug from name
  const generateSlugFromName = () => {
    const name = form.getValues("name");
    if (name) {
      form.setValue("slug", generateSlug(name));
    }
  };
  
  // Create or update product
  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Convert imageUrls from newline-separated string to array
      const imageUrls = values.imageUrls
        .split('\n')
        .map(url => url.trim())
        .filter(url => url !== "");
      
      if (imageUrls.length === 0) {
        throw new Error("At least one image URL is required");
      }
      
      const productData = {
        ...values,
        imageUrls,
      };
      
      if (isEdit && product) {
        // Update existing product
        await apiRequest("PUT", `/api/products/${product.id}`, productData);
        toast({
          title: "Product updated",
          description: "The product has been updated successfully",
        });
      } else {
        // Create new product
        await apiRequest("POST", "/api/products", productData);
        toast({
          title: "Product created",
          description: "The product has been created successfully",
        });
      }
      
      // Invalidate products cache and redirect
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      navigate("/admin/products");
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred while saving the product";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (categoriesLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name*</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter product name" 
                          onChange={(e) => {
                            field.onChange(e);
                            if (!isEdit || !product) {
                              setTimeout(generateSlugFromName, 300);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug*</FormLabel>
                      <div className="flex">
                        <FormControl>
                          <Input {...field} placeholder="product-slug" />
                        </FormControl>
                        {!isEdit && (
                          <Button
                            type="button"
                            variant="outline"
                            className="ml-2"
                            onClick={generateSlugFromName}
                          >
                            Generate
                          </Button>
                        )}
                      </div>
                      <FormDescription>
                        Used in the URL. Must be unique and contain only letters, numbers, and hyphens.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description*</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter product description"
                          className="min-h-[120px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price*</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder="29.99"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="comparePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compare at Price</FormLabel>
                      <FormControl>
                        <Input
                          value={field.value === undefined ? "" : field.value}
                          onChange={field.onChange}
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="39.99"
                        />
                      </FormControl>
                      <FormDescription>
                        Original price for showing discounts
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity*</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          placeholder="100"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category*</FormLabel>
                      <Select
                        value={field.value.toString()}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem 
                              key={category.id} 
                              value={category.id.toString()}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="imageUrls"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URLs*</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                          className="min-h-[120px]"
                        />
                      </FormControl>
                      <FormDescription>
                        Enter one URL per line. At least one image is required.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="https://example.com/video.mp4"
                        />
                      </FormControl>
                      <FormDescription>
                        Optional product demonstration video
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Featured Product</FormLabel>
                        <FormDescription>
                          Display this product on the home page and featured collections
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isBestSeller"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Best Seller</FormLabel>
                        <FormDescription>
                          Mark this product as a best seller with a special badge
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/products")}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-primary hover:bg-primary/90"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
