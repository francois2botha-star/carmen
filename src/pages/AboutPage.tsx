import { Heart, Target, Award } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="font-display text-5xl font-bold mb-4">About Carmen</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your trusted South African online store, bringing quality products
          directly to your doorstep
        </p>
      </div>

      {/* Story */}
      <section className="mb-16 max-w-3xl mx-auto">
        <h2 className="font-display text-3xl font-bold mb-6 text-center">Our Story</h2>
        <div className="prose prose-lg mx-auto text-gray-600">
          <p>
            Carmen was founded with a simple mission: to make quality products
            accessible to everyone across South Africa. We believe that shopping
            online should be easy, reliable, and enjoyable.
          </p>
          <p>
            We carefully curate our product selection to ensure that every item
            meets our high standards for quality and value. From the moment you
            browse our store to when your package arrives at your door, we're
            committed to providing an exceptional experience.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mb-16">
        <h2 className="font-display text-3xl font-bold mb-12 text-center">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-gray-900" />
            </div>
            <h3 className="font-display text-xl font-bold mb-3">Customer First</h3>
            <p className="text-gray-600">
              Your satisfaction is our top priority. We're here to help every
              step of the way.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-gray-900" />
            </div>
            <h3 className="font-display text-xl font-bold mb-3">Quality Focus</h3>
            <p className="text-gray-600">
              Every product is carefully selected to meet our stringent quality
              standards.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-gray-900" />
            </div>
            <h3 className="font-display text-xl font-bold mb-3">Reliable Service</h3>
            <p className="text-gray-600">
              Fast, secure shipping through PUDO means your order arrives safely
              and on time.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gray-100 -mx-4 px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-3xl font-bold mb-8 text-center">
            Why Choose Carmen?
          </h2>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Curated Selection</h3>
              <p className="text-gray-600">
                We handpick every product to ensure you're getting the best
                quality and value.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Secure Shopping</h3>
              <p className="text-gray-600">
                Your payment information is always protected with industry-leading
                security.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                Quick and reliable PUDO shipping gets your order to you safely
                and efficiently.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Local Support</h3>
              <p className="text-gray-600">
                Based in South Africa, we understand the local market and your
                needs.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
