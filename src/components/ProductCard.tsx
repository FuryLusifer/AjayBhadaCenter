import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  stock_quantity: number;
  discount?: number;
}

const ProductCard = ({ id, name, price, image_url, stock_quantity, discount }: ProductCardProps) => {
  const { addToCart } = useCart();
  
  const discountedPrice = discount ? price * (1 - discount / 100) : price;
  const isOutOfStock = stock_quantity === 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) {
      toast.error("Product is out of stock");
      return;
    }
    await addToCart(id, 1);
  };

  return (
    <Link to={`/product/${id}`}>
      <Card className="h-full hover:shadow-[var(--shadow-elegant)] transition-[var(--transition-smooth)] overflow-hidden group">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {image_url ? (
            <img
              src={image_url}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
          {discount && (
            <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground">
              {discount}% OFF
            </Badge>
          )}
          {isOutOfStock && (
            <Badge className="absolute top-2 left-2 bg-muted text-muted-foreground">
              Out of Stock
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-2 mb-2">{name}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">
              Rs.{discountedPrice.toFixed(2)}
            </span>
            {discount && (
              <span className="text-sm text-muted-foreground line-through">
                Rs.{price.toFixed(2)}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {stock_quantity} in stock
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full"
            variant="default"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProductCard;