import { useState } from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import type { InsertProduct, Product } from "@shared/schema";

export default function AdminProducts() {
  const [_, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { data: products, isLoading } = useProducts();
  
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<Omit<InsertProduct, "price"> & { price: string }>({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
  });

  if (authLoading) return <div className="h-screen flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (!user) { setLocation("/admin/login"); return null; }

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        imageUrl: product.imageUrl,
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", description: "", price: "", imageUrl: "" });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      // Pass price as string, Zod or backend will handle casting based on schema
      price: formData.price
    };

    if (editingId) {
      updateProduct.mutate({ id: editingId, ...payload }, {
        onSuccess: () => setIsDialogOpen(false)
      });
    } else {
      createProduct.mutate(payload as any, {
        onSuccess: () => setIsDialogOpen(false)
      });
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-8 lg:p-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">Products</h1>
            <p className="text-muted-foreground">Manage your storefront inventory.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="rounded-xl gap-2 shadow-md">
                <Plus className="w-4 h-4" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">{editingId ? "Edit Product" : "New Product"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required 
                    className="rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price (₹)</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      required 
                      className="rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    value={formData.description || ""}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="rounded-xl resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Image URL (Unsplash/Static)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.imageUrl}
                      onChange={(e) => {
                        const value = e.target.value.trim();
                        let finalUrl = value;

                        if (value.includes("drive.google.com")) {
                          let fileId = "";

                          const fileMatch = value.match(/\/file\/d\/([^\/]+)/);
                          const idMatch = value.match(/[?&]id=([^&]+)/);

                          if (fileMatch) {
                            fileId = fileMatch[1];
                          } else if (idMatch) {
                            fileId = idMatch[1];
                          }

                          if (fileId) {
                            finalUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
                          }
                        }

                        setFormData({ ...formData, imageUrl: finalUrl });
                      }}
                      required
                      placeholder="Paste Google Drive or Image URL"
                      className="rounded-xl"
                    />
                    {formData.imageUrl && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-border">
                      <img
                        src={formData.imageUrl}
                        className="w-full h-full object-cover"
                        alt="Preview"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/150?text=No+Image";
                        }}
                      />
                    </div>
                  )}
                  </div>
                </div>
                
                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancel</Button>
                  <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending} className="rounded-xl">
                    {editingId ? "Save Changes" : "Create Product"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-20">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : !products?.length ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    No products found. Add one to get started!
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id} className="group">
                    <TableCell>
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center border border-border/50">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>₹{product.price}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenDialog(product)}
                          className="rounded-lg hover:bg-primary/10 hover:text-primary"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            if(confirm("Are you sure you want to delete this product?")) {
                              deleteProduct.mutate(product.id);
                            }
                          }}
                          className="rounded-lg hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
