import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, ChevronLeft, Loader2, Check, Edit2 } from "lucide-react";
import { saveFormSubmission } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: number;
  question: string;
  type: "text" | "textarea" | "select" | "radio";
  placeholder?: string;
  options?: string[];
  required?: boolean;
  validation?: "email" | "phone" | "none";
}

const questions: Question[] = [
  {
    id: 1,
    question: "O que está te impedindo?",
    type: "text",
    placeholder: "Digite sua resposta...",
    required: true,
  },
  {
    id: 2,
    question: "Qual é o seu maior objetivo agora?",
    type: "text",
    placeholder: "Conte-nos mais...",
    required: true,
  },
  {
    id: 3,
    question: "Com que frequência você enfrenta esse problema?",
    type: "radio",
    options: ["Diariamente", "Algumas vezes por semana", "Raramente", "Primeira vez"],
    required: true,
  },
  {
    id: 4,
    question: "Como você se sente sobre isso?",
    type: "textarea",
    placeholder: "Descreva com detalhes...",
    required: true,
  },
  {
    id: 5,
    question: "Qual o próximo passo que você pretende dar?",
    type: "text",
    placeholder: "Seu próximo passo...",
    required: false,
  },
];

export function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationClass, setAnimationClass] = useState("animate-slide-in-right");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [errors, setErrors] = useState<Record<number, string>>({});
  const { toast } = useToast();

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;
  const isFirstStep = currentStep === 0;
  const progress = showSummary ? 100 : ((currentStep + 1) / questions.length) * 100;

  const validateAnswer = (questionId: number, value: string): string | null => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return null;

    if (question.required && (!value || value.trim() === "")) {
      return "Este campo é obrigatório";
    }

    if (value && question.validation === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return "Digite um email válido";
      }
    }

    if (value && question.validation === "phone") {
      const phoneRegex = /^[\d\s()+-]{10,}$/;
      if (!phoneRegex.test(value)) {
        return "Digite um telefone válido";
      }
    }

    return null;
  };

  const handleNext = async () => {
    // Validate current answer
    const error = validateAnswer(currentQuestion.id, answers[currentQuestion.id] || "");
    if (error) {
      setErrors((prev) => ({ ...prev, [currentQuestion.id]: error }));
      return;
    }
    setErrors((prev) => ({ ...prev, [currentQuestion.id]: "" }));

    if (isLastStep) {
      // Show summary instead of submitting immediately
      setAnimationClass("animate-slide-out-left");
      setIsAnimating(true);
      setTimeout(() => {
        setShowSummary(true);
        setAnimationClass("animate-slide-in-right");
        setTimeout(() => setIsAnimating(false), 50);
      }, 300);
      return;
    }

    setAnimationClass("animate-slide-out-left");
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
      setAnimationClass("animate-slide-in-right");
      setTimeout(() => setIsAnimating(false), 50);
    }, 300);
  };

  const handlePrevious = () => {
    if (showSummary) {
      setAnimationClass("animate-slide-out-right");
      setIsAnimating(true);
      setTimeout(() => {
        setShowSummary(false);
        setAnimationClass("animate-slide-in-left");
        setTimeout(() => setIsAnimating(false), 50);
      }, 300);
      return;
    }

    if (isFirstStep) return;

    setAnimationClass("animate-slide-out-right");
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep((prev) => prev - 1);
      setAnimationClass("animate-slide-in-left");
      setTimeout(() => setIsAnimating(false), 50);
    }, 300);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await saveFormSubmission(answers);
      toast({
        title: "Formulário enviado!",
        description: "Suas respostas foram salvas com sucesso.",
      });
      setAnswers({});
      setCurrentStep(0);
      setShowSummary(false);
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
    // Clear error when user types
    if (errors[currentQuestion.id]) {
      setErrors((prev) => ({ ...prev, [currentQuestion.id]: "" }));
    }
  };

  const goToQuestion = (index: number) => {
    setAnimationClass("animate-slide-out-right");
    setIsAnimating(true);
    setTimeout(() => {
      setShowSummary(false);
      setCurrentStep(index);
      setAnimationClass("animate-slide-in-left");
      setTimeout(() => setIsAnimating(false), 50);
    }, 300);
  };

  // Summary Screen
  if (showSummary) {
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
            Revisão final
          </p>
        </div>

        <div className={`w-full ${animationClass}`}>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground text-center mb-6">
            Revise suas respostas
          </h1>

          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            {questions.map((q, index) => (
              <div
                key={q.id}
                className="bg-card border border-border rounded-lg p-4 group hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground mb-1">{q.question}</p>
                    <p className="text-foreground font-medium truncate">
                      {answers[q.id] || <span className="text-muted-foreground italic">Não respondido</span>}
                    </p>
                  </div>
                  <button
                    onClick={() => goToQuestion(index)}
                    className="p-2 text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Editar resposta"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between w-full mt-8 gap-4">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Voltar
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Check className="w-5 h-5 mr-1" />
                Confirmar envio
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

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
      <div className={`w-full ${animationClass}`}>
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
              className={`w-full h-14 text-base bg-card border-border focus:border-primary focus:ring-primary ${
                errors[currentQuestion.id] ? "border-destructive" : ""
              }`}
              autoFocus
            />
          )}
          {currentQuestion.type === "textarea" && (
            <Textarea
              value={answers[currentQuestion.id] || ""}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder={currentQuestion.placeholder}
              className={`w-full min-h-[120px] text-base bg-card border-border focus:border-primary focus:ring-primary resize-none ${
                errors[currentQuestion.id] ? "border-destructive" : ""
              }`}
              autoFocus
            />
          )}
          {currentQuestion.type === "radio" && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswerChange(option)}
                  className={`w-full p-4 text-left rounded-lg border transition-all duration-200 ${
                    answers[currentQuestion.id] === option
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card text-foreground hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        answers[currentQuestion.id] === option
                          ? "border-primary bg-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {answers[currentQuestion.id] === option && (
                        <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Error message */}
          {errors[currentQuestion.id] && (
            <p className="text-destructive text-sm mt-2 animate-slide-in-right">
              {errors[currentQuestion.id]}
            </p>
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
          {isLastStep ? (
            "Revisar"
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
