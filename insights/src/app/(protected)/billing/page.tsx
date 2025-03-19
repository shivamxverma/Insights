// src/app/pricing/page.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Youtube } from 'lucide-react';
import { toast } from 'sonner';

// Pricing plan interface for type safety
interface Plan {
  name: string;
  price: number;
  users: string;
  features: string[];
}

// Pricing data tailored to your learning platform
const pricingData = {
  monthly: [
    {
      name: 'Basic Plan',
      price: 10,
      features: [
        'Access to 10 YouTube videos per module',
        'Basic summarization with ChatGPT',
        '5GB storage per user',
        'Basic search and filtering',
      ],
    },
    {
      name: 'Pro Plan',
      price: 20,
      features: [
        'Unlimited YouTube videos per module',
        'Advanced summarization with ChatGPT',
        '20GB storage per user',
        'Enhanced search and sharing',
      ],
    },
  ],
  annual: [
    {
      name: 'Basic Plan',
      price: 8.5, // 15% discount from $10
      features: [
        'Access to 10 YouTube videos per module',
        'Basic summarization with ChatGPT',
        '5GB storage per user',
        'Basic search and filtering',
      ],
    },
    {
      name: 'Pro Plan',
      price: 17, // 15% discount from $20
      features: [
        'Unlimited YouTube videos per module',
        'Advanced summarization with ChatGPT',
        '20GB storage per user',
        'Enhanced search and sharing',
      ],
    },
  ],
};

const PricingPage = () => {
  // State management for billing toggle
  const [isAnnual, setIsAnnual] = useState(false);

  // Get current plans based on billing period
  const currentPlans = isAnnual ? pricingData.annual : pricingData.monthly;

  // Render the pricing page
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-foreground p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.h1
            className="text-4xl md:text-5xl font-semibold text-blue-600 dark:text-gray-100 transition-all duration-300 hover:text-blue-800 dark:hover:text-blue-300"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Choose a Plan for Your Learning Journey
          </motion.h1>
          <div className="flex justify-center items-center gap-4 mt-6">
            <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
              Monthly billing
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isAnnual}
                onChange={() => setIsAnnual(!isAnnual)}
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer-checked:bg-blue-600 transition-colors duration-300"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5"></div>
            </label>
            <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
              Annual billing{' '}
              <span className="inline-block bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm px-2 py-1 rounded-full">
                Save 15%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Section */}
        <div className="grid grid-cols-1 px-24 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {currentPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    {plan.name}
                  </h2>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      ${plan.price}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {' '}
                      per user/{isAnnual ? 'year' : 'month'}
                    </span>
                  </div>
                  <Button
                    className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                    onClick={() => 
                     toast.success(`Get started with ${plan.name}!`, {
                      style: {
                        backgroundColor: '#059669', // Green for success
                        color: 'white',
                      },
                    })}
                  >
                    Get Started
                  </Button>
                </CardContent>

                <CardFooter className="p-6 border-t border-gray-200 dark:border-gray-700">
                    <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                    Features
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Everything in{' '}
                    {plan.name === 'Basic Plan'
                      ? 'free plan'
                      : plan.name === 'Pro Plan'
                      ? 'Basic Plan'
                      : 'Pro Plan'}{' '}
                    plus...
                  </p>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Youtube className="w-4 h-4 text-blue-500 dark:text-blue-300" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;