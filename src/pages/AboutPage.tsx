import { motion } from 'framer-motion';
import { Heart, Users, Zap } from 'lucide-react';

export function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            className="font-display text-5xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            About Carmen
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600 leading-relaxed"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            We started from a passion for beautiful products and a commitment to
            exceptional service. Today, we're proud to serve thousands of happy
            customers across South Africa.
          </motion.p>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          className="prose prose-lg max-w-none text-gray-600"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p>
            Carmen began as a simple idea: what if there was a place where you
            could find carefully curated products, all in one place? No
            algorithms deciding what you see—just thoughtfully selected items
            from someone who truly cares about quality.
          </p>
          <p>
            Starting as a social media seller, we realized many of our customers
            wanted a dedicated space to shop. A place that's fast, reliable, and
            genuinely customer-focused. That's how Carmen was born.
          </p>
          <p>
            Every product we feature has been personally selected. We work
            directly with trusted suppliers to ensure authenticity and quality.
            Your satisfaction isn't just a goal—it's our promise.
          </p>
        </motion.div>
      </section>

      {/* Values */}
      <section className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-gray-900 text-center mb-16">
            Our Values
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Heart className="w-16 h-16 mx-auto text-red-600 mb-6" />
              <h3 className="font-display text-2xl font-bold text-gray-900 mb-4">
                Quality First
              </h3>
              <p className="text-gray-600">
                We only sell products we're proud to recommend to friends and
                family.
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Users className="w-16 h-16 mx-auto text-blue-600 mb-6" />
              <h3 className="font-display text-2xl font-bold text-gray-900 mb-4">
                Customer Focused
              </h3>
              <p className="text-gray-600">
                Your satisfaction is our top priority. We're here to help, always.
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Zap className="w-16 h-16 mx-auto text-yellow-600 mb-6" />
              <h3 className="font-display text-2xl font-bold text-gray-900 mb-4">
                Lightning Fast
              </h3>
              <p className="text-gray-600">
                Quick shipping via PUDO couriers. Get your order when you need it.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
