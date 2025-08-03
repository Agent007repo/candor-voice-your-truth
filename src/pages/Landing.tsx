import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, MessageSquare, BarChart3, Eye, Lock, Zap } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const features = [
    {
      icon: Shield,
      title: "Anonymous Reporting",
      description: "Report issues safely without fear of retaliation. Complete anonymity guaranteed.",
      color: "text-success"
    },
    {
      icon: MessageSquare,
      title: "Real-time Communication",
      description: "Get updates on your reports and communicate anonymously with management.",
      color: "text-primary"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track workplace trends and measure the impact of improvements.",
      color: "text-warning"
    },
    {
      icon: Eye,
      title: "Transparent Process",
      description: "See how your concerns are being addressed with full transparency.",
      color: "text-accent"
    },
    {
      icon: Lock,
      title: "Secure & Private",
      description: "Enterprise-grade security ensures your data remains protected.",
      color: "text-destructive"
    },
    {
      icon: Zap,
      title: "Instant Action",
      description: "Fast response times and automated escalation for critical issues.",
      color: "text-primary"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-90"></div>
        <div className="relative container mx-auto px-4 py-24">
          <div className="text-center text-white animate-fade-up">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Welcome to <span className="text-yellow-300 animate-bounce-gentle">Candor</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed opacity-90">
              The anonymous employee feedback platform that creates transparent, 
              accountable workplaces where every voice matters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="xl" 
                className="bg-white text-primary hover:bg-white/90 hover:scale-105 font-semibold shadow-candor-lg"
                onClick={() => navigate('/report')}
              >
                Report an Issue
              </Button>
              <Button 
                size="xl" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-primary font-semibold"
                onClick={() => navigate('/auth')}
              >
                Access Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why Choose Candor?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Say goodbye to sugarcoated feedback and hello to honest, direct communication 
            that drives real workplace improvements.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className={`glass transition-all duration-300 transform cursor-pointer hover:scale-105 group ${
                hoveredCard === index ? 'shadow-candor-xl' : 'shadow-candor-lg'
              } animate-fade-up`}
              style={{ animationDelay: `${index * 100}ms` }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-primary text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-lg opacity-90">Employee Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24h</div>
              <div className="text-lg opacity-90">Average Response Time</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-lg opacity-90">Anonymous & Secure</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-lg opacity-90">Issues Resolved</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Workplace?</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of organizations creating more transparent, 
          accountable workplaces with Candor.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Button 
            size="xl" 
            variant="gradient"
            className="font-semibold shadow-candor-xl"
            onClick={() => navigate('/auth?mode=signup')}
          >
            Get Started Today
          </Button>
          <Button 
            size="xl" 
            variant="outline" 
            className="font-semibold hover:shadow-candor-md"
            onClick={() => navigate('/track')}
          >
            Track Your Issue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Landing;