import type Stripe from "stripe";

export type BookMetadata = {
  stripeAccountId: string;
  id: string;
  name: string;
  price: number;
};

export type CheckoutMetadata = {
  userId: string;
};

export type ExpandedLineItem = Stripe.LineItem & {
  price: Stripe.Price & {
    book: Stripe.Product & {
      metadata: BookMetadata;
    };
  };
};
