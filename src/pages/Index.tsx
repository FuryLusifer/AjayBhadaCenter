// // Update this page (the content is just a fallback if you fail to update the page)

// const Index = () => {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-background">
//       <div className="text-center">
//         <h1 className="mb-4 text-4xl font-bold">Welcome to Your Blank App</h1>
//         <p className="text-xl text-muted-foreground">Start building your amazing project here!</p>
//       </div>
//     </div>
//   );
// };

// export default Index;

// ************************************ */
import { Link } from "react-router-dom";
import { ShoppingBag, Award, Clock, PhoneCall } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center">
        <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center opacity-20" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-4">Your Complete Kitchen Solution</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover quality kitchen equipment and supplies at Ajay Bhada Center - Hetauda's trusted name since 2000.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
            >
              <ShoppingBag className="h-5 w-5" />
              Browse Products
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-sm">
              <Award className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Quality Products</h3>
              <p className="text-muted-foreground">Curated selection of premium kitchen equipment and supplies</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-sm">
              <Clock className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-muted-foreground">Quick and reliable delivery across Hetauda and nearby areas</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-sm">
              <PhoneCall className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
              <p className="text-muted-foreground">Professional guidance and after-sales service</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/products?category=${category.slug}`}
                className="group relative aspect-square bg-muted rounded-lg overflow-hidden"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 flex items-end p-4">
                  <h3 className="text-white font-medium">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const categories = [
  { name: "Cookware", slug: "cookware", image: "/categories/cookware.jpg" },
  { name: "Appliances", slug: "appliances", image: "/categories/appliances.jpg" },
  { name: "Utensils", slug: "utensils", image: "/categories/utensils.jpg" },
  { name: "Storage", slug: "storage", image: "/categories/storage.jpg" },
];

export default Index;
