import { Navbar } from "@/components/layout/Navbar";
import { useProducts } from "@/hooks/use-products";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Plus, Check, Loader2 } from "lucide-react";
import { useState } from "react";

function ProductCard({ product }: { product: any }) {
  const addItem = useCartStore(state => state.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group bg-card rounded-3xl p-4 shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 border border-border/50 hover:border-primary/20 flex flex-col h-full">
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-5 bg-muted/30">
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="flex flex-col flex-1 justify-between gap-4">
        <div>
          <h3 className="font-display font-semibold text-xl text-foreground line-clamp-1">{product.name}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <span className="text-xl font-bold text-primary">₹{product.price}</span>
          <Button 
            onClick={handleAdd}
            size="icon" 
            variant={added ? "secondary" : "default"}
            className="rounded-full shadow-md shadow-primary/20 transition-all duration-300"
          >
            {added ? <Check className="w-5 h-5 text-green-600" /> : <Plus className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: products, isLoading } = useProducts();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32">
          {/* Decorative blurs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-primary/20 blur-[100px] rounded-full pointer-events-none -z-10" />
          <div className="absolute top-40 -left-40 w-96 h-96 bg-accent/20 blur-[80px] rounded-full pointer-events-none -z-10" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block py-1.5 px-4 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              Handcrafted with Love ✨
            </span>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Elevate Your Everyday <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Hair Aesthetics</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Discover our curated collection of premium hair clips, elegant bands, and beautiful scrunchies designed to make you shine.
            </p>
          </div>
        </section>

        {/* Products Grid */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-32">
          <div className="flex items-center justify-between mb-12">
            <h2 className="font-display text-3xl font-bold">New Arrivals</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !products?.length ? (
            <div className="text-center py-24 bg-card rounded-3xl border border-border/50">
              <h3 className="text-xl font-medium text-foreground">No products yet.</h3>
              <p className="text-muted-foreground mt-2">Check back soon for our new collection!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
