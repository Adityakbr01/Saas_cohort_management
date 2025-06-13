import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";

const faqs = [
  {
    question: "Can I change my plan anytime?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
  },
  {
    question: "Is there a free trial available?",
    answer: "We offer a 7-day free trial for all plans. No credit card required to start your trial.",
  },
  {
    question: "What happens if I cancel my subscription?",
    answer:
      "You'll continue to have access to your plan features until the end of your current billing period. After that, you'll be moved to our free tier with limited access.",
  },
  {
    question: "Do you offer student discounts?",
    answer:
      "Yes! Students can get 50% off any plan with a valid student email address. Contact our support team for more details.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "We offer a 30-day money-back guarantee for all plans. If you're not satisfied, contact us for a full refund.",
  },
];

const FAQs: React.FC = () => {
  return (
    <div className="mb-16">
      <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
      <div className="max-w-3xl mx-auto space-y-6">
        {faqs.map((faq, index) => (
          <Card key={index} aria-label={`FAQ: ${faq.question}`}>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">{faq.question}</h3>
              <p className="text-muted-foreground">{faq.answer}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default memo(FAQs);