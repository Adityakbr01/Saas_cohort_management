import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTASection: React.FC = () => {
  return (
    <div className="text-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 rounded-lg p-12">
      <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
        Join thousands of learners who are already advancing their careers with EduLaunch. Start your free trial
        today!
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" asChild aria-label="Start Free Trial">
          <Link to="/signup">Start Free Trial</Link>
        </Button>
        <Button variant="outline" size="lg" asChild aria-label="Browse Courses">
          <Link to="/courses">Browse Courses</Link>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mt-4">
        No credit card required • 7-day free trial • Cancel anytime
      </p>
    </div>
  );
};

export default memo(CTASection);