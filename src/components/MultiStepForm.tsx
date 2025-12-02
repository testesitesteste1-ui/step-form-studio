import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { saveFormSubmission } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: number;
  question: string;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
}

const questions: Question[] = [
  {
    id: 1,
    question: "O que está te impedindo?",
    type: "text",
    placeholder: "Digite sua resposta...",
  },
  {
    id: 2,
    question: "Qual é o seu maior objetivo agora?",
    type: "text",
    placeholder: "Conte-nos mais...",
  },
  {
    id: 3,
    question: "Como você se sente sobre isso?",
    type: "textarea",
    placeholder: "Descreva com detalhes...",
  },
  {
    id: 4,
    question: "Qual o próximo passo que você pretende dar?",
    type: "text",
    placeholder: "Seu próximo passo...",
  },
];

export function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<"in" | "out">("in");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;
  const isFirstStep = currentStep === 0;
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleNext = async () => {
    if (isLastStep) {
      setIsSubmitting(true);
      try {
        await saveFormSubmission(answers);
        toast({
          title: "Formulário enviado!",
          description: "Suas respostas foram salvas com sucesso.",
        });
        setAnswers({});
        setCurrentStep(0);
      } catch (error) {
        toast({
          title: "Erro ao enviar",
          description: "Tente novamente mais tarde.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setAnimationDirection("out");
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
      setAnimationDirection("in");
      setTimeout(() => setIsAnimating(false), 50);
    }, 300);
  };

  const handlePrevious = () => {
    if (isFirstStep) return;

    setAnimationDirection("out");
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep((prev) => prev - 1);
      setAnimationDirection("in");
      setTimeout(() => setIsAnimating(false), 50);
    }, 300);
  };

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 flex flex-col items-center justify-center min-h-[60vh]">
      {/* Progress bar */}
      <div className="w-full mb-8">
        <div className="h-1 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-muted-foreground text-sm mt-2 text-center">
          {currentStep + 1} de {questions.length}
        </p>
      </div>

      {/* Question */}
      <div
        className={`w-full transition-all duration-300 ${
          isAnimating
            ? animationDirection === "out"
              ? "animate-fade-out"
              : "animate-fade-in"
            : "animate-fade-in"
        }`}
      >
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground text-center mb-8">
          {currentQuestion.question}
        </h1>

        {/* Input */}
        <div className="w-full">
          {currentQuestion.type === "text" && (
            <Input
              value={answers[currentQuestion.id] || ""}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder={currentQuestion.placeholder}
              className="w-full h-14 text-base bg-card border-border focus:border-primary focus:ring-primary"
              autoFocus
            />
          )}
          {currentQuestion.type === "textarea" && (
            <Textarea
              value={answers[currentQuestion.id] || ""}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder={currentQuestion.placeholder}
              className="w-full min-h-[120px] text-base bg-card border-border focus:border-primary focus:ring-primary resize-none"
              autoFocus
            />
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between w-full mt-8 gap-4">
        <Button
          variant="ghost"
          onClick={handlePrevious}
          disabled={isFirstStep}
          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Voltar
        </Button>

        <Button
          onClick={handleNext}
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isLastStep ? (
            "Enviar"
          ) : (
            <>
              Continuar
              <ChevronRight className="w-5 h-5 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
