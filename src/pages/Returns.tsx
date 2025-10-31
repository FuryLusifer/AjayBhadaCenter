import { Card } from "@/components/ui/card";

const Returns = () => {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Return & Refund Policy</h1>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Return Policy</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              We want you to be completely satisfied with your purchase. If you're not happy with your order, 
              we're here to help with returns and exchanges.
            </p>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Return Window</h3>
              <p>You have 2 days from the date of delivery to return an item.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Eligible Items</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Items must be unused and in the same condition that you received them</li>
                <li>Items must be in their original packaging</li>
                <li>Items must have the receipt or proof of purchase</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Non-Returnable Items</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Kitchen Utensils and cookware</li>
            <li>Custom or personalized items</li>
            <li>Items marked as "Final Sale" or "Non-Returnable"</li>
            <li>Opened or used kitchenware for hygiene reasons</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Refund Process</h2>
          <div className="space-y-4 text-muted-foreground">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">How to Initiate a Return</h3>
              <ol className="list-decimal list-inside space-y-2">
                <li>Contact us through the contact page or email us with your order number</li>
                <li>Describe the reason for your return</li>
                <li>Wait for return authorization and instructions</li>
                <li>Pack the item securely in its original packaging</li>
                <li>Ship the item to the address provided</li>
              </ol>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Refund Timeline</h3>
              <p>
                Once we receive your return, we will inspect the item and notify you of the approval 
                or rejection of your refund. If approved, your refund will be processed within 5-7 business days.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Refund Method</h3>
              <p>
                Refunds will be issued to the original payment method. For bank transfers, 
                the refund will be credited to the same account from which the payment was made.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Exchanges</h2>
          <p className="text-muted-foreground">
            We only replace items if they are defective or damaged. If you need to exchange an item for the same product, 
            contact us through our contact page with your order details.
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Shipping Costs</h2>
          <div className="space-y-2 text-muted-foreground">
            <p>
              <strong className="text-foreground">Return shipping costs:</strong> Customer is responsible for 
              return shipping costs unless the item is defective or we made an error.
            </p>
            <p>
              <strong className="text-foreground">Exchange shipping costs:</strong> We will cover the shipping 
              cost for exchanging defective or damaged items.
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="text-muted-foreground mb-2">
            If you have any questions about our return policy, please contact us:
          </p>
          <div className="space-y-1 text-muted-foreground">
            <p><strong className="text-foreground">Phone/Whatsapp:</strong> <a href="https://wa.me/+9779763776991" target="_blank"> +977 9763776991</a></p>
            <p><strong className="text-foreground">Tiktok:</strong><a href="https://www.tiktok.com/@ajay.bhada.center"> @ajay.bhada.center</a></p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Returns;