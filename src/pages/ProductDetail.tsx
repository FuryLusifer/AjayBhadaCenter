import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowLeft, Minus, Plus } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock_quantity: number;
  category_id: string | null;
}

interface Category {
  name: string;
}

interface Offer {
  discount_percentage: number;
}

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    if (!id) return;

    const { data: productData } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (productData) {
      setProduct(productData);

      // Fetch category
      if (productData.category_id) {
        const { data: categoryData } = await supabase
          .from("categories")
          .select("name")
          .eq("id", productData.category_id)
          .single();
        
        if (categoryData) setCategory(categoryData);
      }

      // Fetch offer
      const { data: offerData } = await supabase
        .from("offers")
        .select("discount_percentage")
        .eq("product_id", id)
        .eq("is_active", true)
        .maybeSingle();
      
      if (offerData) setOffer(offerData);
    }

    setLoading(false);
  };

  const handleAddToCart = async () => {
    if (!product || product.stock_quantity === 0) {
      toast.error("Product is out of stock");
      return;
    }
    if (quantity > product.stock_quantity) {
      toast.error(`Only ${product.stock_quantity} items available`);
      return;
    }
    await addToCart(product.id, quantity);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Product not found</p>
        <div className="text-center mt-4">
          <Button asChild variant="outline">
            <Link to="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const discountedPrice = offer ? product.price * (1 - offer.discount_percentage / 100) : product.price;
  const isOutOfStock = product.stock_quantity === 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button asChild variant="ghost" className="mb-6">
        <Link to="/products">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Link>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* Product Image */}
        <div className="aspect-square bg-muted rounded-lg overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No Image Available
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {category && (
            <p className="text-sm text-muted-foreground mb-2">{category.name}</p>
          )}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
          
          <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 mb-6">
            <span className="text-3xl sm:text-4xl font-bold text-primary">
              Rs.{discountedPrice.toFixed(2)}
            </span>
            {offer && (
              <>
                <span className="text-xl text-muted-foreground line-through">
                  Rs.{product.price.toFixed(2)}
                </span>
                <Badge className="bg-destructive text-destructive-foreground">
                  {offer.discount_percentage}% OFF
                </Badge>
              </>
            )}
          </div>

          {product.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm font-semibold mb-2">Availability</p>
            {isOutOfStock ? (
              <Badge variant="destructive">Out of Stock</Badge>
            ) : (
              <p className="text-muted-foreground">{product.stock_quantity} items in stock</p>
            )}
          </div>

          {!isOutOfStock && (
            <>
              <div className="flex items-center gap-4 mb-6">
                <p className="text-sm font-semibold">Quantity:</p>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button size="lg" onClick={handleAddToCart} className="w-full md:w-auto">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;